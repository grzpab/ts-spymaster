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
        type InnerFunctions = Readonly<{
            sum: (
                a: number,
                b: number,
            ) => number;
            multiply: (
                a: number,
                b: number,
            ) => number;
            power: (
                a: number,
                b: number,
            ) => number;
        }>;

        const innerSpyManager = new SinonSpyManager<InnerFunctions>();

        innerSpyManager.setDefaultSpy(
            'sum',
            (
                a,
                b,
            ) => a + b,
        );
        innerSpyManager.setDefaultSpy(
            'multiply',
            (
                a,
                b,
            ) => a * b,
        );
        innerSpyManager.setDefaultSpy(
            'power',
            (
                a,
                b,
            ) => a ** b,
        );

        const innerFunctions: InnerFunctions = {
            sum: innerSpyManager.getCurrentSpy('sum'),
            multiply: innerSpyManager.getCurrentSpy('multiply'),
            power: innerSpyManager.getCurrentSpy('power'),
        };

        const call_inner_functions = (): number => {
            const { sum, multiply, power } = innerFunctions;

            return power(
                multiply(
                    sum(0, 2),
                    2,
                ),
                2,
            );
        };

        type OuterFunctions = Readonly<{
            beforeAll: () => void,
            beforeEach: () => void,
            afterEach: () => void,
            afterAll: () => void,
        }>;

        const outerSpyManager = new SinonSpyManager<OuterFunctions>();

        outerSpyManager.setDefaultSpy('beforeAll', () => {

        });

        outerSpyManager.setDefaultSpy('beforeEach', () => {
        });

        outerSpyManager.setDefaultSpy('afterEach', () => {
            innerSpyManager.restoreDefaultSpies();
        });

        outerSpyManager.setDefaultSpy('afterAll', () => {
        });

        const mochaMock = new MochaMock();

        mochaMock.beforeAll(outerSpyManager.getCurrentSpy('beforeAll'));
        mochaMock.beforeEach(outerSpyManager.getCurrentSpy('beforeEach'));
        mochaMock.afterEach(outerSpyManager.getCurrentSpy('afterEach'));
        mochaMock.afterAll(outerSpyManager.getCurrentSpy('afterAll'));

        mochaMock.describe('test describe', () => {
            mochaMock.it('test it', () => {
                innerSpyManager.setCurrentSpy(
                    'sum',
                    () => 0,
                );

                assert.equal(call_inner_functions(), 0);
            });

            mochaMock.it('test it', () => {
                innerSpyManager.setCurrentSpy(
                    'multiply',
                    () => -1,
                );

                assert.equal(call_inner_functions(), 1);
            });
        });

        mochaMock.describe('test describe', () => {
            mochaMock.it('test it', () => {
                innerSpyManager.setCurrentSpy(
                    'power',
                    () => 10,
                );

                assert.equal(call_inner_functions(), 10);
            });
        });

        mochaMock.run();

        assert.equal(
            innerSpyManager.getCurrentSpy('sum').callCount,
            2,
        );

        assert.equal(
            innerSpyManager.getCurrentSpy('multiply').callCount,
            2,
        );

        assert.equal(
            innerSpyManager.getCurrentSpy('power').callCount,
            2,
        );

        assert.equal(
            outerSpyManager.getCurrentSpy('beforeAll').callCount,
            1,
        );

        assert.equal(
            outerSpyManager.getCurrentSpy('beforeEach').callCount,
            3,
        );

        assert.equal(
            outerSpyManager.getCurrentSpy('afterEach').callCount,
            3,
        );

        assert.equal(
            outerSpyManager.getCurrentSpy('afterAll').callCount,
            1,
        );
    });
});
