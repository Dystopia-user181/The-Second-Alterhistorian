/**
  * @param {object} obj The object to be mapped.
  * @param {function} keyfun A function which determines the key of the new property. Takes in two parameters- First
  * is the key of the original property and second is the value of the original property.
  * @param {function} propfun A function which determines the value of the new property. Takes in two parameters- First
  * is the value of the original property and second is the key of the original property.
  */
export function objectMap(obj, keyfun, propfun) {
	const newObj = {};
	for (const i of Object.keys(obj)) {
		newObj[keyfun(i, obj[i])] = propfun(obj[i], i);
	}
	return newObj;
}

export function run(param, ...args) {
	if (typeof param === "function") return param(...args);
	return param;
}

export function deepAssign(target, source) {
	for (const prop of Object.keys(source)) {
		if (typeof source[prop] === "object" && typeof target[prop] === "object")
			deepAssign(target[prop], source[prop]);
		else
			target[prop] = deepClone(source[prop]);
	}
}

export function mergeUnique(a, b) {
	return a.concat(b.filter(item => a.indexOf(item) < 0));
}

export function shallowClone(object) {
	if (typeof object !== "object" || object === null) return object;
	let fillObject;
	if (object.constructor === Array) fillObject = [];
	else fillObject = {};
	for (const prop in object) {
		fillObject[prop] = object[prop];
	}
	return fillObject;
}

export function deepClone(object) {
	if (typeof object !== "object" || object === null) return object;
	let fillObject;
	if (object.constructor === Array) fillObject = [];
	else fillObject = {};
	for (const prop in object) {
		fillObject[prop] = deepClone(object[prop]);
	}
	return fillObject;
}


export function areArraysEqualSets(a1, a2) {
	const superSet = {};
	for (const i of a1) {
		const e = i + typeof i;
		superSet[e] = 1;
	}

	for (const i of a2) {
		const e = i + typeof i;
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
	constructor(string) {
		this.string = string;
	}

	get capitalize() {
		if (!this.string) return "";
		return this.string[0].toUpperCase() + this.string.slice(1);
	}
}

class Arr {
	constructor(array) {
		this.array = array;
	}

	get last() {
		return this.array[this.array.length - 1];
	}

	findLast(predicate) {
		for (let i = this.array.length; i > 0; i--) {
			if (predicate(this.array[i - 1], i - 1)) return this.array[i - 1];
		}
		return undefined;
	}

	expendableFind(func) {
		for (let i = 0; i < this.array.length; i++) {
			if (func(this.array[i], i)) {
				return this.array.splice(i, 1)[0];
			}
		}
		return undefined;
	}

	mapToObject(keyfun, propfun) {
		const newObj = {};
		for (const i in this.array) {
			newObj[keyfun(this.array[i], i)] = propfun(this.array[i], i);
		}
		return newObj;
	}
}

export function str(_str) {
	return new Str(_str);
}

export function arr(_arr) {
	return new Arr(_arr);
}