import { initializeMachines, MachineTypes } from "./machines";

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
						},
						1: {
							type: "cistern",
							x: 50,
							y: 350,
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
		this.fixMachines();
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
	},
	fixMachines() {
		for (const town of Object.values(player.towns)) {
			for (const machine of Object.values(town.machines)) {
				const type = MachineTypes[machine.type];
				if (type.upgrades.length) {
					if (!machine.upgrades) machine.upgrades = [];
					for (let i = 0; i < type.upgrades.length; i++) {
						if (!(i in machine.upgrades)) machine.upgrades[i] = 0;
					}
				}
				if (type.inputs.length) {
					if (!machine.inputs) machine.inputs = [];
					for (let i = 0; i < type.inputs.length; i++) {
						if (!(i in machine.inputs)) machine.inputs[i] = [];
					}
				}
				if (type.outputs.length) {
					if (!machine.outputs) machine.outputs = [];
					for (let i = 0; i < type.outputs.length; i++) {
						if (!(i in machine.outputs)) machine.outputs[i] = [];
					}
				}
			}
		}
	}
};

window.player = Player.defaultStart();

Player.load();

window.saveInterval = setInterval(() => Player.savePlayer(), 10000);