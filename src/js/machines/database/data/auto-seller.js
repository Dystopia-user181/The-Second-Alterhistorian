import { Machine, Pipe } from "../../logic";

import { Currencies } from "@/js/database/currencies.ts";
import { GameDatabase } from "@/js/database/index";

import { Stack } from "@/utils";

GameDatabase.machines.autoSeller = {
	name: "autoSeller",
	inputs: [{
		accepts: Object.keys(Currencies),
		capacity: () => 60,
		consumes: () => 20
	}],
	outputs: [],
	customLoop(diff) {
		Machine.addInputHistory(this);
		Machine.addOutputHistory(this);
		if (!this.inputItem(0)) return;
		const currency = this.inputItem(0).resource;
		const amt = Stack.removeFromStack(this.inputs[0].data, 20 * diff);
		player.money += Currencies[currency].value * amt;
		Pipe.tickPipes(this, diff);
	},
	description: `Automagically sells things.`
};