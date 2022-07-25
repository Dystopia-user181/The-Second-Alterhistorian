<script>
export default {
	name: "MachineUpgrade",
	props: {
		upgrade: {
			type: Object,
			required: true
		}
	},
	data() {
		return {
			cost: 0,
			effect: "",
			title: "",
			description: "",
			maxed: false,
			canAfford: false,
			currencyDisplay: ""
		}
	},
	methods: {
		update() {
			this.cost = this.upgrade.cost;
			this.effect = this.upgrade.formattedEffect;
			this.title = this.upgrade.title;
			this.description = this.upgrade.description;
			this.maxed = this.upgrade.maxed;
			this.canAfford = this.upgrade.canAfford;
			this.currencyDisplay = this.upgrade.currencyDisplay || "money";
		}
	},
};
</script>

<template>
	<button
		class="c-machine-upgrade"
		:class="{
			'c-machine-upgrade--bought': maxed,
			disabled: !maxed && !canAfford
		}"
		@click="upgrade.buy()"
	>
		<span class="c-emphasise-text"> {{ title }} </span>
		<br>
		{{ description }}
		<br>
		Currently: {{ effect }}
		<span v-if="!maxed">
			<br>
			Cost: {{ format(cost, 2, 1) }} {{ currencyDisplay }}
		</span>
	</button>
</template>

<style scoped>
.c-machine-upgrade {
	width: 180px;
	height: 100px;
	margin: 3px;
	transition: all 0.2s;
	vertical-align: top;
}

.c-machine-upgrade--bought {
	background-color: #216f44;
}
</style>