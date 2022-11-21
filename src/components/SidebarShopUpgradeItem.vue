<script setup>
import CostDisplay from "@/components/CostDisplay.vue";

import { onMount } from "@/components/mixins";

const { shopItem } = defineProps({
	shopItem: {
		type: Object,
		required: true
	}
});

let cost = $ref(0);
let currencyType = $ref("");
let canAfford = $ref(false);
let name = $ref("");
let description = $ref("");
let isBought = $ref(false);

onMount({
	update() {
		cost = shopItem.cost;
		currencyType = shopItem.currencyType;
		canAfford = shopItem.canAfford;
		isBought = shopItem.isBought;
		name = shopItem.title;
		description = shopItem.description;
	}
});
</script>

<template>
	<button
		class="c-sidebar__shop-item"
		:class="{
			'c-sidebar__shop-item--bought': isBought,
			disabled: !isBought && !canAfford
		}"
		@click="shopItem.buy()"
	>
		<span class="c-emphasise-text">
			{{ name }}
		</span>
		<hr>
		{{ description }}
		<br>
		<cost-display
			:cost="cost"
			:type="currencyType"
		/>
	</button>
</template>

<style scoped>
.c-sidebar__shop-item {
	width: 95%;
	min-height: 70px;
	margin: 3px;
	text-align: left;
	align-self: center;
	flex-shrink: 0;
}

.c-sidebar__shop-item--bought {
	background-color: #216f44;
	cursor: default;
}
</style>