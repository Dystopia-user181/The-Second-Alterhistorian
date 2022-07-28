import { GameDatabase } from "../game-database";

// import { machineUpg } from "./init";

const recipes = [{
	input: { resource: "earth", amount: 0.2 },
	output: { resource: "clay", amount: 0.2 },
	waterUsage: 0.4
}, {
	input: { resource: "none", amount: 0 },
	output: { resource: "earth", amount: 0 },
	waterUsage: 0.1
}];

const recipesByInput = mapToObject(recipes, x => x.input.resource, x => x);

GameDatabase.machines.waterMixer = {
	name: "waterMixer",
	inputs: [{
		accepts: recipes.map(x => x.input.resource).filter(x => x !== "none"),
		capacity: () => 10,
		consumes: machine => ({
			amount: recipesByInput[machine.inputResource || "none"].input.amount,
			maximum: machine.outputDiffs.main * recipesByInput[machine.inputResource || "none"].input.amount
		})
	}, {
		accepts: ["water"],
		capacity: () => 10,
		consumes: machine => machine.outputDiffs.main === 0 ? 0.1 : recipesByInput[machine.inputResource || "none"].waterUsage
	}],
	outputs: [{
		id: "main",
		capacity: () => 10,
		produces: machine => ({
			resource: recipesByInput[machine.inputResource || "none"].output.resource,
			amount: recipesByInput[machine.inputResource || "none"].output.amount
		}),
		requiresList: machine => [{
			resource: machine.inputResource || "none",
			amount: recipesByInput[machine.inputResource || "none"].input.amount,
			inputId: 0,
		}, {
			resource: "water",
			amount: recipesByInput[machine.inputResource || "none"].waterUsage,
			inputId: 1,
		}]
	}],
	customLoop(diff) {
		this.inputResource = this.inputItem(0) ? this.inputItem(0).resource : "none";
		Machine.tickThisMachine(this, diff);
	},
	description: `Mixes water and another element. It's leaky.`
};