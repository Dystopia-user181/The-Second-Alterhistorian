import { computed, markRaw, reactive, ref } from "vue";

import { MachinesById, Pipes } from "./player-proxy";
import { Modals } from "@/js/ui/modals";
import { player } from "@/js/player";

import { arr, formatX, objectMap, run, Stack, str } from "@/utils";


class MachineUpgrade {
	constructor(config, parentMachine) {
		this.config = config;
		this.parentMachine = parentMachine;

		// `markRaw` is needed to prevent vue from auto unwrapping computed getters when this is
		// passed as a prop
		this._ = markRaw((upgrade => ({
			count: computed(() => upgrade.parentMachine.data.upgrades[upgrade.id]),
			effect: computed(() => run(upgrade.config.effect, upgrade.count)),
			cost: computed(() => run(upgrade.config.cost, upgrade.count) - upgrade.prepay),
			currencyType: computed(() => run(upgrade.config.currencyType, upgrade.count)),
			isUnlocked: computed(
				upgrade.config.isUnlocked === undefined
					? () => true
					: () => run(upgrade.config.isUnlocked, upgrade.parentMachine)
			),
			formattedEffect: computed(upgrade.config.formatEffect
				? () => upgrade.config.formatEffect(upgrade.effect)
				: () => formatX(upgrade.effect, 2, 1)),
			title: computed(() => run(upgrade.config.title, upgrade)),
			description: computed(() => run(upgrade.config.description, upgrade)),
		}))(this));
	}

	get id() {
		return this.config.id;
	}

	get count() {
		return this._.count.value;
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
		return this._.cost.value;
	}

	get currencyType() {
		return this._.currencyType.value;
	}

	get effect() {
		return this._.effect.value;
	}

	get formattedEffect() {
		return this._.formattedEffect.value;
	}

	get isUnlocked() {
		return this._.isUnlocked.value;
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

	get title() {
		return this._.title.value;
	}

	get description() {
		return this._.description.value;
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

class GenericStackState {
	constructor(data) {
		this.data = data;
		this._volume = ref(Stack.volumeOfStack(this.data));
		this.displayResource = reactive(["none", Infinity]);
		this.lastItem = null;
	}

	get capacity() {
		return Infinity;
	}

	get volume() {
		// Tiny inconsistencies make it display as -0.0 sometimes
		return Math.max(this._volume.value, 0);
	}

	set volume(x) {
		this._volume.value = x;
	}

	get spaceLeft() {
		return this.capacity - this.volume;
	}

	get isCapped() {
		return this.spaceLeft <= Number.EPSILON;
	}

	addToStack(item) {
		// Skip capacity because it's only used for spaceLeft
		const amt = Stack.addToStack(this.data, item, 0, {
			spaceLeft: this.spaceLeft
		});
		this.volume += amt;
		this.lastItem = arr(this.data).last || null;
		return amt;
	}

	removeFromStack(amount) {
		const amt = Stack.removeFromStack(this.data, amount);
		if (this.data.length) this.volume -= amt;
		else this.volume = 0;
		this.lastItem = arr(this.data).last || null;
		return amt;
	}
}

class InputConfigState {
	constructor(config, machine) {
		this.config = config;
		this._machine = machine;
	}

	get capacity() {
		return run(this.config.capacity, this._machine);
	}

	get consumes() {
		return run(this.config.consumes, this._machine);
	}

	get accepts() {
		return run(this.config.accepts, this._machine);
	}

	get label() {
		return run(this.config.label, this._machine);
	}

	get id() {
		return this.config.id;
	}

	get isUnlocked() {
		return this.config.isUnlocked === undefined ? true : run(this.config.isUnlocked, this._machine);
	}

	get raw() {
		return {
			capacity: this.capacity,
			consumes: this.consumes,
			id: this.id,
		};
	}
}

class InputState extends GenericStackState {
	constructor(machine, id) {
		super(machine.data.inputs[id]);
		this.config = new InputConfigState(machine.type.inputs[id], machine);
		this.id = id;
	}

	get capacity() {
		return this.config.capacity;
	}

	get consumes() {
		return this.config.consumes;
	}

	get accepts() {
		return this.config.accepts;
	}

	get label() {
		return this.config.label;
	}

	get isUnlocked() {
		return this.config.isUnlocked;
	}
}

class OutputConfigState {
	constructor(config, machine) {
		this.config = config;
		this._machine = machine;
	}

	get capacity() {
		return run(this.config.capacity, this._machine);
	}

	get produces() {
		return run(this.config.produces, this._machine);
	}

	get requires() {
		return run(this.config.requires, this._machine);
	}

	get requiresList() {
		return run(this.config.requiresList, this._machine);
	}

	get label() {
		return run(this.config.label, this._machine);
	}

	get id() {
		return this.config.id;
	}

	get isUnlocked() {
		return this.config.isUnlocked === undefined ? true : run(this.config.isUnlocked, this._machine);
	}

	get raw() {
		return {
			capacity: this.capacity,
			produces: this.produces,
			id: this.id,
		};
	}
}

class OutputState extends GenericStackState {
	constructor(machine, id) {
		super(machine.data.outputs[id]);
		this.config = new OutputConfigState(machine.type.outputs[id], machine);
		this.id = id;
	}

	get capacity() {
		return this.config.capacity;
	}

	get produces() {
		return this.config.produces;
	}

	get requires() {
		return this.config.requires;
	}

	get requiresList() {
		return this.config.requiresList;
	}

	get label() {
		return this.config.label;
	}

	get isUnlocked() {
		return this.config.isUnlocked;
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

			if (this.type.upgrades)
				this.upgrades = objectMap(this.type.upgrades, x => x, x => new MachineUpgrade(x, this));
			this.isUpgradeable = this.upgrades && Object.keys(this.upgrades).length > 0;

			this.pipes = [];
			this.updates = 0;
			this.inputs = this.type.inputs.map((_, id) => new InputState(this, id));
			this.outputs = this.type.outputs.map((_, id) => new OutputState(this, id));
			Promise.resolve().then(() => this.updatePipes());
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

		get height() {
			return this.data.min ? 110 : 250;
		}

		get name() {
			return this.type.name;
		}

		get displayName() {
			return this.data.name || str(this.name).capitalize;
		}

		addPipe(machine, inputId, outputId) {
			this.data.pipes[outputId].push([machine.id, inputId]);
			Pipes[this.town].push({
				out: [this, this.outputs[outputId]],
				in: [machine, machine.inputs[inputId]]
			});
			this.updatePipes();
		}

		removePipe(machine, inputId) {
			for (let i = 0; i < this.data.pipes.length; i++) {
				for (let j = 0; j < this.data.pipes[i].length; j++) {
					if (this.data.pipes[i][j][0].toString() === machine.id.toString() &&
						this.data.pipes[i][j][1] === inputId) {
						const idx = Pipes[this.town].findIndex(pipe =>
							pipe.out[0].id.toString() === this.id.toString() &&
							pipe.out[1].id.toString() === this.outputs[i].id.toString() &&
							pipe.in[0].id.toString() === machine.id.toString() &&
							pipe.in[1].id.toString() === machine.inputs[inputId].id.toString()
						);
						if (idx === -1) {
							Modals.message.show("Something probably went wrong when deleting this pipe.");
						} else {
							Pipes[this.town].splice(idx, 1);
						}
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
						const idx = Pipes[this.town].findIndex(pipe =>
							pipe.out[0].id.toString() === this.id.toString() &&
							pipe.out[1].id.toString() === this.outputs[i].id.toString() &&
							pipe.in[0].id.toString() === machine.id.toString() &&
							pipe.in[1].id.toString() === this.data.pipes[i][j][1].toString()
						);
						Pipes[this.town].splice(idx, 1);
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
			return this.inputs[id].lastResource;
		}

		outputItem(id) {
			return this.outputs[id].lastResource;
		}

		showStatistics() {
			Modals.machineStatistics.show({ machine: this });
		}

		toggleMinimized() {
			this.data.min = !this.data.min;
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

	type.displayName = str(type.name).capitalize;

	type.prototype.type = type;

	return type;
}