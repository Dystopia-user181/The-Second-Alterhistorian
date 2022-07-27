<script>
export default {
	name: "SidebarShopItem",
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
	>
		<h2>
			{{ name }}
			<br>
			Cost: {{ !currencyType ? "$" : ""}} {{ format(cost, 2, 1) }} {{  }}
		</h2>
	</button>
</template>

<style scoped>
.c-sidebar__shop-item {
	width: 100%;
	min-height: 70px;
	margin: 3px;
}
</style>
