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
			beforeDestroy: null
		}
	},
	beforeDestroy() {
		if (this.beforeDestroy) this.beforeDestroy();
	},
	methods: {
		update() {
			this.inputs = this.machine.inputs.filter(x => x.isUnlocked);
			this.outputs = this.machine.outputs.filter(x => x.isUnlocked);
			this.inputData = this.inputs.map(x => ({
				stack: x.data,
				amount: Stack.volumeOfStack(x.data),
				capacity: x.config.capacity
			}));
			this.outputData = this.outputs.map(x => ({
				stack: x.data,
				amount: Stack.volumeOfStack(x.data),
				capacity: x.config.capacity
			}));
			if (this.holdFunction) this.holdFunction();
		},
		transferFromOutputToHolding(output) {
			if (player.holding.amount <= 0) player.holding.resource = last(output.data).resource;
			else if (player.holding.resource !== last(output.data).resource) return;
			player.holding.amount += Stack.removeFromStack(output.data, output.config.capacity * 0.01);
		},
		registerOutputHold(id) {
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
		transferFromHoldingToInput(input) {
			if (player.holding.amount <= 0) return;
			player.holding.amount = Stack.addToStack(input.data, {
				resource: player.holding.resource,
				amount: Math.min(input.config.capacity * 0.01, player.holding.resource)
			});
		},
		registerInputHold(id) {
			if (!this.holdFunction) {
				this.holdFunction = this.transferFromHoldingToInput.bind(this, this.inputs[id].data);
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
		}
	}
};
</script>

<template>
	<div class="c-machine-container">
		<span class="c-emphasise-text">{{ machine.type.name.capitalize() }}</span>
		<div class="l-machine__inner">
			<div
				v-for="(input, id) in inputs"
				:key="id"
				class="c-machine__input"
				@mousedown="registerInputHold(id)"
			>
				<resource-stack
					:stack="inputData[id].stack"
					:capacity="inputData[id].capacity"
				>
					{{ format(inputData[id].amount, 2, 1) }} / {{ format(inputData[id].capacity, 2, 1) }}
					<br>
					Input
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
				@mousedown="registerOutputHold(id)"
			>
				<resource-stack
					:stack="outputData[id].stack"
					:capacity="outputData[id].capacity"
				>
					{{ format(outputData[id].amount, 2, 1) }} / {{ format(outputData[id].capacity, 2, 1) }}
					<br>
					Output
				</resource-stack>
			</div>
			<span
				v-if="!inputs.length && !outputs.length"
				class="fas fa-lock"
			/>
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
}

.c-machine__input:active, .c-machine__output:active {
	border: 2px solid #dddddd;
}

.l-machine-input-output-separator {
	width: 5px;
}

.fa-lock {
	font-size: 200px;
	margin-top: 10px;
}
</style>
