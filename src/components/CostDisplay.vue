<script setup>
import ResourceSquare from "@/components/ResourceSquare.vue";

import { format } from "@/utils";


const { cost, type } = defineProps({
	cost: {
		type: Number,
		required: true
	},
	type: {
		type: String,
		required: true
	}
});
</script>

<template>
	<span>
		Cost: {{ !type ? "$" : "" }} {{ format(cost, 2, 1) }} {{ type }}
		<ResourceSquare
			v-if="type"
			:type="type"
		/>
	</span>
</template>