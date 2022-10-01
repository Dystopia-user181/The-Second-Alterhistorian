<script setup>
import { Machine } from "@/js/machines/index";
import { Modals } from "@/js/ui/modals";

import { onMount } from "@/components/mixins";


const props = defineProps({
	machine: {
		type: Object,
		required: true
	}
});

const emit = defineEmits([
	"move-machine-start"
]);

const machine = $computed(() => props.machine);

let animation = $ref(false);
let isFullyUpgraded = $ref(false);
let hasPartialBuyableUpgrades = $ref(false);
let hasWholeBuyableUpgrades = $ref(false);


onMount({
	onMount() {
		if (machine.isNew) {
			animation = true;
		}
	},
	update() {
		isFullyUpgraded = machine.isFullyUpgraded;
		hasPartialBuyableUpgrades = machine.hasPartialBuyableUpgrades;
		hasWholeBuyableUpgrades = machine.hasWholeBuyableUpgrades;
	}
});

function openUpgrades() {
	Modals.machineUpgrades.show({ machine });
}

function showStatistics() {
	Modals.machineStatistics.show({ machine });
}

function deleteMachine() {
	if (shiftDown) {
		Machine.remove(machine);
	} else {
		Modals.removeMachine.show({ machine });
	}
}
</script>

<template>
	<div
		class="c-machine-sidebar"
		:class="{
			'c-machine-sidebar--new': animation
		}"
	>
		<div
			class="fas fa-arrows"
			@mousedown="emit('move-machine-start', $event)"
		/>
		<div
			class="fas"
			:class="machine.isMinimized ? 'fa-expand-arrows-alt' : 'fa-compress-arrows-alt'"
			@mousedown="machine.toggleMinimized()"
		/>
		<div
			v-if="machine.isUpgradeable"
			class="fas fa-arrow-up"
			:class="{
				'c-darker': isFullyUpgraded,
				'c-glow-green': hasPartialBuyableUpgrades,
				'c-glow-yellow': hasWholeBuyableUpgrades,
			}"
			@mousedown="openUpgrades()"
		/>
		<div
			v-if="!machine.isMinimized"
			class="fas fa-chart-bar"
			@mousedown="showStatistics()"
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

.c-machine-sidebar--new {
	animation: a-just-bought 3s;
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

@keyframes a-just-bought {
	0% { filter: brightness(400%) drop-shadow(0 0 50px #ffffff); }
	100% { filter: brightness(100%) drop-shadow(0 0 0 transparent); }
}
</style>