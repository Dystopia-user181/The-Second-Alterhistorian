import { GameDatabase } from "../game-database";

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
	upgrades: {
		unlock: {
			cost: 2,
			max: 1,
			id: 0,
			title: "Unlock",
			description: "Unlock the cistern",
			effect: count => Boolean(count),
			formatEffect: effect => effect ? "Unlocked" : "Not unlocked"
		}
	}
};