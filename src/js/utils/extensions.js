window.objectMap = function objectMap(obj, keyfun, propfun) {
	const newObj = {};
	for (const i of Object.keys(obj)) {
		newObj[keyfun(i, obj[i])] = propfun(obj[i], i);
	}
	return newObj;
}

window.mapToObject = function mapToObject(arr, keyfun, propfun) {
	const newObj = {};
	for (const i of Object.keys(arr)) {
		newObj[keyfun(arr[i], i)] = propfun(arr[i], i);
	}
	return newObj;
}

window.run = function run(param, ...args) {
	if (typeof param === "function") return param(...args);
	else return param;
}

String.prototype.capitalize = function() {
	return this[0].toUpperCase() + this.slice(1);
}

window.last = function last(array) {
	return array[array.length - 1];
}

window.deepAssign = function deepAssign(target, source, debugStack = []) {
	for (const prop of Object.keys(source)) {
		if (typeof source[prop] === "object" && typeof target[prop] === "object") deepAssign(target[prop], source[prop]);
		else target[prop] = deepClone(source[prop]);
	}
}

window.mergeUnique = function mergeUnique(a, b) {
	return a.concat(b.filter((item) => a.indexOf(item) < 0));
}

window.deepClone = function(object) {
	if (typeof object !== "object" || object === null) return object;
	let fillObject;
	if (object.constructor === Array) fillObject = [];
	else fillObject = {};
	for (const prop of Object.keys(object)) {
		fillObject[prop] = deepClone(object[prop]);
	}
	return fillObject;
}

window.expendableFind = function expendableFind(array, func) {
	for (let i = 0; i < array.length; i++) {
		if (func(array[i], i)) {
			return array.splice(i, 1)[0];
		}
	}
}

window.findLast = function findLast(array, predicate) {
	for (let i = array.length; i > 0; i--) {
		if (predicate(array[i - 1], i - 1)) return array[i - 1];
	}
}


window.areArraysEqualSets = function areArraysEqualSets(a1, a2) {
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
  
	for (let e in superSet) {
		if (superSet[e] === 1) {
			return false;
		}
	}
  
	return true;
}