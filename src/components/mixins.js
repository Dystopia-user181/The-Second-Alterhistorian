import { onBeforeUnmount, onMounted, ref } from "vue";

import { UIEvent } from "@/js/ui/events.ts";

let componentId = 0;
export function onMount(options = {}) {
	const tempComponentId = componentId;
	onMounted(() => {
		if (options.onMount) options.onMount();
		if (options.update) {
			UIEvent.on(tempComponentId, "UPDATE", options.update);
			options.update();
		}
		if (options.render) {
			UIEvent.on(tempComponentId, "RENDER", options.render);
			options.render();
		}
		if (options.on) {
			for (const event in options.on) {
				UIEvent.on(tempComponentId, event, options.on[event]);
			}
		}
	});
	onBeforeUnmount(() => {
		if (options.beforeUnmount) options.beforeUnmount();
		UIEvent.offAll(tempComponentId);
	});
	componentId++;
}

export const WindowProperties = {
	width: ref(innerWidth),
	height: ref(innerHeight)
};

addEventListener("resize", () => {
	WindowProperties.width.value = innerWidth;
	WindowProperties.height.value = innerHeight;
});