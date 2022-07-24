window.objectMap = function objectMap(obj, keyfun, propfun) {
	const newObj = {};
	for (const i of Object.keys(obj)) {
		newObj[keyfun(i, obj[i])] = propfun(obj[i], i);
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

window.deepAssign = function deepAssign(target, source) {
	for (const prop of Object.keys(source)) {
		if (typeof source[prop] === "object") deepAssign(target[prop], source[prop]);
		else target[prop] = source[prop];
	}
}