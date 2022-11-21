import "@/stylesheets/style.css";
import "@/stylesheets/tooltips.css";

import { createApp } from "vue";

import App from "@/App.vue";

import { UIEvent } from "@/js/ui/events.ts";

const vueApp = createApp(App);

vueApp.mixin({
	mounted() {
		if (this.update) {
			this.on$("UPDATE", this.update);
			this.update();
		}
		if (this.render) {
			this.on$("RENDER", this.render);
			this.render();
		}
	},
	beforeUnmount() {
		UIEvent.offAll(this);
	},
	methods: {
		on$(event, fn) {
			UIEvent.on(this, event, fn);
		}
	}
});

window.addEventListener("load", () => vueApp.mount("#app"));

export const GameUI = {
	events: [],
	flushPromise: undefined,
	globalClickListener: null,
	dispatch(event, args) {
		const index = this.events.indexOf(event);
		if (index !== -1) {
			this.events.splice(index, 1);
		}
		if (event !== "UPDATE") {
			this.events.push([event, args]);
		}
		if (this.flushPromise) return;
		this.flushPromise = Promise.resolve().then(this.flushEvents.bind(this));
	},
	flushEvents() {
		this.flushPromise = undefined;
		for (const event of this.events) {
			UIEvent.dispatch(event[0], event[1]);
		}
		UIEvent.dispatch("UPDATE");
		this.events = [];
	},
	update() {
		this.dispatch("UPDATE");
	},
	render() {
		UIEvent.dispatch("RENDER");
	}
};

window.GameUI = GameUI;