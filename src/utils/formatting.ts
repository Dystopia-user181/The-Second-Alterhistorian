export function format(
	value : number,
	places = 2,
	placesUnder1000 = 2,
	small = false
) {
	if (value === 0)
		return (0).toFixed(placesUnder1000);
	if (Math.log10(value) < -1 && small) {
		const e = Math.floor(Math.log10(value) + Number.EPSILON);
		return `${Math.min(value / Math.pow(10, e), 10 - Math.pow(0.1, places)).toFixed(places)}e${e}`;
	}
	if (value < 1000 && Number(value.toFixed(placesUnder1000)) < 1000)
		return value.toFixed(placesUnder1000);
	const e = Math.floor(Math.log10(value) + Number.EPSILON);
	return `${Math.min(value / Math.pow(10, e), 10 - Math.pow(0.1, places)).toFixed(places)}e${e}`;
}

export function formatX(value : number, places = 2, placesUnder1000 = 2) {
	return `×${format(value, places, placesUnder1000)}`;
}

export function formatPow(value : number, places = 2, placesUnder1000 = 2) {
	return `^${format(value, places, placesUnder1000)}`;
}

export function formatPercents(value : number, places = 2) {
	return `${format(value * 100, 2, places)}%`;
}

export function formatInt(x : number) {
	return format(x, 2, 0, false);
}