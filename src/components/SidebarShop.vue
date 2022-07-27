<script>
import { SidebarShop } from "./../js/towns";

export default {
	name: "SidebarShop",
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
	<div class="c-sidebar">
		<div>
			<h2 class="c-money-display">
				${{format(money, 2, 2)}}
			</h2>
			<button
				class="c-sidebar-sell-button"
				:class="{ disabled: holdingAmount < 1 }"
				@click="sellStatic(1)"
			>
				Sell 1
			</button>
			<button
				class="c-sidebar-sell-button"
				:class="{ disabled: holdingAmount < 10 }"
				@click="sellStatic(10)"
			>
				Sell 10
			</button>
			<br>
			<button
				class="c-sidebar-sell-button"
				:class="{ disabled: holdingAmount <= 0 }"
				@click="sellDynamic(0.1)"
			>
				Sell 10%
			</button>
			<button
				class="c-sidebar-sell-button"
				:class="{ disabled: holdingAmount <= 0 }"
				@click="sellDynamic(1)"
			>
				Sell All
			</button>
		</div>
		<div class="c-sidebar__buy-machines"></div>
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

.c-money-display {
	color: #dddd00;
}

.c-sidebar-sell-button {
	width: 108px;
	margin: 3px;
}

.c-sidebar__buy-machines {
	width: 100%;
	flex: 1 0 auto;
	overflow-y: auto;
}
</style>
