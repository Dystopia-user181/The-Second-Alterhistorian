import { reactive, toRaw } from "vue";

import { initializeMachines, MachineTypes } from "./machines/index";
import { Currencies } from "./currencies/currencies.ts";
import { migrations } from "./migrations";
import { Modals } from "./ui/modals";
import { Towns } from "./towns/index";

import { deepClone, downloadAsFile, objectMap } from "@/utils";


export const Player = {
	defaultStart() {
		return {
			money: 0,
			towns: {
				home: {
					machines: Towns("home").defaultMachines,
					upgrades: 0,
					machinesPrepay: Towns("home").defaultMachinesPrepay,
					upgradesPrepay: Towns("home").defaultUpgradesPrepay,
					display: {
						offset: { x: 0, y: 0 },
						zoom: 1
					},
				}
			},
			currentlyIn: "home",
			holding: {
				resource: "earth",
				amount: 0
			},
			unlockedCurrencies: objectMap(Currencies, x => x, () => false),
			fastTime: 0,
			migrations: migrations.length,
			producedElixir: 0,
			vitalMarker: Player.storageKey,
			options: {
				autosave: 1,
				exportCount: 0
			}
		};
	},
	storageKey: "igj2022-scarlet-summer-alterhistorian2",
	load(playerObj) {
		if (playerObj) {
			const savedPlayer = this.coercePlayer(playerObj, this.defaultStart());
			Object.assign(player, savedPlayer);
			for (; player.migrations < migrations.length; player.migrations++) {
				migrations[player.migrations](player);
			}
		} else {
			Object.assign(player, Player.defaultStart());
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
		for (const prop in target) {
			fillObject[prop] = deepClone(target[prop]);
		}
		for (const prop in source) {
			// I LOVE HARDCODING THINGS!!!!!!!!!!
			if (prop === "machines")
				fillObject[prop] = deepClone(target[prop]);
			else
				fillObject[prop] = this.coercePlayer(target[prop], source[prop]);
		}
		return fillObject;
	},
	savePlayer() {
		if (player.vitalMarker !== Player.storageKey) return;
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
				if (!player.towns[town].machines[i]) {
					player.towns[town].machines[i] = defaultMachine;
					continue;
				}
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
		if (type.upgrades?.length) {
			machine.upgrades = machine.upgrades || [];
			machine.upgradesPrepay = machine.upgradesPrepay || [];
			for (let i = 0; i < Object.keys(type.upgrades).length; i++) {
				machine.upgrades[i] = machine.upgrades[i] || 0;
				machine.upgradesPrepay[i] = machine.upgradesPrepay[i] || 0;
			}
		}
		if (type.inputs?.length) {
			machine.inputs = machine.inputs || [];
			for (let i = 0; i < type.inputs.length; i++) {
				machine.inputs[i] = machine.inputs[i] || [];
			}
		}
		if (type.outputs?.length) {
			machine.outputs = machine.outputs || [];
			machine.pipes = machine.pipes || [];
			for (let i = 0; i < type.outputs.length; i++) {
				machine.outputs[i] = machine.outputs[i] || [];
				machine.pipes[i] = machine.pipes[i] || [];
			}
		}
	},
	reset() {
		Player.load();
		Player.savePlayer();
	},
	exportSave() {
		const dateString = `${new Date(Date.now() - (new Date().getTimezoneOffset() * 60 * 1000))
			.toISOString().split("T")[0]} ${new Date().toLocaleTimeString(undefined, { hour12: false })}`;
		player.options.exportCount++;
		downloadAsFile(
			`Alterhistorian Save #${player.options.exportCount} (${dateString})`,
			window.btoa(JSON.stringify(toRaw(player)))
		);
	},
	importSave(event) {
		// This happens if the file dialog is canceled instead of a file being selected
		if (event.target.files.length === 0) return;

		const reader = new FileReader();
		reader.onload = function() {
			let text = reader.result;
			try {
				text = window.atob(text);
			} catch {
				Modals.message.show("Invalid savefile format.");
				return;
			}
			const playerObj = JSON.parse(text);
			if (typeof playerObj !== "object" || playerObj.vitalMarker !== Player.storageKey) {
				Modals.message.show("Invalid savefile format.");
				return;
			}
			Player.load(playerObj);
			Player.savePlayer();
		};
		reader.readAsText(event.target.files[0]);
	}
};

export const player = reactive({});
window.player = player;

Promise.resolve().then(() => Player.loadSave());

window.saveInterval = setInterval(() => Player.savePlayer(), 10000);