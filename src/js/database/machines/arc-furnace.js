import { GameDatabase } from "../game-database";

import { machineUpg } from "./init";

const recipes = [{
	input: { resource: "clay", amount: 0.7 },
	output: { resource: "bricks", amount: 0.7 },
	energyUsage: 0.1
}, {
	input: { resource: "water", amount: 0.8 },
	output: { resource: "steam", amount: 0.8 },
	energyUsage: 0.06
}, {
	input: { resource: "sand", amount: 1 },
	output: { resource: "glass", amount: 0.7 },
	energyUsage: 0.2
}, {
	input: { resource: "none", amount: 0 },
	output: { resource: "earth", amount: 0 },
	fuelUsage: 0
}];

const recipesByInput = mapToObject(recipes, x => x.input.resource, x => x);

function getConsumption(machine) {
	return recipesByInput[machine.inputResource || "none"].input.amount;
}

function getEnergyUsage(machine) {
	return recipesByInput[machine.inputResource || "none"].energyUsage;
}

function getProduction(machine) {
	const out = recipesByInput[machine.inputResource || "none"].output;
	return {
		resource: out.resource,
		amount: out.amount
	}
}

GameDatabase.machines.arcFurnace = {
	name: "arcFurnace",
	inputs: [{
		accepts: () => recipes.filter(x => !x.isUnlocked ? true : run(x.isUnlocked)).map(x => x.input.resource).filter(x => x !== "none"),
		capacity: machine => 10 * machine.upgrades.capacity.effect,
		consumes: machine => {
			const prod = getConsumption(machine);
			return {
				amount: prod,
				maximum: machine.outputDiffs.main * prod
			};
		}
	}, {
		accepts: machine => {
			const accepts = ["wood"];
			if (machine.upgrades.improve.count) accepts.push("coal");
			return accepts;
		},
		capacity: machine => 10 * machine.upgrades.capacity.effect,
		consumes: machine => {
			const prod = getFuelUsage(machine);
			return {
				amount: prod,
				maximum: machine.outputDiffs.main * prod
			};
		}
	}],
	outputs: [{
		id: "main",
		capacity: machine => 10 * machine.upgrades.capacity.effect,
		produces: machine => getProduction(machine),
		requiresList: machine => [{
			resource: machine.inputResource || "none",
			amount: getConsumption(machine),
			inputId: 0,
		}, {
			resource: machine.inputFuel || "none",
			amount: getFuelUsage(machine),
			inputId: 1,
		}]
	}],
	upgrades: machineUpg([{
		name: "improve",
		cost: 15,
		currencyType: "stone",
		max: 1,
		title: "Improve",
		description: upgrade => `Increase speed and fuel efficiency.${upgrade.count > 0 ? "" : " Unlocks ability to use coal as fuel."}`,
		effect: count => [ Math.pow(1.5, count) + count * 0.5, Math.pow(1.1, count) + count * 0.2 ],
		formatEffect: () => ""
	},
	{
		name: "capacity",
		cost: 3,
		currencyType: count => count >= 1 ? "essence" : "energy",
		max: 2,
		title: "Capacity",
		description: "Increase capacity.",
		effect: count => Math.pow(2, count) + count * 0.4
	}]),
	customLoop(diff) {
		this.inputResource = this.inputItem(0) ? this.inputItem(0).resource : "none";
		this.inputFuel = this.inputItem(1) ? this.inputItem(1).resource : "none";
		Machine.tickThisMachine(this, diff);
	},
	description: `Basic furnace. Takes in a fuel and the item to be heated.`
};