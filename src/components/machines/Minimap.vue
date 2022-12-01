<script setup>
import { Machines } from "@/js/machines";
import { player } from "@/js/player";
import { Towns } from "@/js/towns";

import { onMount } from "@/components/mixins";

const WIDTH = 180, HEIGHT = 180;
const canvas = $ref(null);
let ctx;
function render() {
	ctx.resetTransform();
	ctx.clearRect(0, 0, WIDTH, HEIGHT);
	ctx.translate(WIDTH / 2, HEIGHT / 2);
	ctx.scale(0.04, 0.04);
	ctx.translate(
		-Towns("current").playerData.display.offset.x,
		-Towns("current").playerData.display.offset.y
	);
	for (const machine of Machines[player.currentlyIn]) {
		if (machine.hasWholeBuyableUpgrades) {
			ctx.fillStyle = "#ffd700";
		} else if (machine.hasPartialBuyableUpgrades) {
			ctx.fillStyle = "#00cc00";
		} else {
			ctx.fillStyle = "#999999";
		}
		ctx.fillRect(machine.data.x - 100, machine.data.y - 100, 200, 200);
	}
}

onMount({
	onMount() {
		ctx = canvas.getContext("2d");
	},
	render() {
		render();
	}
});
</script>

<template>
	<canvas
		ref="canvas"
		class="c-minimap"
		width="180"
		height="180"
	/>
</template>

<style scoped>
.c-minimap {
	position: absolute;
	top: 0;
	right: 0;
	background-color: #242424bb;
	z-index: 3;
	border-bottom-left-radius: 10px;
}
</style>