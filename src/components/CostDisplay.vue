<script setup>
import ResourceSquare from "@/components/ResourceSquare.vue";

import { format } from "@/utils";


const { cost, type } = defineProps({
	cost: {
		type: Number,
		required: true
	},
	type: {
		validator: item => item === null || item === undefined || typeof item === "string",
		required: false,
		default: undefined
	}
});
</script>

<template>
	<span>
		Cost: {{ type === undefined ? "$" : "" }} {{ format(cost, 2, 1) }} {{ type === null ? "???" : type }}
		<ResourceSquare
			v-if="type"
			:type="type"
		/>
	</span>
</template>