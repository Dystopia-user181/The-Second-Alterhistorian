import { createApp } from 'vue';
import "./../../style.css";
import App from './../../App.vue';

const vueApp = createApp(App);

vueApp.mixin({
	mounted() {
		if (this.update) {
			this.on$(GAME_EVENTS.UPDATE, this.update);
			this.update();
		}
	},
	beforeUnmount() {
		EventHub.ui.offAll(this);
	},
	methods: {
		on$(event, fn) {
			EventHub.ui.on(event, fn, this);
		},
		format(value, places, placesUnder1000) {
			return format(value, places, placesUnder1000);
		},
		formatInt(value) {
			return formatInt(value);
		},
		formatPercents(value, places) {
			return formatPercents(value, places);
		},
		formatX(value, places, placesUnder1000) {
			return formatX(value, places, placesUnder1000);
		},
		formatPow(value, places, placesUnder1000) {
			return formatPow(value, places, placesUnder1000);
		},
		objectMap(...args) {
			return objectMap(...args);
		}
	}
});

vueApp.mount('#app');
	
export const GameUI = {
	events: [],
	flushPromise: undefined,
	globalClickListener: null,
	dispatch(event, args) {
		const index = this.events.indexOf(event);
		if (index !== -1) {
			this.events.splice(index, 1);
		}
		if (event !== GAME_EVENTS.UPDATE) {
			this.events.push([event, args]);
		}
		if (this.flushPromise) return;
		this.flushPromise = Promise.resolve().then(this.flushEvents.bind(this));
	},
	flushEvents() {
		this.flushPromise = undefined;
		for (const event of this.events) {
			EventHub.ui.dispatch(event[0], event[1]);
		}
		EventHub.ui.dispatch(GAME_EVENTS.UPDATE);
		this.events = [];
	},
	update() {
		this.dispatch(GAME_EVENTS.UPDATE);
	}
};

window.GameUI = GameUI;