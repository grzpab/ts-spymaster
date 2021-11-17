import {
    fake,
    SinonSpy,
} from 'sinon';

export interface SpyProxy<A extends any[], RV> {
    setCurrentSpy(
        _currentSpy: SinonSpy<A, RV>,
    ): SpyProxy<A, RV>;

    restoreDefaultSpy(): SpyProxy<A, RV>;

    getCurrentSpy(): SinonSpy<A, RV>;

    resetHistory(): SpyProxy<A, RV>;
}

export type KeyToFunctionDictionary = Readonly<{
    [key in string]: (...args: any) => any;
}>;

export abstract class SpyManager<
    A extends KeyToFunctionDictionary,
    KA extends keyof A = keyof A,
    P extends Parameters<A[KA]> = Parameters<A[KA]>,
    R extends ReturnType<A[KA]> = ReturnType<A[KA]>,
> {
    protected abstract buildSpyProxy<K extends KA>(fnc: A[K]) : SpyProxy<P, R>;

    protected spy_proxies: Map<KA, SpyProxy<P, R>> = new Map();

    protected get<K extends KA>(
        key: K,
    ): SpyProxy<Parameters<A[K]>, ReturnType<A[K]>> {
        const spy = this.spy_proxies.get(key);

        if (!spy) {
            throw new Error(`No spy found for the key "${key}"`);
        }

        return spy;
    }

    public setDefaultSpy<K extends KA>(
        key: K,
        fnc: A[K],
    ): SpyManager<A> {
        const spyProxy = this.buildSpyProxy(fnc);

        this.spy_proxies.set(key, spyProxy);

        return this;
    }

    public getCurrentSpy<K extends KA>(
        key: K,
    ): SinonSpy<Parameters<A[K]>, ReturnType<A[K]>> {
        const spy_proxy = this.get(key);

        return spy_proxy.getCurrentSpy();
    }

    public setCurrentSpy<K extends KA>(
        key: K,
        fnc: A[K],
    ): SpyManager<A> {
        const spy_proxy = this.get(key);

        const spy: SinonSpy<Parameters<A[K]>, ReturnType<A[K]>> = fake(fnc) as any;

        spy_proxy.setCurrentSpy(spy);

        return this;
    }

    public restoreDefaultSpy<K extends KA>(
        key: K,
    ): SpyManager<A> {
        const spy_proxy = this.get(key);

        spy_proxy.restoreDefaultSpy();

        return this;
    }

    public restoreDefaultSpies(): SpyManager<A> {
        this.spy_proxies.forEach((spyProxy) => {
            spyProxy.restoreDefaultSpy();
        });

        return this;
    }

    public resetHistory<K extends KA>(
        key: K,
    ): SpyManager<A> {
        const spy_proxy = this.get(key);

        spy_proxy.resetHistory();

        return this;
    }

    public resetHistories(): SpyManager<A> {
        this.spy_proxies.forEach((spyProxy) => {
            spyProxy.resetHistory();
        });

        return this;
    }
}
