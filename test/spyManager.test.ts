import { assert } from 'chai';
import {
    SinonSpyManager,
} from '../src/sinon';

describe('SpyManager', () => {
    type SpiedOnFunctions = {
        fnc: (n: number) => number,
    }


    it('should allow for setting default, current spies and restoring the default ones', () => {
        const spyManager = new SinonSpyManager<SpiedOnFunctions>();

        {
            spyManager.setDefaultSpy('fnc', (n) => n);

            const spy = spyManager.getCurrentSpy('fnc');

            const value = spy(10);

            assert.equal(value, 10);
            assert.equal(spy.callCount, 1);
        }

        {
            spyManager.setCurrentSpy('fnc', (n) => 2*n);

            const spy = spyManager.getCurrentSpy('fnc');

            const value = spy(10);

            assert.equal(value, 20);
            assert.equal(spy.callCount, 1);
        }

        {
            spyManager.restoreDefaultSpy('fnc');

            const spy = spyManager.getCurrentSpy('fnc');

            const value = spy(10);

            assert.equal(value, 10);
            assert.equal(spy.callCount, 2);
        }
    });

    it('should allow for restoring default spies', () => {
        const spyManager = new SinonSpyManager<SpiedOnFunctions>();

        {
            spyManager.setDefaultSpy('fnc', (n) => n / 2);

            const spy = spyManager.getCurrentSpy('fnc');

            const value = spy(10);

            assert.equal(value, 5);
            assert.equal(spy.callCount, 1);
        }

        {
            spyManager.setCurrentSpy('fnc', (n) => 2 * n);

            const spy = spyManager.getCurrentSpy('fnc');

            const value = spy(10);

            assert.equal(value, 20);
            assert.equal(spy.callCount, 1);
        }

        {
            spyManager.restoreDefaultSpies();

            const spy = spyManager.getCurrentSpy('fnc');

            const value = spy(10);

            assert.equal(value, 5);
            assert.equal(spy.callCount, 2);
        }
    });

    it('should allow for proxying the current spy value', () => {
        type Service = {
            fnc: SpiedOnFunctions['fnc'],
        };

        const spyManager = new SinonSpyManager<SpiedOnFunctions>();

        spyManager.setDefaultSpy('fnc', (n) => n ** 2);

        const service: Service = {
            fnc: spyManager.getCurrentSpy('fnc'),
        };

        {
            const value = service.fnc(9);

            assert.equal(value, 81);
        }

        spyManager.setCurrentSpy('fnc', (n) => n ** 3);

        {
            const value = service.fnc(9);

            assert.equal(value, 729);
        }

        spyManager.restoreDefaultSpy('fnc');

        {
            const value = service.fnc(9);

            assert.equal(value, 81);
        }
    });

    it('should allow for resetting history', () => {
        const spyManager = new SinonSpyManager<SpiedOnFunctions>();

        spyManager.setDefaultSpy('fnc', (n) => n);

        {
            const spy = spyManager.getCurrentSpy('fnc');

            const value = spy(10);

            assert.equal(value, 10);
            assert.equal(spy.callCount, 1);

            spyManager.resetHistory('fnc');

            assert.equal(spy.callCount, 0);
        }

        {
            const spy = spyManager.getCurrentSpy('fnc');

            const value = spy(10);

            assert.equal(value, 10);
            assert.equal(spy.callCount, 1);

            spyManager.resetHistories();

            assert.equal(spy.callCount, 0);
        }
    });
});
