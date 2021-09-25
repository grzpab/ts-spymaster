# ts-spymaster
A spymaster library for TypeScript projects.

## Context
During testing, developers usually want to know that a particular function:
* was called a predefined number of times,
* was called with predefined attributes,
* returned predefined values.

Most coders achieve that using _spies_, which has been a standard practice for some time now. What the TS community misses, in the opinion of the creator of this library, is:
* a component that manages all the spies,
* a straightforward way to exchange spies in tests,
* a simple way to reset all spies after a test has passed.

This library provided this and much more.

## Library
As a _spymaster_ is someone running a spy ring, the _ts-spymaster_ library allows developers to control the lifecycles of spy objects during testing.

The library is agnostic towards test frameworks, meaning you can use virtually any framework or library with it. It contains bindings for Sinon spies, though.

## Abstract Components

### SpyProxy
The `SpyProxy` interface serves as a blueprint for a spy proxy. A spy proxy holds the following spies:
* the default spy (you construct the proxy with it),
* the current spy (initially the default spy, can be changed to a different one).

Developers can change the current spy at any time in runtime. Later, they can restore the proxy to use the default spy. This way the structure can proxy calls to the intended spy at the time. The spy may also reset the spy history.

### SpyManager
The `SpyManager` abstract class holds all the spy proxies. It allows for setting up proxies, having all proxies use default spies, and resetting the history of all the spies.

## Components

### SinonSpyProxy
The `SinonSpyProxy` class serves as an implementation of the `SpyProxy` interface for Sinon spies.

### SinonSpyManager
The `SinonSpyManager` serves as the implementation of the `SpyManager` class for Sinon spies.

## Usage
The following snippet uses the Chai library for asserting.

```typescript
import { SinonSpyManager } from '@grzpab/ts-spymaster/sinon';

// the setup phase
// setting up the spy manager and 
type SpiedOnFunctions = Readonly<{
	fnc: (n: number) => number,
}>;

const spyManager = new SinonSpyManager<SpiedOnFunctions>();
spyManager.setDefaultSpy('fnc', (n) => n);

// the pre-test phase
// just to show that the current spy is the default spy
const defaultSpy = spyManager.getCurrentSpy('fnc');

assert.equal(defaultSpy(10), 10);

// the test phase
// changing the current spy
spyManager.setCurrentSpy('fnc', (n) => 2*n);

const currentSpy = spyManager.getCurrentSpy('fnc');

assert.equal(currentSpy(10), 20);

// the post-phase phase
// restoring the default spy
spyManager.restoreDefaultSpy('fnc');
```
