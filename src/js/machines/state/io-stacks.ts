import { reactive, Ref, ref } from "vue";

import { ConfiguredMachine, InputConfig, OutputConfig } from "../database/builder";

import { arr, run, Stack } from "@/utils";
import { ResourceData } from "@/types/resources";

class GenericStackState {
	private _volume: Ref<number>;

	data: ResourceData[];
	displayResource: any;
	lastItem?: ResourceData;

	constructor(data: ResourceData[]) {
		this.data = data;
		this._volume = ref(Stack.volumeOfStack(this.data));
		this.displayResource = reactive(["none", Infinity]);
		this.lastItem = undefined;
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
			spaceLeft: this.spaceLeft
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
}

export class InputConfigState<K extends string, Meta extends Record<string, any>> {
	private _config: InputConfig<ConfiguredMachine<K, Meta>>;
	private _machine: ConfiguredMachine<K, Meta>;

	constructor(config: InputConfig<ConfiguredMachine<K, Meta>>, machine: ConfiguredMachine<K, Meta>) {
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

	// FIXME: No configurations define an id, what is this?
	// get id() {
	// 	return this._config.id;
	// }

	get isUnlocked() {
		return this._config.isUnlocked === undefined ? true : run(this._config.isUnlocked, this._machine);
	}

	get raw() {
		return {
			capacity: this.capacity,
			consumes: this.consumes,
			// FIXME: No configurations define an id, what is this?
			// id: this.id,
		};
	}
}

export class InputState<K extends string, Meta extends Record<string, any>> extends GenericStackState {
	private _config: InputConfigState<K, Meta>;
	private _id: number;

	constructor(machine: ConfiguredMachine<K, Meta>, id: number) {
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

export class OutputConfigState<K extends string, Meta extends Record<string, any>> {
	private _config: OutputConfig<ConfiguredMachine<K, Meta>>;
	private _machine: ConfiguredMachine<K, Meta>;

	constructor(config: OutputConfig<ConfiguredMachine<K, Meta>>, machine: ConfiguredMachine<K, Meta>) {

		// constructor(config, machine) {
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

	// FIXME: No outputs define a label, seems like this should be removed
	// get label() {
	// 	return run(this._config.label, this._machine);
	// }

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


export class OutputState<K extends string, Meta extends Record<string, any>> extends GenericStackState {
	private _config: OutputConfigState<K, Meta>;
	private _id: number;

	otherwiseDiff = 0;

	constructor(machine: ConfiguredMachine<K, Meta>, id: number) {
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

	// FIXME: No outputs define a label, seems like this should be removed
	// get label() {
	// 	return this.config.label;
	// }

	get isUnlocked() {
		return this._config.isUnlocked;
	}
}