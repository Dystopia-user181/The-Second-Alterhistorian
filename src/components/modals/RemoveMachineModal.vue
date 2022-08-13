<script>
import ModalWrapper from "./ModalWrapper.vue";

import { Machine } from "@/js/machines/index";
import { Modals } from "@/js/ui/modals";
import { str } from "@/utils/index";

export default {
	name: "RemoveMachineModal",
	components: {
		ModalWrapper
	},
	props: {
		machine: {
			type: Object,
			required: true
		}
	},
	methods: {
		confirm() {
			Machine.remove(this.machine);
			Modals.hide();
		},
		cancel() {
			Modals.hide();
		},
		str
	}
};
</script>

<template>
	<modal-wrapper class="c-machine-production-modal">
		<template #header>
			Remove Machine ({{ str(machine.type.name).capitalize }})
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