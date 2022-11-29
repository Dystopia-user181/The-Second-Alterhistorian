import { onBeforeUnmount, onMounted, ref } from "vue";

import { UIEvent, UIEvents } from "@/js/ui/events";

interface MountOptions {
	onMount?: () => void,
	update?: () => void,
	render?: () => void,
	beforeUnmount?: () => void,
	on?: Partial<UIEvents>
}
let componentId = 0;
export function onMount(options: MountOptions = {}) {
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
			let event: keyof typeof options.on;
			for (event in options.on) {
				// Todo: Make this not terrible
				// But hey we know it works so whatever
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