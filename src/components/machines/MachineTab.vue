<script setup>
import { Machines, Pipe, Pipes } from "@/js/machines/index";
import { TOWNS, Towns } from "@/js/towns";
import { Modals } from "@/js/ui/modals.ts";
import { player } from "@/js/player";

import { HoldMoveHandler, ViewMoveHandler } from "@/utils/view-move-handler";

import { onMount } from "@/components/mixins";

import GridDisplay from "./GridDisplay.vue";
import MachineContainer from "./MachineContainer.vue";
import Minimap from "./Minimap.vue";
import PipeConnection from "./PipeConnection.vue";

import { format, formatX } from "@/utils";

const view = new ViewMoveHandler({
	get offsetX() { return Towns("current").playerData.display.offset.x; },
	set offsetX(v) { Towns("current").playerData.display.offset.x = v; },

	get offsetY() { return Towns("current").playerData.display.offset.y; },
	set offsetY(v) { Towns("current").playerData.display.offset.y = v; },

	get zoom() { return Towns("current").playerData.display.zoom; },
	set zoom(v) { Towns("current").playerData.display.zoom = v; },

	maxOffsetX: TOWNS.MAX_OFFSET_X,
	maxOffsetY: TOWNS.MAX_OFFSET_Y,
	maxZoom: 2,
	isBlockingMove: false,
});

let holdingMachine = null;
let beforeDestroy = null;
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

const machines = $computed(() => Machines[player.currentlyIn]);
const pipes = $computed(() => Pipes[player.currentlyIn]);

const pressedKeys = {
	up: false,
	down: false,
	left: false,
	right: false
};

onMount({
	on: {
		ARROW_KEYDOWN([key]) {
			pressedKeys[key] = true;

			registerOffsetKey();
		},
		ARROW_KEYUP([key]) {
			pressedKeys[key] = false;

			registerOffsetKey();
		}
	},
	onMount() {
		view.mount(machineTab);
	},
	beforeUnmount() {
		if (beforeDestroy) beforeDestroy();
		view.unmount();
	},
	render() {
		mouseX = view._mouseX;
		mouseY = view._mouseY;
		if (holdingFunction) holdingFunction();
		if (holdingKeyFunction) holdingKeyFunction();
		tabWidth = machineTab.offsetWidth;
		tabHeight = machineTab.offsetHeight;
	}
});
function registerOffsetHold(offset) {
	if (!view.config.isBlockingMove) {
		view.config.isBlockingMove = true;
		holdingFunction = function() {
			Towns("current").changeOffset(offset[0] * 15 / view.zoom, offset[1] * 15 / view.zoom);
		};
		const stopHolding = function() {
			view.config.isBlockingMove = false;
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
function registerOffsetKey() {
	const offset = [0, 0];

	if (pressedKeys.left) {
		offset[0] = -1;
	} else if (pressedKeys.right) {
		offset[0] = 1;
	}

	if (pressedKeys.up) {
		offset[1] = -1;
	} else if (pressedKeys.down) {
		offset[1] = 1;
	}

	if (offset[0] === 0 && offset[1] === 0) {
		holdingKeyFunction = null;
		return;
	}

	holdingKeyFunction = function() {
		if (Modals.isOpen)
			return;

		const { x, y } = Towns("current").playerData.display.offset;
		Towns("current").changeOffset(offset[0] * 15 / view.zoom, offset[1] * 15 / view.zoom);
		if (holdingMachine) {
			holdingMachine.changePositionBy(
				Towns("current").playerData.display.offset.x - x,
				Towns("current").playerData.display.offset.y - y
			);
			hold.resetPerspective();
		}
	};
}
function handlePipeDrag(type, machine, id) {
	view.config.isBlockingMove = true;
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
	view.config.isBlockingMove = false;
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

const hold = new HoldMoveHandler({
	get x() { return holdingMachine.data.x; },
	set x(v) { holdingMachine.moveTo(v, undefined); },

	get y() { return holdingMachine.data.y; },
	set y(v) { holdingMachine.moveTo(undefined, v); },
}, view);

hold.addEventListener("stopholding", () => holdingMachine = null);

function handleMoveMachineStart(machine) {
	holdingMachine = machine;
	hold.trigger();
}
</script>

<template>
	<div
		ref="machineTab"
		class="c-machine-tab"
	>
		<minimap />
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
			:viewBox="`
				-${TOWNS.MAX_OFFSET_X} -${TOWNS.MAX_OFFSET_Y}
				${2 * TOWNS.MAX_OFFSET_X} ${2 * TOWNS.MAX_OFFSET_Y}
			`"
			:style="{
				transform: `
				translate(${tabWidth / 2 - TOWNS.MAX_OFFSET_X}px, ${tabHeight / 2 - TOWNS.MAX_OFFSET_Y}px)
				scale(${view.zoom})
				translate(${-view.offsetX}px, ${-view.offsetY}px)`
			}"
			:width="2 * TOWNS.MAX_OFFSET_X"
			:height="2 * TOWNS.MAX_OFFSET_Y"
		>
			<grid-display
				v-if="player.options.showGridlines"
				:x="-TOWNS.MAX_OFFSET_X"
				:y="-TOWNS.MAX_OFFSET_Y"
				:width="TOWNS.MAX_OFFSET_X * 2"
				:height="TOWNS.MAX_OFFSET_Y * 2"
				:step="TOWNS.GRID_SIZE"
			/>
			<pipe-connection
				v-for="(pipe, id) in pipes"
				:key="id"
				:pipe="pipe"
			/>
			<line
				v-if="draggingPipe.type"
				class="c-machine-tab__dragging-pipe"
				:x1="draggingPipe.machine.data.x + (draggingPipe.id + (draggingPipe.type === 'input' ? 0
					: draggingPipe.machine.inputs.length)) * 90 + 45"
				:y1="draggingPipe.machine.data.y + (draggingPipe.type === 'input' ? -10
					: draggingPipe.machine.height + 10)"
				:x2="(hoveringPipe.type && hoveringPipe.type !== draggingPipe.type)
					? hoveringPipe.machine.data.x + (hoveringPipe.id + (hoveringPipe.type === 'input' ? 0
						: hoveringPipe.machine.inputs.length)) * 90 + 45
					: mouseX / view.zoom + view.offsetX - tabWidth / 2 / view.zoom"
				:y2="(hoveringPipe.type && hoveringPipe.type !== draggingPipe.type)
					? hoveringPipe.machine.data.y + (hoveringPipe.type === 'input' ? -10
						: hoveringPipe.machine.height + 10)
					: mouseY / view.zoom + view.offsetY - tabHeight / 2 / view.zoom"
				stroke="gold"
				stroke-width="10"
				stroke-linecap="round"
			/>
		</svg>
		<div
			:style="{
				transform: `
				translate(${tabWidth / 2}px, ${tabHeight / 2}px)
				scale(${view.zoom})
				translate(${-view.offsetX}px, ${-view.offsetY}px)`
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
			v-if="view.offsetX > -TOWNS.MAX_OFFSET_X"
			class="fas fa-chevron-left c-machine-tab__offset c-machine-tab__offset-left"
			@mousedown="registerOffsetHold([-1, 0])"
		/>
		<div
			v-if="view.offsetY > -TOWNS.MAX_OFFSET_Y"
			class="fas fa-chevron-up c-machine-tab__offset c-machine-tab__offset-up"
			@mousedown="registerOffsetHold([0, -1])"
		/>
		<div
			v-if="view.offsetX < TOWNS.MAX_OFFSET_X"
			class="fas fa-chevron-right c-machine-tab__offset c-machine-tab__offset-right"
			@mousedown="registerOffsetHold([1, 0])"
		/>
		<div
			v-if="view.offsetY < TOWNS.MAX_OFFSET_Y"
			class="fas fa-chevron-down c-machine-tab__offset c-machine-tab__offset-down"
			@mousedown="registerOffsetHold([0, 1])"
		/>
		<div
			class="fas fa-house c-machine-tab__goto-home"
			@mousedown="Towns('current').returnHome()"
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