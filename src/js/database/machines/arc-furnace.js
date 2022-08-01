import { GameDatabase } from "../game-database";

import { machineUpg } from "./init";

const recipes = [{
	input: { resource: "clay", amount: 0.7 },
	output: { resource: "bricks", amount: 0.7 },
	energyUsage: 0.07
}, {
	input: { resource: "water", amount: 0.8 },
	output: { resource: "steam", amount: 0.8 },
	energyUsage: 0.05
}, {
	input: { resource: "sand", amount: 1 },
	output: { resource: "glass", amount: 0.7 },
	energyUsage: 0.15
}, {
	input: { resource: "none", amount: 0 },
	output: { resource: "earth", amount: 0 },
	energyUsage: 0
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
		capacity: machine => 40,
		consumes: machine => {
			const prod = getConsumption(machine);
			return {
				amount: prod,
				maximum: machine.outputDiffs.main * prod
			};
		}
	}, {
		accepts: ["energy"],
		capacity: machine => 40,
		consumes: machine => {
			const prod = getEnergyUsage(machine);
			return {
				amount: prod,
				maximum: machine.outputDiffs.main * prod
			};
		}
	}],
	outputs: [{
		id: "main",
		capacity: machine => 40,
		produces: machine => getProduction(machine),
		requiresList: machine => [{
			resource: machine.inputResource || "none",
			amount: getConsumption(machine),
			inputId: 0,
		}, {
			resource: "energy",
			amount: getEnergyUsage(machine),
			inputId: 1,
		}]
	}],
	upgrades: machineUpg([]),
	customLoop(diff) {
		this.inputResource = this.inputItem(0) ? this.inputItem(0).resource : "none";
		Machine.tickThisMachine(this, diff);
	},
	description: `Arc furnace. Takes in Energy and the item to be heated.`
};