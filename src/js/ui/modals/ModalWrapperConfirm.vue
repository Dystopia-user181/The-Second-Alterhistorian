<script setup lang="ts">
import { Modals } from "@/js/ui/modals";


const emit = defineEmits(["confirm", "cancel"]);

function confirm() {
	closeModal();
	emit("confirm");
}

function cancel() {
	closeModal();
	emit("cancel");
}

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
		<div class="c-modal__bottom-row-buttons">
			<button
				class="c-modal__option-button c-tint c-tint--green"
				@click="confirm"
			>
				<slot name="confirmText">
					Confirm
				</slot>
			</button>
			<button
				class="c-modal__option-button c-tint c-tint--red"
				@click="cancel"
			>
				<slot name="cancelText">
					Cancel
				</slot>
			</button>
		</div>
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

.c-modal__bottom-row-buttons {
	display: flex;
	justify-content: space-around;
}

.c-modal__option-button {
	width: 150px;
}
</style>