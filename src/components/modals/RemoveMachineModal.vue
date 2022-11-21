<script setup>
import ModalWrapper from "./ModalWrapper.vue";

import { Machine } from "@/js/machines/index";
import { Modals } from "@/js/ui/modals.ts";

const { machine } = defineProps({
	machine: {
		type: Object,
		required: true
	}
});

function confirm() {
	Machine.remove(machine);
	Modals.hide();
}
function cancel() {
	Modals.hide();
}
</script>

<template>
	<modal-wrapper class="c-machine-production-modal">
		<template #header>
			Remove Machine ({{ machine.displayName }})
		</template>
		<br>
		Are you sure you want to remove this machine? Alchemy resources inside the machine will be lost!
		<br>
		<br>
		<button @click="cancel">
			Cancel
		</button>
		<button @click="confirm">
			Confirm
		</button>
	</modal-wrapper>
</template>

<style scoped>
button {
	margin: 0 20px;
}
</style>