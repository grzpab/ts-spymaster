import {
    fake,
    SinonSpy,
} from "sinon";
import {
    KeyToFunctionDictionary,
    Spymaster,
    SpyProxy,
} from "./abstractions";

export class SinonSpyProxy<A extends Array<any> = Array<any>, RV = any> implements SpyProxy<SinonSpy, A, RV> {
    private _currentSpy: SinonSpy<A, RV>;

    public constructor(
        private readonly _defaultSpy: SinonSpy<A, RV>,
    ) {
        this._currentSpy = _defaultSpy;
    }

    public setCurrentSpy(
        _currentSpy: SinonSpy<A, RV>,
    ): SpyProxy<SinonSpy, A, RV> {
        this._currentSpy = _currentSpy;

        return this;
    }

    public restoreDefaultSpy(): SpyProxy<SinonSpy, A, RV> {
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

    public resetHistory(): SpyProxy<SinonSpy, A, RV> {
        this._currentSpy.resetHistory();

        return this;
    }
}

export class SinonSpymaster<A extends KeyToFunctionDictionary,
    KA extends keyof A = keyof A, // for aliasing and parent class initialization
    P extends Parameters<A[KA]> = Parameters<A[KA]>, // for aliasing and parent class initialization
    R extends ReturnType<A[KA]> = ReturnType<A[KA]>, // for aliasing and parent class initialization
    S extends SinonSpy<P, R> = SinonSpy<P, R>, // for aliasing and parent class initialization
> extends Spymaster<A, KA, P, R, S, SinonSpyProxy<P, R>> {
    protected buildSpyProxy(
        fnc: A[KA],
    ): SinonSpyProxy<P, R> {
        const spy: SinonSpy<P, R> = fake(fnc) as any;

        return new SinonSpyProxy(spy);
    }

    public setCurrentSpy<K extends KA>(
        key: K,
        fnc: A[K],
    ): SinonSpymaster<A> {
        const spy_proxy = this.get(key);

        const spy: SinonSpy<Parameters<A[K]>, ReturnType<A[K]>> = fake(fnc) as any;

        spy_proxy.setCurrentSpy(spy);

        return this;
    }

    public getCurrentSpy<K extends KA>(
        key: K,
    ): SinonSpy<Parameters<A[K]>, ReturnType<A[K]>> {
        const spy_proxy = this.get(key);

        return spy_proxy.getCurrentSpy();
    }
}
