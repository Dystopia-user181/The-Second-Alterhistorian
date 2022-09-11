import { run, str } from "@/utils";

import { ResourceData, ResourceType } from "@/types/resources";
import { TownType } from "@/js/towns";
import { UIEvent } from "@/js/ui/events";

function mapObject<T extends Record<K, unknown>, K extends string, R>(
	input: T,
	map: (value: T[K], index: number) => R
) {
	return Object.fromEntries(
		Object.entries(input).map(([key, value], index) => [key, map(value as T[K], index)])
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
	id: "main" | undefined
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
	name: string
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
	inputs: InputConfig<ConfiguredMachine<K>>[];
	outputs: OutputConfig<ConfiguredMachine<K>>[];
}

// ============= Untyped objects ============ //

declare class Town {
	machines: MachineData[];
}

declare abstract class GenericStackState {
	readonly id: number;
	readonly capacity: number;
	readonly isCapped: boolean;
	readonly isUnlocked: boolean;
	readonly label: string;
	readonly lastItem: ResourceType;
	readonly lastResource: ResourceType;
	readonly spaceLeft: number;

	volume(): number;
	volume(value: number): void

	addToStack(item: ResourceData): number;
	removeFromStack(item: ResourceData): number;
}

declare class InputState<K extends string> extends GenericStackState {
	constructor(machine: ConfiguredMachine<K>, id: number);
	readonly accepts: number[];
	readonly consumes: number;
}

declare class OutputState<K extends string> extends GenericStackState {
	constructor(machine: ConfiguredMachine<K>, id: number);
	readonly produces: number;
	readonly requires: number;
	readonly requiresList: number;
}

interface PipeConnection<InputUpgrades extends string, OutputUpgrades extends string> {
	in: [ConfiguredMachine<InputUpgrades>, InputState<InputUpgrades>]
	out: [ConfiguredMachine<OutputUpgrades>, OutputState<OutputUpgrades>]
}

// ============= Untyped globals ============ //

declare const MachinesById: Record<TownType, Record<number, ConfiguredMachine<string>>>;

declare const Pipes: Record<TownType, PipeConnection<string, string>[]>;

declare const player: {
	money: number,
	holding: {
		resource?: ResourceType,
		amount?: number
	},
	towns: Record<TownType, Town>
};

// ============= Instances ============ //

export class MachineBase {
	#data: MachineData;
	#id: number;
	#townType: TownType;

	get data() {
		return this.#data;
	}

	get height() {
		return this.isMinimized ? 110 : 250;
	}

	get id() {
		return this.#id;
	}

	get isMinimized() {
		return this.data.minimized;
	}

	toggleMinimized() {
		this.data.minimized = !this.data.minimized;
	}

	get townType() {
		return this.#townType;
	}

	constructor(townType: TownType, machineId: number) {
		this.#townType = townType;
		this.#id = machineId;

		this.#data = player.towns[this.townType].machines[this.id];
	}
}

export class MachineUpgrade<K extends string> {
	#parentMachine: ConfiguredMachine<K>;
	#config: UpgradeConfig<K>;
	#index: number;
	#count = 0;

	constructor(machine: ConfiguredMachine<K>, config: UpgradeConfig<K>, index: number) {
		this.#parentMachine = machine;
		this.#config = config;
		this.#index = index;
	}

	// FIXME: effect needs to be typed
	public effect: any = 0;

	get cost() {
		return run(this.#config.cost, this.count) - this.prepay;
	}

	get count() {
		return this.#count;
	}

	set count(value: number) {
		this.#count = value;
	}

	get currencyType() {
		return this.#config.currencyType;
	}

	get id(): number {
		return this.#index;
	}

	get maxed() {
		return this.#count >= this.#config.max;
	}

	get prepay() {
		return this.#parentMachine.data.upgradesPrepay[this.id];
	}

	get canAfford() {
		if (this.maxed) return false;

		// FIXME: Global player access
		if (!this.currencyType) return player.money >= this.cost;
		return player.holding.resource === this.currencyType && player.holding.amount;
	}

	get canAffordWhole() {
		if (this.maxed) return false;

		// FIXME: Global player access
		if (!this.currencyType) return player.money >= this.cost;
		return player.holding.resource === this.currencyType && (player.holding.amount ?? 0) >= this.cost;
	}

	get isUnlocked() {
		return this.#config.isUnlocked?.(this.#parentMachine) ?? true;
	}
}

interface ConfiguredMachineConstructor<K extends string> {
	new (townType: TownType, machineId: number): ConfiguredMachine<K>;
}

export interface ConfiguredMachine<K extends string> extends MachineBase {
	readonly inputs: InputState<K>[];
	readonly isMinimized: boolean;
	readonly name: string;
	readonly outputs: OutputState<K>[];
	readonly upgrades: Record<K, MachineUpgrade<K>>;
}

// interface MachineOptions {
// 	machineId: string
// 	town: Town
// 	x: number
// 	y: number
// 	isDefault: boolean
// 	minimized: boolean
// }

// const defaultMachineOptions = {
// 	x: 0,
// 	y: 0,
// 	isDefault: false,
// 	minimized: false,
// };

interface MachineData {
	upgradesPrepay: number[]
	name?: string;
	minimized: boolean
	pipes: Array<[number, number][]>
}

export function defineMachine<K extends string>(
	config: MachineConfig<K>
): ConfiguredMachineConstructor<K> {
	return class extends MachineBase {
		#inputs: InputState<K>[];
		#isUpgradeable = true;
		#outputs: OutputState<K>[];
		#pipes: [ConfiguredMachine<string>, InputState<string>][][] = [];
		#upgrades: Record<K, MachineUpgrade<K>>;

		outputHistories: unknown[] = [];
		inputHistories: unknown[] = [];

		outputConfHistories: unknown[] = [];
		inputConfHistories: unknown[] = [];

		outputDiffs: Record<string, number> = {};
		updates = 0;

		get name() {
			return config.name;
		}

		get displayName() {
			return this.data.name || str(this.name).capitalize;
		}

		get inputs() {
			return this.#inputs;
		}

		get isUpgradeable() {
			return this.#isUpgradeable;
		}

		get outputs() {
			return this.#outputs;
		}

		get upgrades() {
			return this.#upgrades;
		}

		constructor(townType: TownType, machineId: number) {
			super(townType, machineId);

			this.#upgrades = mapObject(
				config.upgrades,
				(config, index) => new MachineUpgrade(this, config, index)
			);
			this.#isUpgradeable = Object.keys(this.#upgrades).length > 0;

			this.#inputs = Object.values(config.upgrades).map(
				(_, index) => new InputState(this, index)
			);
			this.#outputs = Object.values(config.upgrades).map(
				(_, index) => new OutputState(this, index)
			);

			this.outputDiffs = Object.fromEntries(
				config.outputs.map((output, index) => [output.id ?? index.toString(), 0])
			);

			void Promise.resolve().then(() => this.updatePipes());
		}

		get isFullyUpgraded() {
			return (
				this.isUpgradeable &&
				Object.values<MachineUpgrade<K>>(this.#upgrades).every(
					upgrade => !upgrade.isUnlocked || upgrade.maxed
				)
			);
		}

		get hasPartialBuyableUpgrades() {
			return (
				this.isUpgradeable &&
				!this.hasWholeBuyableUpgrades &&
				Object.values<MachineUpgrade<K>>(this.upgrades).find(x => x.canAfford) !== undefined
			);
		}

		get hasWholeBuyableUpgrades() {
			return (
				this.isUpgradeable &&
				Object.values<MachineUpgrade<K>>(this.#upgrades).find(x => x.canAffordWhole) !== undefined
			);
		}

		// TODO: this crosses over to too many domains
		addPipe(machine: ConfiguredMachine<string>, inputId: number, outputId: number) {
			this.data.pipes[outputId].push([machine.id, inputId]);
			// TODO: add pipes from Town(?) instead of global
			Pipes[this.townType].push({
				out: [this, this.#outputs[outputId]],
				in: [machine, machine.inputs[inputId]]
			});
			this.updatePipes();
		}

		// TODO: this crosses over to too many domains
		removePipe(machine: ConfiguredMachine<any>, inputId: number) {
			for (let i = 0; i < this.data.pipes.length; i++) {
				for (let j = 0; j < this.data.pipes[i].length; j++) {
					if (this.data.pipes[i][j][0].toString() === machine.id.toString() &&
							this.data.pipes[i][j][1] === inputId) {
						const idx = Pipes[this.townType].findIndex(pipe =>
							pipe.out[0].id.toString() === this.id.toString() &&
								pipe.out[1].id.toString() === this.outputs[i].id.toString() &&
								pipe.in[0].id.toString() === machine.id.toString() &&
								pipe.in[1].id.toString() === machine.inputs[inputId].id.toString()
						);
						if (idx === -1) {
							UIEvent.dispatch("ERROR", "Something probably went wrong when deleting this pipe.");
						} else {
							Pipes[this.townType].splice(idx, 1);
						}
						this.data.pipes[i].splice(j, 1);
						this.updatePipes();
						return true;
					}
				}
			}
			return false;
		}

		// TODO: this crosses over to too many domains
		removeAllPipes(machine: ConfiguredMachine<any>) {
			for (let i = 0; i < this.data.pipes.length; i++) {
				for (let j = 0; j < this.data.pipes[i].length; j++) {
					while (this.data.pipes[i][j] && this.data.pipes[i][j][0].toString() === machine.id.toString()) {
						const idx = Pipes[this.townType].findIndex(pipe =>
							pipe.out[0].id.toString() === this.id.toString() &&
								pipe.out[1].id.toString() === this.outputs[i].id.toString() &&
								pipe.in[0].id.toString() === machine.id.toString() &&
								pipe.in[1].id.toString() === this.data.pipes[i][j][1].toString()
						);
						Pipes[this.townType].splice(idx, 1);
						this.data.pipes[i].splice(j, 1);
					}
				}
			}
			this.updatePipes();
		}

		// TODO: this crosses over to too many domains
		updatePipes() {
			this.#pipes = this.data.pipes.map(p => p.map(x => {
				const machine = MachinesById[this.townType][x[0]];
				return [machine, machine.inputs[x[1]]];
			}));
		}

		inputItem(index: number) {
			return this.#inputs[index].lastItem;
		}

		outputItem(index: number) {
			return this.#outputs[index].lastItem;
		}

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

// interface MachineData {
// 	x: number
// 	y: number
// 	type: string,
// 	pipes: unknown[]
// 	inputs: unknown[]
// 	outputs: unknown[]
// 	isDefault: boolean
// 	minimized: boolean
// }