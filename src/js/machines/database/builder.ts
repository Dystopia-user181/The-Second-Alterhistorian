import { ResourceType } from "@/types/resources";

function mapObject<T extends Record<K, unknown>, K extends string, R>(
	input: T,
	map: (value: T[K]) => R
) {
	return Object.fromEntries(
		Object.entries(input).map(([key, value]) => [key, map(value as T[K])])
	) as { [key in K]: R };
}

// ============= Config ============ //

export type InputConfig<Instance> = {
  accepts: ResourceType[] | (() => ResourceType[]);
  capacity: number | ((machine: Instance) => number);
  consumes:
    | number
    | ((machine: Instance) => number)
    | ((machine: Instance) => { amount: number; maximum: number });
  label?: string;
  isUnlocked?: boolean | ((machine: Instance) => boolean);
};

export interface OutputConfig<Instance> {
  capacity: number | ((machine: Instance) => number);
  produces: (machine: Instance) => {
    resource: ResourceType;
    amount: number;
  };
  isUnlocked?: (machine: Instance) => boolean;
  requiresList?: (machine: Instance) => Array<{
    resource: ResourceType | "none";
    amount: number;
    inputId: number;
  }>;
}

export interface UpgradeConfig<K extends string, E = any> {
  cost: number | ((count: number) => number);
  description: string | ((upgrade: MachineUpgrade<K>) => string);
  effect: number | ((count: number) => E);
  max: number;
  name: string;
  title: string | ((upgrade: MachineUpgrade<K>) => string);

  currencyType?: ResourceType | ((count: number) => ResourceType);
  formatEffect?: (effect: E) => string;
  isUnlocked?: (machine: ConfiguredMachine<K>) => boolean;
}

export interface MachineConfig<K extends string> {
  name: string;

  /** The description of the machine that will be displayed to the user */
  description: string;
  upgrades: Record<K, UpgradeConfig<K>>;
  inputs?: InputConfig<ConfiguredMachine<K>>[];
  outputs?: OutputConfig<ConfiguredMachine<K>>[];
}

// ============= Untyped objects ============ //

declare class Town {}
declare class InputState<K extends string> {
	constructor(machine: ConfiguredMachine<K>, id: number);
	readonly accepts: number[];
	readonly capacity: number;
	readonly consumes: number;
	readonly isUnlocked: boolean;
	readonly label: string;
	readonly lastResource: ResourceType;
}

declare class OutputState<K extends string> {
	constructor(machine: ConfiguredMachine<K>, id: number);
	readonly capacity: number;
	readonly produces: number;
	readonly requires: number;
	readonly requiresList: number;
	readonly label: string;
	readonly isUnlocked: boolean;
	readonly lastResource: ResourceType;
}

// ============= Instances ============ //

export class MachineBase {
	#town: Town;
	#id: number;

	get id() {
		return this.#id;
	}

	get town() {
		return this.#town;
	}

	constructor(town: Town, machineId: number) {
		this.#town = town;
		this.#id = machineId;
	}
}

export class MachineUpgrade<K extends string> {
	#parentMachine: ConfiguredMachine<K>;
	#config: UpgradeConfig<K>;
	#count = 0;

	constructor(machine: ConfiguredMachine<K>, config: UpgradeConfig<K>) {
		this.#parentMachine = machine;
		this.#config = config;
	}

	public effect: any = 0;

	get count() {
		return this.#count;
	}

	set count(value: number) {
		this.#count = value;
	}

	get maxed() {
		return this.#count >= this.#config.max;
	}

	get isUnlocked() {
		return this.#config.isUnlocked?.(this.#parentMachine) ?? true;
	}

	get canAfford() {
		if (this.maxed) return false;
		// FIXME: there is no player access here, should come from parent machine
		return true;
		// if (!this.currencyType) return player.money >= this.cost;
		// return player.holding.resource === this.currencyType && player.holding.amount;
	}

	get canAffordWhole() {
		if (this.maxed) return false;
		// FIXME: there is no player access here, should come from parent machine
		return true;
		// if (!this.currencyType) return player.money >= this.cost;
		// return player.holding.resource === this.currencyType && player.holding.amount >= this.cost;
	}
}

interface ConfiguredMachineConstructor<K extends string> {
  new (town: Town, machineId: number): ConfiguredMachine<K>;
}

export interface ConfiguredMachine<K extends string> extends MachineBase {
  readonly name: string;
  readonly upgrades: Record<K, MachineUpgrade<K>>;
  readonly isMinimized: boolean;
}

export function defineMachine<K extends string>(
	config: MachineConfig<K>
): ConfiguredMachineConstructor<K> {
	return class extends MachineBase {
		#upgrades: Record<K, MachineUpgrade<K>>;
		#isUpgradeable = false;
		#pipes: unknown[];
		#minimized = false;
		#inputs: InputState<K>[];
		#outputs: OutputState<K>[];

		get name() {
			return config.name;
		}

		// get displayName() {
		// 	return this.data.name || str(this.name).capitalize;
		// }

		get upgrades() {
			return this.#upgrades;
		}

		get isMinimized() {
			return this.#minimized;
		}

		// FIXME: pass in player
		constructor(town: Town, machineId: number) {
			super(town, machineId);

			this.#upgrades = mapObject(
				config.upgrades,
				config => new MachineUpgrade(this, config)
			);
			this.#isUpgradeable = Object.keys(this.#upgrades).length > 0;

			// FIXME: What type is this?
			this.#pipes = [];

			this.#inputs = Object.values(config.upgrades).map(
				(_, index) => new InputState(this, index)
			);
			this.#outputs = Object.values(config.upgrades).map(
				(_, index) => new OutputState(this, index)
			);

			void Promise.resolve().then(() => this.updatePipes());

			// this.data = player.towns[this.town].machines[this.id];

			// FIXME: What type is this?
			// this.outputHistories = [];

			// FIXME: What type is this?
			// this.inputHistories = [];

			// FIXME: What type is this?
			// this.outputConfHistories = [];

			// FIXME: What type is this?
			// this.inputConfHistories = [];

			// FIXME: What type is this?
			// this.outputDiffs = arr(data.outputs).mapToObject((x, id) => (x.id === undefined ? id : x.id), () => 0);

			// FIXME: Is this a count of updates?
			// this.updates = 0;
		}

		get isFullyUpgraded() {
			return (
				this.#isUpgradeable &&
        Object.values<MachineUpgrade<K>>(this.#upgrades).every(
        	upgrade => !upgrade.isUnlocked || upgrade.maxed
        )
			);
		}

		get hasPartialBuyableUpgrades() {
			return (
				this.#isUpgradeable &&
        !this.hasWholeBuyableUpgrades &&
        Object.values<MachineUpgrade<K>>(this.upgrades).find(x => x.canAfford) !== undefined
			);
		}

		get hasWholeBuyableUpgrades() {
			return (
				this.#isUpgradeable &&
        Object.values<MachineUpgrade<K>>(this.#upgrades).find(x => x.canAffordWhole) !== undefined
			);
		}

		// get height() {
		// 	return this.data.min ? 110 : 250;
		// }

		// FIXME: add pipes from Town(?)
		addPipe(machine: ConfiguredMachine<any>, inputId: number, outputId: number) {
			// this.data.pipes[outputId].push([machine.id, inputId]);
			// Pipes[this.town].push({
			// 	out: [this, this.outputs[outputId]],
			// 	in: [machine, machine.inputs[inputId]]
			// });
			// this.updatePipes();
		}

		// FIXME: add pipes from Town(?)
		removePipe(machine: ConfiguredMachine<any>, inputId: number) {
			// 	for (let i = 0; i < this.data.pipes.length; i++) {
			// 		for (let j = 0; j < this.data.pipes[i].length; j++) {
			// 			if (this.data.pipes[i][j][0].toString() === machine.id.toString() &&
			// 				this.data.pipes[i][j][1] === inputId) {
			// 				const idx = Pipes[this.town].findIndex(pipe =>
			// 					pipe.out[0].id.toString() === this.id.toString() &&
			// 					pipe.out[1].id.toString() === this.outputs[i].id.toString() &&
			// 					pipe.in[0].id.toString() === machine.id.toString() &&
			// 					pipe.in[1].id.toString() === machine.inputs[inputId].id.toString()
			// 				);
			// 				if (idx === -1) {
			// 					Modals.message.show("Something probably went wrong when deleting this pipe.");
			// 				} else {
			// 					Pipes[this.town].splice(idx, 1);
			// 				}
			// 				this.data.pipes[i].splice(j, 1);
			// 				this.updatePipes();
			// 				return true;
			// 			}
			// 		}
			// 	}
			// 	return false;
		}

		// FIXME: add pipes from Town(?)
		removeAllPipes(machine: ConfiguredMachine<any>) {
			// 	for (let i = 0; i < this.data.pipes.length; i++) {
			// 		for (let j = 0; j < this.data.pipes[i].length; j++) {
			// 			while (this.data.pipes[i][j] && this.data.pipes[i][j][0].toString() === machine.id.toString()) {
			// 				const idx = Pipes[this.town].findIndex(pipe =>
			// 					pipe.out[0].id.toString() === this.id.toString() &&
			// 					pipe.out[1].id.toString() === this.outputs[i].id.toString() &&
			// 					pipe.in[0].id.toString() === machine.id.toString() &&
			// 					pipe.in[1].id.toString() === this.data.pipes[i][j][1].toString()
			// 				);
			// 				Pipes[this.town].splice(idx, 1);
			// 				this.data.pipes[i].splice(j, 1);
			// 			}
			// 		}
			// 	}
			// this.updatePipes();
		}

		// FIXME: add pipes from Town(?)
		updatePipes() {
			// this.#pipes = this.data.pipes.map(p => p.map(x => {
			// 	const machine = MachinesById[this.town][x[0]];
			// 	return [machine, machine.inputs[x[1]]];
			// }));
		}

		inputItem(index: number) {
			return this.#inputs[index].lastResource;
		}

		outputItem(index: number) {
			return this.#outputs[index].lastResource;
		}

		// toggleMinimized() {
		// 	this.data.min = !this.data.min;
		// }

		// static name = data.name;

		// static newMachine(x, y) {
		// 	const returnObj = {
		// 		x,
		// 		y,
		// 		type: this.name,
		// 		pipes: Array.from(Array(this.outputs ? this.outputs.length : 0), () => []),
		// 		isDefault: false,
		// 		min: false
		// 	};
		// 	if (this.inputs.length) {
		// 		returnObj.inputs = Array.from(Array(this.inputs.length), () => []);
		// 	}
		// 	if (this.outputs.length) {
		// 		returnObj.outputs = Array.from(Array(this.outputs.length), () => []);
		// 	}
		// 	if (this.upgrades && Object.values(this.upgrades).length) {
		// 		returnObj.upgrades = Array(Object.values(this.upgrades).length).fill(0);
		// 		returnObj.upgradesPrepay = Array(Object.values(this.upgrades).length).fill(0);
		// 	}
		// 	return returnObj;
		// }
	};
}