<script>
import { Currencies } from "./js/database/currencies";

import MachineTab from "./components/MachineTab.vue";
import Sidebar from "./components/Sidebar.vue";

export default {
	name: "App",
	components: {
		MachineTab,
		Sidebar
	},
	data() {
		return {
			holding: { resource: "", amount: 0 },
			mouseX: 0,
			mouseY: 0,
		}
	},
	methods: {
		update() {
			this.holding.resource = player.holding.resource;
			this.holding.amount = player.holding.amount;
		},
		currencyColour(curr) {
			return Currencies[curr].colour;
		},
		updateMousePos(event) {
			this.mouseX = event.clientX;
			this.mouseY = event.clientY;
		}
	}
};
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
			v-if="holding.amount > 0"
			class="c-held-item"
			:style="{
				top: `${mouseY}px`,
				left: `${mouseX}px`,
				'background-color': currencyColour(holding.resource)
			}"
		>
			{{ format(holding.amount, 2, 1) }}
		</div>
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
	justify-content: stretch;
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
}
</style>
