<script>
import { format } from "@/utils";

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
			currencyType: ""
		};
	},
	methods: {
		update() {
			this.cost = this.upgrade.cost;
			this.effect = this.upgrade.formattedEffect;
			this.title = this.upgrade.title;
			this.description = this.upgrade.description;
			this.maxed = this.upgrade.maxed;
			this.canAfford = this.upgrade.canAfford;
			this.currencyType = this.upgrade.currencyType || "";
		},
		format
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
		<span v-if="effect">
			<br>
			Currently: {{ effect }}
		</span>
		<span v-if="!maxed">
			<br>
			Cost: {{ !currencyType ? "$" : "" }} {{ format(cost, 2, 1) }} {{ currencyType }}
		</span>
	</button>
</template>

<style scoped>
.c-machine-upgrade {
	width: 190px;
	height: 110px;
	margin: 3px;
	padding: 0 15px;
	font-size: 0.95em;
	transition: all 0.2s;
	vertical-align: top;
}

.c-machine-upgrade--bought {
	background-color: #216f44;
	cursor: default;
}
</style>