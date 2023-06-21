<script setup>
import { onMount } from "@/components/mixins";

import { format, str } from "@/utils";


const { machine } = defineProps({
	machine: {
		type: Object,
		required: true
	}
});

let inputs = $ref([]);
let outputs = $ref([]);
const avg = $ref({
	inputs: [],
	outputs: []
});
let takingAvg = $ref(false);

function startAvg() {
	avg.inputs = machine.inputs.map((x, id) => ({
		lastResource: "none",
		time: 0,
		value: 0,
		isUnlocked: x.isUnlocked,
		id
	}));
	avg.outputs = machine.outputs.map((x, id) => ({
		lastResource: "none",
		time: 0,
		value: 0,
		isUnlocked: x.isUnlocked,
		id
	}));
	takingAvg = true;
}
function stopAvg() {
	avg.inputs = [];
	avg.outputs = [];
	takingAvg = false;
}

onMount({
	update() {
		inputs = machine.inputs.map((input, id) => (input.isUnlocked ? {
			resource: input.statistics.displayResource[0],
			amount: input.statistics.avgResourcePerSec,
			id
		} : null)).filter(x => x);
		outputs = machine.outputs.map((output, id) => (output.isUnlocked ? {
			resource: output.config.produces.resource,
			amount: output.statistics.avgResourcePerSec,
			id
		} : null)).filter(x => x);

		if (takingAvg) {
			for (const input of machine.inputs) {
				const avgItem = avg.inputs[input.id];
				avgItem.isUnlocked = input.isUnlocked;
				const resource = input.statistics.displayResource[0] === "none" ? avgItem.lastResource
					: input.statistics.displayResource[0];
				if (avgItem.lastResource !== resource) {
					avgItem.lastResource = resource;
					avgItem.time = 0;
				}
				avgItem.value = (avgItem.value * avgItem.time + input.statistics.resourcePerSec) /
						(avgItem.time + 1);
				avgItem.time++;
			}
			for (const output of machine.outputs) {
				const avgItem = avg.outputs[output.id];
				avgItem.isUnlocked = output.isUnlocked;
				const conf = output.config;
				const resource = conf.produces.amount <= 0 ? avgItem.lastResource : conf.produces.resource;
				if (avgItem.lastResource !== resource) {
					avgItem.lastResource = resource;
					avgItem.time = 0;
				}
				avgItem.value = (avgItem.value * avgItem.time + output.statistics.resourcePerSec) /
						(avgItem.time + 1);
				avgItem.time++;
			}
		}
	}
});
</script>

<template>
	<span
		v-if="takingAvg"
		class="c-production--average"
	>
		<template v-if="inputs.length">
			<span class="c-emphasise-text">Inputs</span>
			<br>
			<span
				v-for="input in avg.inputs.filter(x => x.isUnlocked)"
				:key="input.id"
			>
				Input {{ input.id + 1 }}:
				<span v-if="input.value && avg.inputs[input.id].lastResource !== 'none'">
					Consumes {{ format(input.value, 2, 2, true) }}
					{{ str(avg.inputs[input.id].lastResource).capitalize }}/s
				</span>
				<span v-else>
					IDLE
				</span>
				<br>
			</span>
			<br>
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
					Produces {{ format(output.value, 2, 2, true) }}
					{{ str(avg.outputs[output.id].lastResource).capitalize }}/s
				</span>
				<span v-else>
					IDLE
				</span>
				<br>
			</span>
			<br>
		</template>
	</span>
	<template v-else>
		<template v-if="inputs.length">
			<span class="c-emphasise-text">Inputs</span>
			<br>
			<span
				v-for="input in inputs"
				:key="input.id"
			>
				Input {{ input.id + 1 }}:
				<span v-if="input.amount && input.resource !== 'none'">
					Consumes {{ format(input.amount, 2, 2, true) }} {{ str(input.resource).capitalize }}/s
				</span>
				<span v-else>
					IDLE
				</span>
				<br>
			</span>
			<br>
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
					Consumes {{ format(output.amount, 2, 2, true) }} {{ str(output.resource).capitalize }}/s
				</span>
				<span v-else>
					IDLE
				</span>
				<br>
			</span>
			<br>
		</template>
	</template>
	<button @click="takingAvg ? stopAvg() : startAvg()">
		{{ takingAvg ? "Taking Average..." : "Take Average" }}
	</button>
</template>

<style scoped>
.c-production--average {
	color: #ffffa0;
}
</style>