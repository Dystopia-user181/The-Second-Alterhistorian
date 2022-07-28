<script>
import { Modal } from "./../../js/ui/modals";

import ModalWrapper from "./ModalWrapper.vue";

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
			Machine.remove(player.currentlyIn, this.machine);
			Modal.hide();
		},
		cancel() {
			Modal.hide();
		}
	}
};
</script>

<template>
	<modal-wrapper class="c-machine-production-modal">
		<template #header>Remove Machine ({{ machine.type.name.capitalize() }})</template>
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