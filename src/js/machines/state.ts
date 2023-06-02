import { reactive, Ref, ref } from "vue";

import { InputConfig, OutputConfig, UpgradeConfig } from "./database/config";
import { ConfiguredMachine } from "./database/builder";

import { player } from "@/js/player";

import { arr, formatX, run, Stack } from "@/utils";
import { MaybeResourceType, ResourceData } from "@/types/resources";

class GenericStackState {
	private _volume: Ref<number>;

	data: ResourceData[];
	displayResource: [MaybeResourceType, number];
	lastItem?: ResourceData;

	maxDiff = 0;
	uncappedDiff = 0;

	constructor(data: ResourceData[]) {
		this.data = data;
		this._volume = ref(Stack.volumeOfStack(this.data));
		this.displayResource = reactive<[MaybeResourceType, number]>(["none", Infinity]);
		this.lastItem = arr(this.data).last;
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

	addToStack(item: ResourceData) {
		// Skip capacity because it's only used for spaceLeft
		const amt = Stack.addToStack(this.data, item, 0, {
			spaceLeft: this.spaceLeft,
		});
		this.volume += amt;
		this.lastItem = arr(this.data).last || undefined;
		return amt;
	}

	removeFromStack(amount: number) {
		const amt = Stack.removeFromStack(this.data, amount);
		if (this.data.length) this.volume -= amt;
		else this.volume = 0;
		this.lastItem = arr(this.data).last;
		return amt;
	}

	unclog() {
		for (let i = 0; i < this.data.length; i++) {
			while (this.data[i] && this.data[i].amount < 3e-3) {
				this.volume -= this.data[i].amount;
				this.data.splice(i, 1);
			}
		}
		this.lastItem = arr(this.data).last;
	}
}

export class InputConfigState<UpgradeKeys extends string, Meta extends Record<string, any>> {
	private _config: InputConfig<ConfiguredMachine<UpgradeKeys, Meta>>;
	private _machine: ConfiguredMachine<UpgradeKeys, Meta>;

	constructor(
		config: InputConfig<ConfiguredMachine<UpgradeKeys, Meta>>,
		machine: ConfiguredMachine<UpgradeKeys, Meta>
	) {
		this._config = config;
		this._machine = machine;
	}

	get capacity() {
		return run(this._config.capacity, this._machine);
	}

	get consumes() {
		return run(this._config.consumes, this._machine);
	}

	get accepts() {
		return run(this._config.accepts, this._machine);
	}

	get label() {
		return run(this._config.label, this._machine);
	}

	get isUnlocked() {
		return this._config.isUnlocked === undefined ? true : run(this._config.isUnlocked, this._machine);
	}

	get raw() {
		return {
			capacity: this.capacity,
			consumes: this.consumes,
		};
	}
}

export class InputState<UpgradeKeys extends string, Meta extends Record<string, any>> extends GenericStackState {
	private _config: InputConfigState<UpgradeKeys, Meta>;
	private _id: number;

	constructor(machine: ConfiguredMachine<UpgradeKeys, Meta>, id: number) {
		super(machine.data.inputs[id]);
		this._config = new InputConfigState(machine.config.inputs[id], machine);
		this._id = id;
	}

	get id() {
		return this._id;
	}

	get config() {
		return this._config;
	}

	get capacity() {
		return this._config.capacity;
	}

	get consumes() {
		return this._config.consumes;
	}

	get accepts() {
		return this._config.accepts;
	}

	get label() {
		return this._config.label;
	}

	get isUnlocked() {
		return this._config.isUnlocked;
	}
}

export class OutputConfigState<UpgradeKeys extends string, Meta extends Record<string, any>> {
	private _config: OutputConfig<ConfiguredMachine<UpgradeKeys, Meta>>;
	private _machine: ConfiguredMachine<UpgradeKeys, Meta>;

	constructor(
		config: OutputConfig<ConfiguredMachine<UpgradeKeys, Meta>>,
		machine: ConfiguredMachine<UpgradeKeys, Meta>
	) {
		this._config = config;
		this._machine = machine;
	}

	get capacity() {
		return run(this._config.capacity, this._machine);
	}

	get produces() {
		return run(this._config.produces, this._machine);
	}

	get requires() {
		return run(this._config.requires, this._machine);
	}

	get requiresList() {
		return run(this._config.requiresList, this._machine);
	}

	get id() {
		return this._config.id;
	}

	get isUnlocked() {
		return this._config.isUnlocked === undefined ? true : run(this._config.isUnlocked, this._machine);
	}

	get raw() {
		return {
			capacity: this.capacity,
			produces: this.produces,
			id: this.id,
		};
	}
}

export class OutputState<UpgradeKeys extends string, Meta extends Record<string, any>> extends GenericStackState {
	private _config: OutputConfigState<UpgradeKeys, Meta>;
	private _id: number;

	constructor(machine: ConfiguredMachine<UpgradeKeys, Meta>, id: number) {
		super(machine.data.outputs[id]);

		this._config = new OutputConfigState(machine.config.outputs[id], machine);
		this._id = id;
	}

	get id() {
		return this._id;
	}

	get config() {
		return this._config;
	}

	get capacity() {
		return this._config.capacity;
	}

	get produces() {
		return this._config.produces;
	}

	get requires() {
		return this._config.requires;
	}

	get requiresList() {
		return this._config.requiresList;
	}

	get isUnlocked() {
		return this._config.isUnlocked;
	}
}

export class UpgradeState<UpgradeKeys extends string, Meta extends Record<string, any>> {
	private _parentMachine: ConfiguredMachine<UpgradeKeys, any>;
	private _config: UpgradeConfig<UpgradeKeys, any>;
	private _index: number;

	constructor(machine: ConfiguredMachine<UpgradeKeys, any>, config: UpgradeConfig<UpgradeKeys, Meta>, index: number) {
		this._parentMachine = machine;
		this._config = config;
		this._index = index;
	}

	// TODO: effect can be typed if TypeScript ships `satisfies` operator in 4.9
	get effect(): any {
		// eslint-disable-next-line @typescript-eslint/no-unsafe-return
		return run(this._config.effect, this.count);
	}

	get formattedEffect(): string {
		// eslint-disable-next-line max-len
		// eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-argument
		return this._config.formatEffect ? this._config.formatEffect(this.effect) : formatX(this.effect, 2, 1);
	}

	get cost() {
		return run(this._config.cost, this.count) - this.prepay;
	}

	get count() {
		return this._parentMachine.data.upgrades[this.id];
	}

	set count(value: number) {
		this._parentMachine.data.upgrades[this.id] = value;
	}

	get currencyType() {
		return run(this._config.currencyType, this.count);
	}

	get description(): string {
		return run(this._config.description, this);
	}

	get id(): number {
		return this._index;
	}

	get maxed() {
		return this.count >= this._config.max;
	}

	get title(): string {
		return run(this._config.title, this);
	}

	get prepay() {
		return this._parentMachine.data.upgradesPrepay[this.id] ?? 0;
	}

	get canAfford() {
		if (this.maxed || this.currencyType === null)
			return false;

		// TODO: Global player access
		if (!this.currencyType)
			return player.money >= this.cost;
		return player.holding.resource === this.currencyType && player.holding.amount;
	}

	get canAffordWhole() {
		if (this.maxed || this.currencyType === null)
			return false;

		// TODO: Global player access
		if (!this.currencyType)
			return player.money >= this.cost;
		return player.holding.resource === this.currencyType && (player.holding.amount ?? 0) >= this.cost;
	}

	get isUnlocked() {
		return this._config.isUnlocked?.(this._parentMachine) ?? true;
	}

	buy() {
		if (!this.canAfford || this.maxed)
			return;

		if (!this.canAffordWhole) {
			this._parentMachine.data.upgradesPrepay[this.id] += player.holding.amount ?? 0;
			player.holding.amount = 0;
			return;
		}
		if (isNaN(this.count)) this.count = 0;

		if (this.currencyType) {
			if (player.holding.amount) {
				player.holding.amount -= this.cost;
			}
			this.count++;
			this._parentMachine.data.upgradesPrepay[this.id] = 0;
			return;
		}

		player.money -= this.cost;
		this.count++;
	}
}