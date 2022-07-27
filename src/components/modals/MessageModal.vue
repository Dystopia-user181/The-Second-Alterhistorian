<script setup>
import { ref } from "vue";
import { Modal } from "./../../js/ui/modals";

import ModalWrapper from "./ModalWrapper.vue";

const message = ref("");

function update() {
	message.value = Modal.message.text;
}

function hide() {
	if (!Modal.isOpen) return;
	if (Modal.current.hide) Modal.current.hide();
	else Modal.hide();
}
</script>

<template>
	<modal-wrapper>
		<template #header>Info</template>
		<br>
		<span
			class="c-message-modal__text"
			v-html="message"
		/>
		<br><br>
		<button @click="hide">Okay</button>
	</modal-wrapper>
</template>

<style scoped>
.c-message-modal__text {
	font-size: 1.2em;
}
</style>