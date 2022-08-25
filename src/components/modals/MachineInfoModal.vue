<script setup>
import { Currencies } from "@/js/database/currencies.ts";

import { areArraysEqualSets, str } from "@/utils";

import ModalWrapper from "./ModalWrapper.vue";

const { machine } = defineProps({
	machine: {
		type: Object,
		required: true
	}
});

function acceptsAll(accepts) {
	return areArraysEqualSets(accepts, Object.keys(Currencies));
}

const machineNameEditable = $computed({
	get() {
		return machine.data.name;
	},
	set(x) {
		// eslint-disable-next-line vue/no-mutating-props
		machine.data.name = x;
	}
});

const isEditingName = $ref(false);
</script>

<template>
	<modal-wrapper>
		<span class="c-emphasise-text">
			INFO (<input
				v-if="isEditingName"
				v-model="machineNameEditable"
				maxlength="20"
				size="14"
				:placeholder="str(machine.name).capitalize"
			>
			<template v-else>
				{{ machine.displayName }}
			</template>
			<button
				class="fas fa-pen-to-square c-info__edit-name"
				:class="{
					'c-info__edit-name--editing': isEditingName
				}"
				@click="isEditingName = !isEditingName"
			/>
			)
		</span>
		<br>
		{{ machine.type.description }}
		<br>
		<div class="c-info__table">
			<span
				v-for="input in machine.inputs.filter(x => x.isUnlocked)"
				:key="input.id"
			>
				Input {{ input.id + 1 }} accepts:
				{{ acceptsAll(input.config.accepts) ? "all"
					: input.config.accepts.map(x => str(x).capitalize).join(", ") }}
				<br>
			</span>
		</div>
	</modal-wrapper>
</template>

<style scoped>
.c-info__table {
	display: inline-block;
	text-align: left;
}

.c-info__edit-name {
	padding: 5px;
	margin-left: 5px;
	font-size: 0.9em;
}

.c-info__edit-name--editing {
	color: #1d1d1d;
	background-color: #eeeeee;
}
</style>