<script setup lang="ts">
import { Machine, MachineObjectType } from "@/js/machines";
import { Modals } from "@/js/ui/modals";

import { onMount } from "@/components/mixins";


const { machine } = defineProps<{
	machine: MachineObjectType;
}>();

const emit = defineEmits<{
	(e: "move-machine-start", event: MouseEvent): void
}>();

let animation = $ref(false);
let isFullyUpgraded = $ref(false);
let hasPartialBuyableUpgrades = $ref(false);
let hasWholeBuyableUpgrades = $ref(false);


onMount({
	onMount() {
		if (machine.isNew) {
			animation = true;
			setTimeout(() => animation = false, 3000);
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
		<span
			tooltip="Move"
			tooltip-left
		>
			<div
				class="fas fa-arrows"
				@mousedown="emit('move-machine-start', $event)"
			/>
		</span>
		<span
			v-if="machine.isUpgradeable"
			tooltip="Upgrades"
			tooltip-left
		>
			<div
				class="fas fa-arrow-up"
				:class="{
					'c-darker': isFullyUpgraded,
					'c-glow-green': hasPartialBuyableUpgrades,
					'c-glow-yellow': hasWholeBuyableUpgrades,
				}"
				@mousedown="openUpgrades()"
			/>
		</span>
		<span
			tooltip="Info and Production"
			tooltip-left
		>
			<div
				class="fas fa-info-circle"
				@mousedown="showStatistics()"
			/>
		</span>
		<span
			v-if="!machine.data.isDefault"
			tooltip="Delete"
			tooltip-left
		>
			<div
				class="fas fa-trash"
				@mousedown="deleteMachine()"
			/>
		</span>
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

.c-machine-sidebar [tooltip]::before {
	font-weight: bold;
}

.c-machine-sidebar .fas:hover {
	text-shadow: 0 0 5px;
}

.c-machine-sidebar span:nth-child(even) .fas {
	background-color: #282828;
}

.c-machine-sidebar .fa-arrows {
	cursor: move;
}

.c-machine-sidebar .fa-arrow-up,
.c-machine-sidebar .fa-info-circle {
	cursor: pointer;
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