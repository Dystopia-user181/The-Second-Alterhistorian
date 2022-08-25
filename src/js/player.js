import { reactive, toRaw } from "vue";

import { deepAssign, deepClone, objectMap } from "../utils";

import { initializeMachines, MachineTypes } from "./machines/index";
import { Currencies } from "./database/currencies.ts";
import { migrations } from "./migrations";
import { Towns } from "./towns/index";


export const Player = {
	defaultStart() {
		return {
			money: 0,
			towns: {
				home: {
					machines: Towns("home").defaultMachines,
					upgrades: 0,
					machinesPrepay: Towns("home").defaultMachinesPrepay,
					upgradesPrepay: Towns("home").defaultUpgradesPrepay
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
			migrations: migrations.length,
			producedElixir: 0
		};
	},
	storageKey: "igj2022-scarlet-summer-alterhistorian2",
	load(playerObj) {
		if (playerObj) {
			const beforeMigrations = !playerObj.migrations;
			const savedPlayer = this.coercePlayer(playerObj, this.defaultStart());
			deepAssign(player, savedPlayer);
			for (const town in Towns) {
				player.towns[town].machines = savedPlayer.towns[town].machines;
			}
			if (beforeMigrations) player.migrations = 0;
			for (; player.migrations < migrations.length; player.migrations++) {
				migrations[player.migrations](player);
			}
		} else {
			deepAssign(player, Player.defaultStart());
		}
		this.fixMachines();
		initializeMachines();
	},
	loadSave() {
		this.load(JSON.parse(localStorage.getItem(this.storageKey)));
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
			// I LOVE HARDCODING THINGS!!!!!!!!!!
			if (prop === "machines") fillObject[prop] = deepClone(target[prop]);
			else fillObject[prop] = this.coercePlayer(target[prop], source[prop]);
		}
		return fillObject;
	},
	savePlayer() {
		localStorage.setItem(this.storageKey, JSON.stringify(toRaw(player)));
	},
	fixMachines() {
		for (const town in player.towns) {
			for (const machineId in player.towns[town].machines) {
				const machine = player.towns[town].machines[machineId];
				Player.fixMachineData(machine);
			}
			const defaultMachines = Towns(town).defaultMachines;
			for (const defaultMachine of Object.values(defaultMachines)) {
				if (Object.values(player.towns[town].machines)
					.find(x => x.type === defaultMachine.type && x.isDefault)) {
					continue;
				}
				let i = 0;
				while (player.towns[town].machines[i]) {
					i++;
					if (!player.towns[town].machines[i]) {
						player.towns[town].machines[i] = defaultMachine;
						break;
					}
				}
			}
		}
	},
	fixMachineData(machine) {
		const type = MachineTypes[machine.type];
		if (type.upgrades && Object.keys(type.upgrades).length) {
			machine.upgrades = machine.upgrades || [];
			machine.upgradesPrepay = machine.upgradesPrepay || [];
			for (let i = 0; i < Object.keys(type.upgrades).length; i++) {
				machine.upgrades[i] = machine.upgrades[i] || 0;
				machine.upgradesPrepay[i] = machine.upgradesPrepay[i] || 0;
			}
		}
		if (type.inputs.length) {
			machine.inputs = machine.inputs || [];
			for (let i = 0; i < type.inputs.length; i++) {
				machine.inputs[i] = machine.inputs[i] || [];
			}
		}
		if (type.outputs.length) {
			machine.outputs = machine.outputs || [];
			machine.pipes = machine.pipes || [];
			for (let i = 0; i < type.outputs.length; i++) {
				machine.outputs[i] = machine.outputs[i] || [];
				machine.pipes[i] = machine.pipes[i] || [];
			}
		}
	},
	reset() {
		Player.load(Player.defaultStart());
		Player.savePlayer();
	}
};

export const player = reactive({});
window.player = player;

window.addEventListener("load", () => Player.loadSave());

window.saveInterval = setInterval(() => Player.savePlayer(), 10000);