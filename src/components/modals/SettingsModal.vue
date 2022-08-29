<script setup>
import { Modals } from "@/js/ui/modals";
import { Player } from "@/js/player";

import ModalWrapper from "./ModalWrapper.vue";

function importSave() {
	const input = document.createElement("input");
	input.type = "file";

	input.onchange = e => {
		Player.importSave(e);
	};

	input.click();
}
</script>

<template>
	<modal-wrapper class="c-modal__settings">
		<template #header>
			Settings
		</template>
		<br>
		<button
			class="c-settings-button"
			@click="Player.exportSave()"
		>
			Export Save
		</button>
		<button
			class="c-settings-button"
			@click="importSave"
		>
			Import Save
		</button>
		<button
			class="c-settings-button"
			@click="Modals.hardReset.show()"
		>
			HARD RESET
		</button>
	</modal-wrapper>
</template>

<style scoped>
.c-modal__settings {
	width: 620px;
	height: 400px;
}

.c-settings-button {
	width: 200px;
	height: 100px;
	font-size: 18px;
	margin: 3px;
}
</style>