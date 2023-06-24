import { shallowReactive } from "vue";

import { MachineId, MachineTypes } from "./database/index";
import { ConfiguredMachine } from "./database/builder";

import { MachinesById, Pipes } from "./player-proxy-wip";
import { player } from "@/js/player";
import { TownsDatabase } from "@/js/towns/database";
import { TownType } from "@/js/towns";

import { arr, mapObjectValues } from "@/utils";

export { Pipes } from "./player-proxy-wip";

export type MachineObjectType = ConfiguredMachine<any, any>;
export const Machines: Record<TownType, MachineObjectType[]> = {} as any;
export const MachineCounts: Record<TownType, Record<MachineId, number>> = {} as any;

export function initializeMachines() {
	for (const town of TownsDatabase.keys()) {
		if (Machines[town]) arr(Machines[town]).clear();
		else Machines[town] = shallowReactive([]);
		if (Pipes[town]) arr(Pipes[town]).clear();
		else Pipes[town] = shallowReactive([]);
		MachinesById[town] = {};
		MachineCounts[town] = mapObjectValues(MachineTypes, () => 0);
		for (const machineId in player.towns[town].machines) {
			const machine = player.towns[town].machines[machineId];
			const newMach = new(MachineTypes[machine.type])(town, Number(machineId));
			Machines[town].push(newMach);
			const currentMachineIdIndexer = MachinesById[town];
			if (currentMachineIdIndexer) currentMachineIdIndexer[machineId] = newMach;
			MachineCounts[town][machine.type] += 1;
			void Promise.resolve().then(() => {
				for (let pipeId = 0; pipeId < newMach.pipes.length; pipeId++) {
					for (const pipe of newMach.pipes[pipeId]) {
						Pipes[town].push({
							out: [newMach, newMach.outputs[pipeId]],
							in: [pipe[0], pipe[1]]
						});
					}
				}
			});
		}
	}
}