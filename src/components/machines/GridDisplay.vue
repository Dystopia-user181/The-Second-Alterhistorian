<script setup lang="ts">
const { x, y, width, height, step = 200 } = defineProps<{
	x: number;
	y: number;
	width: number;
	height: number;
	step: number;
}>();
</script>

<template>
	<line
		v-for="i in (width / step) + 1"
		:key="`vertical_gridline_${i}`"
		:x1="x + (i - 1) * step"
		:y1="y"
		:x2="x + (i - 1) * step"
		:y2="y + height"
		stroke-width="2"
		stroke="#333"
		stroke-linecap="square"
	/>
	<line
		v-for="i in (height / step) + 1"
		:key="`horizontal_gridline_${i}`"
		:x1="x"
		:y1="y + (i - 1) * step"
		:x2="x + width"
		:y2="y + (i - 1) * step"
		stroke-width="2"
		stroke="#333"
		stroke-linecap="square"
	/>
</template>