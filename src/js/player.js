import { initializeMachines, MachineTypes } from "./machines";
import { Towns } from "./towns";
import { Currencies } from "./database/currencies";
import { migrations } from "./migrations";
import { toRaw, reactive } from "vue";

export const Player = {
	defaultStart() {
		return {
			money: 0,
			towns: {
				home: {
					machines: Towns.home.defaultMachines,
					upgrades: 0
				}
			},
			currentlyIn: "home",
			holding: {
				resource: "earth",
				amount: 0
			},
			display: {
				offset: { x: 0, y: 0 }
			},
			unlockedCurrencies: objectMap(Currencies, x => x, () => false),
			fastTime: 0,
			migrations: migrations.length
		};
	},
	storageKey: "igj2022-scarlet-summer-alterhistorian2",
	load() {
		let tempPlayer = JSON.parse(localStorage.getItem(this.storageKey));
		if (tempPlayer) {
			const beforeMigrations = !tempPlayer.migrations;
			deepAssign(player, this.coercePlayer(tempPlayer, this.defaultStart()));
			if (beforeMigrations) player.migrations = 0;
			for (; player.migrations < migrations.length; player.migrations++) {
				migrations[player.migrations](player);
			}
		}
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
		localStorage.setItem(this.storageKey, JSON.stringify(toRaw(player)));
	},
	fixMachines() {
		for (const town of Object.keys(player.towns)) {
			for (const machine of Object.values(player.towns[town].machines)) {
				const type = MachineTypes[machine.type];
				if (type.upgrades && Object.keys(type.upgrades).length) {
					if (!machine.upgrades) machine.upgrades = [];
					for (let i = 0; i < Object.keys(type.upgrades).length; i++) {
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
					if (!machine.pipes) machine.pipes = [];
					for (let i = 0; i < type.outputs.length; i++) {
						if (!(i in machine.outputs)) machine.outputs[i] = [];
						if (!(i in machine.pipes)) machine.pipes[i] = [];
					}
				}
			}
			const defaultMachines = Towns[town].defaultMachines;
			for (const defaultMachine of Object.values(defaultMachines)) {
				if (!Object.values(player.towns[town].machines).find(x => x.type === defaultMachine.type && x.isDefault)) {
					let i = 0;
					while (true) {
						if (!player.towns[town].machines[i]) {
							player.towns[town].machines[i] = defaultMachine;
							break;
						}
						i++;
					}
				}
			}
		}
	}
};

export const player = reactive(Player.defaultStart());
window.player = player;

Player.load();

window.saveInterval = setInterval(() => Player.savePlayer(), 10000);