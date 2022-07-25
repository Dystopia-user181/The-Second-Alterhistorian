<script>
import { Currencies } from "./../js/database/currencies";

export default {
	name: "ResourceStack",
	props: {
		stack: {
			type: Array,
			required: true
		},
		capacity: {
			type: Number,
			required: false
		}
	},
	data() {
		return {
			display: []
		}
	},
	methods: {
		update() {
			this.display = this.stack.map(x => ({
				height: `${x.amount / this.capacity * 100}%`,
				'background-color': this.currencyColour(x.resource)
			}));
		},
		currencyColour(currency) {
			return Currencies[currency].colour;
		}
	}
};
</script>

<template>
	<div class="c-resources-container">
		<span class="c-resources-container--text">
			<slot />
		</span>
		<div class="c-resources-stack">
			<div
				v-for="(style, id) in display"
				:key="id"
				:style="style"
			/>
		</div>
	</div>
</template>

<style scoped>
.c-resources-container {
	background-color: rgba(15, 20, 25, 0.4);
	height: 100%;
	width: 100%;
	position: relative;
	display: flex;
	align-items: center;
	justify-content: center;
}

.c-resources-container--text {
	position: relative;
	text-align: center;
	z-index: 1;
	font-size: 0.9em;
}

.c-resources-stack {
	position: absolute;
	width: 100%;
	height: 100%;
	inset: 0;
	display: flex;
	flex-direction: column;
	justify-content: flex-end;
}
</style>
