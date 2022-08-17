<script>
import { Currencies } from "@/js/database/currencies.ts";

export default {
	name: "ResourceStack",
	props: {
		stack: {
			type: Array,
			required: true
		},
		capacity: {
			type: Number,
			required: true
		}
	},
	data() {
		return {
			display: [],
			ctx: null
		};
	},
	methods: {
		update() {
			const display = this.stack.map(x => ({
				height: x.amount / this.capacity * 400,
				colour: Currencies[x.resource].colour
			}));
			if (!this.ctx) this.ctx = this.$refs.canvas.getContext("2d");
			const ctx = this.ctx;
			ctx.clearRect(0, 0, 1, 400);
			let height = 0;
			for (let i = display.length - 1; i >= 0; i--) {
				const resource = display[i];
				height += resource.height;
				ctx.fillStyle = resource.colour;
				ctx.fillRect(0, 400 - height, 1, resource.height);
			}
		}
	}
};
</script>

<template>
	<div class="c-resources-container">
		<span class="c-resources-container--text">
			<slot />
		</span>
		<canvas
			ref="canvas"
			class="c-resources-stack__canvas"
			height="400"
			width="1"
		/>
	</div>
</template>

<style scoped>
.c-resources-container {
	background-color: rgba(15, 20, 25, 0.4);
	height: 100%;
	width: 100%;
	position: relative;
	display: flex;
	align-items: center;
	justify-content: center;
}

.c-resources-container--text {
	position: relative;
	text-align: center;
	z-index: 1;
	font-size: 0.9em;
}

.c-resources-stack__canvas {
	position: absolute;
	width: 100%;
	height: 100%;
	inset: 0;
}
</style>