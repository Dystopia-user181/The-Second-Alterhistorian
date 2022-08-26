<script setup>
import { format } from "@/utils";


const { upgrade } = defineProps({
	upgrade: {
		type: Object,
		required: true
	}
});
</script>

<template>
	<button
		class="c-machine-upgrade"
		:class="{
			'c-machine-upgrade--bought': upgrade.maxed,
			disabled: !upgrade.maxed && !upgrade.canAfford
		}"
		@click="upgrade.buy()"
	>
		<span class="c-emphasise-text"> {{ upgrade.title }} </span>
		<br>
		{{ upgrade.description }}
		<span v-if="upgrade.formattedEffect">
			<br>
			Currently: {{ upgrade.formattedEffect }}
		</span>
		<span v-if="!upgrade.maxed">
			<br>
			Cost: {{ !upgrade.currencyType ? "$" : "" }}
			{{ format(upgrade.cost, 2, 1) }}
			{{ upgrade.currencyType }}
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