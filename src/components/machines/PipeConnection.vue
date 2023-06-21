<script setup>
import { Currencies } from "@/js/currencies/currencies.ts";
import { player } from "@/js/player";


import { onMount } from "@/components/mixins";


const props = defineProps({
	pipe: {
		type: Object,
		required: true
	}
});

const pipe = $computed(() => props.pipe);

const displayResource = $computed(() => pipe.out[1].statistics.displayResource[0]);

const x1 = $computed(() => pipe.out[0].data.x + (pipe.out[1].id + pipe.out[0].inputs.length) * 90 + 45);
const y1 = $computed(() => pipe.out[0].data.y + pipe.out[0].height + 10);
const x2 = $computed(() => pipe.in[0].data.x + pipe.in[1].id * 90 + 45);
const y2 = $computed(() => pipe.in[0].data.y - 10);
const rx1 = $computed(() => Math.min(x1, x2));
const rx2 = $computed(() => Math.max(x1, x2));
const ry1 = $computed(() => Math.min(y1, y2));
const ry2 = $computed(() => Math.max(y1, y2));

let w2 = $ref(0);
let h2 = $ref(0);
const shouldExist = $computed(() => {
	const offsetX = player.towns[player.currentlyIn].display.offset.x;
	const offsetY = player.towns[player.currentlyIn].display.offset.y;
	const z = player.towns[player.currentlyIn].display.zoom;
	if (rx2 < offsetX - w2 / z - 7 || ry2 < offsetY - h2 / z + 7)
		return false;

	if (rx1 > offsetX + w2 / z - 7 || ry1 > offsetY + h2 / z + 7)
		return false;

	return true;
});

onMount({
	update() {
		w2 = innerWidth / 2;
		h2 = innerHeight / 2;
	}
});
</script>

<template>
	<template v-if="shouldExist">
		<line
			:x1="x1"
			:y1="y1"
			:x2="x2"
			:y2="y2"
			stroke-width="9"
			stroke="#fff"
			stroke-linecap="round"
		/>
		<line
			:x1="x1"
			:y1="y1"
			:x2="x2"
			:y2="y2"
			stroke-width="5"
			:stroke="(displayResource === 'none' ? '#0000' : Currencies[displayResource].colour)"
			stroke-linecap="round"
		/>
	</template>
</template>