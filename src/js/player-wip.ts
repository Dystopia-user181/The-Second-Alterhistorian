import { hasOwn } from "@/utils/extensions";
import { MachineData } from "@/js/machines/database/config";
import { MachineTypes } from "./machines";
import { ResourceType } from "@/types/resources";
import { TownType } from "./towns";

export interface PlayerTown {
	machines: MachineData[],
	upgrades: 0,
	machinesPrepay: number[],
	upgradesPrepay: number[],
	display: {
		offset: { x: 0, y: 0 },
		zoom: 1
	},
}

// Things aren't typed yet but it needs to be used; as things get typed, delete these
export interface Player {
	money: number,
	holding: {
		resource?: ResourceType,
		amount?: number
	},
	towns: Record<TownType, PlayerTown>
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
		for (let i = 0; i < Object.keys(machineData.upgrades).length; i++) {
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