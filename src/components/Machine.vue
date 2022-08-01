<script>
import { Stack } from "./../js/stack";

import ResourceStack from "./ResourceStack.vue";

export default {
	name: "Machine",
	components: {
		ResourceStack
	},
	props: {
		machine: {
			type: Object,
			required: true
		}
	},
	data() {
		return {
			inputs: [],
			inputData: [],
			outputs: [],
			outputData: [],
			holdFunction: null,
			beforeDestroy: null,
			animation: false,
			unlockedPipes: false
		}
	},
	mounted() {
		if (this.machine.isNew) {
			this.animation = true
			delete this.machine.isNew;
		}
	},
	beforeUnmount() { 
		if (this.beforeDestroy) this.beforeDestroy();
	},
	methods: {
		update() {
			this.unlockedPipes = Pipe.isUnlocked;
			this.inputs = this.machine.inputs.filter(x => x.isUnlocked);
			this.outputs = this.machine.outputs.filter(x => x.isUnlocked);
			this.inputData = this.inputs.map(x => {
				const intermediate = findLast(this.machine.inputHistories, y => y[x.id].length);
				return {
					stack: x.data,
					resource: intermediate ? last(intermediate[x.id]).resource.capitalize() : "None",
					amount: Stack.volumeOfStack(x.data),
					capacity: x.config.capacity,
					label: x.config.label
				};
			});
			this.outputData = this.outputs.map(x => {
				const intermediate = findLast(this.machine.outputHistories, y => y[x.id].length);
				return {
					stack: x.data,
					resource: intermediate ? last(intermediate[x.id]).resource.capitalize() : "None",
					amount: Stack.volumeOfStack(x.data),
					capacity: x.config.capacity,
					label: x.config.label
				};
			});
			if (this.holdFunction) this.holdFunction();
		},
		transferFromOutputToHolding(output) {
			if (!output.data.length) return;
			if (player.holding.amount <= 0) player.holding.resource = last(output.data).resource;
			else if (player.holding.resource !== last(output.data).resource) return;
			player.holding.amount += Stack.removeFromStack(output.data, output.config.capacity * 0.007);
			if (player.holding.amount < 0.001) player.holding.amount = 0;
		},
		registerOutputHold(id, e) {
			if (e.button === 2) {
				this.allToHolding(id);
				return;
			}
			if (!this.holdFunction) {
				this.holdFunction = this.transferFromOutputToHolding.bind(this, this.outputs[id]);
				const stopHolding = function() {
					this.holdFunction = null;
					document.removeEventListener("mouseup", stopHolding);
					document.removeEventListener("mouseleave", stopHolding);
					this.beforeDestroy = null;
				}.bind(this);
				document.addEventListener("mouseup", stopHolding);
				document.addEventListener("mouseleave", stopHolding);
				this.beforeDestroy = stopHolding;
			}
		},
		allToHolding(id) {
			const output = this.outputs[id];
			if (!output.data.length) return;
			if (player.holding.amount <= 0) player.holding.resource = last(output.data).resource;
			else if (player.holding.resource !== last(output.data).resource) return;
			player.holding.amount += Stack.removeFromStack(output.data, last(output.data).amount);
			if (player.holding.amount < 0.001) player.holding.amount = 0;
		},
		transferFromHoldingToInput(input) {
			if (player.holding.amount <= 0 || !input.config.accepts.includes(player.holding.resource)) return;
			player.holding.amount = player.holding.amount - Stack.addToStack(input.data, {
				resource: player.holding.resource,
				amount: Math.min(input.config.capacity * 0.007, player.holding.amount)
			}, input.config.capacity);
		},
		registerInputHold(id, e) {
			if (e.button === 2) {
				this.allToInput(id);
				return;
			}
			if (!this.holdFunction) {
				this.holdFunction = this.transferFromHoldingToInput.bind(this, this.inputs[id]);
				const stopHolding = function() {
					this.holdFunction = null;
					document.removeEventListener("mouseup", stopHolding);
					document.removeEventListener("mouseleave", stopHolding);
					this.beforeDestroy = null;
				}.bind(this);
				document.addEventListener("mouseup", stopHolding);
				document.addEventListener("mouseleave", stopHolding);
				this.beforeDestroy = stopHolding;
			}
		},
		allToInput(id) {
			const input = this.inputs[id];
			if (player.holding.amount <= 0 || !input.config.accepts.includes(player.holding.resource)) return;
			player.holding.amount = player.holding.amount - Stack.addToStack(input.data, {
				resource: player.holding.resource,
				amount: player.holding.amount
			}, input.config.capacity);
		},
		inputClassObject(input) {
			return player.holding.amount === 0 ? "c-cursor-default"
				: (!input.config.accepts.includes(player.holding.resource) ? "c-cursor-notallowed" : "");
		},
		outputClassObject(output) {
			return output.data.length
				? (player.holding.resource === last(output.data).resource || !player.holding.amount ? "" : "c-cursor-notallowed")
				: "c-cursor-default";
		},
		emitInputPipeDrag(id) {
			Pipe.removeAllInputPipesTo(this.machine, id);
			this.$emit("input-pipe-drag-start", this.machine, id);
			const stopHolding = function() {
				document.removeEventListener("mouseup", stopHolding);
				document.removeEventListener("mouseleave", stopHolding);
				this.beforeDestroy = null;
				this.$emit("input-pipe-drag-end", this.machine, id);
			}.bind(this);
			document.addEventListener("mouseup", stopHolding);
			document.addEventListener("mouseleave", stopHolding);
			this.beforeDestroy = stopHolding;
		},
		emitInputPipeHover(id) {
			this.$emit("input-pipe-hover", this.machine, id);
		},
		emitOutputPipeDrag(id) {
			this.$emit("output-pipe-drag-start", this.machine, id);
			const stopHolding = function() {
				document.removeEventListener("mouseup", stopHolding);
				document.removeEventListener("mouseleave", stopHolding);
				this.beforeDestroy = null;
				this.$emit("output-pipe-drag-end", this.machine, id);
			}.bind(this);
			document.addEventListener("mouseup", stopHolding);
			document.addEventListener("mouseleave", stopHolding);
			this.beforeDestroy = stopHolding;
		},
		emitOutputPipeHover(id) {
			this.$emit("output-pipe-hover", this.machine, id);
		},
	}
};
</script>

<template>
	<div
		class="c-machine-container"
		:class="{ 'c-machine-container--new': animation }"
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
				@mouseleave="$emit('pipe-stop-hover')"
				@mousedown="emitInputPipeDrag(input.id)"
			>
				{{ input.id + 1 }}
			</div>
		</div>
		<span class="c-emphasise-text">{{ machine.type.name.capitalize() }}</span>
		<div class="l-machine__inner">
			<div
				v-for="(input, id) in inputs"
				:key="id"
				class="c-machine__input"
				:class="inputClassObject(input)"
				@mousedown="registerInputHold(id, $event)"
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
				@mousedown="registerOutputHold(id, $event)"
			>
				<resource-stack
					:stack="outputData[id].stack"
					:capacity="outputData[id].capacity"
				>
					{{ format(outputData[id].amount, 2, 1) }}<hr>{{ format(outputData[id].capacity, 2, 1) }}
					<br>
					Output {{ id + 1}}
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
				@mouseleave="$emit('pipe-stop-hover')"
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

.c-machine__input {
	min-width: 75px;
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
	text-overflow: initial;
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
	align-items: flex-start;
	position: absolute;
	bottom: 100%;
	transform: translateX(-50%);
	background-color: #333333;
	width: 24px;
	height: 16px;
	border-radius: 4px 4px 0 0;
	cursor: pointer;
}

.c-machine__output-pipe {
	display: flex;
	justify-content: center;
	align-items: flex-end;
	position: absolute;
	top: 100%;
	/* Hide border radius of container */
	transform: translateX(-50%) translateY(-4px);
	background-color: #333333;
	width: 24px;
	height: 20px;
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

@keyframes a-just-bought {
	0% { filter: brightness(400%) drop-shadow(0 0 50px #ffffff); }
	100% { filter: brightness(100%) drop-shadow(0 0 0 transparent); }
}
</style>
