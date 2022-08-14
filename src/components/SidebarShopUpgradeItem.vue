<script>
import { format } from "@/utils/index";

export default {
	name: "SidebarShopUpgradeItem",
	props: {
		shopItem: {
			type: Object,
			required: true
		}
	},
	data() {
		return {
			cost: 0,
			currencyType: "",
			canAfford: false,
			name: "",
			description: "",
			isBought: false
		};
	},
	methods: {
		update() {
			this.cost = this.shopItem.cost;
			this.currencyType = this.shopItem.currencyType || "";
			this.canAfford = this.shopItem.canAfford;
			this.isBought = this.shopItem.isBought;
			this.name = this.shopItem.title;
			this.description = this.shopItem.description;
		},
		format
	}
};
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
		Cost: {{ !currencyType ? "$" : "" }} {{ format(cost, 2, 1) }} {{ currencyType }}
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