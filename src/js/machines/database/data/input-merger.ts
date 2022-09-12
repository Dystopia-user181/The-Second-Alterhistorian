import { Machine, Pipe } from "../../logic";

import { defineMachine } from "../builder";

import { MaybeResourceType, ResourceType, ResourceTypes } from "@/types/resources";

export default defineMachine({
	name: "inputMerger",
	meta: () => ({
		produces0: 0,
		consumes0: 0,
		consumes1: 0,
		consumes2: 0,
		lastDiff: 0,
		updates: 0,
		inputResource: "none" as MaybeResourceType,
	}),
	inputs: [
		{
			accepts: ResourceTypes,
			capacity: () => 20,
			consumes: machine => machine.meta.consumes0 / machine.meta.lastDiff,
		},
		{
			accepts: ResourceTypes,
			capacity: () => 20,
			consumes: machine => machine.meta.consumes1 / machine.meta.lastDiff,
		},
		{
			accepts: ResourceTypes,
			capacity: () => 20,
			consumes: machine => machine.meta.consumes2 / machine.meta.lastDiff,
		},
	],
	outputs: [
		{
			capacity: () => 60,
			produces: machine => ({
				resource: machine.meta.inputResource,
				amount: machine.meta.produces0,
			}),
		},
	],
	upgrades: {},
	customLoop(diff) {
		const cycle = [
			Math.floor(this.meta.updates / 30) % 3,
			Math.floor(this.meta.updates / 30 + 1) % 3,
			Math.floor(this.meta.updates / 30 + 2) % 3,
		];
		// eslint-disable-next-line no-nested-ternary
		const inputResource = this.inputItem(cycle[0])
			? this.inputItem(cycle[0]).resource
			: // eslint-disable-next-line no-nested-ternary
			this.inputItem(cycle[1])
				? this.inputItem(cycle[1]).resource
				: this.inputItem(cycle[2])
					? this.inputItem(cycle[2]).resource
					: "none";
		this.meta.inputResource = inputResource;
		const production = 4 * diff;
		const maximum = this.outputs[0].spaceLeft;
		let amount = 0;
		this.meta.lastDiff = diff;

		Machine.addInputHistory(this);
		if (this.inputItem(0) && this.inputItem(0).resource === inputResource)
			this.meta.consumes0 = this.inputs[0].removeFromStack(Math.min(production, maximum));
		else this.meta.consumes0 = 0;
		amount += this.meta.consumes0;

		if (this.inputItem(1) && this.inputItem(1).resource === inputResource)
			this.meta.consumes1 = this.inputs[1].removeFromStack(Math.min(production, maximum - amount));
		else this.meta.consumes1 = 0;
		amount += this.meta.consumes1;

		if (this.inputItem(2) && this.inputItem(2).resource === inputResource)
			this.meta.consumes2 = this.inputs[2].removeFromStack(Math.min(production, maximum - amount));
		else this.meta.consumes2 = 0;
		amount += this.meta.consumes2;

		this.meta.produces0 =
			this.outputs[0].addToStack({
				resource: inputResource,
				amount,
			}) / diff;
		this.outputDiffs[0] = diff;
		this.outputs[0].otherwiseDiff = diff;

		Machine.addOutputHistory(this);
		Pipe.tickPipes(this, diff);
	},
	description: `Merges three inputs into one single stream.`,
});