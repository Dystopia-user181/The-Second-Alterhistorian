import { run } from "./extensions";

/**
  * Creates a proxy which only evaluates and abstracts database values once something else requires it.
  * @param {object} data      Database value to be evaluated.
  * @param {function} propfun A function which determines the value of the new property. Takes in two parameters- First
  * is the value of the original property and second is the key of the original property.
  */
export function LazyLoad(data, propfun) {
	return new Proxy({}, {
		get(target, prop) {
			if (!(prop in target)) {
				target[prop] = propfun(data[prop], prop);
			}
			return target[prop];
		}
	});
}

/**
  * Creates a proxy which evaluates properties in an object if they are functions.
  * Returns their original value otherwise.
  * @param {object} data Object to be proxied.
  * @param {function} executionArgs Arguments to be passed in during execution of functions.
  * @param {function} defaultSetAsFunctions Key names which are assumed to be functions by default. If not functions,
  * the original property will be returned. Other functions are ignored.
  */
export function BulkRun(data, executionArgs = [], defaultSetAsFunctions = []) {
	const functions = new Map(defaultSetAsFunctions.map(x => [x, 1]));
	if (!defaultSetAsFunctions.length) {
		for (const key in data) {
			if (typeof data[key] === "function") functions.set(key, 1);
		}
	}
	return new Proxy(data, {
		get: defaultSetAsFunctions.length
			? (target, prop) => (functions.has(prop) ? run(target[prop], ...executionArgs) : target[prop])
			: (target, prop) => (functions.has(prop) ? target[prop](executionArgs) : target[prop])
	});
}