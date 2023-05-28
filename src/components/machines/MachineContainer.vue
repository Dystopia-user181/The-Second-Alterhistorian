<script setup>
import { Machines } from "@/js/machines";
import { Towns } from "@/js/towns";

import { WindowProperties } from "@/components/mixins";

import MachineSidebar from "./MachineSidebar.vue";
import MachineVue from "./Machine.vue";


const { machine } = defineProps({
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

const pos = $computed(() => ({
	left: `${machine.data.x}px`,
	top: `${machine.data.y}px`
}));

const shouldExist = $computed(() => {
	const offsetX = Towns("current").playerData.display.offset.x;
	const offsetY = Towns("current").playerData.display.offset.y;
	const zoom = Towns("current").playerData.display.zoom;
	const machX = machine.data.x, machY = machine.data.y;
	const w2 = WindowProperties.width.value * 0.5 / zoom;
	const h2 = WindowProperties.height.value * 0.5 / zoom;
	return machX > offsetX - w2 - 600 &&
		machX < offsetX + w2 &&
		machY > offsetY - h2 - 330 &&
		machY < offsetY + h2 + 30;
});

function bringToTop() {
	// Bring machine to top for Machines object
	const idx = Machines[machine.townType].findIndex(x => x.id.toString() === machine.id.toString());
	if (idx === -1) return;
	Machines[machine.townType].push(machine);
	Machines[machine.townType].splice(idx, 1);

	// Bring machine to top in player to save the z-index between saves
	const playerData = Towns(machine.townType).playerData;
	const machineData = playerData.machines[idx];
	delete playerData.machines[idx];
	playerData.machines[idx] = machineData;
}
</script>

<template>
	<span
		v-if="shouldExist"
		@mousedown="bringToTop"
	>
		<machine-vue
			:machine="machine"
			:style="pos"
			@input-pipe-drag-start="(...args) => emit('input-pipe-drag-start', ...args)"
			@output-pipe-drag-start="(...args) => emit('output-pipe-drag-start', ...args)"
			@input-pipe-hover="(...args) => emit('input-pipe-hover', ...args)"
			@output-pipe-hover="(...args) => emit('output-pipe-hover', ...args)"
			@pipe-stop-hover="emit('pipe-stop-hover')"
			@move-machine-start="e => emit('move-machine-start', machine, e)"
		/>
		<machine-sidebar
			:machine="machine"
			:style="pos"
			@move-machine-start="e => emit('move-machine-start', machine, e)"
		/>
	</span>
</template>