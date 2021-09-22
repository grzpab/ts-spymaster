import { fake, SinonSpy } from 'sinon';

export interface SpyProxy<A extends any[], RV> {
    setCurrentSpy(
        _currentSpy: SinonSpy<A, RV>
    ): SpyProxy<A, RV>;

    restoreDefaultSpy(): SpyProxy<A, RV>;

    getCurrentSpy(): SinonSpy<A, RV>;
    resetHistory(): SpyProxy<A, RV>;
}

export type KeyToFunctionDictionary = Readonly<{
    [key in string]: (...args: any) => any;
}>;

export abstract class SpyManager<A extends KeyToFunctionDictionary> {
    protected abstract buildSpyProxy<K extends keyof A>(fnc: A[K]) : SpyProxy<Parameters<A[keyof A]>, ReturnType<A[keyof A]>>;

    protected spy_proxies: Map<keyof A, SpyProxy<Parameters<A[keyof A]>, ReturnType<A[keyof A]>>> = new Map();

    protected get<K extends keyof A>(
        key: K,
    ): SpyProxy<Parameters<A[K]>, ReturnType<A[K]>> {
        const spy = this.spy_proxies.get(key);

        if (!spy) {
            throw new Error(`No spy found for the key "${key}"`);
        }

        return spy;
    }

    public setDefaultSpy<K extends keyof A>(
        key: K,
        fnc: A[K]
    ): SpyManager<A> {
        const spyProxy = this.buildSpyProxy(fnc);

        this.spy_proxies.set(key, spyProxy);

        return this;
    }

    public getCurrentSpy<K extends keyof A>(
        key: K,
    ): SinonSpy<Parameters<A[keyof A]>, ReturnType<A[keyof A]>> {
        const spy_proxy = this.get(key);

        return spy_proxy.getCurrentSpy();
    }

    public setCurrentSpy<K extends keyof A>(
        key: K,
        fnc: A[K]
    ): SpyManager<A> {
        const spy_proxy = this.get(key);

        const spy: SinonSpy<Parameters<A[keyof A]>, ReturnType<A[keyof A]>> = fake(fnc) as any;

        spy_proxy.setCurrentSpy(spy);

        return this;
    }

    public restoreDefaultSpy<K extends keyof A>(
        key: K,
    ): SpyManager<A> {
        const spy_proxy = this.get(key);

        spy_proxy.restoreDefaultSpy();

        return this;
    }

    public restoreDefaultSpies(): SpyManager<A> {
        this.spy_proxies.forEach((spyProxy) => {
            spyProxy.restoreDefaultSpy()
        });

        return this;
    }

    public resetHistory<K extends keyof A>(
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
