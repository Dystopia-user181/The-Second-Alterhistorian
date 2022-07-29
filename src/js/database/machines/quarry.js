import { GameDatabase } from "../game-database";

import { machineUpg } from "./init";

GameDatabase.machines.quarry = {
	name: "quarry",
	inputs: [],
	outputs: [{
		capacity: machine => 10 * machine.upgrades.capacity.effect,
		produces: machine => ({
			resource: "stone",
			amount: 0.15 * machine.upgrades.velocity.effect
		}),
		isUnlocked: machine => machine.upgrades.unlock.maxed
	},
	{
		capacity: machine => 5 * machine.upgrades.capacity.effect,
		produces: machine => ({
			resource: "coal",
			amount: 0.04 * machine.upgrades.velocity.effect
		}),
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
	},
	{
		name: "capacity",
		cost: count => Math.pow(5, count) * 10,
		currencyType: "energy",
		max: 2,
		title: "Capacity",
		description: "Increase Stone and Coal capacity",
		effect: count => Math.pow(2, count)
	},
	{
		name: "velocity",
		cost: count => Math.pow(4, count) * 10,
		currencyType: "energy",
		max: 2,
		title: "Velocity",
		description: "Increase Stone and Coal production",
		effect: count => Math.pow(1.4, count) + count * 0.2
	},]),
	description: `Produces Stone and Coal.`
};