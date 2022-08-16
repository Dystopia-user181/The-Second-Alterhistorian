<script setup>
import { Currencies } from "@/js/database/currencies";
import { onMount } from "@/components/mixins";

const props = defineProps({
	pipe: {
		type: Object,
		required: true
	}
});

const pipe = $computed(() => props.pipe);

const displayResource = $computed(() => pipe.out[1].displayResource[0]);

const x1 = $computed(() => pipe.out[0].data.x + pipe.out[1].id * 30 + 15);
const y1 = $computed(() => pipe.out[0].data.y + pipe.out[0].height + 10);
const x2 = $computed(() => pipe.in[0].data.x + pipe.in[1].id * 30 + 15);
const y2 = $computed(() => pipe.in[0].data.y - 10);
const rx1 = $computed(() => Math.min(x1, x2));
const rx2 = $computed(() => Math.max(x1, x2));
const ry1 = $computed(() => Math.min(y1, y2));
const ry2 = $computed(() => Math.max(y1, y2));

let shouldExist = $ref(false);

onMount({
	update() {
		if (rx2 < player.display.offset.x || ry2 < player.display.offset.y)
			shouldExist = false;
		else if (rx1 > player.display.offset.x + innerWidth || ry1 > player.display.offset.y + innerHeight)
			shouldExist = false;
		else
			shouldExist = true;
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