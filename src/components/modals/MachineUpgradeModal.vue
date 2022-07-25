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
	<modal-wrapper>
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
</style>