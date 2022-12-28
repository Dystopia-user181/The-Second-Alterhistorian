import { PlayerTown, TownType } from "./towns";

import { MachineData } from "@/js/machines/database/config";
import { MachineTypes } from "./machines";
import { ResourceType } from "@/types/resources";

import { hasOwn } from "@/utils";

// Things aren't typed yet but it needs to be used; as things get typed, delete these
export interface PlayerType {
	options: {
		autosave: number,
		exportCount: number,
		showGridlines: number,
		snapToGrid: number,
	},
	money: number,
	fastTime: number,
	holding: {
		resource: ResourceType,
		amount: number
	},
	towns: Record<TownType, PlayerTown>,
	currentlyIn: TownType,
	unlockedCurrencies: Record<ResourceType, boolean>,
	migrations: number,
	vitalMarker: string,
	producedElixir: number,
}

export function fixMachineData(machineData: MachineData) {
	if (!hasOwn(MachineTypes, machineData.type)) {
		throw `machineData.type '${machineData.type}' is not a valid MachineType`;
	}

	const config = MachineTypes[machineData.type].config;

	if (Object.keys(config.upgrades).length) {
		machineData.upgrades = machineData.upgrades || [];
		machineData.upgradesPrepay = machineData.upgradesPrepay || [];
		for (let i = 0; i < Object.keys(config.upgrades).length; i++) {
			machineData.upgrades[i] = machineData.upgrades[i] || 0;
			machineData.upgradesPrepay[i] = machineData.upgradesPrepay[i] || 0;
		}
	}

	if (config.inputs?.length) {
		machineData.inputs = machineData.inputs || [];
		for (let i = 0; i < config.inputs.length; i++) {
			machineData.inputs[i] = machineData.inputs[i] || [];
		}
	}

	if (config.outputs?.length) {
		machineData.outputs = machineData.outputs || [];
		machineData.pipes = machineData.pipes || [];
		for (let i = 0; i < config.outputs.length; i++) {
			machineData.outputs[i] = machineData.outputs[i] || [];
			machineData.pipes[i] = machineData.pipes[i] || [];
		}
	}
}