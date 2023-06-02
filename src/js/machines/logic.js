import { player } from "@/js/player";

import { Currencies } from "@/js/currencies/currencies";
import { Towns } from "@/js/towns/index";

import { arr } from "@/utils";


export const Machine = {
	get timeSpeedFactor() {
		return player.fastTime < 180 ? 2 : player.fastTime / 90;
	},
	gameLoop(realDiff, machines = []) {
		let diff = Math.min(realDiff, 1);
		if (diff === 1) player.fastTime += realDiff - 1;
		if (player.fastTime) {
			const factor = this.timeSpeedFactor;
			const add = Math.min(player.fastTime, diff * factor);
			diff += add;
			player.fastTime -= add;
		}
		for (const machine of machines.flat()) {
			if (machine.config.customLoop) {
				machine.config.customLoop.bind(machine)(diff);
			} else {
				Machine.tickThisMachine(machine, diff);
			}
			machine.updates++;
			Machine.updateLastResource(machine);
		}
	},
	updateLastResource(machine) {
		for (const input of machine.inputs) {
			const inpData = machine.inputHistory?.[input.id];
			if (inpData?.length) {
				input.displayResource[0] = arr(inpData).last.resource;
				input.displayResource[1] = machine.updates;
			} else if (machine.updates - 5 > input.displayResource[1]) {
				input.displayResource[0] = "none";
				input.displayResource[1] = Infinity;
			}
		}
		for (const output of machine.outputs) {
			const outData = machine.outputHistory?.[output.id];
			if (outData?.length) {
				output.displayResource[0] = arr(outData).last.resource;
				output.displayResource[1] = machine.updates;
			} else if (machine.updates - 5 > output.displayResource[1]) {
				output.displayResource[0] = "none";
				output.displayResource[1] = Infinity;
			}
		}
	},
	updateInputHistory(machine) {
		machine.inputHistory = (machine.data.inputs || []).map(x => x.slice(-20));
		machine.inputConfHistories.push(machine.inputs.map(x => x.config.raw));
		if (machine.inputConfHistories.length > 10) machine.inputConfHistories.shift();
	},
	updateOutputHistory(machine) {
		machine.outputHistory = (machine.data.outputs || []).map(x => x.slice(-20));
		machine.outputConfHistories.push(machine.outputs.map(x => x.config.raw));
		if (machine.outputConfHistories.length > 10) machine.outputConfHistories.shift();
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
			output.uncappedDiff = diff;
			output.maxDiff = output.spaceLeft / conf.produces.amount;
			if (isNaN(output.maxDiff)) {
				output.maxDiff = 0;
				return;
			}
			if (!conf.requires && !conf.requiresList) return;
			if (!inputs.length) return;
			const requiresList = conf.requiresList ? conf.requiresList : [conf.requires];
			for (const requirement of requiresList) {
				const input = inputs[requirement.inputId].lastItem;
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
			machine.outputDiffs[conf.id === undefined ? id : conf.id] = Math.min(output.maxDiff, diff);
		});
		Machine.updateInputHistory(machine);
		Machine.updateOutputHistory(machine);
		inputs.forEach(input => {
			input.uncappedDiff = diff;
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