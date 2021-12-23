import {
    fake,
    SinonSpy,
} from "sinon";
import {
    KeyToFunctionDictionary,
    Spymaster,
    SpyProxy,
} from "./abstractions";

export class SinonSpyProxy<A extends Array<any> = Array<any>, RV = any> implements SpyProxy<A, RV> {
    private _currentSpy: SinonSpy<A, RV>;

    public constructor(
        private readonly _defaultSpy: SinonSpy<A, RV>,
    ) {
        this._currentSpy = _defaultSpy;
    }

    public setCurrentSpy(
        _currentSpy: SinonSpy<A, RV>,
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
            apply: (
                target,
                thisArg,
                argArray,
            ) => this._currentSpy.apply(thisArg, argArray),
        });
    }

    public resetHistory(): SpyProxy<A, RV> {
        this._currentSpy.resetHistory();

        return this;
    }
}

export class SinonSpymaster<A extends KeyToFunctionDictionary,
    KA extends keyof A = keyof A,
    P extends Parameters<A[KA]> = Parameters<A[KA]>,
    R extends ReturnType<A[KA]> = ReturnType<A[KA]>,
> extends Spymaster<A, KA, P, R> {
    protected buildSpyProxy(
        fnc: A[KA],
    ): SpyProxy<P, R> {
        const spy: SinonSpy<P, R> = fake(fnc) as any;

        return new SinonSpyProxy(spy);
    }

    public setCurrentSpy<K extends KA>(
        key: K,
        fnc: A[K],
    ): SinonSpymaster<A, KA, P, R> {
        const spy_proxy = this.get(key);

        const spy: SinonSpy<Parameters<A[K]>, ReturnType<A[K]>> = fake(fnc) as any;

        spy_proxy.setCurrentSpy(spy);

        return this;
    }
}
