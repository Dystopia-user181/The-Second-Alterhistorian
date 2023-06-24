<script setup lang="ts">
import ResourceSquare from "@/components/ResourceSquare.vue";

import { format } from "@/utils";
import { ResourceType } from "@/types/resources";


const { cost, type } = defineProps<{
	cost: number;
	type: ResourceType | null | undefined;
}>();
</script>

<template>
	<span>
		Cost:
		{{ type === undefined ? "$" : "" }}
		{{ format(cost, 2, cost < 1 ? 2 : 1) }}
		{{ type === null ? "???" : type }}
		<ResourceSquare
			v-if="type"
			:type="type"
		/>
	</span>
</template>