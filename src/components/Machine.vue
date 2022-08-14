<script setup>
import { ref, shallowRef } from "vue";

import { onMount } from "@/components/mixins";

import { Pipe } from "@/js/machines/index";
import { player } from "@/js/player";

import { arr, format, Stack } from "@/utils/index";

import ResourceStack from "./ResourceStack.vue";

const props = defineProps({
	machine: {
		type: Object,
		required: true
	}
});

const emit = defineEmits([
	"input-pipe-drag-start", "input-pipe-hover",
	"output-pipe-drag-start", "output-pipe-hover",
	"pipe-stop-hover"
]);

const inputs = shallowRef([]);
const inputData = shallowRef([]);
const outputs = shallowRef([]);
const outputData = shallowRef([]);
const animation = ref(false);
const isMin = ref(false);
const hasUpgradeAvailable = ref(false);
const unlockedPipes = ref(false);
let holdFunction = null, beforeDestroy = null;


onMount({
	onMount() {
		if (props.machine.isNew) {
			animation.value = true;
			delete props.machine.isNew;
		}
	},
	beforeUnmount() {
		if (beforeDestroy) beforeDestroy();
	},
	update() {
		const machine = props.machine;
		unlockedPipes.value = Pipe.isUnlocked;
		hasUpgradeAvailable.value = machine.hasUpgradeAvailable;
		isMin.value = machine.data.min;
		inputs.value = machine.inputs.filter(x => x.isUnlocked);
		outputs.value = machine.outputs.filter(x => x.isUnlocked);
		inputData.value = inputs.value.map(x => ({
			stack: x.data,
			resource: x.displayResource[0],
			amount: Stack.volumeOfStack(x.data),
			capacity: x.config.capacity,
			label: x.config.label
		}));
		outputData.value = outputs.value.map(x => ({
			stack: x.data,
			resource: x.displayResource[0],
			amount: Stack.volumeOfStack(x.data),
			capacity: x.config.capacity,
			label: x.config.label
		}));
	},
	render() {
		if (holdFunction) holdFunction();
	}
});

function transferFromOutputToHolding(output) {
	if (!output.data.length) return;
	if (player.holding.amount <= 0) player.holding.resource = arr(output.data).last.resource;
	else if (player.holding.resource !== arr(output.data).last.resource) return;
	player.holding.amount += Stack.removeFromStack(output.data, output.config.capacity * 0.007);
	if (player.holding.amount < 0.001) player.holding.amount = 0;
}

function registerOutputHold(output, e) {
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
	if (!output.data.length) return;
	if (player.holding.amount <= 0) player.holding.resource = arr(output.data).last.resource;
	else if (player.holding.resource !== arr(output.data).last.resource) return;
	player.holding.amount += Stack.removeFromStack(output.data, arr(output.data).last.amount);
	if (player.holding.amount < 0.001) player.holding.amount = 0;
}

function transferFromHoldingToInput(input) {
	if (player.holding.amount <= 0 || !input.config.accepts.includes(player.holding.resource)) return;
	player.holding.amount -= Stack.addToStack(input.data, {
		resource: player.holding.resource,
		amount: Math.min(input.config.capacity * 0.007, player.holding.amount)
	}, input.config.capacity);
}

function registerInputHold(input, e) {
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
	if (player.holding.amount <= 0 || !input.config.accepts.includes(player.holding.resource)) return;
	player.holding.amount -= Stack.addToStack(input.data, {
		resource: player.holding.resource,
		amount: player.holding.amount
	}, input.config.capacity);
}

function inputClassObject(input) {
	if (player.holding.amount === 0) return "c-cursor-default";
	return input.config.accepts.includes(player.holding.resource) ? "" : "c-cursor-notallowed";
}

function outputClassObject(output) {
	if (!output.data.length) return "c-cursor-default";
	return (player.holding.resource !== arr(output.data).last.resource && player.holding.amount)
		? "c-cursor-default" : "";
}

function emitInputPipeDrag(id) {
	Pipe.removeAllInputPipesTo(props.machine, id);
	emit("input-pipe-drag-start", props.machine, id);
}

function emitInputPipeHover(id) {
	emit("input-pipe-hover", props.machine, id);
}

function emitOutputPipeDrag(id) {
	emit("output-pipe-drag-start", props.machine, id);
}

function emitOutputPipeHover(id) {
	emit("output-pipe-hover", props.machine, id);
}
</script>

<template>
	<div
		class="c-machine-container"
		:class="{
			'c-machine-container--new': animation,
			'c-machine-container--min': isMin,
			'c-glow-yellow': hasUpgradeAvailable,
		}"
	>
		<div
			v-if="unlockedPipes && inputs.length"
			class="c-pipe-container c-pipe-container--top"
		>
			Input Pipes
			<div
				v-for="input in inputs"
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
		<span class="c-emphasise-text">{{ machine.displayName }}</span>
		<div class="l-machine__inner">
			<span v-if="isMin">
				Collapsed
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
						:stack="inputData[id].stack"
						:capacity="inputData[id].capacity"
					>
						{{ format(inputData[id].amount, 2, 1) }}<hr>{{ format(inputData[id].capacity, 2, 1) }}
						<br>
						Input {{ id + 1 }}
						<br>
						{{ inputData[id].resource }}
						<span v-if="inputData[id].label">
							<br>
							{{ inputData[id].label }}
						</span>
					</resource-stack>
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
						:stack="outputData[id].stack"
						:capacity="outputData[id].capacity"
					>
						{{ format(outputData[id].amount, 2, 1) }}<hr>{{ format(outputData[id].capacity, 2, 1) }}
						<br>
						Output {{ id + 1 }}
						<br>
						{{ outputData[id].resource }}
						<span v-if="outputData[id].label">
							<br>
							{{ outputData[id].label }}
						</span>
					</resource-stack>
				</div>
				<span
					v-if="!inputs.length && !outputs.length"
					class="fas fa-lock"
				/>
			</template>
		</div>
		<div
			v-if="unlockedPipes && outputs.length"
			class="c-pipe-container"
		>
			Output Pipes
			<div
				v-for="output in outputs"
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
	padding: 3px 1.5px;
	display: flex;
	flex-direction: column;
	align-items: center;
	position: absolute;
	border-radius: 0 10px 10px 10px;
	z-index: 1;
}

.l-machine__inner {
	align-self: stretch;
	min-width: 250px;
	height: 100%;
	display: flex;
	align-items: stretch;
	justify-content: center;
}

.l-machine__inner > span {
	align-self: center;
}

.c-machine__input {
	min-width: 80px;
}

.c-machine__output {
	min-width: 100px;
}

.c-machine__input, .c-machine__output {
	margin: 1.5px 3px;
	border: 2px solid transparent;
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
	width: 5px;
}

.c-pipe-container {
	font-size: 0.7em;
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
	font-size: 200px;
	margin-top: 10px;
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
	height: 160px;
	width: 250px;
}

@keyframes a-just-bought {
	0% { filter: brightness(400%) drop-shadow(0 0 50px #ffffff); }
	100% { filter: brightness(100%) drop-shadow(0 0 0 transparent); }
}
</style>
