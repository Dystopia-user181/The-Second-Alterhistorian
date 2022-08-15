<script>
import { Currencies } from "@/js/database/currencies";
import { format } from "@/utils";
import { player } from "@/js/player";

export default {
	name: "SidebarSellPanel",
	data() {
		return {
			money: 0,
			holdingAmount: 0,
			holdingResource: "",
			showMode: "",
			gainedMoney: 0
		};
	},
	methods: {
		update() {
			this.money = player.money;
			this.holdingAmount = player.holding.amount;
			this.holdingResource = player.holding.resource;
			switch (this.showMode) {
				case "sell1":
					this.gainedMoney = Currencies[this.holdingResource].value * (player.holding.amount >= 1);
					break;
				case "sellall":
					this.gainedMoney = Currencies[this.holdingResource].value * this.holdingAmount;
					break;
				default:
					this.gainedMoney = 0;
			}
		},
		sellStatic(amount) {
			if (player.holding.amount >= amount) {
				player.holding.amount -= amount;
				player.money += amount * Currencies[player.holding.resource].value;
			}
		},
		sellDynamic(fraction) {
			const amount = player.holding.amount * fraction;
			player.holding.amount -= amount;
			player.money += amount * Currencies[player.holding.resource].value;
		},
		format
	}
};
</script>

<template>
	<div class="c-sidebar__shop">
		<h2 class="c-money-display">
			${{ format(money, 2, 2) }}
			<br>
			<span v-if="gainedMoney">
				+${{ format(gainedMoney, 2, 2) }}
			</span>
			<br v-else>
		</h2>
		<button
			class="c-sidebar-shop__sell-button"
			:class="{ disabled: holdingAmount < 1 }"
			@mouseenter="showMode = 'sell1'"
			@mouseleave="showMode = ''"
			@click="sellStatic(1)"
		>
			Sell 1
		</button>
		<button
			class="c-sidebar-shop__sell-button"
			:class="{ disabled: holdingAmount <= 0 }"
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