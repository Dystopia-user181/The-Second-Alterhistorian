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
		shouldExist = props.machine.data.x > player.display.offset.x - 600 &&
			props.machine.data.x < player.display.offset.x + window.innerWidth &&
			props.machine.data.y > player.display.offset.y - 300 &&
			props.machine.data.y < player.display.offset.y + window.innerHeight;
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