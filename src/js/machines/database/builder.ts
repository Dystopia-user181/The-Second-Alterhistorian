import { MachinesById, Pipes } from "../player-proxy-wip";

import { InputState, OutputState, UpgradeState } from "@/js/machines/state";

import { MachineConfig, MachineData } from "@/js/machines/database/config";
import { mapObjectValues, nonNegativeMod, str } from "@/utils";
import { ResourceData } from "@/types/resources";
import { TownType } from "@/js/towns";
import { UIEvent } from "@/js/ui/events";

abstract class MachineBase {
	private _data: MachineData;
	private _id: number;
	private _townType: TownType;

	get data() {
		return this._data;
	}

	get height() {
		return this.isMinimized ? 110 : 250;
	}

	get id() {
		return this._id;
	}

	get isMinimized() {
		return this.data.minimized;
	}

	toggleMinimized() {
		this.data.minimized = !this.data.minimized;
	}

	get townType() {
		return this._townType;
	}

	get town() {
		// eslint-disable-next-line no-console
		console.warn("Machine.town is deprecated, use Machine.townType instead");
		return this._townType;
	}

	constructor(townType: TownType, machineId: number) {
		this._townType = townType;
		this._id = machineId;

		// TODO: This should probably just be passed in
		this._data = player.towns[this.townType].machines[this.id];
	}
}

interface ConfiguredMachineConstructor<UpgradeKeys extends string, Meta extends Record<string, any>> {
	new (townType: TownType, machineId: number): ConfiguredMachine<UpgradeKeys, Meta>;
	newMachine(x: number, y: number): MachineData;
	readonly config: MachineConfig<UpgradeKeys, Meta>;
}


// This is the type used by the rest of the system for a machine configuration,
// not the one defined by the anonymous class in defineMachine, so this must be
// kept up to date with any changes. If you see weird errors in defineMachine
// that complain about the whole class, it's probably because of a mismatch
// between `defineMachine`'s anonymous class and ConfiguredMachine interface.
export interface ConfiguredMachine<UpgradeKeys extends string, Meta extends Record<string, any>> extends MachineBase {
	readonly config: MachineConfig<UpgradeKeys, Meta>;
	readonly inputs: InputState<UpgradeKeys, Meta>[];
	readonly isMinimized: boolean;
	readonly name: string;
	readonly outputs: OutputState<UpgradeKeys, Meta>[];
	readonly pipes: [ConfiguredMachine<string, Meta>, InputState<UpgradeKeys, Meta>][][];
	readonly upgrades: Record<UpgradeKeys, UpgradeState<UpgradeKeys, Meta>>;

	inputItem(index: number): ResourceData | undefined;
	outputItem(index: number): ResourceData | undefined;

	inputHistories: ResourceData[][][];
	outputHistories: ResourceData[][][];

	inputConfHistories: unknown[];
	outputConfHistories: unknown[];

	meta: Meta;
	outputDiffs: Record<string, number>;
	updates: number
}

// If you make public changes to this, make sure to also update ConfiguredMachine
export function defineMachine<UpgradeKeys extends string, Meta extends Record<string, any>>(
	config: MachineConfig<UpgradeKeys, Meta>
): ConfiguredMachineConstructor<UpgradeKeys, Meta> {
	return class extends MachineBase {
		private _inputs: InputState<UpgradeKeys, Meta>[];
		private _isUpgradeable = true;
		private _meta: Meta;
		private _outputs: OutputState<UpgradeKeys, Meta>[];
		private _pipes: [ConfiguredMachine<string, Meta>, InputState<UpgradeKeys, Meta>][][] = [];
		private _upgrades: Record<UpgradeKeys, UpgradeState<UpgradeKeys, Meta>>;

		updates = 0;

		get meta(): Meta {
			return this._meta;
		}

		inputHistories: ResourceData[][][] = [];
		outputHistories: ResourceData[][][] = [];

		inputConfHistories: unknown[] = [];
		outputConfHistories: unknown[] = [];

		outputDiffs: Record<string, number> = {};

		get config(): MachineConfig<UpgradeKeys, Meta> {
			return config;
		}

		get name() {
			return config.name;
		}

		get displayName() {
			return this.data.name || str(this.name).capitalize;
		}

		get inputs() {
			return this._inputs;
		}

		get isUpgradeable() {
			return this._isUpgradeable;
		}

		get outputs() {
			return this._outputs;
		}

		get pipes() {
			return this._pipes;
		}

		get upgrades() {
			return this._upgrades;
		}

		constructor(townType: TownType, machineId: number) {
			super(townType, machineId);

			this._upgrades = mapObjectValues(
				config.upgrades,
				(config, index) => new UpgradeState(this, config, index)
			);
			this._isUpgradeable = Object.keys(this._upgrades).length > 0;

			this._inputs = config.inputs.map((_, index) => new InputState<UpgradeKeys, Meta>(this, index));
			this._outputs = config.outputs.map((_, index) => new OutputState<UpgradeKeys, Meta>(this, index));

			this._meta = config.meta?.() as Meta;

			this.outputDiffs = Object.fromEntries(
				config.outputs.map((output, index) => [output.id ?? index.toString(), 0])
			);

			void Promise.resolve().then(() => this.updatePipes());
		}

		get isFullyUpgraded() {
			return (
				this.isUpgradeable &&
				Object.values<UpgradeState<UpgradeKeys, Meta>>(this._upgrades).every(
					upgrade => !upgrade.isUnlocked || upgrade.maxed
				)
			);
		}

		get hasPartialBuyableUpgrades() {
			return (
				this.isUpgradeable &&
				!this.hasWholeBuyableUpgrades &&
				Object.values<UpgradeState<UpgradeKeys, Meta>>(this._upgrades).some(x => x.canAfford)
			);
		}

		get hasWholeBuyableUpgrades() {
			return (
				this.isUpgradeable &&
				Object.values<UpgradeState<UpgradeKeys, Meta>>(this._upgrades).some(x => x.canAffordWhole)
			);
		}

		// TODO: this crosses over to too many domains
		addPipe(machine: ConfiguredMachine<string, Record<string, any>>, inputId: number, outputId: number) {
			this.data.pipes[outputId].push([machine.id, inputId]);
			// TODO: add pipes from Town(?) instead of global
			Pipes[this.townType].push({
				out: [this, this._outputs[outputId]],
				in: [machine, machine.inputs[inputId]],
			});
			this.updatePipes();
		}

		// TODO: this crosses over to too many domains
		removePipe(machine: ConfiguredMachine<any, any>, inputId: number) {
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
		removeAllPipes(machine: ConfiguredMachine<any, any>) {
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
			this._pipes = this.data.pipes.map(p =>
				p.map(x => {
					const townMachines = MachinesById[this.townType];
					// MachinesById isn't guaranteed to have the town type
					if (!townMachines) {
						throw `MachinesById is returning an invalid list for #{this.townType}`;
					}
					const machine = townMachines[x[0]];
					return [machine, machine.inputs[x[1]]];
				})
			) as [ConfiguredMachine<string, Meta>, InputState<UpgradeKeys, Meta>][][];
		}

		moveTo(_x: number, _y: number) {
			const maxOffsetX = 5000;
			const maxOffsetY = 4000;
			let x: number, y: number;
			x = _x;
			y = _y;
			if (player.options.snapToGrid && player.options.showGridlines) {
				const gridInterval = 200;
				// Produces a graph like /\/\/\/|\/\/\/\ -- Check if value is higher than a certain threshold
				if (Math.abs(nonNegativeMod(x, gridInterval) - gridInterval / 2) > gridInterval * 0.43 &&
				Math.abs(nonNegativeMod(y, gridInterval) - gridInterval / 2) > gridInterval * 0.43) {
					x = Math.round(x / gridInterval) * gridInterval;
					y = Math.round(y / gridInterval) * gridInterval;
				}
			}
			this.data.x = Math.max(Math.min(x, maxOffsetX), -maxOffsetX);
			this.data.y = Math.max(Math.min(y, maxOffsetY), -maxOffsetY);
		}

		changePositionBy(x: number, y: number) {
			this.moveTo(this.data.x + x, this.data.y + y);
		}

		inputItem(index: number) {
			return this._inputs[index].lastItem;
		}

		outputItem(index: number) {
			return this._outputs[index].lastItem;
		}

		static get config(): Readonly<MachineConfig<UpgradeKeys, Meta>> {
			return config;
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