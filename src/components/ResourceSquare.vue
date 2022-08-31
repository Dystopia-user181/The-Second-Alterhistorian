<script setup>
import { Currencies } from "@/js/currencies/currencies.ts";

const { type, size } = defineProps({
	type: {
		type: String,
		required: true
	},
	size: {
		type: String,
		default: "1em"
	}
});
</script>

<template>
	<div
		v-if="Currencies[type]"
		class="c-resource-square"
		:style="{
			'background-color': Currencies[type].colour,
			'width': size,
			'height': size
		}"
	/>
</template>

<style scoped>
.c-resource-square {
	display: inline-block;
	vertical-align: middle;
}
</style>