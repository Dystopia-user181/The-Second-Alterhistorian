import { GameDatabase } from "./database/game-database";
import { Stack } from "./stack";
import { Modals } from "./ui/modals";
import { Currencies } from "./database/currencies";

function acceptsAll(accepts) {
	return areArraysEqualSets(accepts, Object.keys(Currencies));
}
function MachineType(data) {
	const returnValue = class {
		constructor(town, id) {
			this.town = town;
			this.id = id;
			this.data = player.towns[this.town].machines[this.id];
			this.outputHistories = [];
			this.inputHistories = [];
			this.outputConfHistories = [];
			this.inputConfHistories = [];
			this.outputDiffs = mapToObject(data.outputs, (x, id) => x.id === undefined ? id : x.id, () => 0);
			const machine = this;
			this.inputs = this.type.inputs.map((x, id) => ({
				id,
				get config() {
					return objectMap(x, y => y, (item, propName) => {
						switch(propName) {
							case "capacity": case "consumes": case "accepts": case "label":
								return run(item, machine);
							default:
								return item;
						}
					})
				},
				get isUnlocked() {
					return x.isUnlocked === undefined ? true : run(x.isUnlocked, machine)
				},
				data: this.data.inputs[id]
			}))
			this.outputs = this.type.outputs.map((x, id) => ({
				id,
				get config() {
					return objectMap(x, y => y, (item, propName) => {
						switch(propName) {
							case "capacity": case "produces": case "requires": case "requiresList": case "label":
								return run(item, machine);
							default:
								return item;
						}
					})
				},
				get isUnlocked() {
					return x.isUnlocked === undefined ? true : run(x.isUnlocked, machine)
				},
				data: this.data.outputs[id]
			}));
			if (this.type.upgrades) this.upgrades = objectMap(this.type.upgrades, x => x, x => new MachineUpgrade(x, this));
			this.pipes = [];
			requestAnimationFrame(() => this.updatePipes());
		}

		get hasUpgradeAvailable() {
			return this.upgrades && Object.values(this.upgrades).find(x => x.canAffordWhole) !== undefined;
		}

		get params() {
			return this.data.params;
		}

		get type() {
			return MachineTypes[data.name];
		}

		get height() {
			return this.data.min ? 160 : 250;
		}

		addPipe(machine, inputId, outputId) {
			this.data.pipes[outputId].push([machine.id, inputId]);
			this.updatePipes();
		}

		removePipe(machine, inputId) {
			for (let i = 0; i < this.data.pipes.length; i++) {
				for (let j = 0; j < this.data.pipes[i].length; j++) {
					if (this.data.pipes[i][j][0].toString() === machine.id.toString() && this.data.pipes[i][j][1] === inputId) {
						this.data.pipes[i].splice(j, 1);
						this.updatePipes();
						return true;
					}
				}
			}
			return false;
		}
		
		removeAllPipes(machine) {
			for (let i = 0; i < this.data.pipes.length; i++) {
				for (let j = 0; j < this.data.pipes[i].length; j++) {
					while (this.data.pipes[i][j] && this.data.pipes[i][j][0].toString() === machine.id.toString()) {
						this.data.pipes[i].splice(j, 1);
					}
				}
			}
			this.updatePipes();
		}

		updatePipes() {
			this.pipes = this.data.pipes.map(p => p.map(x => {
				const machine = MachinesById[this.town][x[0]];
				return [machine, machine.inputs[x[1]]];
			}));
		}

		inputItem(id) {
			return last(this.inputs[id].data);
		}

		outputItem(id) {
			return last(this.outputs[id].data);
		}

		showDescription() {
			const acceptsTable = this.inputs.find(x => x.isUnlocked) ? `<br><div style="display: inline-block; text-align: left;">
				${this.inputs.filter(x => x.isUnlocked).map(x => x.config.accepts)
					.map((x, id) => `Input ${id + 1} accepts: ${acceptsAll(x) ? "All" : x.map(x => x.capitalize()).join(", ")}`).join("<br>")}
			</div>` : "";
			Modals.message.show(`${this.type.description}${acceptsTable}`);
		}

		showProduction() {
			Modals.machineProduction.show({ machine: this });
		}

		static name = data.name;

		static newMachine(x, y) {
			const returnObj = {
				x,
				y,
				type: this.name,
				pipes: Array.from(Array(this.outputs ? this.outputs.length : 0), () => []),
				isDefault: false,
				min: false
			};
			if (this.inputs.length) {
				returnObj.inputs = Array.from(Array(this.inputs.length), () => []);
			}
			if (this.outputs.length) {
				returnObj.outputs = Array.from(Array(this.outputs.length), () => []);
			}
			if (this.upgrades && Object.values(this.upgrades).length) {
				returnObj.upgrades = Array(Object.values(this.upgrades).length).fill(0);
				returnObj.upgradesPrepay = Array(Object.values(this.upgrades).length).fill(0);
			}
			return returnObj;
		}
	}

	for (const i of Object.keys(data)) {
		if (i !== "name") returnValue[i] = data[i];
	}

	return returnValue;
}

class MachineUpgrade {
	constructor(config, parentMachine) {
		this.config = config;
		this.parentMachine = parentMachine;
	}

	get id() {
		return this.config.id;
	}

	get count() {
		return this.parentMachine.data.upgrades[this.id];
	}

	set count(x) {
		this.parentMachine.data.upgrades[this.id] = x;
	}

	get max() {
		return this.config.max;
	}

	get maxed() {
		return this.count >= this.max;
	}

	get cost() {
		return run(this.config.cost, this.count) - this.prepay;
	}

	get currencyType() {
		return run(this.config.currencyType, this.count);
	}

	get effect() {
		return run(this.config.effect, this.count);
	}

	get formattedEffect() {
		return !this.config.formatEffect ? formatX(this.effect, 2, 1) : this.config.formatEffect(this.effect);
	}

	get title() {
		return run(this.config.title, this);
	}

	get description() {
		return run(this.config.description, this);
	}

	get isUnlocked() {
		return this.config.isUnlocked === undefined ? true : run(this.config.isUnlocked, this.parentMachine);
	}

	get canAfford() {
		if (this.maxed) return false;
		if (!this.currencyType) return player.money >= this.cost;
		return player.holding.resource === this.currencyType && player.holding.amount;
	}

	get canAffordWhole() {
		if (this.maxed) return false;
		if (!this.currencyType) return player.money >= this.cost;
		return player.holding.resource === this.currencyType && player.holding.amount >= this.cost;
	}

	get prepay() {
		return this.parentMachine.data.upgradesPrepay[this.id];
	}

	set prepay(x) {
		this.parentMachine.data.upgradesPrepay[this.id] = x;
	}

	buy() {
		if (!this.canAfford || this.maxed) return;
		if (!this.canAffordWhole) {
			this.prepay += player.holding.amount;
			player.holding.amount = 0;
			return;
		}
		if (!this.currencyType) {
			player.money -= this.cost;
			this.count++;
		} else {
			player.holding.amount -= this.cost;
			this.count++;
			this.prepay = 0;
		}
	}
}

export const MachineTypes = objectMap(GameDatabase.machines, x => x, x => MachineType(x));
window.MachineTypes = MachineTypes

export const Machines = {};
window.Machines = Machines;
const MachinesById = {};
export const MachineCounts = {};

export const Machine = {
	gameLoop(realDiff) {
		let diff = Math.min(realDiff, 1);
		// if (diff === 1) player.fastTime += realDiff - 1;
		if (player.fastTime) {
			const add = Math.min(player.fastTime, diff * 2);
			diff += add;
			player.fastTime -= add;
		}
		for (const machine of Object.values(Machines).flat()) {
			if (machine.type.customLoop) {
				machine.type.customLoop.bind(machine)(diff);
				continue;
			}
			Machine.tickThisMachine(machine, diff);
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
			if (isNaN(x.maxDiff)) return x.maxDiff = 0;
			if (!conf.requires && !conf.requiresList) return;
			if (!inputs.length) return;
			const requiresList = conf.requiresList ? conf.requiresList : [conf.requires];
			for (const requirement of requiresList) {
				const input = last(inputs[requirement.inputId].data);
				if (!input) return x.maxDiff = 0;
				if (requirement.resource) {
					if (input.resource !== requirement.resource) return x.maxDiff = 0;
					x.maxDiff = Math.min(x.maxDiff, input.amount / requirement.amount);
				} else if (requirement.resourceList) {
					const usedResource =  requirement.resourceList.find(x => x.resource === input.resource);
					if (!usedResource) return x.maxDiff = 0;
					x.maxDiff = Math.min(x.maxDiff, input.amount / usedResource.amount);
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
			machine.outputDiffs[conf.id !== undefined ? conf.id : id] = Math.min(x.maxDiff, diff);
		});
		Machine.addInputHistory(machine);
		Machine.addOutputHistory(machine);
		// Re-calculate inputs
		inputs = machine.inputs.filter(x => x.isUnlocked);
		inputs.forEach(x => {
			x.otherwiseDiff = diff;
			const conf = x.config;
			const amount = typeof conf.consumes === "object" ? Math.min(conf.consumes.amount * diff, conf.consumes.maximum)
				: conf.consumes * diff;
			if (x.data.length) Stack.removeFromStack(x.data, amount);
		});
	},
	add(townName, type, x, y) {
		const machines = player.towns[townName].machines;
		if (Object.values(machines).length > 50) {
			Modals.message.show("Reached machine cap in this town!");
			return false;
		}
		const newMach = MachineTypes[type].newMachine(x, y);
		let i = 0;
		while (true) {
			if (!machines[i]) {
				machines[i] = newMach;
				const constructed = new MachineTypes[type](townName, i);
				Machines[townName].push(constructed);
				MachinesById[townName][i] = constructed;
				MachineCounts[townName][type]++;
				last(Machines[townName]).isNew = true;
				return true;
			}
			i++;
		}
	},
	remove(machine) {
		Pipe.removeAllInputPipesTo(machine);
		requestAnimationFrame(() => Pipe.removeAllInputPipesTo(machine));
		delete player.towns[machine.town].machines[machine.id];
		Machines[machine.town].splice(Machines[machine.town].findIndex(x => x.id === machine.id), 1);
		delete MachinesById[machine.town][machine.id];
		MachineCounts[machine.town][machine.type]--;
	}
};
window.Machine = Machine;

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
			let ratios = [], whole = 0;
			const outputLast = last(output.data);
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
	},
	removeAllInputPipesTo(machine, inputId) {
		const town = machine.town;
		if (inputId !== undefined) {
			for (const otherMachine of Machines[town]) {
				if (otherMachine.removePipe(machine, inputId)) return;
			}
		} else {
			for (const otherMachine of Machines[town]) {
				otherMachine.removeAllPipes(machine);
			}
		}
	}
};
window.Pipe = Pipe;

export function initializeMachines() {
	for (const town of Object.keys(GameDatabase.towns)) {
		Machines[town] = [];
		MachinesById[town] = {};
		MachineCounts[town] = objectMap(MachineTypes, x => x, () => 0);
		for (const machineId of Object.keys(player.towns[town].machines)) {
			const machine = player.towns[town].machines[machineId];
			const newMach = new MachineTypes[machine.type](town, machineId);
			Machines[town].push(newMach);
			MachinesById[town][machineId] = newMach;
			MachineCounts[town][machine.type] += 1;
		}
	}
}
