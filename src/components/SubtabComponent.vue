<script setup>
const { subtabs } = defineProps({
	subtabs: {
		type: Array,
		required: true
	}
});

const currentTab = $ref(0);

const emit = defineEmits(["changeTab"]);
</script>

<template>
	<div class="c-subtab-display__tab-button-container">
		<button
			v-for="(subtab, id) of subtabs"
			:key="id"
			class="c-tab-button"
			:class="[{ 'c-tab-button--current': currentTab === id }, subtab.buttonClass]"

			@click="() => {
				currentTab = id;
				emit('changeTab', id, subtab);
			}"
		>
			{{ subtab.name }}
		</button>
	</div>
	<slot :name="subtabs[currentTab].name + 'Tab'" />
</template>

<style scoped>
.c-subtab-display__tab-button-container {
	display: flex;
	justify-content: center;
	align-items: center;
	width: 100%;
}

.c-tab-button {
	margin: 3px;
}

.c-tab-button--current {
	background-color: #ffffff33;
}
</style>