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
let zoom = $ref(1);
let mouseX = $ref(0);
let mouseY = $ref(0);
let tabWidth = $ref(0);
let tabHeight = $ref(0);
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

const maxOffsetX = 5000;
const maxOffsetY = 4000;

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
	render() {
		mouseX = window.mouseX - machineTab.offsetLeft;
		mouseY = window.mouseY - machineTab.offsetTop;
		if (holdingFunction) holdingFunction();
		if (holdingKeyFunction) holdingKeyFunction();
		player.towns[player.currentlyIn].display.offset.x = Math.max(-maxOffsetX,
			Math.min(player.towns[player.currentlyIn].display.offset.x, maxOffsetX)
		);
		player.towns[player.currentlyIn].display.offset.y = Math.max(-maxOffsetY,
			Math.min(player.towns[player.currentlyIn].display.offset.y, maxOffsetY)
		);
		offsetX = player.towns[player.currentlyIn].display.offset.x;
		offsetY = player.towns[player.currentlyIn].display.offset.y;
		zoom = player.towns[player.currentlyIn].display.zoom;
		tabWidth = machineTab.offsetWidth;
		tabHeight = machineTab.offsetHeight;
	}
});
function registerOffsetHold(offset) {
	if (!holding) {
		holding = true;
		holdingFunction = function() {
			player.towns[player.currentlyIn].display.offset.x += offset[0] * 15 / zoom;
			player.towns[player.currentlyIn].display.offset.y += offset[1] * 15 / zoom;
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
		const { x, y } = player.towns[player.currentlyIn].display.offset;
		player.towns[player.currentlyIn].display.offset.x += offset[0] * 15 / zoom;
		player.towns[player.currentlyIn].display.offset.y += offset[1] * 15 / zoom;
		if (holdingMachine) {
			holdingMachine.data.x += (player.towns[player.currentlyIn].display.offset.x - x);
			holdingMachine.data.y += (player.towns[player.currentlyIn].display.offset.y - y);
			holdingMachineX += (player.towns[player.currentlyIn].display.offset.x - x);
			holdingMachineY += (player.towns[player.currentlyIn].display.offset.y - y);
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
	holdingMachineX = machine.data.x;
	holdingMachineY = machine.data.y;
	if (!holding) {
		holding = true;
		holdingMachine = machine;
		const followMouse = function(event) {
			machine.data.x = Math.min(
				Math.max(holdingMachineX + (event.clientX - e.clientX) / zoom, -maxOffsetX),
				maxOffsetX
			);
			machine.data.y = Math.min(
				Math.max(holdingMachineY + (event.clientY - e.clientY) / zoom, -maxOffsetY),
				maxOffsetY
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
		let { x, y } = player.towns[player.currentlyIn].display.offset;
		const followMouse = function(event2) {
			// Move board position with edge handling, then move reference point if it hits the edge
			player.towns[player.currentlyIn].display.offset.x = Math.max(Math.min(x +
				(event.clientX - event2.clientX) / zoom,
			maxOffsetX), -maxOffsetX);
			x = player.towns[player.currentlyIn].display.offset.x + (event2.clientX - event.clientX) / zoom;

			player.towns[player.currentlyIn].display.offset.y = Math.max(Math.min(y +
				(event.clientY - event2.clientY) / zoom,
			maxOffsetY), -maxOffsetY);
			y = player.towns[player.currentlyIn].display.offset.y + (event2.clientY - event.clientY) / zoom;
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

function gotoHome() {
	player.towns[player.currentlyIn].display.offset = { x: 0, y: 0 };
}

function changeZoom({ deltaY }) {
	const magnitude = Math.pow(0.9, Math.sign(deltaY));
	player.towns[player.currentlyIn].display.zoom *= magnitude;
	player.towns[player.currentlyIn].display.zoom = Math.min(
		Math.max(player.towns[player.currentlyIn].display.zoom, Math.pow(0.9, 6)),
		Math.pow(0.9, -6)
	);
}
</script>

<template>
	<div
		ref="machineTab"
		class="c-machine-tab"
		@mousedown="attemptUseDrag"
		@wheel="changeZoom"
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
			:viewBox="`-${maxOffsetX} -${maxOffsetY} ${2 * maxOffsetX} ${2 * maxOffsetY}`"
			:style="{
				transform: `
				translate(${tabWidth / 2 - maxOffsetX}px, ${tabHeight / 2 - maxOffsetY}px)
				scale(${zoom})
				translate(${-offsetX}px, ${-offsetY}px)`
			}"
			:width="2 * maxOffsetX"
			:height="2 * maxOffsetY"
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
					: mouseX / zoom + offsetX - tabWidth / 2 / zoom"
				:y2="(hoveringPipe.type && hoveringPipe.type !== draggingPipe.type)
					? hoveringPipe.machine.data.y + (hoveringPipe.type === 'input' ? -10
						: hoveringPipe.machine.height + 10)
					: mouseY / zoom + offsetY - tabHeight / 2 / zoom"
				stroke="gold"
				stroke-width="10"
				stroke-linecap="round"
			/>
		</svg>
		<div
			:style="{
				transform: `
				translate(${tabWidth / 2}px, ${tabHeight / 2}px)
				scale(${zoom})
				translate(${-offsetX}px, ${-offsetY}px)`
			}"
			class="l-machines-container"
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
			v-if="offsetX > -maxOffsetX"
			class="fas fa-chevron-left c-machine-tab__offset c-machine-tab__offset-left"
			@mousedown="registerOffsetHold([-1, 0])"
		/>
		<div
			v-if="offsetY > -maxOffsetY"
			class="fas fa-chevron-up c-machine-tab__offset c-machine-tab__offset-up"
			@mousedown="registerOffsetHold([0, -1])"
		/>
		<div
			v-if="offsetX < maxOffsetX"
			class="fas fa-chevron-right c-machine-tab__offset c-machine-tab__offset-right"
			@mousedown="registerOffsetHold([1, 0])"
		/>
		<div
			v-if="offsetY < maxOffsetY"
			class="fas fa-chevron-down c-machine-tab__offset c-machine-tab__offset-down"
			@mousedown="registerOffsetHold([0, 1])"
		/>
		<div
			class="fas fa-house c-machine-tab__goto-home"
			@mousedown="gotoHome"
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

.l-machines-container {
	width: 0;
	height: 0;
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

.c-machine-tab__goto-home {
	position: absolute;
	opacity: 0.5;
	right: 15px;
	bottom: 15px;
	font-size: 30px;
	cursor: pointer;
}

.c-machine-tab__goto-home:hover {
	opacity: 1;
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