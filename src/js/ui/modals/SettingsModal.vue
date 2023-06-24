<script setup lang="ts">
import { player, Player } from "@/js/player";
import { Modals } from "@/js/ui/modals";

import ModalWrapper from "./ModalWrapper.vue";

interface FileEvent extends Event {
    target: HTMLInputElement;
}

function importSave() {
	const input = document.createElement("input");
	input.type = "file";

	input.onchange = (e: Event) => {
		// @ts-ignore: Typescript does not type input events properly
		Player.importSave(e as FileEvent);
	};

	input.click();
}

function getOptionsText(option: keyof typeof player.options) {
	return player.options[option] ? "ON" : "OFF";
}

function toggleOption(option: keyof typeof player.options) {
	player.options[option] = Number(!player.options[option]);
}
</script>

<template>
	<modal-wrapper class="c-modal__settings">
		<template #header>
			Settings
		</template>
		<button
			class="c-settings-button"
			@click="Player.savePlayer()"
		>
			Save
		</button>
		<button
			class="c-settings-button"
			@click="toggleOption('autosave')"
		>
			Autosave: {{ getOptionsText("autosave") }}
		</button>
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
		<br>
		<button
			class="c-settings-button"
			@click="toggleOption('showGridlines')"
		>
			Show Gridlines: {{ getOptionsText("showGridlines") }}
		</button>
		<button
			class="c-settings-button"
			:class="{ disabled: !player.options.showGridlines }"
			@click="if (player.options.showGridlines) toggleOption('snapToGrid');"
		>
			Snap To Grid: {{ getOptionsText("snapToGrid") }}
		</button>
		<button
			class="c-settings-button"
			@click="toggleOption('minimap');"
		>
			Show Minimap: {{ getOptionsText("minimap") }}
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
	vertical-align: middle;
}
</style>