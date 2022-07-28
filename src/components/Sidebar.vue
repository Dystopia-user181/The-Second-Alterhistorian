<script>
import SidebarShop from "./SidebarShop.vue";
import SidebarSellPanel from "./SidebarSellPanel.vue";

export default {
	name: "Sidebar",
	components: {
		SidebarShop,
		SidebarSellPanel
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
	width: 250px;
	padding: 10px;
	display: flex;
	flex-direction: column;
	align-items: center;
	align-self: stretch;
}
</style>
