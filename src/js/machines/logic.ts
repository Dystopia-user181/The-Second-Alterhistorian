import { player } from "@/js/player";

import { MachineCounts, MachineObjectType, Machines, Pipes } from "./player-proxy";
import { MachineId, MachineTypes } from "./database";
import { Currencies } from "@/js/currencies/currencies";
import { MachinesById } from "./player-proxy-wip";

import { GameUI } from "@/js//ui/game-ui";
import { LogicEvent } from "@/js/events/events";

import { Modals } from "@/js/ui/modals";

import { Towns, TownType } from "@/js/towns/index";

import { arr } from "@/utils";


export const Machine = {
	get timeSpeedFactor() {
		return player.fastTime < 180 ? 2 : Math.min(player.fastTime / 90, 9);
	},
	offlineEfficiency: 0.4,
	gameLoop(realDiff: number, machines: MachineObjectType[][] = []) {
		let diff = Math.min(realDiff, 1);
		if (diff === 1) player.fastTime += realDiff - 1;
		if (player.fastTime) {
			const factor = this.timeSpeedFactor, efficiency = this.offlineEfficiency;
			const add = Math.min(player.fastTime * efficiency, diff * factor);
			diff += add;
			player.fastTime -= add / efficiency;
		}
		for (const machine of machines.flat()) {
			if (machine.config.customLoop) {
				machine.config.customLoop.bind(machine)(diff);
			} else {
				Machine.tickThisMachine(machine, diff);
			}
			machine.updates++;
		}
	},
	updateInputStatistics(machine: MachineObjectType, diff: number) {
		for (const input of machine.inputs) {
			input.updateStatistics(diff);
		}
	},
	updateOutputStatistics(machine: MachineObjectType, diff: number) {
		for (const output of machine.outputs) {
			output.updateStatistics(diff);
		}
	},
	tickThisMachine(machine: MachineObjectType, diff: number) {
		Machine.tickMachineProcesses(machine, diff);
		Pipe.tickPipes(machine, diff);
	},
	tickMachineProcesses(machine: MachineObjectType, diff: number) {
		machine.outputDiffs = {};
		const outputs = machine.outputs.filter(x => x.isUnlocked);
		const inputs = machine.inputs.filter(x => x.isUnlocked);
		outputs.forEach(output => {
			const conf = output.config;
			output.maxDiff = output.spaceLeft / conf.produces.amount;
			if (isNaN(output.maxDiff)) {
				output.maxDiff = 0;
				return;
			}
			if (!conf.requires && !conf.requiresList) return;
			if (!inputs.length) return;
			const requiresList = conf.requiresList ? conf.requiresList : [conf.requires];
			for (const requirement of requiresList) {
				if (!requirement) continue;
				const input = inputs[requirement.inputId].statistics.lastItem;
				if (!input) {
					output.maxDiff = 0;
					return;
				}
				if (requirement.resource) {
					if (input.resource !== requirement.resource) {
						output.maxDiff = 0;
						return;
					}
					output.maxDiff = Math.min(output.maxDiff, input.amount / requirement.amount);
				} else if (requirement.resourceList) {
					const resource = requirement.resourceList.find(required => required.resource === input.resource);
					if (!resource) {
						output.maxDiff = 0;
						return;
					}
					output.maxDiff = Math.min(output.maxDiff, input.amount / resource.amount);
				}
			}
		});
		outputs.forEach((output, id) => {
			const conf = output.config;
			const produces = {
				resource: conf.produces.resource,
				amount: conf.produces.amount * Math.min(output.maxDiff, diff)
			};
			if (produces.amount) Currencies[produces.resource].isUnlocked = true;
			output.addToStack(produces);
			output.outputDiff = Math.min(output.maxDiff, diff);
			machine.outputDiffs[conf.id === undefined ? id : conf.id] = output.outputDiff;
		});
		Machine.updateInputStatistics(machine, diff);
		Machine.updateOutputStatistics(machine, diff);
		inputs.forEach(input => {
			const conf = input.config;
			const amount = typeof conf.consumes === "object"
				? Math.min(conf.consumes.amount * diff, conf.consumes.maximum)
				: conf.consumes * diff;
			if (input.data.length) input.removeFromStack(amount);
		});
	},
	add(townName: TownType, type: MachineId, x: number, y: number) {
		const machines = player.towns[townName].machines;
		if (Object.values(machines).length >= 50) {
			Modals.message.showText("Reached machine cap in this town!");
			return false;
		}
		const newMach = MachineTypes[type].newMachine(x, y);
		let i = 0;
		while (i < 1000) {
			if (!machines[i]) {
				machines[i] = newMach;
				const constructed = new MachineTypes[type](townName, i);
				Machines[townName].push(constructed);
				const currentMachineIdIndexer = MachinesById[townName];
				if (currentMachineIdIndexer) currentMachineIdIndexer[i] = constructed;
				MachineCounts[townName][type]++;
				(arr(Machines[townName]).last as MachineObjectType).isNew = true;
				LogicEvent.dispatch("MACHINE_ADDED");
				GameUI.dispatch("MACHINE_ADDED");
				return true;
			}
			i++;
		}
		Modals.message.showText("Could not find suitable id for machine. This message should NEVER appear.");
		return false;
	},
	remove(machine: MachineObjectType) {
		Pipe.removeAllInputPipesTo(machine);
		requestAnimationFrame(() => Pipe.removeAllInputPipesTo(machine));
		const pipes = Pipes[machine.townType];
		for (let i = 0; i < pipes.length; i++) {
			while (pipes[i] && pipes[i].out[0].id === machine.id) {
				pipes.splice(i, 1);
			}
		}
		Machines[machine.townType].splice(
			Machines[machine.townType].findIndex(x => x.id.toString() === machine.id.toString()),
			1);
		const currentMachineIdIndexer = MachinesById[machine.townType];
		if (currentMachineIdIndexer) delete currentMachineIdIndexer[machine.id];
		MachineCounts[machine.townType][machine.config.name]--;
		delete player.towns[machine.townType].machines[machine.id];
		LogicEvent.dispatch("MACHINE_DELETED", machine.id);
		GameUI.dispatch("MACHINE_DELETED", machine.id);
	}
};

export const Pipe = {
	get isUnlocked() {
		return Towns("home").upgrades.pipesBasic.isBought;
	},
	get capacityPerSecond() {
		return this.isUnlocked ? Towns("home").upgrades.pipesSpeed1.effectOrDefault(1) *
			Towns("home").upgrades.pipesSpeed2.effectOrDefault(1) * 0.02
			: 0;
	},
	tickPipes(machine: MachineObjectType, diff: number) {
		if (!this.isUnlocked) return;
		for (let outputId = 0; outputId < machine.outputs.length; outputId++) {
			const output = machine.outputs[outputId];
			if (!output || !output.data.length) continue;
			const ratios = [];
			let whole = 0;
			const outputLast = arr(output.data).last;
			if (!outputLast) continue;
			for (const pipe of machine.pipes[outputId]) {
				const input = pipe[1];
				if (!input.config.accepts.includes(outputLast.resource)) continue;
				ratios.push(input.isCapped ? 0
					: input.config.capacity * this.capacityPerSecond * diff);
				whole += input.config.capacity * this.capacityPerSecond * diff;
			}
			const amtLeftMultiplier = Math.min(outputLast.amount / whole, 1);
			for (const pipe of machine.pipes[outputId]) {
				const input = pipe[1];
				if (!input.config.accepts.includes(outputLast.resource)) continue;
				const amount = amtLeftMultiplier * (ratios.shift() as number);
				output.removeFromStack(
					input.addToStack({
						resource: outputLast.resource,
						amount
					})
				);
			}
		}
	},
	removeAllInputPipesTo(machine: MachineObjectType, inputId?: number) {
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
	}
};