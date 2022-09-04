<script setup>
import { str } from "@/utils";

import { onMount } from "@/components/mixins";

import MachineInfoModal from "./MachineInfoModal.vue";
import MachineProductionModal from "./MachineProductionModal.vue";
import ModalWrapper from "./ModalWrapper.vue";


const { machine } = defineProps({
	machine: {
		type: Object,
		required: true
	}
});

const machineNameEditable = $computed({
	get() {
		return machine.data.name;
	},
	set(x) {
		// eslint-disable-next-line vue/no-mutating-props
		machine.data.name = x;
	}
});

let isEditingName = $ref(false);
const currentTab = $ref("INFO");

onMount({
	on: {
		ENTER_PRESSED() {
			isEditingName = false;
		}
	}
});
</script>

<template>
	<ModalWrapper class="c-machine-statistics-modal">
		<span class="c-emphasise-text">
			{{ currentTab }} (<input
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
		<button
			class="c-info__tab-button"
			@click="currentTab = 'INFO'"
		>
			INFO
		</button>
		<button
			class="c-info__tab-button"
			@click="currentTab = 'PRODUCTION'"
		>
			PRODUCTION
		</button>
		<br>
		<MachineInfoModal
			v-if="currentTab === 'INFO'"
			:machine="machine"
		/>
		<MachineProductionModal
			v-else-if="currentTab === 'PRODUCTION'"
			:machine="machine"
		/>
	</ModalWrapper>
</template>

<style scoped>
.c-machine-statistics-modal {
	min-width: 500px;
	min-height: 300px;
}

.c-info__tab-button {
	margin: 3px;
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