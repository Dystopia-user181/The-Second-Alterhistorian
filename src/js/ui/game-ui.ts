import "@/stylesheets/style.css";
import "@/stylesheets/tooltips.css";

import { createApp } from "vue";

import App from "@/App.vue";

import { UIEvent, UIEventList, UIEvents, UIEventType } from "@/js/ui/events";

const vueApp = createApp(App);

window.addEventListener("load", () => vueApp.mount("#app"));

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type EventsStorage<T extends Record<UIEventType, (...args: any) => any>> = {
	[K in UIEventType]: Parameters<T[K]> | boolean;
};

export const GameUI = {
	events: (function() {
		const obj = {} as Record<string, unknown>;
		for (const event of UIEventList) {
			obj[event] = false;
		}
		return obj as EventsStorage<UIEvents>;
	}()),
	flushPromise: undefined as undefined | Promise<void>,
	dispatch<K extends UIEventType>(event: K, ...args: Parameters<UIEvents[K]>) {
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		this.events[event] = args ? args : true;
		if (this.flushPromise) return;
		this.flushPromise = Promise.resolve().then(this.flushEvents.bind(this));
	},
	flushEvents() {
		this.flushPromise = undefined;
		for (const E in this.events) {
			const event = E as UIEventType;
			const args = this.events[event];
			if (!args) continue;
			if (args === true) UIEvent.dispatch(event);
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			else UIEvent.dispatch(event, this.events[event]);
		}
		UIEvent.dispatch("UPDATE");
		this.events = (function() {
			const obj = {} as Record<string, unknown>;
			for (const event of UIEventList) {
				obj[event] = false;
			}
			return obj as EventsStorage<UIEvents>;
		}());
	},
	update() {
		this.dispatch("UPDATE");
	},
	render() {
		UIEvent.dispatch("RENDER");
	}
};