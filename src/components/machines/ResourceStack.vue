<script setup>
import { watch } from "vue";

import { Currencies } from "@/js/currencies/currencies";

import { onMount } from "@/components/mixins";


const props = defineProps({
	stack: {
		type: Array,
		required: true
	},
	capacity: {
		type: Number,
		required: true
	}
});
let display = $ref([]);
const canvas = $ref(null);
let ctx;

function update() {
	const cap = props.capacity;
	if (props.stack.length <= 40) {
		display = props.stack.map(x => ({
			height: `${x.amount / cap * 100}%`,
			"background-color": Currencies[x.resource].colour
		}));
		return;
	}
	const internalDisplay = props.stack.map(x => ({
		height: x.amount / cap * 400,
		colour: Currencies[x.resource].colour,
	}));
	ctx.clearRect(0, 0, 1, 400);
	let height = 0;
	for (let i = internalDisplay.length - 1; i >= 0; i--) {
		const resource = internalDisplay[i];
		height += resource.height;
		ctx.fillStyle = resource.colour;
		ctx.fillRect(0, 400 - height, 1, resource.height);
	}
}
watch(props, update, { deep: true });

onMount({
	onMount() {
		ctx = canvas.getContext("2d");
		update();
	}
});
</script>

<template>
	<div class="c-resources-container">
		<span class="c-resources-container--text">
			<slot />
		</span>
		<div
			v-if="props.stack.length <= 40"
			class="c-resources-stack"
		>
			<div
				v-for="(style, id) in display"
				:key="id"
				:style="style"
			/>
		</div>
		<canvas
			ref="canvas"
			:style="{
				visibility: props.stack.length > 40 ? 'visible' : 'hidden'
			}"
			class="c-resources-stack__canvas"
			height="400"
			width="1"
		/>
	</div>
</template>

<style scoped>
.c-resources-container {
	height: 100%;
	width: 100%;
	position: relative;
	display: flex;
	align-items: center;
	justify-content: center;
}

.c-resources-container--text {
	position: relative;
	text-align: center;
	z-index: 1;
	font-size: 0.9em;
}

.c-resources-stack {
	position: absolute;
	width: 100%;
	height: 100%;
	inset: 0;
	display: flex;
	flex-direction: column;
	justify-content: flex-end;
}

.c-resources-stack__canvas {
	position: absolute;
	width: 100%;
	height: 100%;
	inset: 0;
}
</style>