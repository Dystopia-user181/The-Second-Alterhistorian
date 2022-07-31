<script>
export default {
	name: "SidebarShopMachineItem",
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
			description: ""
		}
	},
	methods: {
		update() {
			this.cost = this.shopItem.cost;
			this.currencyType = this.shopItem.currencyType || "";
			this.canAfford = this.shopItem.canAfford;
			this.name = this.shopItem.associatedMachine.name.capitalize();
			this.description = this.shopItem.associatedMachine.description;
		}
	}
};
</script>

<template>
	<button
		class="c-sidebar__shop-item"
		:class="{ disabled: !canAfford }"
		@click="shopItem.buy()"
	>
		<span class="c-emphasise-text">
			{{ name }}
		</span>
		<hr>
		{{ description }}
		<br>
		Cost: {{ !currencyType ? "$" : ""}} {{ format(cost, 2, 1) }} {{ currencyType }}
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
</style>
