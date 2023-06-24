<script setup lang="ts">
import { Currencies } from "@/js/currencies/currencies";
import { ResourceType } from "@/types/resources";

const { type, size } = withDefaults(defineProps<{
	type: ResourceType;
	size: string;
}>(), ({
	size: "1em"
}));
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