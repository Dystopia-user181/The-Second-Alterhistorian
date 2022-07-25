<script>
import MachineUpgrade from "./MachineUpgrade.vue";
import ModalWrapper from "./ModalWrapper.vue";

export default {
	name: "MachineUpgradeModal",
	props: {
		machine: {
			type: Object,
			required: true
		}
	},
	components: {
		MachineUpgrade,
		ModalWrapper
	},
	data() {
		return {
			upgrades: []
		}
	},
	methods: {
		update() {
			this.upgrades = this.machine.machineData.upgrades;
		}
	},
};
</script>

<template>
	<modal-wrapper class="c-machine-upgrade-modal">
		<template #header>
			Upgrades ({{ machine.machineData.type.name.capitalize() }})
		</template>
		<machine-upgrade
			v-for="upgrade in upgrades"
			:key="upgrade.id"
			:upgrade="upgrade"
		/>
	</modal-wrapper>
</template>

<style scoped>
.c-machine-upgrade-modal {
	min-width: 400px;
	min-height: 250px;
}
</style>