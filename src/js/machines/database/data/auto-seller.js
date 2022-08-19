import { Machine, Pipe } from "../../logic";

import { Currencies } from "@/js/database/currencies.ts";
import { GameDatabase } from "@/js/database/index";

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
		const amount = this.inputs[0].removeFromStack(20 * diff);
		player.money += Currencies[currency].value * amount;
		Pipe.tickPipes(this, diff);
	},
	description: `Automagically sells things.`
};