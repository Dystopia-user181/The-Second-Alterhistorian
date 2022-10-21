<script setup>
import { SidebarShop, Towns } from "@/js/towns/index";
import { player } from "@/js/player";

import { onMount } from "@/components/mixins";

import SidebarShopMachineItem from "./SidebarShopMachineItem.vue";
import SidebarShopUpgradeItem from "./SidebarShopUpgradeItem.vue";
import SubtabComponent from "./SubtabComponent.vue";

let currentMachines = $shallowRef([]);
let currentUpgrades = $shallowRef([]);
let isFullyUpgraded = $ref(false);
let hasPartialBuyableUpgrades = $ref(false);
let hasWholeBuyableUpgrades = $ref(false);

onMount({
	update() {
		currentMachines = SidebarShop.currentMachines.filter(x => x.isUnlocked);
		currentUpgrades = Object.values(SidebarShop.currentUpgrades).filter(x => x.isUnlocked);
		isFullyUpgraded = Towns("current").isFullyUpgraded;
		hasPartialBuyableUpgrades = Towns("current").hasPartialBuyableUpgrades;
		hasWholeBuyableUpgrades = Towns("current").hasWholeBuyableUpgrades;
	}
});
</script>

<template>
	<div
		class="c-sidebar__shop-subtab-container"
	>
		<subtab-component
			:subtabs="[
				{ name: 'Machines', buttonClass: 'c-sidebar__shop-label' },
				{
					name: 'Upgrades',
					buttonClass: {
						'c-sidebar__shop-label': true,
						'c-darker': isFullyUpgraded,
						'c-glow-green': hasPartialBuyableUpgrades,
						'c-glow-yellow': hasWholeBuyableUpgrades
					}
				}
			]"
		>
			<template #MachinesTab>
				<div class="c-sidebar__shop">
					<h3 class="c-emphasise-text">
						&nbsp;&nbsp;
						Machines: {{ Object.values(player.towns[player.currentlyIn].machines).length }} / 50
					</h3>
					<sidebar-shop-machine-item
						v-for="(shopItem, id) of currentMachines"
						:key="id"
						:shop-item="shopItem"
					/>
				</div>
			</template>
			<template #UpgradesTab>
				<div class="c-sidebar__shop">
					<sidebar-shop-upgrade-item
						v-for="(shopItem, id) of currentUpgrades"
						:key="id"
						:shop-item="shopItem"
					/>
				</div>
			</template>
		</subtab-component>
	</div>
</template>

<style scoped>
:deep(.c-sidebar__shop) {
	width: 100%;
	overflow-y: auto;
	overflow-x: hidden;
	display: flex;
	flex-direction: column;
	align-items: flex-start;
}

.c-sidebar__shop-subtab-container {
	display: flex;
	flex-direction: column;
	overflow-y: hidden;
	width: 100%;
}

:deep(.c-sidebar__shop-label) {
	padding: 0 10px;
	width: 100%;
	margin: 5px;
	margin-top: 10px;
	justify-self: stretch;
	padding: 10px 5px;
	font-size: 1.1em;
	font-weight: bold;
}

:deep(.c-darker) {
	color: #aaa;
}

:deep(.c-glow-green) {
	color: lime;
}

:deep(.c-glow-yellow) {
	color: gold;
}
</style>