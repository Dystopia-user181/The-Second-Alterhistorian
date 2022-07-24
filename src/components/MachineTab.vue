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
			machines: []
		}
	},
	methods: {
		update() {
			this.machines = Machines[player.currentlyIn].map(machine => ({
				positionStyle: {
					top: `${machine.data.x}px`,
					left: `${machine.data.y}px`
				},
				machineData: machine
			}));
		}
	}
}
</script>

<template>
	<div class="c-machine-tab">
		<machine
			v-for="(machine, machineId) in machines"
			:key="machineId"
			:machine="machine.machineData"
			:style="machine.positionStyle"
		/>
	</div>
</template>

<style scoped>
.c-machine-tab {
	background-color: #202020;
	overflow: hidden;
	position: relative;
	flex-grow: 1;
	align-self: stretch;
	justify-self: stretch;
}
</style>