<script>
import { Machines } from "./../js/machines";

import Machine from "./Machine.vue";

export default {
	name: "MachineTab",
	components: {
		Machine
	},
	data() {
		return {
			machines: [],
			holding: false,
			beforeDestroy: null,
			offsetX: 0,
			offsetY: 0,
			width: 0,
			height: 0,
			ctx: null,
			holdingFunction: null
		}
	},
	computed: {
		maxOffsetX: () => 2998,
		maxOffsetY: () => 1998
	},
	created() {
		this.offsetX = player.display.offset.x;
		this.offsetY = player.display.offset.y;
	},
	beforeDestroy() {
		if (this.beforeDestroy) this.beforeDestroy();
	},
	methods: {
		update() {
			this.machines = Machines[player.currentlyIn].map(machine => ({
				position: {
					top: machine.data.y - this.offsetY,
					left: machine.data.x - this.offsetX
				},
				machineData: machine
			}));
			if (this.holdingFunction) this.holdingFunction();
			this.width = this.$refs.machineTab.offsetWidth;
			this.offsetX = Math.min(this.offsetX, this.maxOffsetX - this.width);
			player.display.offset.x = this.offsetX;
			this.height = this.$refs.machineTab.offsetHeight;
			this.offsetY = Math.min(this.offsetY, this.maxOffsetY - this.height);
			player.display.offset.y = this.offsetY;
			if (this.ctx === null) this.ctx = this.$refs.canvas.getContext("2d");;
			this.ctx.clearRect(0, 0, this.width, this.height);
			this.ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
			for (let i = -2 - this.offsetX % 100; i < this.width; i += 100) {
				this.ctx.fillRect(i - 1, 0, 2, this.height);
			}
			for (let i = -2 - this.offsetY % 100; i < this.height; i += 100) {
				this.ctx.fillRect(0, i - 1, this.width, 2);
			}
		},
		registerMoveHold(machine) {
			if (!this.holding) {
				this.holding = true;
				const followMouse = function(event) {
					machine.machineData.data.x = Math.min(
						Math.max(event.clientX + 12.5 - this.$refs.machineTab.offsetLeft + this.offsetX, 20),
						this.maxOffsetX - 270
					);
					machine.machineData.data.y = Math.min(
						Math.max(event.clientY - 12.5 - this.$refs.machineTab.offsetTop + this.offsetY, 20),
						this.maxOffsetY - 270
					);
				}.bind(this);
				document.addEventListener("mousemove", followMouse);
				const stopHolding = function() {
					this.holding = false;
					document.removeEventListener("mousemove", followMouse);
					document.removeEventListener("mouseup", stopHolding);
					document.removeEventListener("mouseleave", stopHolding);
					this.beforeDestroy = null;
				}.bind(this);
				document.addEventListener("mouseup", stopHolding);
				document.addEventListener("mouseleave", stopHolding);
				this.beforeDestroy = stopHolding;
			}
		},
		openUpgrades(machine) {
			Modal.machineUpgrades.show({ machine });
		},
		registerOffsetHold(offset) {
			if (!this.holding) {
				this.holding = true;
				this.holdingFunction = function() {
					this.offsetX = Math.max(Math.min(this.offsetX + offset[0] * 15, this.maxOffsetX - this.width), 0);
					this.offsetY = Math.max(Math.min(this.offsetY + offset[1] * 15, this.maxOffsetY - this.height), 0);
				}.bind(this);
				const stopHolding = function() {
					this.holding = false;
					this.holdingFunction = null;
					document.removeEventListener("mouseup", stopHolding);
					document.removeEventListener("mouseleave", stopHolding);
					this.beforeDestroy = null;
				}.bind(this);
				document.addEventListener("mouseup", stopHolding);
				document.addEventListener("mouseleave", stopHolding);
				this.beforeDestroy = stopHolding;
			}
		}
	}
}
</script>

<template>
	<div
		class="c-machine-tab"
		ref="machineTab"
	>
		<canvas
			ref="canvas"
			class="c-machine-tab__canvas"
			:width="width"
			:height="height"
		/>
		<span
			v-for="(machine, machineId) in machines"
			:key="machineId"
		>
			<machine
				:machine="machine.machineData"
				:style="objectMap(machine.position, x => x, x => `${x}px`)"
			/>
			<div
				class="c-machine-sidebar"
				:style="objectMap(machine.position, x => x, x => `${x}px`)"
			>
				<div
					class="fas fa-arrows"
					@mousedown="registerMoveHold(machine)"
				/>
				<div
					class="fas fa-arrow-up"
					@mousedown="openUpgrades(machine)"
				/>
				<div
					class="fas fa-info-circle"
					@mousedown="machine.machineData.showDescription()"
				/>
			</div>
		</span>
		<div
			v-if="offsetX > 0"
			class="fas fa-chevron-left c-machine-tab__offset c-machine-tab__offset-left"
			@mousedown="registerOffsetHold([-1, 0])"
		/>
		<div
			v-if="offsetY > 0"
			class="fas fa-chevron-up c-machine-tab__offset c-machine-tab__offset-up"
			@mousedown="registerOffsetHold([0, -1])"
		/>
		<div
			v-if="offsetX < maxOffsetX - width"
			class="fas fa-chevron-right c-machine-tab__offset c-machine-tab__offset-right"
			@mousedown="registerOffsetHold([1, 0])"
		/>
		<div
			v-if="offsetY < maxOffsetY - height"
			class="fas fa-chevron-down c-machine-tab__offset c-machine-tab__offset-down"
			@mousedown="registerOffsetHold([0, 1])"
		/>
	</div>
</template>

<style scoped>
.c-machine-tab {
	background-color: #202020;
	overflow: hidden;
	position: relative;
	flex: 1 0 auto;
	align-self: stretch;
	justify-self: stretch;
}

.c-machine-sidebar {
	position: absolute;
	display: flex;
	flex-direction: column;
	transform: translateX(calc(1px - 100%));
	z-index: 1;
}

.c-machine-sidebar .fas {
	width: 25px;
	height: 25px;
	display: flex;
	align-items: center;
	justify-content: center;
	background-color: #333333;
	border-radius: 5px 0 0 5px;
	font-size: 1.1em;
}

.c-machine-sidebar .fas:nth-child(even) {
	opacity: 0.7;
}

.c-machine-sidebar .fa-arrows {
	cursor: move;
}

.c-machine-sidebar .fa-arrow-up {
	cursor: pointer;
}

.c-machine-sidebar .fa-info-circle {
	cursor: help;
}

.c-machine-tab__offset {
	position: absolute;
	opacity: 0.5;
	font-size: 30px;
	cursor: pointer;
	z-index: 2;
}

.c-machine-tab__offset:hover {
	text-shadow: 0 0 5px;
}

.c-machine-tab__offset:active {
	opacity: 1;
}

.c-machine-tab__offset-left {
	left: 0;
	top: 50%;
	transform: translateY(-50%) scaleY(1.5);
}

.c-machine-tab__offset-up {
	top: 0;
	left: 50%;
	transform: translateX(-50%) scaleX(1.5);
}

.c-machine-tab__offset-right {
	right: 0;
	top: 50%;
	transform: translateY(-50%) scaleY(1.5);
}

.c-machine-tab__offset-down {
	bottom: 0;
	left: 50%;
	transform: translateX(-50%) scaleX(1.5);
}

.c-machine-tab__canvas {
	position: absolute;
	top: 0;
	left: 0;
}
</style>