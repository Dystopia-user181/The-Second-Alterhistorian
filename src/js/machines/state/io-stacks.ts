import { reactive, Ref, ref } from "vue";

import { ConfiguredMachine, InputConfig, OutputConfig } from "../database/builder";

import { arr, run, Stack } from "@/utils";
import { ResourceData } from "@/types/resources";

class GenericStackState {
	data: ResourceData[];
	_volume: Ref<number>;
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
	#config: InputConfig<ConfiguredMachine<K, Meta>>;
	#machine: ConfiguredMachine<K, Meta>;

	constructor(config: InputConfig<ConfiguredMachine<K, Meta>>, machine: ConfiguredMachine<K, Meta>) {
		this.#config = config;
		this.#machine = machine;
	}

	get capacity() {
		return run(this.#config.capacity, this.#machine);
	}

	get consumes() {
		return run(this.#config.consumes, this.#machine);
	}

	get accepts() {
		return run(this.#config.accepts, this.#machine);
	}

	get label() {
		return run(this.#config.label, this.#machine);
	}

	// FIXME: No configurations define an id, what is this?
	// get id() {
	// 	return this.#config.id;
	// }

	get isUnlocked() {
		return this.#config.isUnlocked === undefined ? true : run(this.#config.isUnlocked, this.#machine);
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
	#config: InputConfigState<K, Meta>;
	#id: number;

	constructor(machine: ConfiguredMachine<K, Meta>, id: number) {
		super(machine.data.inputs[id]);
		this.#config = new InputConfigState(machine.config.inputs[id], machine);
		this.#id = id;
	}

	get id() {
		return this.#id;
	}

	get config() {
		return this.#config;
	}

	get capacity() {
		return this.#config.capacity;
	}

	get consumes() {
		return this.#config.consumes;
	}

	get accepts() {
		return this.#config.accepts;
	}

	get label() {
		return this.#config.label;
	}

	get isUnlocked() {
		return this.#config.isUnlocked;
	}
}

export class OutputConfigState<K extends string, Meta extends Record<string, any>> {
	#config: OutputConfig<ConfiguredMachine<K, Meta>>;
	#machine: ConfiguredMachine<K, Meta>;

	constructor(config: OutputConfig<ConfiguredMachine<K, Meta>>, machine: ConfiguredMachine<K, Meta>) {

		// constructor(config, machine) {
		this.#config = config;
		this.#machine = machine;
	}

	get capacity() {
		return run(this.#config.capacity, this.#machine);
	}

	get produces() {
		return run(this.#config.produces, this.#machine);
	}

	get requires() {
		return run(this.#config.requires, this.#machine);
	}

	get requiresList() {
		return run(this.#config.requiresList, this.#machine);
	}

	// FIXME: No outputs define a label, seems like this should be removed
	// get label() {
	// 	return run(this.#config.label, this.#machine);
	// }

	get id() {
		return this.#config.id;
	}

	get isUnlocked() {
		return this.#config.isUnlocked === undefined ? true : run(this.#config.isUnlocked, this.#machine);
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
	#config: OutputConfigState<K, Meta>;
	#id: number;
	otherwiseDiff = 0;

	constructor(machine: ConfiguredMachine<K, Meta>, id: number) {
		super(machine.data.outputs[id]);

		this.#config = new OutputConfigState(machine.config.outputs[id], machine);
		this.#id = id;
	}

	get id() {
		return this.#id;
	}

	get config() {
		return this.#config;
	}

	get capacity() {
		return this.#config.capacity;
	}

	get produces() {
		return this.#config.produces;
	}

	get requires() {
		return this.#config.requires;
	}

	get requiresList() {
		return this.#config.requiresList;
	}

	// FIXME: No outputs define a label, seems like this should be removed
	// get label() {
	// 	return this.config.label;
	// }

	get isUnlocked() {
		return this.#config.isUnlocked;
	}
}