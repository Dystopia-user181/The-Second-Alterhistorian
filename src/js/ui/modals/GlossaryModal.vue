<script setup lang="ts">
import { CurrenciesList } from "@/js/currencies/currencies";

import { format, str } from "@/utils";

import ModalWrapper from "./ModalWrapper.vue";
</script>

<template>
	<modal-wrapper>
		<template #header>
			The Elements, by Euler
		</template>
		<br>
		<div class="c-modal__currencies">
			<div
				v-for="currency in CurrenciesList.filter(x => x.isUnlocked)"
				:key="currency.type"
				class="c-modal__currency-entry c-tint"
				:style="{ '--tint-background': currency.colour }"
			>
				<i class="c-emphasise-text">{{ str(currency.type).capitalize }}</i>
				<br>
				Selling Price: ${{ format(currency.value, 2, 1) }}
				<br>
				<i>{{ currency.description }}</i>
			</div>
		</div>
	</modal-wrapper>
</template>

<style scoped>
.c-modal__currencies {
	width: 700px;
	height: 500px;
	overflow-y: auto;
}

.c-modal__currency-entry {
	border: 1px solid white;
	border-radius: 10px;
	text-align: left;
	font-family: 'Times New Roman', Times, serif;
	font-size: 1.15em;
	padding: 20px;
	margin: 6px;
	--tint-opacity: 0.2;
}
</style>