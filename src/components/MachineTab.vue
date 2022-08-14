<script>
import { Machine, Machines, Pipe } from "@/js/machines/index";
import { Currencies } from "@/js/database/currencies";
import { Modals } from "@/js/ui/modals";
import { player } from "@/js/player";

import { arr, format, formatX, objectMap } from "@/utils/index";

import MachineVue from "./Machine.vue";

export default {
	name: "MachineTab",
	components: {
		MachineVue
	},
	data() {
		return {
			machines: [],
			fastTime: 0,
			holding: false,
			holdingMachine: null,
			beforeDestroy: null,
			offsetX: 0,
			offsetY: 0,
			width: 0,
			height: 0,
			ctx: null,
			holdingFunction: null,
			holdingKeyFunction: null,
			draggingPipe: {
				type: "",
				machine: null,
				id: 0
			},
			hoveringPipe: {
				type: "",
				machine: null,
				id: 0
			},
		};
	},
	computed: {
		maxOffsetX: () => 5998,
		maxOffsetY: () => 2998
	},
	mounted() {
		this.on$(GAME_EVENTS.ARROW_KEYDOWN, key => {
			switch (key) {
				case "up":
					this.registerOffsetKey([0, -1]);
					break;
				case "right":
					this.registerOffsetKey([1, 0]);
					break;
				case "down":
					this.registerOffsetKey([0, 1]);
					break;
				case "left":
					this.registerOffsetKey([-1, 0]);
					break;
			}
		});
		this.on$(GAME_EVENTS.ARROW_KEYUP, () => {
			this.deregisterOffsetKey();
		});
	},
	beforeUnmount() {
		if (this.beforeDestroy) this.beforeDestroy();
	},
	methods: {
		update() {
			this.fastTime = player.fastTime;
			this.width = this.$refs.machineTab.offsetWidth;
			this.height = this.$refs.machineTab.offsetHeight;
			this.machines = Machines[player.currentlyIn].map(machine => ({
				position: {
					top: machine.data.y - this.offsetY,
					left: machine.data.x - this.offsetX
				},
				notifyUpgrade: machine.hasUpgradeAvailable,
				machineData: machine
			})).filter(x => (
				x.position.top > - 250 && x.position.left > - 600 &&
					x.position.top < this.height && x.position.left < this.width
			));
		},
		render() {
			player.display.offset.x = Math.min(player.display.offset.x, this.maxOffsetX - this.width);
			player.display.offset.y = Math.min(player.display.offset.y, this.maxOffsetY - this.height);
			this.offsetX = player.display.offset.x;
			this.offsetY = player.display.offset.y;
			if (this.holdingFunction) this.holdingFunction();
			if (this.holdingKeyFunction) this.holdingKeyFunction();
			if (this.ctx === null) this.ctx = this.$refs.canvas.getContext("2d");
			this.$nextTick(() => {
				const ctx = this.ctx;
				ctx.clearRect(0, 0, this.width, this.height);
				ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
				for (let i = -2 - this.offsetX % 100; i < this.width; i += 100) {
					ctx.fillRect(i - 1, 0, 2, this.height);
				}
				for (let i = -2 - this.offsetY % 100; i < this.height; i += 100) {
					ctx.fillRect(0, i - 1, this.width, 2);
				}
				ctx.lineCap = "round";
				ctx.globalAlpha = 0.8;
				for (const machine of Machines[player.currentlyIn]) {
					for (let i = 0; i < machine.pipes.length; i++) {
						const pipes = machine.pipes[i];
						for (const pipe of pipes) {
							ctx.lineWidth = 9;
							ctx.strokeStyle = "#ffffff";
							ctx.beginPath();
							ctx.moveTo(
								machine.data.x + i * 30 + 15 - this.offsetX,
								machine.data.y + machine.height + 10 - this.offsetY
							);
							ctx.lineTo(pipe[0].data.x + pipe[1].id * 30 + 15 - this.offsetX,
								pipe[0].data.y - 10 - this.offsetY);
							ctx.stroke();
							ctx.lineWidth = 5;
							const intermediate = arr(machine.outputHistories).findLast(x => x[i].length);
							const currency = intermediate ? arr(intermediate[i]).last.resource : "";
							ctx.strokeStyle = currency ? Currencies[currency].colour : "#0000";
							ctx.beginPath();
							ctx.moveTo(
								machine.data.x + i * 30 + 15 - this.offsetX,
								machine.data.y + machine.height + 10 - this.offsetY
							);
							ctx.lineTo(pipe[0].data.x + pipe[1].id * 30 + 15 - this.offsetX,
								pipe[0].data.y - 10 - this.offsetY);
							ctx.stroke();
						}
					}
				}
				ctx.globalAlpha = 1;
				ctx.lineWidth = 5;
				if (this.draggingPipe.type) {
					ctx.strokeStyle = "#ffffff";
					ctx.beginPath();
					ctx.moveTo(this.draggingPipe.machine.data.x + this.draggingPipe.id * 30 + 15 - this.offsetX,
						this.draggingPipe.machine.data.y + (this.draggingPipe.type === "input" ? -10
							: this.draggingPipe.machine.height + 10) - this.offsetY);
					if (this.hoveringPipe.type && this.hoveringPipe.type !== this.draggingPipe.type)
						ctx.lineTo(this.hoveringPipe.machine.data.x + this.hoveringPipe.id * 30 + 15 - this.offsetX,
							this.hoveringPipe.machine.data.y + (this.hoveringPipe.type === "input" ? -10
								: this.hoveringPipe.machine.height + 10) - this.offsetY);
					else
						ctx.lineTo(mouseX - this.$refs.machineTab.offsetLeft, mouseY - this.$refs.machineTab.offsetTop);
					ctx.stroke();
				}
			});
		},
		moveMachines() {
			for (const machine of this.machines) {
				machine.position.top = machine.machineData.data.y - this.offsetY;
				machine.position.left = machine.machineData.data.x - this.offsetX;
			}
		},
		registerMoveHold(machine) {
			if (!this.holding) {
				this.holding = true;
				this.holdingMachine = machine;
				const followMouse = function(event) {
					machine.machineData.data.x = Math.min(
						Math.max(event.clientX + 12.5 - this.$refs.machineTab.offsetLeft + this.offsetX, 20),
						this.maxOffsetX - 270
					);
					machine.machineData.data.y = Math.min(
						Math.max(event.clientY - 12.5 - this.$refs.machineTab.offsetTop + this.offsetY, 20),
						this.maxOffsetY - 270
					);
					this.moveMachines();
				}.bind(this);
				document.addEventListener("mousemove", followMouse);
				const stopHolding = function() {
					this.holding = false;
					document.removeEventListener("mousemove", followMouse);
					document.removeEventListener("mouseup", stopHolding);
					document.removeEventListener("mouseleave", stopHolding);
					this.beforeDestroy = null;
					this.holdingMachine = null;
				}.bind(this);
				document.addEventListener("mouseup", stopHolding);
				document.addEventListener("mouseleave", stopHolding);
				this.beforeDestroy = stopHolding;
			}
		},
		openUpgrades(machine) {
			Modals.machineUpgrades.show({ machine });
		},
		registerOffsetHold(offset) {
			if (!this.holding) {
				this.holding = true;
				this.holdingFunction = function() {
					player.display.offset.x = Math.max(Math.min(player.display.offset.x + offset[0] * 15,
						this.maxOffsetX - this.width), 0);
					player.display.offset.y = Math.max(Math.min(player.display.offset.y + offset[1] * 15,
						this.maxOffsetY - this.height), 0);
					this.moveMachines();
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
		},
		registerOffsetKey(offset) {
			this.holdingKeyFunction = function() {
				const { x, y } = player.display.offset;
				player.display.offset.x = Math.max(Math.min(player.display.offset.x + offset[0] * 15,
					this.maxOffsetX - this.width), 0);
				player.display.offset.y = Math.max(Math.min(player.display.offset.y + offset[1] * 15,
					this.maxOffsetY - this.height), 0);
				if (this.holdingMachine) {
					this.holdingMachine.machineData.data.x += (player.display.offset.x - x);
					this.holdingMachine.machineData.data.y += (player.display.offset.y - y);
				}
				this.moveMachines();
			}.bind(this);
		},
		deregisterOffsetKey() {
			this.holdingKeyFunction = null;
		},
		deleteMachine(machine) {
			if (shiftDown) {
				Machine.remove(machine);
				this.update();
			} else {
				Modals.removeMachine.show({ machine }).then(() => this.update());
			}
		},
		handlePipeDrag(type, machine, id) {
			this.holding = true;
			this.draggingPipe.type = type;
			this.draggingPipe.machine = machine;
			this.draggingPipe.id = id;
			const stopHolding = function() {
				document.removeEventListener("mouseup", stopHolding);
				document.removeEventListener("mouseleave", stopHolding);
				this.handlePipeStopDrag();
			}.bind(this);
			document.addEventListener("mouseup", stopHolding);
			document.addEventListener("mouseleave", stopHolding);
		},
		handlePipeStopDrag() {
			this.holding = false;
			if (this.draggingPipe.type === "output") {
				if (this.hoveringPipe.type === "input") {
					Pipe.removeAllInputPipesTo(this.hoveringPipe.machine, this.hoveringPipe.id);
					this.draggingPipe.machine.addPipe(
						this.hoveringPipe.machine,
						this.hoveringPipe.id,
						this.draggingPipe.id
					);
				}
			} else if (this.draggingPipe.type === "input") {
				if (this.hoveringPipe.type === "output") {
					Pipe.removeAllInputPipesTo(this.draggingPipe.machine, this.draggingPipe.id);
					this.hoveringPipe.machine.addPipe(
						this.draggingPipe.machine,
						this.draggingPipe.id,
						this.hoveringPipe.id
					);
				}
			}
			this.draggingPipe.type = "";
			this.draggingPipe.machine = null;
		},
		handlePipeHover(type, machine, id) {
			this.hoveringPipe.type = type;
			this.hoveringPipe.machine = machine;
			this.hoveringPipe.id = id;
		},
		handlePipeStopHover() {
			this.hoveringPipe.type = "";
			this.hoveringPipe.machine = null;
		},
		attemptUseDrag(event) {
			if (!this.holding) {
				this.holding = true;
				let { x, y } = player.display.offset;
				const followMouse = function(event2) {
					// Move board position with edge handling, then move reference point if it hits the edge
					player.display.offset.x = Math.max(Math.min(x + event.clientX - event2.clientX,
						this.maxOffsetX - this.width), 0);
					x = player.display.offset.x + event2.clientX - event.clientX;
					player.display.offset.y = Math.max(Math.min(y + event.clientY - event2.clientY,
						this.maxOffsetY - this.height), 0);
					y = player.display.offset.y + event2.clientY - event.clientY;
					this.moveMachines();
				}.bind(this);
				document.addEventListener("mousemove", followMouse);
				const stopHolding = function() {
					this.holding = false;
					document.removeEventListener("mousemove", followMouse);
					document.removeEventListener("mouseup", stopHolding);
					document.removeEventListener("mouseleave", stopHolding);
					this.beforeDestroy = null;
					this.holdingMachine = null;
				}.bind(this);
				document.addEventListener("mouseup", stopHolding);
				document.addEventListener("mouseleave", stopHolding);
				this.beforeDestroy = stopHolding;
			}
		},
		objectMap,
		format,
		formatX
	}
};
</script>

<template>
	<div
		ref="machineTab"
		class="c-machine-tab"
		@mousedown="attemptUseDrag"
	>
		<span class="c-machine-tab__fast-time-display">
			Fast Time: {{ format(fastTime, 2, 2) }}s
			<template v-if="fastTime > 0">
				<br>
				Time speedup: {{ formatX(4, 2, 1) }}
			</template>
		</span>
		<canvas
			ref="canvas"
			class="c-machine-tab__canvas"
			:width="width"
			:height="height"
		/>
		<span
			v-for="machine in machines"
			:key="machine.machineData.id"
		>
			<machine-vue
				:machine="machine.machineData"
				:style="objectMap(machine.position, x => x, x => `${x}px`)"
				@input-pipe-drag-start="(machine, id) => handlePipeDrag('input', machine, id)"
				@output-pipe-drag-start="(machine, id) => handlePipeDrag('output', machine, id)"
				@input-pipe-drag-end="handlePipeStopDrag"
				@output-pipe-drag-end="handlePipeStopDrag"
				@input-pipe-hover="(machine, id) => handlePipeHover('input', machine, id)"
				@output-pipe-hover="(machine, id) => handlePipeHover('output', machine, id)"
				@pipe-stop-hover="handlePipeStopHover"
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
					:class="{ 'c-glow-yellow': machine.notifyUpgrade }"
					@mousedown="openUpgrades(machine.machineData)"
				/>
				<div
					class="fas fa-info-circle"
					@mousedown="machine.machineData.showDescription()"
				/>
				<div
					class="fas fa-chart-bar"
					@mousedown="machine.machineData.showProduction()"
				/>
				<div
					class="fas"
					:class="machine.machineData.data.min ? 'fa-expand-arrows-alt' : 'fa-compress-arrows-alt'"
					@mousedown="machine.machineData.data.min = !machine.machineData.data.min"
				/>
				<div
					v-if="!machine.machineData.data.isDefault"
					class="fas fa-trash"
					@mousedown="deleteMachine(machine.machineData)"
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
	transform: translateX(calc(0.3px - 100%));
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
	transition: text-shadow 0.3s;
}

.c-machine-sidebar .fas:hover {
	text-shadow: 0 0 5px;
}

.c-machine-sidebar .fas:nth-child(even) {
	opacity: 0.7;
}

.c-machine-sidebar .fa-arrows {
	cursor: move;
}

.c-machine-sidebar .fa-arrow-up,
.c-machine-sidebar .fa-expand-arrows-alt,
.c-machine-sidebar .fa-compress-arrows-alt {
	cursor: pointer;
}

.c-machine-sidebar .fa-info-circle,
.c-machine-sidebar .fa-chart-bar {
	cursor: help;
}

.c-machine-sidebar .fa-trash {
	cursor: pointer;
	color: #cc5555;
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

.c-machine-tab__fast-time-display {
	pointer-events: none;
	position: absolute;
	left: 0;
	top: 0;
	z-index: 3;
	padding: 5px;
	background-color: #24242488;
	border-bottom-right-radius: 5px;
}
</style>