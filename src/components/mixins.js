import { onBeforeUnmount, onMounted } from "vue";

let componentId = 0;
export function onMount(options = {}) {
	const tempComponentId = componentId;
	onMounted(() => {
		if (options.onMount) options.onMount();
		if (options.update) {
			EventHub.ui.on(GAME_EVENTS.UPDATE, options.update, tempComponentId);
			options.update();
		}
		if (options.render) {
			EventHub.ui.on(GAME_EVENTS.RENDER, options.render, tempComponentId);
			options.render();
		}
		if (options.on) {
			for (const event in options.on) {
				EventHub.ui.on(event, options.on[event], tempComponentId);
			}
		}
	});
	onBeforeUnmount(() => {
		if (options.beforeUnmount) options.beforeUnmount();
		EventHub.ui.offAll(tempComponentId);
	});
	componentId++;
}