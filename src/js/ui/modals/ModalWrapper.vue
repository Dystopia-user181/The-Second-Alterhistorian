<script setup lang="ts">
import { Modals } from "@/js/ui/modals";

function closeModal() {
	if (!Modals.isOpen) return;
	if (Modals.current.value?.hide) Modals.current.value.hide();
	else Modals.hide();
}
</script>

<template>
	<div class="c-modal__wrapper">
		<div class="c-modal__header">
			<span
				class="fas fa-xmark c-modal__close-button"
				@click="closeModal"
			/>
			<span
				v-if="$slots.header"
				class="c-modal__title"
			>
				<slot name="header" />
			</span>
		</div>
		<slot />
	</div>
</template>

<style scoped>
.c-modal__wrapper {
	text-align: center;
}

.c-modal__close-button {
	font-weight: bold;
	font-size: 20px;
	position: absolute;
	top: 10px;
	right: 10px;
	cursor: pointer;
}

.c-modal__title {
	font-size: 2em;
	font-weight: bold;
}
</style>