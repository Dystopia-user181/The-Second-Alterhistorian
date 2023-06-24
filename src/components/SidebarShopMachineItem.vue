<script setup lang="ts">
import CostDisplay from "@/components/CostDisplay.vue";

import { onMount } from "@/components/mixins";

import { SidebarShopItem } from "@/js/towns";

import { MachineCounts } from "@/js/machines";
import { player } from "@/js/player";
import { ResourceType } from "@/types/resources";

import { formatInt, str } from "@/utils";


const { shopItem } = defineProps<{
	shopItem: SidebarShopItem
}>();
let cost = $ref(0);
let currencyType = $ref<ResourceType | undefined>("earth");
let canAfford = $ref(false);
let name = $ref("");
let description = $ref("");
let count = $ref(0);

onMount({
	update() {
		cost = shopItem.cost;
		currencyType = shopItem.currencyType;
		canAfford = shopItem.canAfford;
		name = str(shopItem.associatedMachine.config.name).capitalize;
		description = shopItem.associatedMachine.config.description;
		count = MachineCounts[player.currentlyIn][shopItem.associatedMachine.config.name];
	}
});
</script>

<template>
	<button
		class="c-sidebar__shop-item"
		:class="{ disabled: !canAfford }"
		@click="shopItem.buy()"
	>
		<span class="c-emphasise-text">
			{{ name }} ({{ formatInt(count) }})
		</span>
		<hr>
		{{ description }}
		<br>
		<CostDisplay
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
</style>