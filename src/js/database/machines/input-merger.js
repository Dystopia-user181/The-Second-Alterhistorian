import { GameDatabase } from "../game-database";
import { Stack } from "./../../stack";
import { Currencies } from "./../currencies";

// import { machineUpg } from "./init";

GameDatabase.machines.inputMerger = {
	name: "inputMerger",
	inputs: [{
		accepts: Object.keys(Currencies),
		capacity: () => 20,
		consumes: machine => machine.consumes0 / machine.lastDiff
	}, {
		accepts: Object.keys(Currencies),
		capacity: () => 20,
		consumes: machine => machine.consumes1 / machine.lastDiff
	}, {
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
		const cycle = [Math.floor(Date.now() / 1000) % 3, Math.floor(Date.now() / 1000 + 1) % 3, Math.floor(Date.now() / 1000 + 2) % 3];
		const inputResource = this.inputItem(cycle[0]) ? this.inputItem(cycle[0]).resource : (
			this.inputItem(cycle[1]) ? this.inputItem(cycle[1]).resource : (
				this.inputItem(cycle[2]) ? this.inputItem(cycle[2]).resource : ""
			)
		);
		this.inputResource = inputResource;
		const production = 4 * diff, maximum = this.outputs[0].config.capacity - Stack.volumeOfStack(this.outputs[0].data);
		let amt = 0;
		this.lastDiff = diff;

		Machine.addInputHistory(this);
		if (this.inputItem(0) && this.inputItem(0).resource === inputResource)
			this.consumes0 = Stack.removeFromStack(this.inputs[0].data, Math.min(production, maximum));
		else
			this.consumes0 = 0;
		amt += this.consumes0;

		if (this.inputItem(1) && this.inputItem(1).resource === inputResource)
			this.consumes1 = Stack.removeFromStack(this.inputs[1].data, Math.min(production, maximum - amt));
		else
			this.consumes1 = 0;
		amt += this.consumes1;
	
		if (this.inputItem(2) && this.inputItem(2).resource === inputResource)
			this.consumes2 = Stack.removeFromStack(this.inputs[2].data, Math.min(production, maximum - amt));
		else
			this.consumes2 = 0;
		amt += this.consumes2;

		this.produces0 = Stack.addToStack(this.outputs[0].data, {
			resource: inputResource,
			amount: amt
		}, this.outputs[0].config.capacity) / diff;
		this.outputDiffs[0] = diff;
		this.outputs[0].otherwiseDiff = diff;

		Machine.addOutputHistory(this);
		Pipe.tickPipes(this, diff);
	},
	description: `Merges three inputs into one single stream.`
};