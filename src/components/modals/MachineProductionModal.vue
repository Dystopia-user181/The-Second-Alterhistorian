<script>
import ModalWrapper from "./ModalWrapper.vue";

export default {
	name: "MachineProductionModal",
	components: {
		ModalWrapper
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
			outputs: [],
			avg: {
				inputs: [],
				outputs: []
			},
			takingAvg: false
		}
	},
	methods: {
		update() {
			const getConsumes = (function(consumes, diff) {
				// *1.1 to account for some errors
				return typeof consumes === "object" ? Math.min(consumes.amount, consumes.maximum / diff * 1.1) : consumes;
			}).bind(this);
			const getProduces = (function (x, id, diff) {
				return this.machine.outputDiffs[x.id !== undefined ? x.id : id] * x.produces.amount / diff
			}).bind(this);
			this.inputs = this.machine.inputs.map((x, id) => {
				const input = findLast(this.machine.inputHistories.map(x => x[id]), x => x.length);
				return !x.isUnlocked ? null : {
					resource: input ? last(input).resource : "",
					amount: this.machine.inputConfHistories.map(x => x[id]).reduce((a, v) => a + getConsumes(v.consumes, x.otherwiseDiff), 0)
						/ this.machine.inputConfHistories.length,
					id
				}
			}).filter(x => x);
			this.outputs = this.machine.outputs.map((x, id) => (!x.isUnlocked ? null : {
				resource: x.config.produces.resource,
				amount: this.machine.outputConfHistories.map(x => x[id]).reduce((a, v) => a + getProduces(v, id, x.otherwiseDiff), 0)
					/ this.machine.outputConfHistories.length,
				id
			})).filter(x => x);
			if (this.takingAvg) {
				const avg = this.avg;
				for (const input of this.machine.inputs) {
					const avgItem = avg.inputs[input.id];
					avgItem.isUnlocked = input.isUnlocked;
					const resource = last(input.data) ? last(input.data).resource : avgItem.lastResource;
					const conf = input.config;
					if (avgItem.lastResource !== resource) {
						avgItem.lastResource = resource;
						avgItem.time = 0;
					}
					avgItem.value = (avgItem.value * avgItem.time + getConsumes(conf.consumes, input.otherwiseDiff)) / (avgItem.time + 1);
					avgItem.time++;
				}
				for (const output of this.machine.outputs) {
					const avgItem = avg.outputs[output.id];
					avgItem.isUnlocked = output.isUnlocked;
					const conf = output.config;
					const resource = conf.produces.amount <= 0 ? avgItem.lastResource : conf.produces.resource;
					if (avgItem.lastResource !== resource) {
						avgItem.lastResource = resource;
						avgItem.time = 0;
					}
					avgItem.value = (avgItem.value * avgItem.time + getProduces(conf, output.id, output.otherwiseDiff)) / (avgItem.time + 1);
					avgItem.time++;
				}
			}
		},
		startAvg() {
			this.avg.inputs = this.machine.inputs.map((x, id) => ({
				lastResource: "none",
				time: 0,
				value: 0,
				isUnlocked: x.isUnlocked,
				id
			}));
			this.avg.outputs = this.machine.outputs.map((x, id) => ({
				lastResource: "none",
				time: 0,
				value: 0,
				isUnlocked: x.isUnlocked, 
				id
			}));
			this.takingAvg = true;
		},
		stopAvg() {
			this.avg.inputs = [];
			this.avg.outputs = [];
			this.takingAvg = false;
		}
	},
};
</script>

<template>
	<modal-wrapper class="c-machine-production-modal">
		<template #header>Statistics ({{ machine.type.name.capitalize() }})</template>
		<br>
		<template v-if="inputs.length">
			<span class="c-emphasise-text">Inputs</span>
			<br>
			<span
				v-for="input in inputs"
				:key="input.id"
			>
				Input {{ input.id + 1 }}:
				<span v-if="input.amount">
					Consumes {{ format(input.amount, 2, 2, true) }} {{ input.resource.capitalize() }}/s
				</span>
				<span v-else>
					IDLE
				</span>
				<br>
			</span>
		</template>
		<template v-if="outputs.length">
			<span class="c-emphasise-text">Outputs</span>
			<br>
			<span
				v-for="output in outputs"
				:key="output.id"
			>
				Output {{ output.id + 1 }}:
				<span v-if="output.amount">
					Consumes {{ format(output.amount, 2, 2, true) }} {{ output.resource.capitalize() }}/s
				</span>
				<span v-else>
					IDLE
				</span>
				<br>
			</span>
		</template>
		<button @click="takingAvg ? stopAvg() : startAvg()">
			{{ takingAvg ? "Taking Average..." : "Take Average" }}
		</button>
		<template v-if="takingAvg">
			<br>
			<template v-if="inputs.length">
				<span class="c-emphasise-text">Inputs</span>
				<br>
				<span
					v-for="input in avg.inputs.filter(x => x.isUnlocked)"
					:key="input.id"
				>
					Input {{ input.id + 1 }}:
					<span v-if="input.value">
						Consumes {{ format(input.value, 2, 2, true) }} {{ input.lastResource.capitalize() }}/s
					</span>
					<span v-else>
						IDLE
					</span>
					<br>
				</span>
			</template>
			<template v-if="outputs.length">
				<span class="c-emphasise-text">Outputs</span>
				<br>
				<span
					v-for="output in avg.outputs.filter(x => x.isUnlocked)"
					:key="output.id"
				>
					Output {{ output.id + 1 }}:
					<span v-if="output.value">
						Consumes {{ format(output.value, 2, 2, true) }} {{ output.lastResource.capitalize() }}/s
					</span>
					<span v-else>
						IDLE
					</span>
					<br>
				</span>
			</template>
		</template>
	</modal-wrapper>
</template>

<style scoped>
.c-machine-production-modal {
	min-width: 400px;
	min-height: 250px;
}
</style>
