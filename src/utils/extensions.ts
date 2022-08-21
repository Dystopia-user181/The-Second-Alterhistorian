import { AnyFunction, isArray, isObject } from "./types";

/**
 * @param {object} obj The object to be mapped.
 * @param {function} keyfun A function which determines the key of the new property. Takes in two parameters- First
 * is the key of the original property and second is the value of the original property.
 * @param {function} propfun A function which determines the value of the new property. Takes in two parameters- First
 * is the value of the original property and second is the key of the original property.
 */
// FIXME: This is typed correctly as designed, but the function itself is not
// TypeScript compatible; it will always return a union of the possible types,
// and correct keys cannot be inferred since they are transformed.
export function objectMap<T extends Record<keyof T, unknown>, K extends keyof T, R>(
	obj: T,
	keyfun: (index: K, value: T[K]) => K,
	propfun: (value: T[K], index: K) => R
): { [key in K]: R } {
	const newObj = {} as { [key in K]: R };
	for (const i of Object.keys(obj)) {
		const key = i as K;
		const fun = keyfun(key, obj[key]);

		newObj[fun] = propfun(obj[key], key);
	}
	return newObj;
}

export function run<T>(
	param: T,
	...args: T extends AnyFunction ? Parameters<T> : never
): T extends AnyFunction ? ReturnType<T> : T {
	let result;

	if (typeof param === "function") {
		// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
		result = param(...args);
	} else {
		result = param;
	}

	// eslint-disable-next-line @typescript-eslint/no-unsafe-return
	return result;
}

export function deepAssign<T, K extends keyof T>(target: T, source: T) : void {
	Object.keys(source).forEach(k => {
		const key = k as K;
		if (isObject(source[key]))
			deepAssign(target[key], source[key]);
		else
			target[key] = deepClone(source[key]);
	});
}

export function shallowClone<T>(object: T): T;
export function shallowClone<T>(object: T[]): T[];
export function shallowClone<T>(object: Record<string | number | symbol, T>) {
	if (isArray(object)) {
		return Array.from(object);
	}

	if (isObject(object)) {
		return { ...object };
	}

	return object;
}

export function deepClone<T>(object: T): T;
export function deepClone<T>(object: T[]): T[];
export function deepClone<T>(object: Record<string | number | symbol, T>) {
	if (isArray(object)) {
		return object.map(value => deepClone(value));
	}

	if (isObject(object)) {
		return Object.fromEntries(Object.entries(object).map(([key, value]) => [key, deepClone(value)]));
	}

	return object;
}

export function areArraysEqualSets<T extends { toString:() => string }>(a1: T[], a2: T[]): boolean {
	const superSet = {} as Record<string, number>;

	for (const i of a1) {
		const e = i.toString() + typeof i;
		superSet[e] = 1;
	}

	for (const i of a2) {
		const e = i.toString() + typeof i;
		if (!superSet[e]) {
			return false;
		}
		superSet[e] = 2;
	}

	for (const e in superSet) {
		if (superSet[e] === 1) {
			return false;
		}
	}

	return true;
}

class Str {
	public string: string;

	constructor(string: string) {
		this.string = string;
	}

	get capitalize() {
		if (!this.string) return "";
		return this.string[0].toUpperCase() + this.string.slice(1);
	}
}

class Arr<T> {
	public array: T[];

	constructor(array: T[]) {
		this.array = array;
	}

	get last() {
		return this.array[this.array.length - 1];
	}

	findLast(predicate: (value: T, index: number) => boolean) {
		for (let i = this.array.length; i > 0; i--) {
			if (predicate(this.array[i - 1], i - 1)) return this.array[i - 1];
		}
		return undefined;
	}

	expendableFind(predicate: (value: T, index: number) => boolean) {
		for (let i = 0; i < this.array.length; i++) {
			if (predicate(this.array[i], i)) {
				return this.array.splice(i, 1)[0];
			}
		}
		return undefined;
	}

	// Not sure about the usage for this one, seems like index is always a string
	// FIXME: Similar to objectToMap, this is can only result in a loosely typed union
	mapToObject<K extends string, R>(
		keyfun: (value: T, index: string) => K,
		propfun: (value: T, index: K) => R
	): { [key in K]: R } {
		const newObj = {} as { [key in K]: R };

		this.array.forEach((value, i) => {
			const index = i.toString();
			const key = keyfun(value, index);
			newObj[key] = propfun(value, index as K);
		});

		return newObj;
	}
}

export function str(_str: string) {
	return new Str(_str);
}

export function arr<T>(_arr: T[]) {
	return new Arr(_arr);
}