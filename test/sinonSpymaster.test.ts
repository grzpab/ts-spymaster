import { assert } from "chai";
import {
    SinonSpymaster,
} from "../src/sinon";

describe("Spymaster", () => {
    type SpiedOnFunctions = Readonly<{
        fnc: (n: number) => number,
    }>;


    it("should allow for setting default, current spies and restoring the default ones", () => {
        const spymaster = new SinonSpymaster<SpiedOnFunctions>();

        {
            spymaster.setDefaultSpy("fnc", (n) => n);

            const spy = spymaster.getCurrentSpy("fnc");

            const value = spy(10);

            assert.equal(value, 10);
            assert.equal(spy.callCount, 1);
        }

        {
            spymaster.setCurrentSpy("fnc", (n) => 2 * n);

            const spy = spymaster.getCurrentSpy("fnc");

            const value = spy(10);

            assert.equal(value, 20);
            assert.equal(spy.callCount, 1);
        }

        {
            spymaster.restoreDefaultSpy("fnc");

            const spy = spymaster.getCurrentSpy("fnc");

            const value = spy(10);

            assert.equal(value, 10);
            assert.equal(spy.callCount, 2);
        }
    });

    it("should allow for restoring default spies", () => {
        const spymaster = new SinonSpymaster<SpiedOnFunctions>();

        {
            spymaster.setDefaultSpy("fnc", (n) => n / 2);

            const spy = spymaster.getCurrentSpy("fnc");

            const value = spy(10);

            assert.equal(value, 5);
            assert.equal(spy.callCount, 1);
        }

        {
            spymaster.setCurrentSpy("fnc", (n) => 2 * n);

            const spy = spymaster.getCurrentSpy("fnc");

            const value = spy(10);

            assert.equal(value, 20);
            assert.equal(spy.callCount, 1);
        }

        {
            spymaster.restoreDefaultSpies();

            const spy = spymaster.getCurrentSpy("fnc");

            const value = spy(10);

            assert.equal(value, 5);
            assert.equal(spy.callCount, 2);
        }
    });

    it("should allow for proxying the current spy value", () => {
        type Service = {
            fnc: SpiedOnFunctions["fnc"],
        };

        const spymaster = new SinonSpymaster<SpiedOnFunctions>();

        spymaster.setDefaultSpy("fnc", (n) => n ** 2);

        const service: Service = {
            fnc: spymaster.getCurrentSpy("fnc"),
        };

        {
            const value = service.fnc(9);

            assert.equal(value, 81);
        }

        spymaster.setCurrentSpy("fnc", (n) => n ** 3);

        {
            const value = service.fnc(9);

            assert.equal(value, 729);
        }

        spymaster.restoreDefaultSpy("fnc");

        {
            const value = service.fnc(9);

            assert.equal(value, 81);
        }
    });

    it("should allow for resetting history", () => {
        const spymaster = new SinonSpymaster<SpiedOnFunctions>();

        spymaster.setDefaultSpy("fnc", (n) => n);

        {
            const spy = spymaster.getCurrentSpy("fnc");

            const value = spy(10);

            assert.equal(value, 10);
            assert.equal(spy.callCount, 1);

            spymaster.resetHistory("fnc");

            assert.equal(spy.callCount, 0);
        }

        {
            const spy = spymaster.getCurrentSpy("fnc");

            const value = spy(10);

            assert.equal(value, 10);
            assert.equal(spy.callCount, 1);

            spymaster.resetHistories();

            assert.equal(spy.callCount, 0);
        }
    });

    it("should throw an error if the key is not defined yet", () => {
        const spymaster = new SinonSpymaster<SpiedOnFunctions>();

        assert.throw(() => {
            spymaster.getCurrentSpy("fnc");
        });
    });
});
