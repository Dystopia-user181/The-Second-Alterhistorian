<script setup>
const { x, y, width, height, step } = defineProps({
	x: {
		type: Number,
		required: true
	},
	y: {
		type: Number,
		required: true
	},
	width: {
		type: Number,
		required: true
	},
	height: {
		type: Number,
		required: true
	},
	step: {
		type: Number,
		required: false,
		default: 200
	},
});
</script>

<template>
	<line
		v-for="i in (width / step) + 1"
		:key="`vertical_gridline_${i}`"
		:x1="x + (i - 1) * step"
		:y1="y"
		:x2="x + (i - 1) * step"
		:y2="y + height"
		stroke-width="3"
		stroke="#444"
		stroke-linecap="square"
	/>
	<line
		v-for="i in (height / step) + 1"
		:key="`horizontal_gridline_${i}`"
		:x1="x"
		:y1="y + (i - 1) * step"
		:x2="x + width"
		:y2="y + (i - 1) * step"
		stroke-width="3"
		stroke="#444"
		stroke-linecap="square"
	/>
</template>