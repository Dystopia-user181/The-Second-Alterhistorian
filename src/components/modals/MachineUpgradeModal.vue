<script>
import MachineUpgrade from "./MachineUpgrade.vue";
import ModalWrapper from "./ModalWrapper.vue";

export default {
	name: "MachineUpgradeModal",
	components: {
		MachineUpgrade,
		ModalWrapper
	},
	props: {
		machine: {
			type: Object,
			required: true
		}
	},
	data() {
		return {
			upgrades: []
		};
	},
	methods: {
		update() {
			this.upgrades = Object.values(this.machine.upgrades || {}).filter(x => x.isUnlocked);
		}
	},
};
</script>

<template>
	<modal-wrapper class="c-machine-upgrade-modal">
		<template #header>
			Upgrades ({{ machine.displayName }})
		</template>
		<machine-upgrade
			v-for="upgrade in upgrades"
			:key="upgrade.id"
			:upgrade="upgrade"
		/>
		<span v-if="!upgrades.length"> No upgrades, sorry :( </span>
	</modal-wrapper>
</template>

<style scoped>
.c-machine-upgrade-modal {
	min-width: 400px;
	max-width: 600px;
	min-height: 250px;
}
</style>