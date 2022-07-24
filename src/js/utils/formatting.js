window.format = function format(v, precision = 2, precisionBefore1000 = 2) {
	if (v < 1000 && Number(v.toFixed(precisionBefore1000)) < 1000) return v.toFixed(precisionBefore1000);
	const e = Math.floor(Math.log10(v) + Number.EPSILON);
	return `${Math.floor(Math.min(v / Math.pow(10, e), 9.99999))}e${e}`;
}