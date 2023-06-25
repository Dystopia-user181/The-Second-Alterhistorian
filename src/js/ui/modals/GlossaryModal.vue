<script setup lang="ts">
import ModalWrapper from "./ModalWrapper.vue";

import { CurrenciesList } from "@/js/currencies/currencies";

import { format, str } from "@/utils";

const showHints = $ref(false);
</script>

<template>
	<modal-wrapper>
		<template #header>
			The Elements, by Euler
		</template>
		<br>
		<div class="c-modal__currency-hint-prompt">
			Enable hints: <input
				v-model="showHints"
				type="checkbox"
			>
		</div>
		<div class="c-modal__currencies">
			<div
				v-for="currency in CurrenciesList"
				:key="currency.type"
				class="c-modal__currency-entry c-tint"
				:style="{
					'--tint-background': currency.colour,
					opacity: currency.isUnlocked ? 1 : 0.6,
				}"
			>
				<template v-if="currency.isUnlocked">
					<i class="c-emphasise-text">{{ str(currency.type).capitalize }}</i>
					<br>
					Selling Price: ${{ format(currency.value, 2, 1) }}
					<br>
					<i>{{ currency.description }}</i>
				</template>
				<template v-else>
					<i class="c-emphasise-text">???</i>
					<br>
					<i v-if="showHints">
						<b>Hint: </b> {{ currency.hint || "This should be easy enough to figure out on your own." }}
					</i>
					<i v-else>????</i>
				</template>
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

.c-modal__currency-hint-prompt {
	text-align: left;
	font-size: 18px;
	vertical-align: middle;
	padding: 0 6px 7px;
}

.c-modal__currency-hint-prompt input {
	vertical-align: middle;
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