import { assert } from "chai";
import { SinonSpymaster } from "../src/sinon";

class MochaMock<F extends () => void> {
    private readonly describesContainingIts: Array<Array<F>> = [];
    private _beforeAll: F | null = null;
    private _beforeEach: F | null = null;
    private _afterEach: F | null = null;
    private _afterAll: F | null = null;

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

describe("MochaMock with hooks", () => {
    it("should work with inner and outer spy managers", () => {
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

        const innerSpymaster = new SinonSpymaster<InnerFunctions>();

        innerSpymaster.setDefaultSpy(
            "sum",
            (
                a,
                b,
            ) => a + b,
        );
        innerSpymaster.setDefaultSpy(
            "multiply",
            (
                a,
                b,
            ) => a * b,
        );
        innerSpymaster.setDefaultSpy(
            "power",
            (
                a,
                b,
            ) => a ** b,
        );

        const innerFunctions: InnerFunctions = {
            sum: innerSpymaster.getCurrentSpy("sum"),
            multiply: innerSpymaster.getCurrentSpy("multiply"),
            power: innerSpymaster.getCurrentSpy("power"),
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

        const outerSpymaster = new SinonSpymaster<OuterFunctions>();

        outerSpymaster.setDefaultSpy("beforeAll", () => {

        });

        outerSpymaster.setDefaultSpy("beforeEach", () => {
        });

        outerSpymaster.setDefaultSpy("afterEach", () => {
            innerSpymaster.restoreDefaultSpies();
        });

        outerSpymaster.setDefaultSpy("afterAll", () => {
        });

        const mochaMock = new MochaMock();

        mochaMock.beforeAll(outerSpymaster.getCurrentSpy("beforeAll"));
        mochaMock.beforeEach(outerSpymaster.getCurrentSpy("beforeEach"));
        mochaMock.afterEach(outerSpymaster.getCurrentSpy("afterEach"));
        mochaMock.afterAll(outerSpymaster.getCurrentSpy("afterAll"));

        mochaMock.describe("test describe", () => {
            mochaMock.it("test it", () => {
                innerSpymaster.setCurrentSpy(
                    "sum",
                    () => 0,
                );

                assert.equal(call_inner_functions(), 0);
            });

            mochaMock.it("test it", () => {
                innerSpymaster.setCurrentSpy(
                    "multiply",
                    () => -1,
                );

                assert.equal(call_inner_functions(), 1);
            });
        });

        mochaMock.describe("test describe", () => {
            mochaMock.it("test it", () => {
                innerSpymaster.setCurrentSpy(
                    "power",
                    () => 10,
                );

                assert.equal(call_inner_functions(), 10);
            });
        });

        mochaMock.run();

        assert.equal(
            innerSpymaster.getCurrentSpy("sum").callCount,
            2,
        );

        assert.equal(
            innerSpymaster.getCurrentSpy("multiply").callCount,
            2,
        );

        assert.equal(
            innerSpymaster.getCurrentSpy("power").callCount,
            2,
        );

        assert.equal(
            outerSpymaster.getCurrentSpy("beforeAll").callCount,
            1,
        );

        assert.equal(
            outerSpymaster.getCurrentSpy("beforeEach").callCount,
            3,
        );

        assert.equal(
            outerSpymaster.getCurrentSpy("afterEach").callCount,
            3,
        );

        assert.equal(
            outerSpymaster.getCurrentSpy("afterAll").callCount,
            1,
        );
    });
});
