<script setup>
import { Modals } from "@/js/ui/modals";

import SidebarSellPanel from "./SidebarSellPanel.vue";
import SidebarShop from "./SidebarShop.vue";
</script>

<template>
	<div class="c-sidebar">
		<h2 class="c-sidebar__header">
			<i
				class="fas fa-circle-info"
				@click="Modals.info.show()"
			/>
			<i
				class="fas fa-question-circle"
				@click="Modals.h2p.show()"
			/>
		</h2>
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

.c-sidebar__header {
	position: relative;
	font-size: 25px;
	width: 100%;
}

.c-sidebar__header .fa-circle-info, .c-sidebar__header .fa-question-circle {
	cursor: pointer;
	position: absolute;
}

.c-sidebar__header .fa-circle-info {
	right: 45px;
}

.c-sidebar__header .fa-question-circle {
	right: 10px;
}
</style>