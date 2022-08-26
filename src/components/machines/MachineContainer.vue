<script setup>
import { computed } from "vue";

import { onMount } from "@/components/mixins";

import MachineSidebar from "./MachineSidebar.vue";
import MachineVue from "./Machine.vue";


const props = defineProps({
	machine: {
		type: Object,
		required: true
	}
});

const emit = defineEmits([
	"input-pipe-drag-start", "input-pipe-hover",
	"output-pipe-drag-start", "output-pipe-hover",
	"pipe-stop-hover",
	"move-machine-start"
]);

const pos = computed(() => ({
	left: `${props.machine.data.x}px`,
	top: `${props.machine.data.y}px`
}));

let shouldExist = $ref(false);

onMount({
	update() {
		const offsetX = player.towns[player.currentlyIn].display.offset.x;
		const offsetY = player.towns[player.currentlyIn].display.offset.y;
		const z = player.towns[player.currentlyIn].display.zoom;
		const machX = props.machine.data.x, machY = props.machine.data.y;
		const w2 = innerWidth / 2 / z, h2 = innerHeight / 2 / z;
		shouldExist = machX > offsetX - w2 - 600 / z &&
			machX < offsetX + w2 &&
			machY > offsetY - h2 - 300 / z &&
			machY < offsetY + h2;
	}
});
</script>

<template>
	<span v-if="shouldExist">
		<machine-vue
			:machine="props.machine"
			:style="pos"
			@input-pipe-drag-start="(...args) => emit('input-pipe-drag-start', ...args)"
			@output-pipe-drag-start="(...args) => emit('output-pipe-drag-start', ...args)"
			@input-pipe-hover="(...args) => emit('input-pipe-hover', ...args)"
			@output-pipe-hover="(...args) => emit('output-pipe-hover', ...args)"
			@pipe-stop-hover="emit('pipe-stop-hover')"
			@move-machine-start="e => emit('move-machine-start', machine, e)"
		/>
		<machine-sidebar
			:machine="props.machine"
			:style="pos"
			@move-machine-start="e => emit('move-machine-start', machine, e)"
		/>
	</span>
</template>