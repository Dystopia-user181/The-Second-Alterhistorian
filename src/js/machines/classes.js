import { computed, markRaw, reactive, ref } from "vue";

import { MachinesById, Pipes } from "./player-proxy";

import { Currencies } from "@/js/database/currencies.ts";
import { Modals } from "@/js/ui/modals";
import { player } from "@/js/player";

import { areArraysEqualSets, arr, BulkRun, formatX, objectMap, run, Stack, str } from "@utils";


function acceptsAll(accepts) {
	return areArraysEqualSets(accepts, Object.keys(Currencies));
}

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
			// Need inconsistent this because of "isUnlocked" property
			// eslint-disable-next-line consistent-this
			const machine = this;
			this.inputs = this.type.inputs.map((input, id) => ({
				id,
				config: BulkRun(input, [this], ["capacity", "consumes", "accepts", "label"]),
				get isUnlocked() {
					return input.isUnlocked === undefined ? true : run(input.isUnlocked, machine);
				},
				data: this.data.inputs[id],
				_volume: ref(Stack.volumeOfStack(this.data.inputs[id])),
				// Tiny inconsistencies make it display as -0.0 sometimes
				get volume() { return Math.max(this._volume.value, 0); },
				set volume(x) { this._volume.value = x; },
				addToStack(item) {
					// Skip capacity because it's only used in spaceLeft
					const amt = Stack.addToStack(this.data, item, 0, {
						spaceLeft: this.spaceLeft
					});
					this.volume += amt;
					return amt;
				},
				removeFromStack(item) {
					const amt = Stack.removeFromStack(this.data, item);
					this.volume -= amt;
					return amt;
				},
				get spaceLeft() {
					return this.config.capacity - this.volume;
				},
				get isCapped() {
					return this.spaceLeft <= Number.EPSILON;
				},
				displayResource: reactive(["none", Infinity])
			}));
			this.outputs = this.type.outputs.map((output, id) => ({
				id,
				config: BulkRun(output, [this], ["capacity", "produces", "requires", "requiresList", "label"]),
				get isUnlocked() {
					return output.isUnlocked === undefined ? true : run(output.isUnlocked, machine);
				},
				data: this.data.outputs[id],
				_volume: ref(Stack.volumeOfStack(this.data.outputs[id])),
				// Tiny inconsistencies make it display as -0.0 sometimes
				get volume() { return Math.max(this._volume.value, 0); },
				set volume(x) { this._volume.value = x; },
				addToStack(item) {
					// Skip capacity because it's only used in spaceLeft
					const amt = Stack.addToStack(this.data, item, 0, {
						spaceLeft: this.spaceLeft
					});
					this.volume += amt;
					return amt;
				},
				removeFromStack(item) {
					const amt = Stack.removeFromStack(this.data, item);
					this.volume -= amt;
					return amt;
				},
				get spaceLeft() {
					return this.config.capacity - this.volume;
				},
				get isCapped() {
					return this.spaceLeft <= Number.EPSILON;
				},
				displayResource: reactive(["none", Infinity])
			}));
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

		get params() {
			return this.data.params;
		}

		get height() {
			return this.data.min ? 160 : 250;
		}

		get name() {
			return this.type.name;
		}

		get displayName() {
			return str(this.name).capitalize;
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
						Pipes[this.town].splice(Pipes[this.town].findIndex(pipe =>
							pipe.out[0] === this && pipe.out[1] === this.outputs[i] &&
							pipe.in[0] === machine && pipe.in[1] === machine.inputs[inputId]
						), 1);
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
						Pipes[this.town].splice(Pipes[this.town].findIndex(pipe =>
							pipe.out[0] === this && pipe.out[1] === this.outputs[i] &&
							pipe.in[0] === machine && pipe.in[1] === machine.inputs[this.data.pipes[i][j][1]]
						), 1);
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