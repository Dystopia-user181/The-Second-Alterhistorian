import { key, looseObject, primitive } from "@/types/objects";

/**
  * @param {object} obj The object to be mapped.
  * @param {function} keyfun A function which determines the key of the new property. Takes in two parameters- First
  * is the key of the original property and second is the value of the original property.
  * @param {function} propfun A function which determines the value of the new property. Takes in two parameters- First
  * is the value of the original property and second is the key of the original property.
  */
export function objectMap<initialType, finalType>(
	obj : Record<key, initialType>,
	keyfun : (key: key, prop: initialType) => key,
	propfun : (prop: initialType, key: key) => finalType
) : Record<key, finalType> {
	const newObj : Record<key, finalType> = {};
	for (const i of Object.keys(obj)) {
		newObj[keyfun(i, obj[i])] = propfun(obj[i], i);
	}
	return newObj;
}

export function run<paramType>(
	param : (...args: unknown[]) => paramType | paramType,
	...args : unknown[]
) : paramType {
	if (typeof param === "function") return param(...args);
	return param;
}

export function deepAssign(
	target : looseObject,
	source : looseObject
) {
	for (const prop in source) {
		if (typeof source[prop] === "object" && typeof target[prop] === "object")
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			deepAssign(target[prop], source[prop]);
		else
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			target[prop] = typeof source[prop] === "object" ? deepClone(source[prop]) : source[prop];
	}
}

export function mergeUnique<type>(a : type[], b : type[]) : type[] {
	return a.concat(b.filter(item => a.indexOf(item) < 0));
}

export function shallowClone(object : looseObject) {
	if (typeof object !== "object" || object === null) return object;
	const fillObject : looseObject = object.constructor === Array ? [] : {};
	for (const prop in object) {
		fillObject[prop] = object[prop];
	}
	return fillObject;
}

export function deepClone(object : looseObject) {
	const fillObject : looseObject = object.constructor === Array ? [] : {};
	for (const prop in object) {
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		if (typeof object[prop] === "object") fillObject[prop] = deepClone(object[prop]);
		else fillObject[prop] = object[prop];
	}
	return fillObject;
}


export function areArraysEqualSets(a1 : primitive[], a2 : primitive[]) {
	const superSet : Record<key, number> = {};
	for (const i of a1) {
		const e = `${i}${typeof i}`;
		superSet[e] = 1;
	}

	for (const i of a2) {
		const e = `${i}${typeof i}`;
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
	string: string;
	constructor(string : string) {
		this.string = string;
	}

	get capitalize() {
		if (!this.string) return "";
		return this.string[0].toUpperCase() + this.string.slice(1);
	}
}

class Arr<type> {
	array: type[];
	constructor(array : type[]) {
		this.array = array;
	}

	get last() {
		return this.array[this.array.length - 1];
	}

	findLast(predicate : (prop: type, key : key) => boolean) {
		for (let i = this.array.length; i > 0; i--) {
			if (predicate(this.array[i - 1], i - 1)) return this.array[i - 1];
		}
		return undefined;
	}

	expendableFind(predicate : (prop: type, key: key) => boolean) {
		for (let i = 0; i < this.array.length; i++) {
			if (predicate(this.array[i], i)) {
				return this.array.splice(i, 1)[0];
			}
		}
		return undefined;
	}

	mapToObject<returnType>(
		keyfun : (prop: type, key: number) => key,
		propfun: (prop: type, key: number) => returnType
	) {
		const newObj : Record<key, returnType> = {};
		for (let i = 0; i < this.array.length; i++) {
			newObj[keyfun(this.array[i], i)] = propfun(this.array[i], i);
		}
		return newObj;
	}
}

export function str(_str : string) {
	return new Str(_str);
}

export function arr<type>(_arr : type[]) {
	return new Arr(_arr);
}