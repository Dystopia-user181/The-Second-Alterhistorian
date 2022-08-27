<script setup>
import { SidebarShop, Towns } from "@/js/towns/index";
import { player } from "@/js/player";

import { onMount } from "@/components/mixins";

import SidebarShopMachineItem from "./SidebarShopMachineItem.vue";
import SidebarShopUpgradeItem from "./SidebarShopUpgradeItem.vue";


const tab = $ref("machines");
let currentMachines = $shallowRef([]);
let currentUpgrades = $shallowRef([]);
let isFullyUpgraded = $ref(false);
let hasPartialBuyableUpgrades = $ref(false);
let hasWholeBuyableUpgrades = $ref(false);

onMount({
	update() {
		currentMachines = SidebarShop.currentMachines.filter(x => x.isUnlocked);
		currentUpgrades = Object.values(SidebarShop.currentUpgrades).filter(x => x.isUnlocked);
		isFullyUpgraded = Towns.current.isFullyUpgraded;
		hasPartialBuyableUpgrades = Towns.current.hasPartialBuyableUpgrades;
		hasWholeBuyableUpgrades = Towns.current.hasWholeBuyableUpgrades;
	}
});
</script>

<template>
	<div class="c-sidebar__shop-tabs">
		<button
			class="c-emphasise-text c-sidebar__shop-label"
			:class="{ 'c-current-tab': tab === 'machines' }"
			@click="tab = 'machines'"
		>
			Machines
		</button>
		<button
			class="c-emphasise-text c-sidebar__shop-label"
			:class="{
				'c-current-tab': tab === 'upgrades',
				'c-darker': isFullyUpgraded,
				'c-glow-green': hasPartialBuyableUpgrades,
				'c-glow-yellow': hasWholeBuyableUpgrades,
			}"
			@click="tab = 'upgrades'"
		>
			Upgrades
		</button>
	</div>
	<div class="c-sidebar__shop">
		<template v-if="tab === 'machines'">
			<h3 class="c-emphasise-text">
				&nbsp;&nbsp;
				Machines: {{ Object.values(player.towns[player.currentlyIn].machines).length }} / 50
			</h3>
			<sidebar-shop-machine-item
				v-for="(shopItem, id) of currentMachines"
				:key="id"
				:shop-item="shopItem"
			/>
		</template>
		<template v-else-if="tab === 'upgrades'">
			<sidebar-shop-upgrade-item
				v-for="(shopItem, id) of currentUpgrades"
				:key="id"
				:shop-item="shopItem"
			/>
		</template>
	</div>
</template>

<style scoped>
.c-sidebar__shop {
	width: 100%;
	flex: 1 0 auto;
	flex-basis: 0;
	overflow-y: auto;
	overflow-x: hidden;
	display: flex;
	flex-direction: column;
	align-items: flex-start;
}

.c-sidebar__shop-tabs {
	display: flex;
	width: 100%;
}

.c-sidebar__shop-label {
	padding: 0 10px;
	width: 100%;
	margin: 5px;
	margin-top: 10px;
	text-align: center;
	padding: 10px 5px;
}

.c-current-tab {
	background-color: #ffffff33;
}

.c-glow-green {
	color: lime;
}

.c-glow-yellow {
	color: gold;
}
</style>