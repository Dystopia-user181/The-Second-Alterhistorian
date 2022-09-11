<script setup>
import { Currencies } from "@/js/currencies/currencies.ts";

import { areArraysEqualSets, str } from "@/utils";

const { machine } = defineProps({
	machine: {
		type: Object,
		required: true
	}
});

function acceptsAll(accepts) {
	return areArraysEqualSets(accepts, Object.keys(Currencies));
}
</script>

<template>
	{{ machine.type.description }}
	<br>
	<div class="c-info__table">
		<span
			v-for="input in machine.inputs.filter(x => x.isUnlocked)"
			:key="input.id"
		>
			Input {{ input.id + 1 }} accepts:
			{{ acceptsAll(input.accepts) ? "all"
				: input.accepts.map(x => str(x).capitalize).join(", ") }}
			<br>
		</span>
	</div>
</template>

<style scoped>
.c-info__table {
	display: inline-block;
	padding: 10px;
	max-width: 400px;
	text-align: left;
}
</style>