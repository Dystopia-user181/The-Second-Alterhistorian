import { run, str } from "@/utils";

import { MaybeResourceType, ResourceData, ResourceType } from "@/types/resources";
import { TownType } from "@/js/towns";
import { UIEvent } from "@/js/ui/events";

function mapObject<T extends Record<K, unknown>, K extends string, R>(
	input: T,
	map: (value: T[K], index: number) => R
) {
	return Object.fromEntries(Object.entries(input).map(([key, value], index) => [key, map(value as T[K], index)])) as {
		[key in K]: R;
	};
}

// ============= Config ============ //

export type InputConfig<Instance> = {
	accepts: readonly ResourceType[] | ((machine: Instance) => ResourceType[]);
	capacity: number | ((machine: Instance) => number);
	consumes: number | ((machine: Instance) => number) | ((machine: Instance) => { amount: number; maximum: number });
	label?: string;
	isUnlocked?: boolean | ((machine: Instance) => boolean);
};

interface OutputRequirement {
	resource: ResourceType | "none";
	amount: number;
	inputId: number;
}

export interface OutputConfig<Instance> {
	id?: "main";
	capacity: number | ((machine: Instance) => number);
	produces: ResourceData | ((machine: Instance) => ResourceData);
	isUnlocked?: (machine: Instance) => boolean;
	// FIXME: Combine requires and requiresList
	requires?: (machine: Instance) => OutputRequirement;
	requiresList?: (machine: Instance) => Array<OutputRequirement>;
}

export interface UpgradeConfig<K extends string, Meta, E = any> {
	cost: number | ((count: number) => number);
	description: string | ((upgrade: MachineUpgrade<K>) => string);
	effect: number | ((count: number) => E);
	max: number;
	name: string;
	title: string | ((upgrade: MachineUpgrade<K>) => string);

	currencyType?: ResourceType | undefined | ((count: number) => ResourceType | undefined);
	formatEffect?: (effect: E) => string;
	isUnlocked?: (machine: ConfiguredMachine<K, Meta>) => boolean;
}

export interface MachineConfig<K extends string, Meta = never> {
	name: string;

	/** The description of the machine that will be displayed to the user */
	description: string;
	upgrades: Record<K, UpgradeConfig<K, unknown>>;
	inputs: InputConfig<ConfiguredMachine<K, Meta>>[];
	outputs: OutputConfig<ConfiguredMachine<K, Meta>>[];

	meta?: () => Meta;

	customLoop?: (this: ConfiguredMachine<K, Meta>, diff: number) => void;
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
	readonly lastItem: ResourceData;
	readonly lastResource: ResourceType;
	readonly spaceLeft: number;

	volume(): number;
	volume(value: number): void;

	addToStack(item: ResourceData): number;
	removeFromStack(amount: number): number;
}

declare class InputState<K extends string, Meta> extends GenericStackState {
	constructor(machine: ConfiguredMachine<K, Meta>, id: number);
	readonly accepts: number[];
	readonly consumes: number;
}

declare class OutputState<K extends string, Meta> extends GenericStackState {
	constructor(machine: ConfiguredMachine<K, Meta>, id: number);
	readonly produces: number;
	readonly requires: number;
	readonly requiresList: number;

	// Looks like a hack?
	otherwiseDiff?: number;
}

interface PipeConnection<InputUpgrades extends string, OutputUpgrades extends string> {
	in: [ConfiguredMachine<InputUpgrades, unknown>, InputState<InputUpgrades, unknown>];
	out: [ConfiguredMachine<OutputUpgrades, unknown>, OutputState<OutputUpgrades, unknown>];
}

// ============= Untyped globals ============ //

declare const MachinesById: Record<TownType, Record<number, ConfiguredMachine<string, unknown>>>;

declare const Pipes: Record<TownType, PipeConnection<string, string>[]>;

declare const player: {
	money: number;
	holding: {
		resource?: ResourceType;
		amount?: number;
	};
	towns: Record<TownType, Town>;
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
	#parentMachine: ConfiguredMachine<K, unknown>;
	#config: UpgradeConfig<K, unknown>;
	#index: number;
	#count = 0;

	constructor(machine: ConfiguredMachine<K, unknown>, config: UpgradeConfig<K, unknown>, index: number) {
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
		return this.#parentMachine.data.upgradesPrepay[this.id] ?? 0;
	}

	get canAfford() {
		if (this.maxed) return false;

		// TODO: Global player access
		if (!this.currencyType) return player.money >= this.cost;
		return player.holding.resource === this.currencyType && player.holding.amount;
	}

	get canAffordWhole() {
		if (this.maxed) return false;

		// TODO: Global player access
		if (!this.currencyType) return player.money >= this.cost;
		return player.holding.resource === this.currencyType && (player.holding.amount ?? 0) >= this.cost;
	}

	get isUnlocked() {
		return this.#config.isUnlocked?.(this.#parentMachine) ?? true;
	}
}

interface ConfiguredMachineConstructor<K extends string> {
	new (townType: TownType, machineId: number): ConfiguredMachine<K, unknown>;
	newMachine(x: number, y: number): MachineData
}

export interface ConfiguredMachine<K extends string, Meta> extends MachineBase {
	readonly inputs: InputState<K, Meta>[];
	readonly isMinimized: boolean;
	readonly name: string;
	readonly outputs: OutputState<K, Meta>[];
	readonly upgrades: Record<K, MachineUpgrade<K>>;
	inputItem(index: number): ResourceData;
	outputItem(index: number): ResourceData;
	outputDiffs: Record<string, number>;

	meta: Meta;
}

interface MachineData {
	inputs: unknown[];
	isDefault: boolean;
	minimized: boolean;
	outputs: unknown[];
	pipes: Array<[number, number][]>;
	type: string;
	upgrades: number[];
	upgradesPrepay: number[];
	x: number;
	y: number;

	name?: string;
}

export function defineMachine<K extends string, Meta extends Record<string, unknown> = never>(
	config: MachineConfig<K, Meta>
): ConfiguredMachineConstructor<K> {
	return class extends MachineBase {
		#inputs: InputState<K, Meta>[];
		#isUpgradeable = true;
		#outputs: OutputState<K, Meta>[];
		#pipes: [ConfiguredMachine<string, Meta>, InputState<string, Meta>][][] = [];
		#upgrades: Record<K, MachineUpgrade<K>>;
		#meta?: Meta;

		get meta(): Meta | undefined {
			return this.#meta;
		}

		outputHistories: unknown[] = [];
		inputHistories: unknown[] = [];

		outputConfHistories: unknown[] = [];
		inputConfHistories: unknown[] = [];

		outputDiffs: Record<string, number> = {};

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

			this.#upgrades = mapObject(config.upgrades, (config, index) => new MachineUpgrade(this, config, index));
			this.#isUpgradeable = Object.keys(this.#upgrades).length > 0;

			this.#inputs = Object.values(config.upgrades).map((_, index) => new InputState(this, index));
			this.#outputs = Object.values(config.upgrades).map((_, index) => new OutputState(this, index));

			this.#meta = config.meta?.();

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
		addPipe(machine: ConfiguredMachine<string, unknown>, inputId: number, outputId: number) {
			this.data.pipes[outputId].push([machine.id, inputId]);
			// TODO: add pipes from Town(?) instead of global
			Pipes[this.townType].push({
				out: [this, this.#outputs[outputId]],
				in: [machine, machine.inputs[inputId]],
			});
			this.updatePipes();
		}

		// TODO: this crosses over to too many domains
		removePipe(machine: ConfiguredMachine<any, unknown>, inputId: number) {
			for (let i = 0; i < this.data.pipes.length; i++) {
				for (let j = 0; j < this.data.pipes[i].length; j++) {
					if (
						this.data.pipes[i][j][0].toString() === machine.id.toString() &&
						this.data.pipes[i][j][1] === inputId
					) {
						const idx = Pipes[this.townType].findIndex(
							pipe =>
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
		removeAllPipes(machine: ConfiguredMachine<any, unknown>) {
			for (let i = 0; i < this.data.pipes.length; i++) {
				for (let j = 0; j < this.data.pipes[i].length; j++) {
					while (this.data.pipes[i][j] && this.data.pipes[i][j][0].toString() === machine.id.toString()) {
						const idx = Pipes[this.townType].findIndex(
							pipe =>
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
			this.#pipes = this.data.pipes.map(p =>
				p.map(x => {
					const machine = MachinesById[this.townType][x[0]];
					return [machine, machine.inputs[x[1]]];
				})
			) as [ConfiguredMachine<string, Meta>, InputState<string, Meta>][][];
		}

		inputItem(index: number) {
			return this.#inputs[index].lastItem;
		}

		outputItem(index: number) {
			return this.#outputs[index].lastItem;
		}

		static newMachine(x: number, y: number): MachineData {
			return {
				x,
				y,
				type: config.name,
				pipes: Array.from(Array(config.outputs ? config.outputs.length : 0), () => []),
				isDefault: false,
				minimized: false,
				inputs: Array.from(Array(config.inputs.length), () => []),
				outputs: Array.from(Array(config.outputs.length), () => []),
				upgrades: Array(Object.values(config.upgrades).length).fill(0) as number[],
				upgradesPrepay: Array(Object.values(config.upgrades).length).fill(0) as number[],
			};
		}
	};
}