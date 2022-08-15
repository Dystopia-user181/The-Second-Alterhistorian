<script setup>
import { Currencies } from "@/js/database/currencies";

const props = defineProps({
	pipe: {
		type: Object,
		required: true
	}
});

const pipe = $computed(() => props.pipe);

const displayResource = $computed(() => pipe.out[1].displayResource[0]);
</script>

<template>
	<line
		:x1="pipe.out[0].data.x + pipe.out[1].id * 30 + 15"
		:y1="pipe.out[0].data.y + pipe.out[0].height + 10"
		:x2="pipe.in[0].data.x + pipe.in[1].id * 30 + 15"
		:y2="pipe.in[0].data.y - 10"
		stroke-width="9"
		stroke="#fff"
		stroke-linecap="round"
	/>
	<line
		:x1="pipe.out[0].data.x + pipe.out[1].id * 30 + 15"
		:y1="pipe.out[0].data.y + pipe.out[0].height + 10"
		:x2="pipe.in[0].data.x + pipe.in[1].id * 30 + 15"
		:y2="pipe.in[0].data.y - 10"
		stroke-width="5"
		:stroke="(displayResource === 'none' ? '#0000' : Currencies[displayResource].colour)"
		stroke-linecap="round"
	/>
</template>