import { defineMachine } from "../builder";

import { player } from "@/js/player";

import { Machine, Pipe } from "@/js/machines/logic";
import { Currencies } from "@/js/currencies/currencies";
import { ResourceTypes } from "@/types/resources";

export default defineMachine({
	name: "autoSeller",
	inputs: [
		{
			accepts: ResourceTypes,
			capacity: () => 60,
			consumes: () => 20,
		},
		{
			accepts: ResourceTypes,
			capacity: () => 60,
			consumes: () => 20,
		},
	],
	outputs: [],
	customLoop(diff) {
		Machine.updateInputStatistics(this, diff);
		Machine.updateOutputStatistics(this, diff);
		for (let i = 0; i < 2; i++) {
			if (!this.inputItem(i)) continue;

			const currency = this.inputItem(i)?.resource ?? "none";
			if (currency === "none") continue;

			const amount = this.inputs[i].removeFromStack(20 * diff);
			player.money += Currencies[currency].value * amount;
		}
		Pipe.tickPipes(this, diff);
	},
	upgrades: {},
	description: `Automagically sells things.`,
});