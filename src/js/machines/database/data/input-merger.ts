import { Machine, Pipe } from "../../logic";

import { Currencies } from "@/js/currencies/currencies.ts";
import { GameDatabase } from "@/js/database/index";

import { defineMachine } from "../builder";

export default defineMachine({
	name: "inputMerger",
	inputs: [{
		accepts: Object.keys(Currencies),
		capacity: () => 20,
		consumes: machine => machine.consumes0 / machine.lastDiff
	},
	{
		accepts: Object.keys(Currencies),
		capacity: () => 20,
		consumes: machine => machine.consumes1 / machine.lastDiff
	},
	{
		accepts: Object.keys(Currencies),
		capacity: () => 20,
		consumes: machine => machine.consumes2 / machine.lastDiff
	}],
	outputs: [{
		capacity: () => 60,
		produces: machine => ({
			resource: machine.inputResource,
			amount: machine.produces0
		})
	}],
	customLoop(diff) {
		const cycle = [
			Math.floor(this.updates / 30) % 3,
			Math.floor(this.updates / 30 + 1) % 3,
			Math.floor(this.updates / 30 + 2) % 3
		];
		// eslint-disable-next-line no-nested-ternary
		const inputResource = this.inputItem(cycle[0]) ? this.inputItem(cycle[0]).resource : (
			// eslint-disable-next-line no-nested-ternary
			this.inputItem(cycle[1]) ? this.inputItem(cycle[1]).resource : (
				this.inputItem(cycle[2]) ? this.inputItem(cycle[2]).resource : ""
			)
		);
		this.inputResource = inputResource;
		const production = 4 * diff;
		const maximum = this.outputs[0].spaceLeft;
		let amount = 0;
		this.lastDiff = diff;

		Machine.addInputHistory(this);
		if (this.inputItem(0) && this.inputItem(0).resource === inputResource)
			this.consumes0 = this.inputs[0].removeFromStack(Math.min(production, maximum));
		else
			this.consumes0 = 0;
		amount += this.consumes0;

		if (this.inputItem(1) && this.inputItem(1).resource === inputResource)
			this.consumes1 = this.inputs[1].removeFromStack(Math.min(production, maximum - amount));
		else
			this.consumes1 = 0;
		amount += this.consumes1;

		if (this.inputItem(2) && this.inputItem(2).resource === inputResource)
			this.consumes2 = this.inputs[2].removeFromStack(Math.min(production, maximum - amount));
		else
			this.consumes2 = 0;
		amount += this.consumes2;

		this.produces0 = this.outputs[0].addToStack({
			resource: inputResource,
			amount
		}) / diff;
		this.outputDiffs[0] = diff;
		this.outputs[0].otherwiseDiff = diff;

		Machine.addOutputHistory(this);
		Pipe.tickPipes(this, diff);
	},
	description: `Merges three inputs into one single stream.`
};