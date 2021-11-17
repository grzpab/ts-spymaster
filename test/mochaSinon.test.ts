import { assert } from 'chai';
import { SinonSpyManager } from '../src/sinon';

class MochaMock<F extends () => void> {
    private describesContainingIts: F[][] = [];
    private _beforeAll: F | null = null;
    private _beforeEach: F | null = null;
    private _afterEach: F | null = null;
    private _afterAll: F | null = null;

    public constructor() {
    }

    public describe(
        title: string,
        fnc: F,
    ): void {
        this.describesContainingIts.push([]);

        fnc();
    }

    public it(
        title: string,
        fnc: F,
    ): void {
        const its = this.describesContainingIts[this.describesContainingIts.length - 1];

        its.push(fnc);
    }

    public beforeAll(_beforeAll: F) {
        this._beforeAll = _beforeAll;
    }

    public beforeEach(_beforeEach: F) {
        this._beforeEach = _beforeEach;
    }

    public afterEach(_afterEach: F) {
        this._afterEach = _afterEach;
    }

    public afterAll(_afterAll: F) {
        this._afterAll = _afterAll;
    }

    public run() {
        this._beforeAll?.();

        for (const describe of this.describesContainingIts) {
            for (const it of describe) {
                this._beforeEach?.();

                it();

                this._afterEach?.();
            }
        }

        this._afterAll?.();
    }
}

describe.only('', () => {
    it('', () => {
        type SpiedOnFunctions = Readonly<{
            beforeAll: () => void,
            beforeEach: () => void,
            afterEach: () => void,
            afterAll: () => void,
        }>;

        const spyManager = new SinonSpyManager<SpiedOnFunctions>();

        const beforeAll = () => {};
        const beforeEach = () => {};
        const afterEach = () => {};
        const afterAll = () => {};

        spyManager.setDefaultSpy('beforeAll', beforeAll);
        spyManager.setDefaultSpy('beforeEach', beforeEach);
        spyManager.setDefaultSpy('afterEach', afterEach);
        spyManager.setDefaultSpy('afterAll', afterAll);

        const mochaMock = new MochaMock();

        mochaMock.beforeAll(spyManager.getCurrentSpy('beforeAll'));
        mochaMock.beforeEach(spyManager.getCurrentSpy('beforeEach'));
        mochaMock.afterEach(spyManager.getCurrentSpy('afterEach'));
        mochaMock.afterAll(spyManager.getCurrentSpy('afterAll'));

        mochaMock.describe('test describe', () => {
            mochaMock.it('test it', () => {
                console.log('abcd');
            });

            mochaMock.it('test it', () => {
                console.log('abcd');
            });
        });

        mochaMock.describe('test describe', () => {
            mochaMock.it('test it', () => {
                console.log('abcd');
            });

            mochaMock.it('test it', () => {
                console.log('abcd');
            });
        });

        mochaMock.run();

        assert.equal(
            spyManager.getCurrentSpy('beforeAll').callCount,
            1,
        );

        assert.equal(
            spyManager.getCurrentSpy('beforeEach').callCount,
            4,
        );

        assert.equal(
            spyManager.getCurrentSpy('afterEach').callCount,
            4,
        );

        assert.equal(
            spyManager.getCurrentSpy('afterAll').callCount,
            1,
        );
    });
});
