import { GameDatabase } from "../game-database";

import { machineUpg } from "./init";

GameDatabase.machines.cistern = {
	name: "cistern",
	inputs: [],
	outputs: [{
		capacity: machine => 5 * machine.upgrades.capacity.effect,
		produces: machine => ({
			resource: "water",
			amount: 0.15 * machine.upgrades.velocity.effect
		}),
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
	},
	{
		name: "capacity",
		cost: count => Math.pow(3, count) * 30,
		max: 1,
		title: "Capacity",
		effect: count => count * 2 + 1,
		description: "Incrcease capacity"
	},
	{
		name: "velocity",
		cost: count => Math.pow(4, count) * 30,
		max: 2,
		title: "Velocity",
		effect: count => Math.pow(1.5, count) + count,
		description: "Increase production"
	}]),
	description: `Produces Water.`
};