import { GameDatabase } from "../game-database";

import { machineUpg } from "./init";

GameDatabase.machines.quarry = {
	name: "quarry",
	inputs: [],
	outputs: [{
		capacity: () => 10,
		produces: {
			resource: "coal",
			amount: 0.05
		},
		isUnlocked: machine => machine.upgrades.unlock.maxed
	}],
	upgrades: machineUpg([{
		name: "unlock",
		cost: 2.34e100,
		max: 1,
		title: "Unlock",
		description: "Unlock the quarry.",
		effect: count => Boolean(count),
		formatEffect: effect => effect ? "Unlocked" : "Not unlocked"
	}]),
	description: `Produces Coal.`
};