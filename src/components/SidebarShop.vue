<script>
import { SidebarShop } from "./../js/towns";
import SidebarShopItem from "./SidebarShopItem.vue";

export default {
	name: "SidebarShop",
	components: {
		SidebarShopItem
	},
	data() {
		return {
			currentShop: []
		};
	},
	methods: {
		update() {
			this.currentShop = SidebarShop.current;
		}
	}
};
</script>

<template>
	<div class="c-sidebar__shop">
		<span class="c-emphasise-text c-sidebar__shop-label">
			Purchase Machines
			<hr>
		</span>
		<sidebar-shop-item
			v-for="(shopItem, id) of currentShop"
			:key="id"
			:shop-item="shopItem"
		/>
	</div>
</template>

<style scoped>
.c-sidebar__shop {
	width: 100%;
	flex: 1 0 auto;
	overflow-y: auto;
	overflow-x: hidden;
	display: flex;
	flex-direction: column;
	align-items: flex-start;
}

.c-sidebar__shop-label {
	padding: 0 10px;
	width: 100%;
	margin-top: 20px;
}
</style>
