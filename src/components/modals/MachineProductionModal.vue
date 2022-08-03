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
			}).filter(x => x && x.amount > 0);
			this.outputs = this.machine.outputs.map((x, id) => (!x.isUnlocked ? null : {
				resource: x.config.produces.resource,
				amount: this.machine.outputConfHistories.map(x => x[id]).reduce((a, v) => a + getProduces(v, id, x.otherwiseDiff), 0)
					/ this.machine.outputConfHistories.length,
				id
			})).filter(x => x && x.amount > 0);
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
				Input {{ input.id + 1 }}: Consumes {{ format(input.amount, 2, 2, true) }} {{ input.resource.capitalize() }}/s
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
				Output {{ output.id + 1 }}: Produces {{ format(output.amount, 2, 2, true) }} {{ output.resource.capitalize() }}/s
				<br>
			</span>
		</template>
		<template v-else-if="!inputs.length">
			STATUS: Idle
		</template>
	</modal-wrapper>
</template>

<style scoped>
.c-machine-production-modal {
	min-width: 400px;
	min-height: 250px;
}
</style>