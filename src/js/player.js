import { initializeMachines } from "./machines";

export const Player = {
	defaultStart() {
		return {
			money: 0,
			towns: {
				home: {
					machines: {
						0: {
							type: "shoveller",
							x: 50,
							y: 50,
							upgrades: {
								0: 0,
								1: 0
							},
							outputs: [[]]
						}
					}
				}
			},
			currentlyIn: "home",
			holding: {
				resource: "earth",
				amount: 0
			}
		};
	},
	storageKey: "igj2022-scarlet-summer-alterhistorian2",
	load() {
		let tempPlayer = JSON.parse(localStorage.getItem(this.storageKey));
		if (tempPlayer) deepAssign(player, this.coercePlayer(tempPlayer, this.defaultStart()));
		initializeMachines();
	},
	coercePlayer(target, source) {
		if (target === null || target === undefined) return source;
		if (typeof target !== "object") return target;
		let fillObject;
		if (source.constructor === Array) fillObject = [];
		else fillObject = {};
		for (const prop of Object.keys(target)) {
			fillObject[prop] = deepClone(target[prop]);
		}
		for (const prop of Object.keys(source)) {
			fillObject[prop] = this.coercePlayer(target[prop], source[prop]);
		}
		return fillObject;
	},
	savePlayer() {
		localStorage.setItem(this.storageKey, JSON.stringify(player));
	}
};

window.player = Player.defaultStart();

Player.load();

window.saveInterval = setInterval(() => Player.savePlayer(), 10000);