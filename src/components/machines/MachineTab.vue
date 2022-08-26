<script setup>
import { Machines, Pipe, Pipes } from "@/js/machines/index";
import { Modals } from "@/js/ui/modals";
import { player } from "@/js/player";

import { onMount } from "@/components/mixins";

import MachineContainer from "./MachineContainer.vue";
import PipeConnection from "./PipeConnection.vue";

import { format, formatX } from "@/utils";


let holding = $ref(false);
let holdingMachine = null;
let holdingMachineX, holdingMachineY;
let beforeDestroy = null;
let offsetX = $ref(0);
let offsetY = $ref(0);
let width = $ref(0);
let height = $ref(0);
let mouseX = $ref(0);
let mouseY = $ref(0);
let holdingFunction = null;
let holdingKeyFunction = null;
const draggingPipe = $ref({
	type: "",
	machine: null,
	id: 0
});
const hoveringPipe = $ref({
	type: "",
	machine: null,
	id: 0
});

const machineTab = $ref(null);

const maxOffsetX = 5998;
const maxOffsetY = 2998;

const machines = $computed(() => Machines[player.currentlyIn]);
const pipes = $computed(() => Pipes[player.currentlyIn]);

onMount({
	on: {
		ARROW_KEYDOWN([key]) {
			if (Modals.isOpen) return;
			switch (key) {
				case "up":
					registerOffsetKey([0, -1]);
					break;
				case "right":
					registerOffsetKey([1, 0]);
					break;
				case "down":
					registerOffsetKey([0, 1]);
					break;
				case "left":
					registerOffsetKey([-1, 0]);
					break;
			}
		},
		ARROW_KEYUP() {
			deregisterOffsetKey();
		}
	},
	beforeUnmount() {
		if (beforeDestroy) beforeDestroy();
	},
	update() {
		width = machineTab.offsetWidth;
		height = machineTab.offsetHeight;
	},
	render() {
		mouseX = window.mouseX;
		mouseY = window.mouseY;
		if (holdingFunction) holdingFunction();
		if (holdingKeyFunction) holdingKeyFunction();
		player.display.offset.x = Math.min(player.display.offset.x, maxOffsetX - width);
		player.display.offset.y = Math.min(player.display.offset.y, maxOffsetY - height);
		offsetX = player.display.offset.x;
		offsetY = player.display.offset.y;
	}
});
function registerOffsetHold(offset) {
	if (!holding) {
		holding = true;
		holdingFunction = function() {
			player.display.offset.x = Math.max(Math.min(player.display.offset.x + offset[0] * 15,
				maxOffsetX - width), 0);
			player.display.offset.y = Math.max(Math.min(player.display.offset.y + offset[1] * 15,
				maxOffsetY - height), 0);
		};
		const stopHolding = function() {
			holding = false;
			holdingFunction = null;
			document.removeEventListener("mouseup", stopHolding);
			document.removeEventListener("mouseleave", stopHolding);
			beforeDestroy = null;
		};
		document.addEventListener("mouseup", stopHolding);
		document.addEventListener("mouseleave", stopHolding);
		beforeDestroy = stopHolding;
	}
}
function registerOffsetKey(offset) {
	holdingKeyFunction = function() {
		const { x, y } = player.display.offset;
		player.display.offset.x = Math.max(Math.min(player.display.offset.x + offset[0] * 15,
			maxOffsetX - width), 0);
		player.display.offset.y = Math.max(Math.min(player.display.offset.y + offset[1] * 15,
			maxOffsetY - height), 0);
		if (holdingMachine) {
			holdingMachine.data.x += (player.display.offset.x - x);
			holdingMachine.data.y += (player.display.offset.y - y);
			holdingMachineX += (player.display.offset.x - x);
			holdingMachineY += (player.display.offset.y - y);
		}
	};
}
function deregisterOffsetKey() {
	holdingKeyFunction = null;
}
function handlePipeDrag(type, machine, id) {
	holding = true;
	draggingPipe.type = type;
	draggingPipe.machine = machine;
	draggingPipe.id = id;
	const stopHolding = function() {
		document.removeEventListener("mouseup", stopHolding);
		document.removeEventListener("mouseleave", stopHolding);
		handlePipeStopDrag();
	};
	document.addEventListener("mouseup", stopHolding);
	document.addEventListener("mouseleave", stopHolding);
}
function handlePipeStopDrag() {
	holding = false;
	if (draggingPipe.type === "output") {
		if (hoveringPipe.type === "input") {
			Pipe.removeAllInputPipesTo(hoveringPipe.machine, hoveringPipe.id);
			draggingPipe.machine.addPipe(
				hoveringPipe.machine,
				hoveringPipe.id,
				draggingPipe.id
			);
		}
	} else if (draggingPipe.type === "input") {
		if (hoveringPipe.type === "output") {
			Pipe.removeAllInputPipesTo(draggingPipe.machine, draggingPipe.id);
			hoveringPipe.machine.addPipe(
				draggingPipe.machine,
				draggingPipe.id,
				hoveringPipe.id
			);
		}
	}
	draggingPipe.type = "";
	draggingPipe.machine = null;
}
function handlePipeHover(type, machine, id) {
	hoveringPipe.type = type;
	hoveringPipe.machine = machine;
	hoveringPipe.id = id;
}
function handlePipeStopHover() {
	hoveringPipe.type = "";
	hoveringPipe.machine = null;
}
function handleMoveMachineStart(machine, e) {
	holdingMachineX = machine.data.x - e.clientX;
	holdingMachineY = machine.data.y - e.clientY;
	if (!holding) {
		holding = true;
		holdingMachine = machine;
		const followMouse = function(event) {
			machine.data.x = Math.min(
				Math.max(holdingMachineX + event.clientX, 30),
				maxOffsetX - 270
			);
			machine.data.y = Math.min(
				Math.max(holdingMachineY + event.clientY, 30),
				maxOffsetY - 270
			);
		};
		document.addEventListener("mousemove", followMouse);
		const stopHolding = function() {
			holding = false;
			document.removeEventListener("mousemove", followMouse);
			document.removeEventListener("mouseup", stopHolding);
			document.removeEventListener("mouseleave", stopHolding);
			beforeDestroy = null;
			holdingMachine = null;
		};
		document.addEventListener("mouseup", stopHolding);
		document.addEventListener("mouseleave", stopHolding);
		beforeDestroy = stopHolding;
	}
}
function attemptUseDrag(event) {
	if (!holding) {
		holding = true;
		let { x, y } = player.display.offset;
		const followMouse = function(event2) {
			// Move board position with edge handling, then move reference point if it hits the edge
			player.display.offset.x = Math.max(Math.min(x + event.clientX - event2.clientX,
				maxOffsetX - width), 0);
			x = player.display.offset.x + event2.clientX - event.clientX;
			player.display.offset.y = Math.max(Math.min(y + event.clientY - event2.clientY,
				maxOffsetY - height), 0);
			y = player.display.offset.y + event2.clientY - event.clientY;
		};
		document.addEventListener("mousemove", followMouse);
		const stopHolding = function() {
			holding = false;
			document.removeEventListener("mousemove", followMouse);
			document.removeEventListener("mouseup", stopHolding);
			document.removeEventListener("mouseleave", stopHolding);
			beforeDestroy = null;
			holdingMachine = null;
		};
		document.addEventListener("mouseup", stopHolding);
		document.addEventListener("mouseleave", stopHolding);
		beforeDestroy = stopHolding;
	}
}
</script>

<template>
	<div
		ref="machineTab"
		class="c-machine-tab"
		@mousedown="attemptUseDrag"
	>
		<span class="c-machine-tab__fast-time-display">
			Fast Time: {{ format(player.fastTime, 2, 2) }}s
			<template v-if="player.fastTime > 0">
				<br>
				Time speedup: {{ formatX(4, 2, 1) }}
			</template>
		</span>
		<svg
			ref="canvas"
			class="c-machine-tab__canvas"
			:style="{
				transform: `translate(-${offsetX}px, -${offsetY}px)`
			}"
			:width="maxOffsetX"
			:height="maxOffsetY"
		>
			<pipe-connection
				v-for="(pipe, id) in pipes"
				:key="id"
				:pipe="pipe"
			/>
			<line
				v-if="draggingPipe.type"
				class="c-machine-tab__dragging-pipe"
				:x1="draggingPipe.machine.data.x + draggingPipe.id * 30 + 15"
				:y1="draggingPipe.machine.data.y + (draggingPipe.type === 'input' ? -10
					: draggingPipe.machine.height + 10)"
				:x2="(hoveringPipe.type && hoveringPipe.type !== draggingPipe.type)
					? hoveringPipe.machine.data.x + hoveringPipe.id * 30 + 15
					: mouseX + machineTab.offsetLeft + offsetX"
				:y2="(hoveringPipe.type && hoveringPipe.type !== draggingPipe.type)
					? hoveringPipe.machine.data.y + (hoveringPipe.type === 'input' ? -10
						: hoveringPipe.machine.height + 10)
					: mouseY - machineTab.offsetTop + offsetY"
				stroke="gold"
				stroke-width="10"
				stroke-linecap="round"
			/>
		</svg>
		<div
			:style="{
				transform: `translate(-${offsetX}px, -${offsetY}px)`
			}"
		>
			<machine-container
				v-for="machine in machines"
				:key="machine.id"
				:machine="machine"
				@input-pipe-drag-start="(machine, id) => handlePipeDrag('input', machine, id)"
				@output-pipe-drag-start="(machine, id) => handlePipeDrag('output', machine, id)"
				@input-pipe-hover="(machine, id) => handlePipeHover('input', machine, id)"
				@output-pipe-hover="(machine, id) => handlePipeHover('output', machine, id)"
				@pipe-stop-hover="handlePipeStopHover"
				@move-machine-start="handleMoveMachineStart"
			/>
		</div>
		<div
			v-if="offsetX > 0"
			class="fas fa-chevron-left c-machine-tab__offset c-machine-tab__offset-left"
			@mousedown="registerOffsetHold([-1, 0])"
		/>
		<div
			v-if="offsetY > 0"
			class="fas fa-chevron-up c-machine-tab__offset c-machine-tab__offset-up"
			@mousedown="registerOffsetHold([0, -1])"
		/>
		<div
			v-if="offsetX < maxOffsetX - width"
			class="fas fa-chevron-right c-machine-tab__offset c-machine-tab__offset-right"
			@mousedown="registerOffsetHold([1, 0])"
		/>
		<div
			v-if="offsetY < maxOffsetY - height"
			class="fas fa-chevron-down c-machine-tab__offset c-machine-tab__offset-down"
			@mousedown="registerOffsetHold([0, 1])"
		/>
	</div>
</template>

<style scoped>
.c-machine-tab {
	background-color: #202020;
	overflow: hidden;
	position: relative;
	flex: 1 0 auto;
	align-self: stretch;
	justify-self: stretch;
}

.c-machine-tab__offset {
	position: absolute;
	opacity: 0.5;
	font-size: 30px;
	cursor: pointer;
	z-index: 2;
}

.c-machine-tab__offset:hover {
	text-shadow: 0 0 5px;
}

.c-machine-tab__offset:active {
	opacity: 1;
}

.c-machine-tab__offset-left {
	left: 0;
	top: 50%;
	transform: translateY(-50%) scaleY(1.5);
}

.c-machine-tab__offset-up {
	top: 0;
	left: 50%;
	transform: translateX(-50%) scaleX(1.5);
}

.c-machine-tab__offset-right {
	right: 0;
	top: 50%;
	transform: translateY(-50%) scaleY(1.5);
}

.c-machine-tab__offset-down {
	bottom: 0;
	left: 50%;
	transform: translateX(-50%) scaleX(1.5);
}

.c-machine-tab__canvas {
	position: absolute;
	top: 0;
	left: 0;
}

.c-machine-tab__fast-time-display {
	pointer-events: none;
	position: absolute;
	left: 0;
	top: 0;
	z-index: 3;
	padding: 5px;
	background-color: #24242488;
	border-bottom-right-radius: 5px;
}

.c-machine-tab__dragging-pipe {
	animation: a-opacity 2s infinite;
}

@keyframes a-opacity {
	0% { opacity: 1; }
	50% { opacity: 0.6; }
	100% { opacity: 1; }
}
</style>