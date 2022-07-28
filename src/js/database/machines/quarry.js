import { GameDatabase } from "../game-database";

import { machineUpg } from "./init";

GameDatabase.machines.quarry = {
	name: "quarry",
	inputs: [],
	outputs: [{
		capacity: () => 10,
		produces: {
			resource: "stone",
			amount: 0.15
		},
		isUnlocked: machine => machine.upgrades.unlock.maxed
	},
	{
		capacity: () => 5,
		produces: {
			resource: "coal",
			amount: 0.04
		},
		isUnlocked: machine => machine.upgrades.unlock.maxed
	}],
	upgrades: machineUpg([{
		name: "unlock",
		cost: 55,
		currencyType: "bricks",
		max: 1,
		title: "Build",
		description: "Build the quarry.",
		effect: count => Boolean(count),
		formatEffect: () => "",
		isUnlocked: machine => !machine.upgrades.unlock.effect
	}]),
	description: `Produces Stone and Coal.`
};