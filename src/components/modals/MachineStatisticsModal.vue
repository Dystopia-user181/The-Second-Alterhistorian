<script setup>
import { str } from "@/utils";

import { onMount } from "@/components/mixins";

import MachineInfoModal from "./MachineInfoModal.vue";
import MachineProductionModal from "./MachineProductionModal.vue";
import ModalWrapper from "./ModalWrapper.vue";
import SubtabComponent from "@/components/SubtabComponent.vue";


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
let currentTabDisplay = $ref("INFO");
const onChangeTab = (_, x) => currentTabDisplay = x.name;

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
			{{ currentTabDisplay }} (<input
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
		<SubtabComponent
			:subtabs="[{ name: 'INFO' }, { name: 'PRODUCTION' }]"
			@changeTab="onChangeTab"
		>
			<template #INFOTab>
				<MachineInfoModal :machine="machine" />
			</template>
			<template #PRODUCTIONTab>
				<MachineProductionModal :machine="machine" />
			</template>
		</SubtabComponent>
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