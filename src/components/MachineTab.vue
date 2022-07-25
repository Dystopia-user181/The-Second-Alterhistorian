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
			beforeDestroy: null
		}
	},
	beforeDestroy() {
		if (this.beforeDestroy) this.beforeDestroy();
	},
	methods: {
		update() {
			this.machines = Machines[player.currentlyIn].map(machine => ({
				position: {
					top: machine.data.y,
					left: machine.data.x
				},
				machineData: machine
			}));
		},
		registerMoveHold(machine) {
			if (!this.holding) {
				this.holding = true;
				const followMouse = function(event) {
					machine.machineData.data.x = Math.max(event.clientX + 12.5 - this.$refs.machineTab.offsetLeft, 30);
					machine.machineData.data.y = Math.max(event.clientY - 12.5 - this.$refs.machineTab.offsetTop, 30);
				}.bind(this);
				this.$refs.machineTab.addEventListener("mousemove", followMouse);
				const stopHolding = function() {
					this.holding = false;
					this.$refs.machineTab.removeEventListener("mousemove", followMouse);
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
		<span
			v-for="(machine, machineId) in machines"
			:key="machineId"
		>
			<machine
				:machine="machine.machineData"
				:style="objectMap(machine.position, x => x, x => `${x}px`)"
			/>
			<div
				class="fas fa-arrows"
				:style="objectMap(machine.position, x => x, x => `${x}px`)"
				@mousedown="registerMoveHold(machine)"
			/>
		</span>
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

.fa-arrows {
	position: absolute;
	width: 25px;
	height: 25px;
	display: flex;
	align-items: center;
	justify-content: center;
	background-color: #333333;
	border-radius: 5px 0 0 5px;
	font-size: 1.1em;
	transform: translateX(-100%);
	cursor: move;
}
</style>