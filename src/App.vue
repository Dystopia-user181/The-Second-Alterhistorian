<script>
import { Currencies } from "./js/database/currencies";

import MachineTab from "./components/MachineTab.vue";

export default {
	name: "App",
	components: {
		MachineTab
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
		<machine-tab />
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
	padding: 20px;
	display: flex;
	flex-direction: column;
	align-items: center;
	overflow: hidden;
	position: relative;
}

.c-held-item {
	position: absolute;
	opacity: 0.6;
	width: 40px;
	height: 40px;
	padding-left: 30px;
	padding-top: 30px;
	filter: brightness(80%);
	pointer-events: none;
}
</style>
