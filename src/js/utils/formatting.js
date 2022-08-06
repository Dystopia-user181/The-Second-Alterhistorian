window.format = function format(v, precision = 2, precisionBefore1000 = 2, small = false) {
	if (v === 0) return (0).toFixed(precisionBefore1000);
	if (Math.log10(v) < -1 && small) {
		const e = Math.floor(Math.log10(v) + Number.EPSILON);
		return `${Math.min(v / Math.pow(10, e), 10 - Math.pow(0.1, precision)).toFixed(precision)}e${e}`;
	}
	if (v < 1000 && Number(v.toFixed(precisionBefore1000)) < 1000) return v.toFixed(precisionBefore1000);
	const e = Math.floor(Math.log10(v) + Number.EPSILON);
	return `${Math.min(v / Math.pow(10, e), 10 - Math.pow(0.1, precision)).toFixed(precision)}e${e}`;
};

window.formatX = function formatX(value, places, placesUnder1000) {
	return `×${format(value, places, placesUnder1000)}`;
};
  
window.formatPow = function formatPow(value, places, placesUnder1000) {
	return `^${format(value, places, placesUnder1000)}`;
};
  
window.formatPercents = function formatPercents(value, places) {
	return `${format(value * 100, 2, places)}%`;
};

window.formatInt = function formatInt(x) {
	return format(x, 2, 0, false);
}