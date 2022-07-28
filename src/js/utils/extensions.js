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
