import { player } from "@/js/player";

import { arr, deepClone, Stack, str } from "@/utils/index";

import { Towns } from "@/js/towns/index";

export const Machine = {
	gameLoop(realDiff, machines = []) {
		let diff = Math.min(realDiff, 1);
		if (diff === 1) player.fastTime += realDiff - 1;
		if (player.fastTime) {
			const add = Math.min(player.fastTime, diff * 2);
			diff += add;
			player.fastTime -= add;
		}
		for (const machine of machines.flat()) {
			if (machine.type.customLoop) {
				machine.type.customLoop.bind(machine)(diff);
			} else {
				Machine.tickThisMachine(machine, diff);
			}
			machine.updates++;
			for (const input of machine.inputs) {
				const inpData = arr(machine.inputHistories).last[input.id];
				if (inpData.length) {
					input.displayResource = [str(arr(inpData).last.resource).capitalize, machine.updates];
				} else if (machine.updates - 5 > input.displayResource) {
					input.displayResource = ["None", Infinity];
				}
			}
			for (const output of machine.outputs) {
				const outData = arr(machine.outputHistories).last[output.id];
				if (outData.length) {
					output.displayResource = [str(arr(outData).last.resource).capitalize, machine.updates];
				} else if (machine.updates - 5 > output.displayResource) {
					output.displayResource = ["None", Infinity];
				}
			}
		}
	},
	addInputHistory(machine) {
		machine.inputHistories.push(deepClone((machine.data.inputs || []).map(x => x.slice(-20))));
		if (machine.inputHistories.length > 10) machine.inputHistories.shift();
		machine.inputConfHistories.push(deepClone(machine.inputs.map(x => x.config)));
		if (machine.inputConfHistories.length > 10) machine.inputConfHistories.shift();
	},
	addOutputHistory(machine) {
		machine.outputHistories.push(deepClone((machine.data.outputs || []).map(x => x.slice(-20))));
		if (machine.outputHistories.length > 10) machine.outputHistories.shift();
		machine.outputConfHistories.push(deepClone(machine.outputs.map(x => x.config)));
		if (machine.outputConfHistories.length > 10) machine.outputConfHistories.shift();
	},
	tickThisMachine(machine, diff) {
		Machine.tickMachineProcesses(machine, diff);
		Pipe.tickPipes(machine, diff);
	},
	tickMachineProcesses(machine, diff) {
		machine.outputDiffs = {};
		const outputs = machine.outputs.filter(x => x.isUnlocked);
		let inputs = deepClone(machine.inputs.filter(x => x.isUnlocked));
		outputs.forEach(x => {
			const conf = x.config;
			x.otherwiseDiff = diff;
			x.maxDiff = (conf.capacity - Stack.volumeOfStack(x.data)) / conf.produces.amount;
			if (isNaN(x.maxDiff)) {
				x.maxDiff = 0;
				return;
			}
			if (!conf.requires && !conf.requiresList) return;
			if (!inputs.length) return;
			const requiresList = conf.requiresList ? conf.requiresList : [conf.requires];
			for (const requirement of requiresList) {
				const input = arr(inputs[requirement.inputId].data).last;
				if (!input) {
					x.maxDiff = 0;
					return;
				}
				if (requirement.resource) {
					if (input.resource !== requirement.resource) {
						x.maxDiff = 0;
						return;
					}
					x.maxDiff = Math.min(x.maxDiff, input.amount / requirement.amount);
				} else if (requirement.resourceList) {
					const resource = requirement.resourceList.find(required => required.resource === input.resource);
					if (!resource) {
						x.maxDiff = 0;
						return;
					}
					x.maxDiff = Math.min(x.maxDiff, input.amount / resource.amount);
				}
			}
		});
		outputs.forEach((x, id) => {
			const conf = x.config;
			const produces = {
				resource: conf.produces.resource,
				amount: conf.produces.amount * Math.min(x.maxDiff, diff)
			};
			if (produces.amount) player.unlockedCurrencies[produces.resource] = true;
			Stack.addToStack(x.data, produces);
			machine.outputDiffs[conf.id === undefined ? id : conf.id] = Math.min(x.maxDiff, diff);
		});
		Machine.addInputHistory(machine);
		Machine.addOutputHistory(machine);
		// Re-calculate inputs
		inputs = machine.inputs.filter(x => x.isUnlocked);
		inputs.forEach(x => {
			x.otherwiseDiff = diff;
			const conf = x.config;
			const amount = typeof conf.consumes === "object"
				? Math.min(conf.consumes.amount * diff, conf.consumes.maximum)
				: conf.consumes * diff;
			if (x.data.length) Stack.removeFromStack(x.data, amount);
		});
	}
};

export const Pipe = {
	get isUnlocked() {
		return Towns.home.upgrades.pipesBasic.isBought;
	},
	get capacityPerSecond() {
		return this.isUnlocked ? Towns.home.upgrades.pipesSpeed1.effectOrDefault(1) *
			Towns.home.upgrades.pipesSpeed2.effectOrDefault(1) * 0.02
			: 0;
	},
	tickPipes(machine, diff) {
		if (!this.isUnlocked) return;
		for (const outputId in machine.pipes) {
			const output = machine.outputs[outputId];
			if (!output.data.length) continue;
			const ratios = [];
			let whole = 0;
			const outputLast = arr(output.data).last;
			for (const pipe of machine.pipes[outputId]) {
				const input = pipe[1];
				if (!input.config.accepts.includes(outputLast.resource)) continue;
				ratios.push(Stack.volumeOfStack(input.data) >= input.config.capacity ? 0
					: input.config.capacity * this.capacityPerSecond * diff);
				whole += input.config.capacity * this.capacityPerSecond * diff;
			}
			const amtLeftMultiplier = Math.min(outputLast.amount / whole, 1);
			for (const pipe of machine.pipes[outputId]) {
				const input = pipe[1];
				if (!input.config.accepts.includes(outputLast.resource)) continue;
				const amount = amtLeftMultiplier * ratios.shift();
				Stack.removeFromStack(output.data,
					Stack.addToStack(input.data, {
						resource: outputLast.resource,
						amount
					}, input.config.capacity)
				);
			}
		}
	}
};