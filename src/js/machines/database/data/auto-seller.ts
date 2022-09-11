import { Machine, Pipe } from "../../logic";

import { Currencies } from "@/js/currencies/currencies";

import { defineMachine } from "../builder";
import { ResourceTypes } from "@/types/resources";

export default defineMachine({
	name: "autoSeller",
	inputs: [{
		accepts: ResourceTypes,
		capacity: () => 60,
		consumes: () => 20
	}],
	outputs: [],
	customLoop(diff) {
		Machine.addInputHistory(this);
		Machine.addOutputHistory(this);
		if (!this.inputItem(0)) return;
		const currency = this.inputItem(0).resource;
		const amount = this.inputs[0].removeFromStack(20 * diff);
		player.money += Currencies[currency].value * amount;
		Pipe.tickPipes(this, diff);
	},
	description: `Automagically sells things.`
};