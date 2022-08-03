import { GameDatabase } from "../game-database";
import { Stack } from "./../../stack";
import { Currencies } from "./../currencies";

// import { machineUpg } from "./init";

GameDatabase.machines.autoSeller = {
	name: "autoSeller",
	inputs: [{
		accepts: Object.keys(Currencies),
		capacity: () => 60,
		consumes: () => 20
	}],
	outputs: [],
	customLoop(diff) {
		if (!this.inputItem(0)) return;
		const currency = this.inputItem(0).resource;
		Machine.addInputHistory(this);
		Machine.addOutputHistory(this);
		const amt = Stack.removeFromStack(this.inputs[0].data, 20 * diff);
		player.money += Currencies[currency].value * amt;
		Pipe.tickPipes(this, diff);
	},
	description: `Automagically sells things.`
};