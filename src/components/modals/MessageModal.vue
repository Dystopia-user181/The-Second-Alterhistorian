<script setup>
import { ref } from "vue";
import { Modals } from "./../../js/ui/modals";

import ModalWrapper from "./ModalWrapper.vue";

function hide() {
	if (!Modals.isOpen) return;
	if (Modals.current.hide) Modals.current.hide();
	else Modals.hide();
}
</script>

<template>
	<modal-wrapper>
		<template #header>Info</template>
		<br>
		<span
			class="c-message-modal__text"
			v-html="Modals.message.text"
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