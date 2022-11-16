import { shallowReactive } from "vue";

import { GameUI } from "@/js/ui/game-ui";
import { LogicEvent } from "@/js/database/events.ts";

import { Machine, Pipe } from "./logic";
import { MachineTypes } from "./database/index";

import { MachinesById, Pipes } from "./player-proxy-wip.ts";
import { Modals } from "@/js/ui/modals";
import { player } from "@/js/player";
import { TownsDatabase } from "@/js/towns/database";

import { arr, objectMap } from "@/utils";

export { Pipes } from "./player-proxy-wip.ts";

export const Machines = {};
export const MachineCounts = {};

export function initializeMachines() {
	for (const town of TownsDatabase.keys()) {
		if (Machines[town]) arr(Machines[town]).clear();
		else Machines[town] = shallowReactive([]);
		if (Pipes[town]) arr(Pipes[town]).clear();
		else Pipes[town] = shallowReactive([]);
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
	if (Object.values(machines).length >= 50) {
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
	delete player.towns[machine.townType].machines[machine.id];
	const pipes = Pipes[machine.townType];
	for (let i = 0; i < pipes.length; i++) {
		while (pipes[i] && pipes[i].out[0].id === machine.id) {
			pipes.splice(i, 1);
		}
	}
	Machines[machine.townType].splice(Machines[machine.townType].findIndex(x => x.id === machine.id), 1);
	delete MachinesById[machine.townType][machine.id];
	MachineCounts[machine.townType][machine.config.name]--;
	LogicEvent.dispatch("MACHINE_REMOVED");
	GameUI.dispatch("MACHINE_REMOVED");
};

Pipe.removeAllInputPipesTo = function(machine, inputId) {
	const town = machine.townType;
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