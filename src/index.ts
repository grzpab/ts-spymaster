import { fake, SinonSpy } from 'sinon';

export class SpyProxy<A extends any[] = any[], RV = any> {
    private _currentSpy: SinonSpy<A, RV>;

    public constructor(
        private readonly _defaultSpy: SinonSpy<A, RV>,
    ) {
        this._currentSpy = _defaultSpy;
    }

    public setCurrentSpy(
        _currentSpy: SinonSpy<A, RV>
    ): SpyProxy<A, RV> {
        this._currentSpy = _currentSpy;

        return this;
    }

    public restoreDefaultSpy(): SpyProxy<A, RV> {
        this._currentSpy = this._defaultSpy;

        return this;
    }

    public getCurrentSpy(): SinonSpy<A, RV> {
        return new Proxy(this._currentSpy, {
            apply: (target, thisArg, argArray) => {
                return this._currentSpy.apply(thisArg, argArray);
            },
        });
    }

    public resetHistory(): SpyProxy<A, RV> {
        this._currentSpy.resetHistory();

        return this;
    }
}

export class SpyManager<
    A extends {
        [key in string]: (...args: any) => any
    }
> {
    protected spy_proxies: Map<keyof A, SpyProxy<Parameters<A[keyof A]>, ReturnType<A[keyof A]>>> = new Map();

    protected get<K1 extends keyof A>(
        key: K1,
    ): SpyProxy<Parameters<A[K1]>, ReturnType<A[K1]>> {
        const spy = this.spy_proxies.get(key);

        if (!spy) {
            throw new Error(`No spy found for the key "${key}"`);
        }

        return spy;
    }

    public setDefaultSpy<K1 extends keyof A>(
        key: K1,
        fnc: A[K1]
    ): SpyManager<A> {
        const spy: SinonSpy<Parameters<A[keyof A]>, ReturnType<A[keyof A]>> = fake(fnc) as any;
        const spyProxy = new SpyProxy(spy);

        this.spy_proxies.set(key, spyProxy);

        return this;
    }

    public getCurrentSpy<K1 extends keyof A>(
        key: K1,
    ): SinonSpy<Parameters<A[keyof A]>, ReturnType<A[keyof A]>> {
        const spy_proxy = this.get(key);

        return spy_proxy.getCurrentSpy();
    }

    public setCurrentSpy<K1 extends keyof A>(
        key: K1,
        fnc: A[K1]
    ): SpyManager<A> {
        const spy_proxy = this.get(key);

        const spy: SinonSpy<Parameters<A[keyof A]>, ReturnType<A[keyof A]>> = fake(fnc) as any;

        spy_proxy.setCurrentSpy(spy);

        return this;
    }

    public restoreDefaultSpy<K1 extends keyof A>(
        key: K1,
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

    public resetHistory<K1 extends keyof A>(
        key: K1,
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
