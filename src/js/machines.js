import { GameDatabase } from "./database/game-database";
import { Stack } from "./stack";
import { Modals } from "./ui/modals";

function MachineType(data) {
	const returnValue = class {
		constructor(town, id) {
			this.town = town;
			this.id = id;
			this.outputDiffs = mapToObject(data.outputs, (x, id) => x.id === undefined ? id : x.id, () => 0);
		}

		get data() {
			return player.towns[this.town].machines[this.id];
		}

		/* get connections() {
			return this.data.connections;
		} */

		get upgrades() {
			return !this.type.upgrades ? {} : objectMap(this.type.upgrades, x => x, x => new MachineUpgrade(x, this));
		}

		get hasUpgradeAvailable() {
			return Object.values(this.upgrades).find(x => x.canAfford) !== undefined;
		}

		get params() {
			return this.data.params;
		}

		get inputs() {
			const data = this.data;
			return this.type.inputs.map((x, id) => ({
				config: objectMap(x, y => y, (item, propName) => {
					switch(propName) {
						case "capacity": case "consumes":
							return run(item, this);
						default:
							return item;
					}
				}),
				isUnlocked: x.isUnlocked === undefined ? true : run(x.isUnlocked, this),
				get data() {
					return data.inputs[id]
				},
				set data(x) {
					data.inputs[id] = x;
				}
			}));
		}

		inputItem(id) {
			return last(this.inputs[id].data);
		}

		get outputs() {
			const data = this.data;
			return this.type.outputs.map((x, id) => ({
				config: objectMap(x, y => y, (item, propName) => {
					switch(propName) {
						case "capacity": case "produces": case "requires": case "requiresList":
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

		showDescription() {
			const acceptsTable = this.type.inputs.length ? `<br><div style="display: inline-block; text-align: left;">
				${this.type.inputs.map(x => x.accepts.map(x => x.capitalize()))
					.map((x, id) => `Input ${id + 1} accepts: ${x.join(", ")}`).join("<br>")}
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
				connections: [],
			};
			if (this.inputs.length) {
				returnObj.inputs = Array.from(Array(this.inputs.length), () => []);
			}
			if (this.outputs.length) {
				returnObj.outputs = Array.from(Array(this.outputs.length), () => []);
			}
			if (this.upgrades && Object.values(this.upgrades).length) {
				returnObj.upgrades = Array(Object.values(this.upgrades).length).fill(0);
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

	get isUnlocked() {
		return this.config.isUnlocked === undefined ? true : run(this.config.isUnlocked, this.parentMachine);
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
window.MachineTypes = MachineTypes;

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
			Machine.tickThisMachine(machine, diff);
		}
	},
	tickThisMachine(machine, diff) {
		machine.outputDiffs = {};
		const outputs = machine.outputs.filter(x => x.isUnlocked);
		let inputs = machine.inputs.filter(x => x.isUnlocked);
		outputs.forEach(x => {
			const conf = x.config;
			x.maxDiff = (conf.capacity - Stack.volumeOfStack(x.data)) / conf.produces.amount;
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
			Stack.addToStack(x.data, produces);
			machine.outputDiffs[conf.id !== undefined ? conf.id : id] = Math.min(x.maxDiff, diff);
		});
		// Re-calculate inputs
		inputs = machine.inputs.filter(x => x.isUnlocked);
		inputs.forEach(x => {
			const conf = x.config;
			const amount = typeof conf.consumes === "object" ? Math.min(conf.consumes.amount * diff, conf.consumes.maximum)
				: conf.consumes * diff;
			if (x.data.length) Stack.removeFromStack(x.data, amount);
		});
	},
	add(townName, type, x, y) {
		const machines = player.towns[townName].machines;
		if (Object.values(machines).length > 50) return Modals.message.show("Reached machine cap in this town!");
		const newMach = MachineTypes[type].newMachine(x, y);
		let i = 0;
		while (true) {
			if (!machines[i]) {
				machines[i] = newMach;
				Machines[townName].push(new MachineTypes[type](townName, i));
				last(Machines[townName]).isNew = true;
				break;
			}
			i++;
		}
	},
	remove(townName, machine) {
		delete player.towns[townName].machines[machine.id];
		Machines[townName].splice(Machines[townName].findIndex(x => x.id === machine.id), 1);
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