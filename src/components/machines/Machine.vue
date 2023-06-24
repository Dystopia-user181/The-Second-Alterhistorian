<script setup lang="ts">
import ResourceStack from "./ResourceStack.vue";

import { onMount } from "@/components/mixins";

import { InputState, OutputState } from "@/js/machines/state";
import { MachineObjectType, Pipe } from "@/js/machines";
import { player } from "@/js/player";

import { ResourceData } from "@/types/resources";

import { arr, format, str } from "@/utils";


const { machine } = defineProps<{
	machine: MachineObjectType;
}>();

const emit = defineEmits<{
	(e: "input-pipe-drag-start", machine: MachineObjectType, id: number): void;
	(e: "output-pipe-drag-start", machine: MachineObjectType, id: number): void;
	(e: "input-pipe-hover", machine: MachineObjectType, id: number): void;
	(e: "output-pipe-hover", machine: MachineObjectType, id: number): void;
	(e: "pipe-stop-hover"): void;
	(e: "move-machine-start", event: MouseEvent): void;
}>();

interface StackDataType {
	stack: ResourceData[];
	resource: string;
	capacity: number;
	label?: string;
}
let inputs = $shallowRef<InputState<any, any>[]>([]);
let inputData = $shallowRef<StackDataType[]>([]);
let outputs = $shallowRef<OutputState<any, any>[]>([]);
let outputData = $shallowRef<StackDataType[]>([]);
let animation = $ref(false);
let isMin = $ref(false);
let hasWholeBuyableUpgrades = $ref(false);
let hasPartialBuyableUpgrades = $ref(false);
let unlockedPipes = $ref(false);
let holdFunction: (() => void) | null = null, beforeDestroy: (() => void) | null = null;


onMount({
	onMount() {
		if (machine.isNew) {
			animation = true;
			// eslint-disable-next-line vue/no-mutating-props
			requestAnimationFrame(() => machine.isNew = false);
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
			resource: str(x.statistics.displayResource[0]).capitalize,
			capacity: x.config.capacity,
			label: x.config.label
		}));
		outputData = outputs.map(x => ({
			stack: x.data,
			resource: str(x.statistics.displayResource[0]).capitalize,
			capacity: x.config.capacity
		}));
	},
	render() {
		if (holdFunction) holdFunction();
	}
});

function transferFromOutputToHolding(output: OutputState<any, any>) {
	const bottomOfStack = arr(output.data).last;
	if (!bottomOfStack || !output.isUnlocked) return;
	if (player.holding.amount <= 0) player.holding.resource = bottomOfStack.resource;
	else if (player.holding.resource !== bottomOfStack.resource) return;
	player.holding.amount += output.removeFromStack(output.config.capacity * 0.007);
	if (player.holding.amount < 0.001) player.holding.amount = 0;
}

function registerOutputHold(output: OutputState<any, any>, e: MouseEvent) {
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

function allToHolding(output: OutputState<any, any>) {
	const bottomOfStack = arr(output.data).last;
	if (!bottomOfStack || !output.isUnlocked) return;
	if (player.holding.amount <= 0) player.holding.resource = bottomOfStack.resource;
	else if (player.holding.resource !== bottomOfStack.resource) return;
	player.holding.amount += output.removeFromStack(Infinity);
	if (player.holding.amount < 0.001) player.holding.amount = 0;
}

function transferFromHoldingToInput(input: InputState<any, any>) {
	if (!input.isUnlocked) return;
	if (player.holding.amount <= 0 || !input.config.accepts.includes(player.holding.resource)) return;
	player.holding.amount -= input.addToStack({
		resource: player.holding.resource,
		amount: Math.min(input.config.capacity * 0.007, player.holding.amount)
	});
}

function registerInputHold(input: InputState<any, any>, e: MouseEvent) {
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

function allToInput(input: InputState<any, any>) {
	if (!input.isUnlocked) return;
	if (player.holding.amount <= 0 || !input.config.accepts.includes(player.holding.resource)) return;
	player.holding.amount -= input.addToStack({
		resource: player.holding.resource,
		amount: player.holding.amount
	});
}

function inputClassObject(input: InputState<any, any>) {
	if (!input.isUnlocked) return "c-cursor-default";
	if (player.holding.amount === 0) return "c-cursor-default";
	return input.config.accepts.includes(player.holding.resource) ? "" : "c-cursor-notallowed";
}

function outputClassObject(output: OutputState<any, any>) {
	if (!output.isUnlocked) return "c-cursor-default";
	return (player.holding.resource !== output.statistics.displayResource[0] && player.holding.amount)
		? "c-cursor-default" : "";
}

function emitInputPipeDrag(id: number) {
	Pipe.removeAllInputPipesTo(machine, id);
	emit("input-pipe-drag-start", machine, id);
}

function emitInputPipeHover(id: number) {
	emit("input-pipe-hover", machine, id);
}

function emitOutputPipeDrag(id: number) {
	emit("output-pipe-drag-start", machine, id);
}

function emitOutputPipeHover(id: number) {
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
			class="c-pipe-container"
		>
			<div
				v-for="input in inputs"
				:key="input.id"
				class="c-machine__input-pipe"
				:class="{ disabled: !input.isUnlocked }"
				:style="{ left: `${input.id * 90 + 45}px` }"
				@mouseenter="if (input.isUnlocked) emitInputPipeHover(input.id);"
				@mouseleave="if (input.isUnlocked) emit('pipe-stop-hover');"
				@mousedown="if (input.isUnlocked) emitInputPipeDrag(input.id);"
			>
				{{ input.isUnlocked ? input.id + 1 : "x" }}
			</div>
		</div>
		<div
			v-if="unlockedPipes || !isMin"
			class="c-emphasise-text c-machine__title"
			:style="{ width: `${90 * (inputs.length + outputs.length)}px` }"
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
			<div
				v-for="output in outputs"
				:key="output.id"
				class="c-machine__output-pipe"
				:class="{ disabled: !output.isUnlocked }"
				:style="{ left: `${(output.id + inputs.length) * 90 + 45}px`}"
				@mouseenter="if (output.isUnlocked) emitOutputPipeHover(output.id);"
				@mouseleave="if (output.isUnlocked) emit('pipe-stop-hover');"
				@mousedown="if (output.isUnlocked) emitOutputPipeDrag(output.id);"
			>
				{{ output.isUnlocked ? output.id + 1 : "x" }}
			</div>
		</div>
	</div>
</template>

<style scoped>
.c-machine-container {
	background-color: #333333;
	height: 270px;
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
	text-overflow: ellipsis;
	overflow: hidden;
}

.c-machine__input, .c-machine__output {
	display: flex;
	justify-content: center;
	align-items: center;
	margin: 1.5px 3px;
	min-width: 84px;
	background-color: rgba(15, 20, 25, 0.4);
	border: none;
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

.c-machine__input-pipe.disabled, .c-machine__output-pipe.disabled {
	cursor: default;
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
	overflow: hidden;
}

@keyframes a-just-bought {
	0% { filter: brightness(400%) drop-shadow(0 0 50px #ffffff); }
	100% { filter: brightness(100%) drop-shadow(0 0 0 transparent); }
}
</style>