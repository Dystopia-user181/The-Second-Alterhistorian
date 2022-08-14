import { MachinesById } from "./player-proxy";

import { Currencies } from "@/js/database/currencies";
import { Modals } from "@/js/ui/modals";
import { player } from "@/js/player";

import { areArraysEqualSets, arr, formatX, objectMap, run, str } from "@/utils/index";

function acceptsAll(accepts) {
	return areArraysEqualSets(accepts, Object.keys(Currencies));
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
		return this.config.formatEffect ? this.config.formatEffect(this.effect) : formatX(this.effect, 2, 1);
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
		if (this.currencyType) {
			player.holding.amount -= this.cost;
			this.count++;
			this.prepay = 0;
		} else {
			player.money -= this.cost;
			this.count++;
		}
	}
}

export function MachineType(data) {
	const type = class {
		constructor(town, machineId) {
			this.town = town;
			this.id = machineId;
			this.data = player.towns[this.town].machines[this.id];
			this.outputHistories = [];
			this.inputHistories = [];
			this.outputConfHistories = [];
			this.inputConfHistories = [];
			this.outputDiffs = arr(data.outputs).mapToObject((x, id) => (x.id === undefined ? id : x.id), () => 0);
			// Have to use alias to make it available for use in inputs and outputs
			// eslint-disable-next-line consistent-this
			const machine = this;
			this.inputs = this.type.inputs.map((x, id) => ({
				id,
				get config() {
					return objectMap(x, y => y, (item, propName) => {
						switch (propName) {
							case "capacity": case "consumes": case "accepts": case "label":
								return run(item, machine);
							default:
								return item;
						}
					});
				},
				get isUnlocked() {
					return x.isUnlocked === undefined ? true : run(x.isUnlocked, machine);
				},
				data: this.data.inputs[id]
			}));
			this.outputs = this.type.outputs.map((x, id) => ({
				id,
				get config() {
					return objectMap(x, y => y, (item, propName) => {
						switch (propName) {
							case "capacity": case "produces": case "requires": case "requiresList": case "label":
								return run(item, machine);
							default:
								return item;
						}
					});
				},
				get isUnlocked() {
					return x.isUnlocked === undefined ? true : run(x.isUnlocked, machine);
				},
				data: this.data.outputs[id]
			}));
			if (this.type.upgrades)
				this.upgrades = objectMap(this.type.upgrades, x => x, x => new MachineUpgrade(x, this));
			this.pipes = [];
			requestAnimationFrame(() => this.updatePipes());
		}

		get isUpgradeable() {
			return this.upgrades && Object.keys(this.upgrades).length > 0;
		}

		get isFullyUpgraded() {
			return this.isUpgradeable &&
				Object.values(this.upgrades).every(upgrade => !upgrade.isUnlocked || upgrade.maxed);
		}

		get hasPartialBuyableUpgrades() {
			return this.isUpgradeable &&
				!this.hasWholeBuyableUpgrades &&
				Object.values(this.upgrades).find(x => x.canAfford) !== undefined;
		}

		get hasWholeBuyableUpgrades() {
			return this.isUpgradeable && Object.values(this.upgrades).find(x => x.canAffordWhole) !== undefined;
		}

		get params() {
			return this.data.params;
		}

		get height() {
			return this.data.min ? 160 : 250;
		}

		get type() {
			return this.constructor;
		}

		addPipe(machine, inputId, outputId) {
			this.data.pipes[outputId].push([machine.id, inputId]);
			this.updatePipes();
		}

		removePipe(machine, inputId) {
			for (let i = 0; i < this.data.pipes.length; i++) {
				for (let j = 0; j < this.data.pipes[i].length; j++) {
					if (this.data.pipes[i][j][0].toString() === machine.id.toString() &&
						this.data.pipes[i][j][1] === inputId) {
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
			return arr(this.inputs[id].data).last;
		}

		outputItem(id) {
			return arr(this.outputs[id].data).last;
		}

		showDescription() {
			const acceptsTable = this.inputs.find(x => x.isUnlocked) ? `
<br>
<div style="display: inline-block; text-align: left;">
	${this.inputs.filter(x => x.isUnlocked).map(x => x.config.accepts)
		.map((x, id) => `Input ${id + 1} accepts: ${acceptsAll(x) ? "All"
			: x.map(y => str(y).capitalize).join(", ")}`)
		.join("<br>")}
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
	};

	for (const i of Object.keys(data)) {
		if (i !== "name") type[i] = data[i];
	}

	return type;
}