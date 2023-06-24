<script setup lang="ts">
import { ref } from "vue";

import { Currencies } from "@/js/currencies/currencies";
import { Modals } from "@/js/ui/modals";
import { player } from "@/js/player";
import { ResourceType } from "@/types/resources";
import { Towns } from "@/js/towns";

import { onMount } from "@/components/mixins";

import EndCutscene from "@/components/EndCutscene.vue";
import MachineTab from "@/components/machines/MachineTab.vue";
import PopupModal from "@/components/PopupModal.vue";
import Sidebar from "@/components/Sidebar.vue";

import { format } from "@/utils";


const mouseX = ref(0), mouseY = ref(0);

function currencyColour(curr: ResourceType) {
	return Currencies[curr].colour;
}
function updateMousePos(event: MouseEvent) {
	mouseX.value = event.clientX;
	mouseY.value = event.clientY;
}

const splashTexts = ref<{
	time: number;
	text: string;
	pos: [number, number];
}[]>([]);
const elixirOpacity = ref(0);

onMount({
	update() {
		if (player.holding.resource === "elixir") elixirOpacity.value = Math.pow(player.holding.amount, 0.7);
		else elixirOpacity.value = 0;

		splashTexts.value = splashTexts.value.filter(x => x.time + 3000 > Date.now());

		if (Towns("home").upgrades.win.effectOrDefault(0)) return;

		if (player.holding.amount && player.holding.resource === "elixir") {
			const splashes = ["CONSUME more Elixir",
				"Elixir is your magnum opus",
				"An eternal suffering to those who dare touch your Elixir"];
			if (Math.random() < (player.holding.amount * 5 + 1) / 100) splashTexts.value.push({
				time: Date.now(),
				text: splashes[Math.floor(Math.random() * splashes.length)],
				pos: [Math.random() * 100, Math.random() * 100]
			});
			return;
		}
		if (player.producedElixir > 0) {
			const splashes = ["CONSUME the Elixir", "Elixir is your making", "Let no one profit off Elixir"];
			if (Math.random() < 0.01) splashTexts.value.push({
				time: Date.now(),
				text: splashes[Math.floor(Math.random() * splashes.length)],
				pos: [Math.random() * 100, Math.random() * 100]
			});
		}
	}
});
</script>

<template>
	<div
		class="c-game-ui"
		@mousemove="updateMousePos"
	>
		<template v-if="!Towns('home').upgrades.win.effectOrDefault(0)">
			<div class="c-main-tabs">
				<machine-tab />
				<sidebar />
			</div>
			<popup-modal
				v-if="Modals.current.value"
				:modal="Modals.current.value"
			/>
			<div
				class="c-elixir-bg"
				:style="{ opacity: elixirOpacity }"
			/>
			<div
				v-for="consume in splashTexts"
				:key="consume.time"
				class="c-elixir-splashtext"
				:style="{ top: `${consume.pos[0]}%`, left: `${consume.pos[1]}%` }"
			>
				{{ consume.text }}
			</div>
		</template>
		<end-cutscene v-else />
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
	</div>
</template>

<style scoped>
.c-game-ui {
	min-height: 100vh;
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

.c-elixir-bg {
	z-index: 7;
	background-color: #903ae6;
	pointer-events: none;
	position: absolute;
	width: 100%;
	height: 100%;
	inset: 0;
}

.c-elixir-splashtext {
	z-index: 8;
	position: absolute;
	text-shadow: 0 0 7px #b27ee7;
	pointer-events: none;
	animation: a-elixir-splash 3s linear;
	width: 1000px;
	text-align: center;
}

@keyframes a-elixir-splash {
	0% { transform: translate(-50%, -50%) scale(0) rotate(0); opacity: 0; }
	50% { transform: translate(-50%, -50%) scale(1.5) rotate(360deg); opacity: 1; }
	100% { transform: translate(-50%, -50%) scale(0) rotate(360deg); opacity: 0; }
}
</style>