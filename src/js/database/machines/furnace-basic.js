import { GameDatabase } from "../game-database";

import { machineUpg } from "./init";

const recipes = [{
	input: { resource: "clay", amount: 0.2 },
	output: { resource: "bricks", amount: 0.2 },
	fuelUsage: 0.2
}, {
	input: { resource: "water", amount: 0.3 },
	output: { resource: "steam", amount: 0.3 },
	fuelUsage: 0.15
}, {
	input: { resource: "none", amount: 0 },
	output: { resource: "earth", amount: 0 },
	fuelUsage: 0
}];

const recipesByInput = mapToObject(recipes, x => x.input.resource, x => x);

function getConsumption(machine) {
	return recipesByInput[machine.inputResource || "none"].input.amount * machine.upgrades.improve.effect[0];
}

function getFuelusage(machine) {
	return recipesByInput[machine.inputResource || "none"].fuelUsage * machine.upgrades.improve.effect[0]
		/ machine.upgrades.improve.effect[1];
}

function getProduction(machine) {
	const out = recipesByInput[machine.inputResource || "none"].output;
	return {
		resource: out.resource,
		amount: out.amount * machine.upgrades.improve.effect[0]
	}
}

GameDatabase.machines.furnaceBasic = {
	name: "furnaceBasic",
	inputs: [{
		accepts: recipes.map(x => x.input.resource).filter(x => x !== "none"),
		capacity: () => 10,
		consumes: machine => {
			const prod = getConsumption(machine);
			return {
				amount: prod,
				maximum: machine.outputDiffs.main * prod
			};
		}
	}, {
		accepts: ["wood"],
		capacity: () => 10,
		consumes: machine => machine.outputDiffs.main === 0 ? 0 : getFuelusage(machine)
	}],
	outputs: [{
		id: "main",
		capacity: () => 10,
		produces: machine => getProduction(machine),
		requiresList: machine => [{
			resource: machine.inputResource || "none",
			amount: getConsumption(machine),
			inputId: 0,
		}, {
			resource: "wood",
			amount: getFuelusage(machine),
			inputId: 1,
		}]
	}],
	upgrades: machineUpg([{
		name: "improve",
		cost: 15,
		currencyType: "stone",
		max: 1,
		title: "Improve",
		description: "Increase speed and fuel efficiency with better materials.",
		effect: count => [ Math.pow(1.5, count) + count * 0.5, Math.pow(1.1, count) + count * 0.2 ],
		formatEffect: () => ""
	}]),
	customLoop(diff) {
		this.inputResource = this.inputItem(0) ? this.inputItem(0).resource : "none";
		Machine.tickThisMachine(this, diff);
	},
	description: `Basic furnace. Takes in wood and the item to be heated.`
};