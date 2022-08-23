import { key } from "@/types/objects";

/**
  * Creates a proxy which only evaluates and abstracts database values once something else requires it.
  * @param {object} data      Database value to be evaluated.
  * @param {function} propfun A function which determines the value of the new property. Takes in two parameters- First
  * is the value of the original property and second is the key of the original property.
  */
export function LazyLoad<initialType, finalType>(
	data : Record<key, initialType>,
	propfun : (prop: initialType, key: key) => finalType
) {
	return new Proxy({}, {
		get(target : Record<key, finalType>, prop : string) {
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
  * @param {function} arguments Arguments to be passed in during execution of functions.
  */
export function BulkRun(
	data : Record<key, any>,
	args : any[] = []
) {
	const functions = new Map();
	for (const key in data) {
		if (typeof data[key] === "function") functions.set(key, 1);
	}
	return new Proxy(data, {
		get(
			target : Record<key, any>,
			prop : string
		) {
			// eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
			return functions.has(prop) ? target[prop](...args) : target[prop];
		}
	});
}