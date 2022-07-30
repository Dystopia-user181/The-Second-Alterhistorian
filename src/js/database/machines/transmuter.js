import { GameDatabase } from "../game-database";

import { machineUpg } from "./init";

const recipes = [{
	input: { resource: "stone", amount: 0.5 },
	output: { resource: "iron", amount: 0.05 },
	essenceUsage: 0.4
}, {
	input: { resource: "none", amount: 0 },
	output: { resource: "earth", amount: 0 },
	essenceUsage: 0
}];

const recipesByInput = mapToObject(recipes, x => x.input.resource, x => x);

function getConsumption(machine) {
	return recipesByInput[machine.inputResource || "none"].input.amount;
}

function getEssenceUsage(machine) {
	return recipesByInput[machine.inputResource || "none"].essenceUsage;
}

function getProduction(machine) {
	const out = recipesByInput[machine.inputResource || "none"].output;
	return {
		resource: out.resource,
		amount: out.amount
	}
}

GameDatabase.machines.transmuter = {
	name: "transmuter",
	inputs: [{
		accepts: recipes.map(x => x.input.resource).filter(x => x !== "none"),
		capacity: () => 5,
		consumes: machine => {
			const prod = getConsumption(machine);
			return {
				amount: prod,
				maximum: machine.outputDiffs.main * prod
			};
		}
	}, {
		accepts: ["essence"],
		capacity: () => 5,
		consumes: machine => {
			const prod = getEssenceUsage(machine);
			return {
				amount: prod,
				maximum: machine.outputDiffs.main * prod
			};
		}
	}],
	outputs: [{
		id: "main",
		capacity: () => 5,
		produces: machine => getProduction(machine),
		requiresList: machine => [{
			resource: machine.inputResource || "none",
			amount: getConsumption(machine),
			inputId: 0,
		}, {
			resource: "essence",
			amount: getEssenceUsage(machine),
			inputId: 1,
		}],
		isUnlocked: machine => machine.upgrades.unlock.effect
	}],
	customLoop(diff) {
		this.inputResource = this.inputItem(0) ? this.inputItem(0).resource : "none";
		Machine.tickThisMachine(this, diff);
	},
	description: `You're an alchemist- you know what this is.`
};