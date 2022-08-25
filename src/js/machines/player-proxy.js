import { shallowReactive } from "vue";

import { GameUI } from "@/js/ui/game-ui";
import { LogicEvent } from "@/js/database/events.ts";

import { Machine, Pipe } from "./logic";
import { MachineTypes } from "./database/index";

import { GameDatabase } from "@/js/database";
import { Modals } from "@/js/ui/modals";
import { player } from "@/js/player";

import { arr, objectMap } from "@utils";


export const Machines = {};
export const MachinesById = {};
export const MachineCounts = {};
export const Pipes = {};
window.Pipes = Pipes;

export function initializeMachines() {
	for (const town in GameDatabase.towns) {
		Machines[town] = shallowReactive([]);
		Pipes[town] = shallowReactive([]);
		MachinesById[town] = {};
		MachineCounts[town] = objectMap(MachineTypes, x => x, () => 0);
		for (const machineId in player.towns[town].machines) {
			const machine = player.towns[town].machines[machineId];
			const newMach = new MachineTypes[machine.type](town, machineId);
			Machines[town].push(newMach);
			MachinesById[town][machineId] = newMach;
			MachineCounts[town][machine.type] += 1;
			Promise.resolve().then(() => {
				for (const pipeId in newMach.pipes) {
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


Machine.add = function(townName, type, x, y) {
	const machines = player.towns[townName].machines;
	if (Object.values(machines).length > 50) {
		Modals.message.show("Reached machine cap in this town!");
		return false;
	}
	const newMach = MachineTypes[type].newMachine(x, y);
	let i = 0;
	while (i < 1000) {
		if (!machines[i]) {
			machines[i] = newMach;
			const constructed = new MachineTypes[type](townName, i);
			Machines[townName].push(constructed);
			MachinesById[townName][i] = constructed;
			MachineCounts[townName][type]++;
			arr(Machines[townName]).last.isNew = true;
			LogicEvent.dispatch("MACHINE_ADDED");
			GameUI.dispatch("MACHINE_ADDED");
			return true;
		}
		i++;
	}
	Modals.message.show("Could not find suitable id for machine. This message should NEVER appear.");
	return false;
};

Machine.remove = function(machine) {
	Pipe.removeAllInputPipesTo(machine);
	requestAnimationFrame(() => Pipe.removeAllInputPipesTo(machine));
	delete player.towns[machine.town].machines[machine.id];
	Machines[machine.town].splice(Machines[machine.town].findIndex(x => x.id === machine.id), 1);
	delete MachinesById[machine.town][machine.id];
	MachineCounts[machine.town][machine.type]--;
	LogicEvent.dispatch("MACHINE_REMOVED");
	GameUI.dispatch("MACHINE_REMOVED");
};

Pipe.removeAllInputPipesTo = function(machine, inputId) {
	const town = machine.town;
	if (inputId === undefined) {
		for (const otherMachine of Machines[town]) {
			otherMachine.removeAllPipes(machine);
		}
	} else {
		for (const otherMachine of Machines[town]) {
			if (otherMachine.removePipe(machine, inputId)) return;
		}
	}
};