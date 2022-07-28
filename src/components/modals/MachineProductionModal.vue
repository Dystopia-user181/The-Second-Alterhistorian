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
			outputs: []
		}
	},
	methods: {
		update() {
			this.inputs = this.machine.inputs.map((x, id) => (!x.data.length ? null : {
				resource: last(x.data).resource,
				amount: typeof x.config.consumes === "object" ? Math.min(x.config.consumes.amount, x.config.consumes.maximum * 1e10) : x.config.consumes,
				id
			})).filter(x => x && x.amount > 0);
			this.outputs = this.machine.outputs.map((x, id) => (!x.data.length ? null : {
				resource: x.config.produces.resource,
				amount: this.machine.outputDiffs[x.config.id !== undefined ? x.config.id : id]  === 0 ? 0 : x.config.produces.amount,
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
				Input {{ input.id + 1 }}: Consumes {{ format(input.amount, 2, 2) }} {{ input.resource.capitalize() }}/s
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
				Output {{ output.id + 1 }}: Produces {{ format(output.amount, 2, 2) }} {{ output.resource.capitalize() }}/s
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