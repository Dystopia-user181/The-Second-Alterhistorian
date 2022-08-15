<script setup>
import { computed } from "vue";

import { Machine } from "@/js/machines/index";
import { Modals } from "@/js/ui/modals";

const props = defineProps({
	machine: {
		type: Object,
		required: true
	}
});

const emit = defineEmits([
	"move-machine-start"
]);

const machine = computed(() => props.machine);

function openUpgrades() {
	Modals.machineUpgrades.show({ machine: machine.value });
}

function deleteMachine() {
	if (shiftDown) {
		Machine.remove(machine.value);
	} else {
		Modals.removeMachine.show({ machine: machine.value });
	}
}
</script>

<template>
	<div class="c-machine-sidebar">
		<div
			class="fas fa-arrows"
			@mousedown="emit('move-machine-start', $event)"
		/>
		<div
			v-if="machine.isUpgradeable"
			class="fas fa-arrow-up"
			:class="{
				'c-darker': machine.isFullyUpgraded,
				'c-glow-green': machine.notifyPartialUpgrade,
				'c-glow-yellow': machine.notifyUpgrade,
			}"
			@mousedown="openUpgrades()"
		/>
		<div
			class="fas fa-info-circle"
			@mousedown="machine.showDescription()"
		/>
		<div
			class="fas fa-chart-bar"
			@mousedown="machine.showProduction()"
		/>
		<div
			class="fas"
			:class="machine.data.min ? 'fa-expand-arrows-alt' : 'fa-compress-arrows-alt'"
			@mousedown="machine.toggleMinimized()"
		/>
		<div
			v-if="!machine.data.isDefault"
			class="fas fa-trash"
			@mousedown="deleteMachine()"
		/>
	</div>
</template>

<style scoped>
.c-machine-sidebar {
	position: absolute;
	display: flex;
	flex-direction: column;
	transform: translateX(calc(0.3px - 100%));
	z-index: 1;
}

.c-machine-sidebar .fas {
	width: 25px;
	height: 25px;
	display: flex;
	align-items: center;
	justify-content: center;
	background-color: #333333;
	border-radius: 5px 0 0 5px;
	font-size: 1.1em;
	transition: text-shadow 0.3s;
}

.c-machine-sidebar .fas:hover {
	text-shadow: 0 0 5px;
}

.c-machine-sidebar .fas:nth-child(even) {
	opacity: 0.7;
}

.c-machine-sidebar .fa-arrows {
	cursor: move;
}

.c-machine-sidebar .fa-arrow-up,
.c-machine-sidebar .fa-expand-arrows-alt,
.c-machine-sidebar .fa-compress-arrows-alt {
	cursor: pointer;
}

.c-machine-sidebar .fa-info-circle,
.c-machine-sidebar .fa-chart-bar {
	cursor: help;
}

.c-machine-sidebar .fa-trash {
	cursor: pointer;
	color: #cc5555;
}
</style>