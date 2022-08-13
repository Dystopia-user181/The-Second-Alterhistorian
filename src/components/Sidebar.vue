<script>
import SidebarSellPanel from "./SidebarSellPanel.vue";
import SidebarShop from "./SidebarShop.vue";

export default {
	name: "Sidebar",
	components: {
		SidebarSellPanel,
		SidebarShop,
	}
};
</script>

<template>
	<div class="c-sidebar">
		<sidebar-sell-panel />
		<sidebar-shop />
	</div>
</template>

<style scoped>
.c-sidebar {
	width: 300px;
	padding: 10px;
	display: flex;
	flex-direction: column;
	align-items: center;
	align-self: stretch;
}
</style>
