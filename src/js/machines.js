import { GameDatabase } from "./database/game-database";
import { Stack } from "./stack";

function MachineType(data) {
	return class {
		constructor(town, id) {
			this.town = town;
			this.id = id;
		}

		get data() {
			return player.towns[this.town].machines[this.id];
		}

		/* get connections() {
			return this.data.connections;
		} */

		get upgrades() {
			return objectMap(this.type.upgrades, x => x, x => new MachineUpgrade(x, this));
		}

		get params() {
			return this.data.params;
		}

		get inputs() {
			const data = this.data;
			return this.type.inputs.map((x, id) => ({
				config: objectMap(x, y => y, (item, propName) => {
					switch(propName) {
						case "capacity": case "uses":
							return run(item, this);
						case "isUnlocked":
							return item === undefined ? true : run(item, this);
						default:
							return item;
					}
				}),
				get data() {
					return data.inputs[id]
				},
				set data(x) {
					data.inputs[id] = x;
				}
			}));
		}

		get outputs() {
			const data = this.data;
			return this.type.outputs.map((x, id) => ({
				config: objectMap(x, y => y, (item, propName) => {
					switch(propName) {
						case "capacity": case "produces": case "requires":
							return run(item, this);
						default:
							return item;
					}
				}),
				isUnlocked: x.isUnlocked === undefined ? true : run(x.isUnlocked, this),
				get data() {
					return data.outputs[id]
				},
				set data(x) {
					data.outputs[id] = x;
				}
			}));
		}

		get type() {
			return MachineTypes[data.name];
		}

		static upgrades = data.upgrades;

		static inputs = data.inputs;

		static outputs = data.outputs;

		static name = data.name;

		static customLoop = data.customLoop;

		static newMachine(x, y) {
			const returnObj = {
				x,
				y,
				type: this.name,
				connections: [],
			};
			if (this.inputs.length) {
				returnObj.inputs = Array.from(Array(this.inputs.length), () => []);
			}
			if (this.outputs.length) {
				returnObj.outputs = Array.from(Array(this.outputs.length), () => []);
			}
			if (this.upgrades.length) {
				returnObj.upgrades = Array(this.upgrades.length).fill(0);
			}
			return returnObj
		}
	}
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

	get max() {
		return this.config.max;
	}

	get maxed() {
		return this.count >= this.max;
	}

	set count(x) {
		this.parentMachine.data.upgrades[this.id] = x;
	}

	get cost() {
		return run(this.config.cost, this.count);
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

	get canAfford() {
		if (this.maxed) return false;
		if (!this.currencyType) return player.money >= this.cost;
		return player.holding.resource === this.currencyType && player.holding.amount >= this.cost;
	}

	buy() {
		if (!this.canAfford) return;
		if (!this.currencyType) {
			player.money -= this.cost;
			this.count++;
		} else {
			player.holding.amount -= this.cost;
			this.count++;
		}
	}
}

export const MachineTypes = objectMap(GameDatabase.machines, x => x, x => MachineType(x));

export const Machines = {};
window.Machines = Machines;

export const Machine = {
	gameLoop(realDiff) {
		const diff = Math.min(realDiff, 1);
		for (const machine of Object.values(Machines).flat()) {
			if (machine.type.customLoop) {
				machine.type.customLoop.bind(machine)(diff);
				continue;
			}
			machine.outputDiffs = {};
			const outputs = machine.outputs.filter(x => x.isUnlocked);
			outputs.forEach(x => {
				const conf = x.config;
				x.maxDiff = (conf.capacity - Stack.volumeOfStack(x.data)) / conf.produces.amount;
				if (!conf.requires) return;
				if (!inputs.data.length) return x.maxDiff = 0;
				const input = last(inputs.data);
				if (conf.requires.resource) {
					if (input.resource !== conf.requires.resource) return x.maxDiff = 0;
					x.maxDiff = Math.min(x.maxDiff, input.amount / conf.requires.amount);
				} else if (conf.requires.resourceList) {
					const usedResource =  conf.requires.resourceList.find(x => x.resource === input.resource);
					if (!usedResource) return x.maxDiff = 0;
					x.maxDiff = Math.min(x.maxDiff, input.amount / usedResource.amount);
				}
			});
			outputs.forEach((x, id) => {
				const conf = x.config;
				const produces = {
					resource: conf.produces.resource,
					amount: conf.produces.amount * Math.min(x.maxDiff, diff)
				}
				Stack.addToStack(x.data, produces);
				machine.outputDiffs[id] = Math.min(x.maxDiff, diff);
			});
			const inputs = machine.inputs.filter(x => x.isUnlocked);
			inputs.forEach(x => {
				const conf = x.config;
				const amount = typeof conf.uses === "object" ? Math.min(conf.uses.amount * diff, conf.uses.maximum) : conf.uses;
				if (x.data.length) Stack.removeFromStack(x.data, { resource: last(x).resource, amount });
			});
		}
	},
	add(townName, type, x, y) {
		const machines = player.towns[townName].machines;
		if (Object.values(machines).length > 50) return Modal.message.show("Reached machine cap in this town!");
		const newMach = MachineTypes[type].newMachine(x, y);
		let i = 0;
		while (true) {
			if (!machines[i]) {
				machines[i] = newMach;
			}
			i++;
		}
	}
};
window.Machine = Machine;

export function initializeMachines() {
	for (const town of Object.keys(GameDatabase.towns)) {
		if (!Machines[town]) Machines[town] = [];
		for (const machineId of Object.keys(player.towns[town].machines)) {
			const machine = player.towns[town].machines[machineId];
			Machines[town].push(new MachineTypes[machine.type](town, machineId));
		}
	}
}