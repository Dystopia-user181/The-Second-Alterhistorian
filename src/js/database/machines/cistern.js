import { GameDatabase } from "../game-database";

import { machineUpg } from "./init";

GameDatabase.machines.cistern = {
	name: "cistern",
	inputs: [],
	outputs: [{
		capacity: () => 5,
		produces: {
			resource: "water",
			amount: 0.15
		},
		isUnlocked: machine => machine.upgrades.unlock.maxed
	}],
	upgrades: machineUpg([{
		name: "unlock",
		cost: 2,
		max: 1,
		title: "Unlock",
		description: "Unlock the cistern",
		effect: count => Boolean(count),
		formatEffect: effect => effect ? "Unlocked" : "Not unlocked"
	}])
};