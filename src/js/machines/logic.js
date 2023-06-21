import { player } from "@/js/player";

import { Currencies } from "@/js/currencies/currencies";
import { Towns } from "@/js/towns/index";

import { arr } from "@/utils";


export const Machine = {
	get timeSpeedFactor() {
		return player.fastTime < 180 ? 2 : Math.min(player.fastTime / 90, 9);
	},
	offlineEfficiency: 0.4,
	gameLoop(realDiff, machines = []) {
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
	updateInputStatistics(machine, diff) {
		for (const input of machine.inputs) {
			input.updateStatistics(diff);
		}
	},
	updateOutputStatistics(machine, diff) {
		for (const output of machine.outputs) {
			output.updateStatistics(diff);
		}
	},
	tickThisMachine(machine, diff) {
		Machine.tickMachineProcesses(machine, diff);
		Pipe.tickPipes(machine, diff);
	},
	tickMachineProcesses(machine, diff) {
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
	tickPipes(machine, diff) {
		if (!this.isUnlocked) return;
		for (const outputId in machine.pipes) {
			const output = machine.outputs[outputId];
			if (!output || !output.data.length) continue;
			const ratios = [];
			let whole = 0;
			const outputLast = arr(output.data).last;
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
				const amount = amtLeftMultiplier * ratios.shift();
				output.removeFromStack(
					input.addToStack({
						resource: outputLast.resource,
						amount
					})
				);
			}
		}
	}
};