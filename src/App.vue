<script setup>
import { ref } from "vue";
import { Currencies } from "./js/database/currencies";
import { Modals } from "./js/ui/modals";
import { player } from "./js/player";

import MachineTab from "./components/MachineTab.vue";
import Sidebar from "./components/Sidebar.vue";
import PopupModal from "./components/modals/PopupModal.vue";

const mouseX = ref(0), mouseY = ref(0);
window.mouseX = 0, window.mouseY = 0;

function currencyColour(curr) {
	return Currencies[curr].colour;
}
function updateMousePos(event) {
	window.mouseX = event.clientX;
	window.mouseY = event.clientY;
	mouseX.value = event.clientX;
	mouseY.value = event.clientY;
}
</script>

<template>
	<div
		class="c-game-ui"
		@mousemove="updateMousePos"
	>
		<h1>The Second Alterhistorian</h1>
		<div class="c-main-tabs">
			<machine-tab />
			<sidebar />
		</div>
		<div
			v-if="player.holding.amount > 0"
			class="c-held-item"
			:style="{
				top: `${mouseY}px`,
				left: `${mouseX}px`,
				'background-color': currencyColour(player.holding.resource)
			}"
		>
			{{ format(player.holding.amount, 2, 1) }}
		</div>
		<popup-modal v-if="Modals.current.value" :modal="Modals.current.value" />
	</div>
</template>

<style scoped>
.c-game-ui {
	min-height: 100vh;
	padding-top: 20px;
	display: flex;
	flex-direction: column;
	align-items: center;
	overflow: hidden;
	position: relative;
}

.c-main-tabs {
	display: flex;
	width: 100%;
	flex: 1 0 auto;
}

.c-held-item {
	position: absolute;
	opacity: 0.8;
	width: 40px;
	height: 40px;
	padding-left: 30px;
	padding-top: 30px;
	filter: brightness(80%);
	pointer-events: none;
	z-index: 100;
}
</style>
