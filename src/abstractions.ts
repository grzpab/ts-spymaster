interface Spy<A, RV> {

}

export interface SpyProxy<S extends Spy<A, RV>, A extends Array<any>, RV> {
    setCurrentSpy(
        _currentSpy: S,
    ): SpyProxy<S, A, RV>;

    restoreDefaultSpy(): SpyProxy<S, A, RV>;

    getCurrentSpy(): S;

    resetHistory(): SpyProxy<S, A, RV>;
}

export type KeyToFunctionDictionary = Readonly<{
    [key in string]: (...args: any) => any;
}>;

export abstract class Spymaster<A extends KeyToFunctionDictionary,
    KA extends keyof A = keyof A,
    P extends Parameters<A[KA]> = Parameters<A[KA]>,
    R extends ReturnType<A[KA]> = ReturnType<A[KA]>,
    S extends Spy<P, R> = Spy<P, R>,
    SP extends SpyProxy<Spy<P, R>, P, R> = SpyProxy<S, P, R>,
> {
    protected abstract buildSpyProxy(fnc: A[KA]): SP;

    protected spy_proxies: Map<KA, SP> = new Map();

    protected get<K extends KA>(
        key: K,
    ): SP {
        const spy = this.spy_proxies.get(key);

        if (!spy) {
            throw new Error(`No spy found for the key "${key}"`);
        }

        return spy;
    }

    public setDefaultSpy<K extends KA>(
        key: K,
        fnc: A[K],
    ): Spymaster<A> {
        const spyProxy = this.buildSpyProxy(fnc);

        this.spy_proxies.set(key, spyProxy);

        return this;
    }

    public getCurrentSpy<K extends KA>(
        key: K,
    ): Spy<Parameters<A[K]>, ReturnType<A[K]>> {
        const spy_proxy = this.get(key);

        return spy_proxy.getCurrentSpy();
    }

    public abstract setCurrentSpy<K extends KA>(
        key: K,
        fnc: A[K],
    ): Spymaster<A, KA, P, R>;

    public restoreDefaultSpy<K extends KA>(
        key: K,
    ): Spymaster<A> {
        const spy_proxy = this.get(key);

        spy_proxy.restoreDefaultSpy();

        return this;
    }

    public restoreDefaultSpies(): Spymaster<A> {
        this.spy_proxies.forEach((spyProxy) => {
            spyProxy.restoreDefaultSpy();
        });

        return this;
    }

    public resetHistory<K extends KA>(
        key: K,
    ): Spymaster<A> {
        const spy_proxy = this.get(key);

        spy_proxy.resetHistory();

        return this;
    }

    public resetHistories(): Spymaster<A> {
        this.spy_proxies.forEach((spyProxy) => {
            spyProxy.resetHistory();
        });

        return this;
    }
}
