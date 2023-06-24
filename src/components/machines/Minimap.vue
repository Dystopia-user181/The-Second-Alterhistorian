<script setup lang="ts">
import { Machines } from "@/js/machines";
import { player } from "@/js/player";
import { Towns } from "@/js/towns";

import { onMount } from "@/components/mixins";

const WIDTH = 180, HEIGHT = 160;
const canvas = $ref<HTMLCanvasElement | null>(null);
let ctx: CanvasRenderingContext2D | null;
function render() {
	if (!ctx) return;
	ctx.resetTransform();
	ctx.clearRect(0, 0, WIDTH, HEIGHT);
	ctx.translate(WIDTH / 2, HEIGHT / 2);
	ctx.scale(0.04, 0.04);
	ctx.translate(
		-Towns("current").playerData.display.offset.x,
		-Towns("current").playerData.display.offset.y
	);
	ctx.lineWidth = 25;
	for (const machine of Machines[player.currentlyIn]) {
		if (machine.hasWholeBuyableUpgrades) {
			ctx.strokeStyle = "#ffd700";
			ctx.fillStyle = "#ffd70088";
		} else if (machine.hasPartialBuyableUpgrades) {
			ctx.strokeStyle = "#00dd00";
			ctx.fillStyle = "#00cc0088";
		} else {
			ctx.strokeStyle = "#ffffff";
			ctx.fillStyle = "#ffffff88";
		}
		ctx.beginPath();
		ctx.roundRect(
			machine.data.x,
			machine.data.y,
			90 * (machine.inputs.length + machine.outputs.length),
			270, [25]
		);
		ctx.fill();
		ctx.stroke();
	}
}

onMount({
	onMount() {
		if (!canvas) return;
		ctx = canvas.getContext("2d");
	},
	render() {
		render();
	}
});
</script>

<template>
	<div class="c-minimap">
		<div class="c-minimap__header">
			Minimap
		</div>
		<canvas
			ref="canvas"
			class="c-minimap__canvas"
			:width="WIDTH"
			:height="HEIGHT"
		/>
	</div>
</template>

<style scoped>
.c-minimap {
	position: absolute;
	top: 0;
	right: 0;
	background-color: #242424;
	z-index: 3;
	border-bottom-left-radius: 10px;
	border-left: 2px solid white;
	border-bottom: 2px solid white;
}

.c-minimap__header {
	font-size: 17px;
	font-weight: bold;
	text-align: center;
	margin-top: 5px;
}

.c-minimap__canvas {
	background-color: #121212bb;
	border-radius: 6px;
	margin: 6px 6px 0;
}
</style>