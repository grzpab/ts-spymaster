import {
    fake,
    SinonSpy,
} from 'sinon';
import {
    KeyToFunctionDictionary,
    SpyManager,
    SpyProxy,
} from './index';

export class SinonSpyProxy<A extends any[] = any[], RV = any> implements SpyProxy<A, RV>{
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

export class SinonSpyManager<A extends KeyToFunctionDictionary> extends SpyManager<A> {
    protected buildSpyProxy<K extends keyof A>(
        fnc: A[K],
    ): SpyProxy<Parameters<A[keyof A]>, ReturnType<A[keyof A]>> {
        const spy: SinonSpy<Parameters<A[keyof A]>, ReturnType<A[keyof A]>> = fake(fnc) as any;

        return new SinonSpyProxy(spy);
    }
}
