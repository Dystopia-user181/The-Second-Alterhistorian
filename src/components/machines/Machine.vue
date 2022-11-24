<script setup>
import { onMount } from "@/components/mixins";

import { Pipe } from "@/js/machines/index";
import { player } from "@/js/player";

import ResourceStack from "./ResourceStack.vue";

import { arr, format, str } from "@/utils";


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

let inputs = $shallowRef([]);
let inputData = $shallowRef([]);
let outputs = $shallowRef([]);
let outputData = $shallowRef([]);
let animation = $ref(false);
let isMin = $ref(false);
let hasWholeBuyableUpgrades = $ref(false);
let hasPartialBuyableUpgrades = $ref(false);
let unlockedPipes = $ref(false);
let holdFunction = null, beforeDestroy = null;


onMount({
	onMount() {
		if (machine.isNew) {
			animation = true;
			requestAnimationFrame(() => delete machine.isNew);
			setTimeout(() => animation = false, 3000);
		}
	},
	beforeUnmount() {
		if (beforeDestroy) beforeDestroy();
	},
	update() {
		unlockedPipes = Pipe.isUnlocked;
		hasWholeBuyableUpgrades = machine.hasWholeBuyableUpgrades;
		hasPartialBuyableUpgrades = machine.hasPartialBuyableUpgrades;
		isMin = machine.isMinimized;
		inputs = machine.inputs;
		outputs = machine.outputs;
		inputData = inputs.map(x => ({
			stack: x.data,
			resource: str(x.displayResource[0]).capitalize,
			capacity: x.config.capacity,
			label: x.config.label
		}));
		outputData = outputs.map(x => ({
			stack: x.data,
			resource: str(x.displayResource[0]).capitalize,
			capacity: x.config.capacity,
			label: x.config.label
		}));
	},
	render() {
		if (holdFunction) holdFunction();
	}
});

function transferFromOutputToHolding(output) {
	if (!output.data.length || !output.isUnlocked) return;
	if (player.holding.amount <= 0) player.holding.resource = arr(output.data).last.resource;
	else if (player.holding.resource !== arr(output.data).last.resource) return;
	player.holding.amount += output.removeFromStack(output.config.capacity * 0.007);
	if (player.holding.amount < 0.001) player.holding.amount = 0;
}

function registerOutputHold(output, e) {
	if (!output.isUnlocked) return;
	if (e.button === 2) {
		allToHolding(output);
		return;
	}
	if (!holdFunction) {
		holdFunction = transferFromOutputToHolding.bind(null, output);
		const stopHolding = function() {
			holdFunction = null;
			document.removeEventListener("mouseup", stopHolding);
			document.removeEventListener("mouseleave", stopHolding);
			beforeDestroy = null;
		};
		document.addEventListener("mouseup", stopHolding);
		document.addEventListener("mouseleave", stopHolding);
		beforeDestroy = stopHolding;
	}
}

function allToHolding(output) {
	if (!output.data.length || !output.isUnlocked) return;
	if (player.holding.amount <= 0) player.holding.resource = arr(output.data).last.resource;
	else if (player.holding.resource !== arr(output.data).last.resource) return;
	player.holding.amount += output.removeFromStack(Infinity);
	if (player.holding.amount < 0.001) player.holding.amount = 0;
}

function transferFromHoldingToInput(input) {
	if (!input.isUnlocked) return;
	if (player.holding.amount <= 0 || !input.config.accepts.includes(player.holding.resource)) return;
	player.holding.amount -= input.addToStack({
		resource: player.holding.resource,
		amount: Math.min(input.config.capacity * 0.007, player.holding.amount)
	});
}

function registerInputHold(input, e) {
	if (!input.isUnlocked) return;
	if (e.button === 2) {
		allToInput(input);
		return;
	}
	if (!holdFunction) {
		holdFunction = transferFromHoldingToInput.bind(null, input);
		const stopHolding = function() {
			holdFunction = null;
			document.removeEventListener("mouseup", stopHolding);
			document.removeEventListener("mouseleave", stopHolding);
			beforeDestroy = null;
		};
		document.addEventListener("mouseup", stopHolding);
		document.addEventListener("mouseleave", stopHolding);
		beforeDestroy = stopHolding;
	}
}

function allToInput(input) {
	if (!input.isUnlocked) return;
	if (player.holding.amount <= 0 || !input.config.accepts.includes(player.holding.resource)) return;
	player.holding.amount -= input.addToStack({
		resource: player.holding.resource,
		amount: player.holding.amount
	});
}

function inputClassObject(input) {
	if (!input.isUnlocked) return "c-cursor-default";
	if (player.holding.amount === 0) return "c-cursor-default";
	return input.config.accepts.includes(player.holding.resource) ? "" : "c-cursor-notallowed";
}

function outputClassObject(output) {
	if (!output.isUnlocked) return "c-cursor-default";
	return (player.holding.resource !== output.displayResource[0] && player.holding.amount)
		? "c-cursor-default" : "";
}

function emitInputPipeDrag(id) {
	Pipe.removeAllInputPipesTo(machine, id);
	emit("input-pipe-drag-start", machine, id);
}

function emitInputPipeHover(id) {
	emit("input-pipe-hover", machine, id);
}

function emitOutputPipeDrag(id) {
	emit("output-pipe-drag-start", machine, id);
}

function emitOutputPipeHover(id) {
	emit("output-pipe-hover", machine, id);
}
</script>

<template>
	<div
		class="c-machine-container"
		:class="{
			'c-machine-container--new': animation,
			'c-machine-container--min': isMin,
			'c-glow-green': hasPartialBuyableUpgrades,
			'c-glow-yellow': hasWholeBuyableUpgrades,
		}"
	>
		<div
			v-if="unlockedPipes && inputs.length"
			class="c-pipe-container c-pipe-container--top"
		>
			Input Pipes
			<div
				v-for="input in inputs.filter(x => x.isUnlocked)"
				:key="input.id"
				class="c-machine__input-pipe"
				:style="{ left: `${input.id * 30 + 15}px`}"
				@mouseenter="emitInputPipeHover(input.id)"
				@mouseleave="emit('pipe-stop-hover')"
				@mousedown="emitInputPipeDrag(input.id)"
			>
				{{ input.id + 1 }}
			</div>
		</div>
		<div
			v-if="unlockedPipes || !isMin"
			class="c-emphasise-text c-machine__title"
			@mousedown="emit('move-machine-start', $event)"
		>
			<!-- This is a zws so it doesn't get collapsed -->
			<!-- eslint-disable-next-line no-irregular-whitespace -->
			{{ isMin ? "​" : machine.displayName }}
		</div>
		<div class="l-machine__inner">
			<span
				v-if="isMin"
				class="c-collapsed-text"
			>
				<b>{{ machine.displayName }}</b> (Collapsed)
			</span>
			<template v-else>
				<div
					v-for="(input, id) in inputs"
					:key="id"
					class="c-machine__input"
					:class="inputClassObject(input)"
					@mousedown="registerInputHold(input, $event)"
				>
					<resource-stack
						v-if="input.isUnlocked"
						:stack="input.data"
						:capacity="inputData[id].capacity"
					>
						{{ format(input.volume, 2, 1) }}<hr>{{ format(inputData[id].capacity, 2, 1) }}
						<br>
						Input {{ id + 1 }}
						<br>
						{{ inputData[id].resource }}
						<span v-if="inputData[id].label">
							<br>
							{{ inputData[id].label }}
						</span>
					</resource-stack>
					<span
						v-else
						class="fas fa-lock"
					/>
				</div>
				<div
					v-if="inputs.length && outputs.length"
					class="l-machine-input-output-separator"
				/>
				<div
					v-for="(output, id) in outputs"
					:key="id"
					class="c-machine__output"
					:class="outputClassObject(output)"
					@mousedown="registerOutputHold(output, $event)"
				>
					<resource-stack
						v-if="output.isUnlocked"
						:stack="output.data"
						:capacity="outputData[id].capacity"
					>
						{{ format(output.volume, 2, 1) }}<hr>{{ format(outputData[id].capacity, 2, 1) }}
						<br>
						Output {{ id + 1 }}
						<br>
						{{ outputData[id].resource }}
						<span v-if="outputData[id].label">
							<br>
							{{ outputData[id].label }}
						</span>
					</resource-stack>
					<span
						v-else
						class="fas fa-lock"
					/>
				</div>
			</template>
		</div>
		<div
			v-if="unlockedPipes && outputs.length"
			class="c-pipe-container"
		>
			Output Pipes
			<div
				v-for="output in outputs.filter(x => x.isUnlocked)"
				:key="output.id"
				class="c-machine__output-pipe"
				:style="{ left: `${output.id * 30 + 15}px`}"
				@mouseenter="emitOutputPipeHover(output.id)"
				@mouseleave="emit('pipe-stop-hover')"
				@mousedown="emitOutputPipeDrag(output.id)"
			>
				{{ output.id + 1 }}
			</div>
		</div>
	</div>
</template>

<style scoped>
.c-machine-container {
	background-color: #333333;
	height: 250px;
	padding: 3px 0;
	display: flex;
	flex-direction: column;
	align-items: center;
	position: absolute;
	border-radius: 0 10px 10px 10px;
	z-index: 1;
}

.l-machine__inner {
	align-self: stretch;
	height: 100%;
	display: flex;
	align-items: stretch;
	justify-content: center;
}

.l-machine__inner > span {
	align-self: center;
}

.c-machine__title {
	cursor: move;
	align-self: stretch;
	text-align: center;
	font-size: 16px;
}

.c-machine__input, .c-machine__output {
	display: flex;
	justify-content: center;
	align-items: center;
	margin: 1.5px 3px;
	min-width: 94px;
	background-color: rgba(15, 20, 25, 0.4);
	border: 2px solid #333333;
	transition: all 0.2s;
	flex-grow: 1;
	cursor: pointer;
	border-radius: 10px;
	overflow: hidden;
	white-space: pre-wrap;
}

.c-machine__input:active, .c-machine__output:active {
	border: 2px solid #dddddd;
}

.l-machine-input-output-separator {
	width: 2px;
	background-color: #dddddd;
	margin: 0 -1px;
	height: 95%;
	align-self: center;
}

.c-pipe-container {
	font-size: 0.67em;
	align-self: flex-start;
	margin-left: 5px;
}

.c-pipe-container--top {
	height: 0;
}

.c-machine__input-pipe {
	display: flex;
	justify-content: center;
	align-items: center;
	position: absolute;
	bottom: 100%;
	transform: translateX(-50%);
	background-color: #333333bb;
	width: 24px;
	height: 20px;
	border-radius: 4px 4px 0 0;
	cursor: pointer;
}

.c-machine__output-pipe {
	display: flex;
	justify-content: center;
	align-items: center;
	position: absolute;
	top: 100%;
	/* Hide border radius of container */
	transform: translateX(-50%) translateY(-4px);
	background-color: #333333bb;
	width: 24px;
	height: 24px;
	padding-top: 4px;
	border-radius: 0 0 4px 4px;
	cursor: pointer;
}

hr {
	margin: 2px 0;
}

.fa-lock {
	font-size: 80px;
}

.c-cursor-default {
	cursor: default;
}

.c-cursor-notallowed {
	cursor: not-allowed;
}

.c-machine-container--new {
	animation: a-just-bought 3s;
}

.c-machine-container--min {
	height: 110px;
	width: 160px;
}

.c-machine-container--min .l-machine__inner {
	min-width: 160px;
}

.c-collapsed-text {
	text-align: center;
}

@keyframes a-just-bought {
	0% { filter: brightness(400%) drop-shadow(0 0 50px #ffffff); }
	100% { filter: brightness(100%) drop-shadow(0 0 0 transparent); }
}
</style>