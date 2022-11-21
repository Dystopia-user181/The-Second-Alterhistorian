<script setup>
import { Currencies } from "@/js/currencies/currencies.ts";
import { player } from "@/js/player";

import { format } from "@/utils";


const showMode = $ref("");

const gainedMoney = $computed(() => {
	switch (showMode) {
		case "sell1":
			return Currencies[player.holding.resource].value * (player.holding.amount >= 1);
		case "sellall":
			return Currencies[player.holding.resource].value * player.holding.amount;
		default:
			return 0;
	}
});

function sellStatic(amount) {
	if (player.holding.amount >= amount) {
		player.holding.amount -= amount;
		player.money += amount * Currencies[player.holding.resource].value;
	}
}
function sellDynamic(fraction) {
	const amount = player.holding.amount * fraction;
	player.holding.amount -= amount;
	player.money += amount * Currencies[player.holding.resource].value;
}
</script>

<template>
	<div class="c-sidebar__shop">
		<h2 class="c-money-display">
			${{ format(player.money, 2, 2) }}
			<br>
			<span v-if="gainedMoney">
				+${{ format(gainedMoney, 2, 2) }}
			</span>
			<br v-else>
		</h2>
		<button
			class="c-sidebar-shop__sell-button"
			:class="{ disabled: player.holding.amount < 1 }"
			@mouseenter="showMode = 'sell1'"
			@mouseleave="showMode = ''"
			@click="sellStatic(1)"
		>
			Sell 1
		</button>
		<button
			class="c-sidebar-shop__sell-button"
			:class="{ disabled: player.holding.amount <= 0 }"
			@mouseenter="showMode = 'sellall'"
			@mouseleave="showMode = ''"
			@click="sellDynamic(1)"
		>
			Sell All
		</button>
	</div>
</template>

<style scoped>
.c-sidebar-shop {
	text-align: center;
}
.c-money-display {
	color: #dddd00;
	margin-bottom: 0;
}

.c-sidebar-shop__sell-button {
	width: 130px;
	margin: 3px;
}
</style>