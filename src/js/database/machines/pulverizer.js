import { GameDatabase } from "../game-database";

import { machineUpg } from "./init";

const recipes = [{
	input: { resource: "earth", amount: 1.5 },
	output: { resource: "sand", amount: 1.1 },
	energyUsage: 0.1
}, {
	input: { resource: "stone", amount: 0.6 },
	output: { resource: "stonePowder", amount: 0.6 },
	energyUsage: 0.1
}, {
	input: { resource: "none", amount: 0 },
	output: { resource: "earth", amount: 0 },
	energyUsage: 0
}];

const recipesByInput = mapToObject(recipes, x => x.input.resource, x => x);

function poundForce() {
	return Math.tan((Date.now() / 1000) % 1.293);
}

function getConsumption(machine) {
	return recipesByInput[machine.inputResource || "none"].input.amount * poundForce();
}

function getEnergyUsage(machine) {
	return recipesByInput[machine.inputResource || "none"].energyUsage * poundForce();
}

function getProduction(machine) {
	const out = recipesByInput[machine.inputResource || "none"].output;
	return {
		resource: out.resource,
		amount: out.amount * poundForce()
	}
}

GameDatabase.machines.pulverizer = {
	name: "pulverizer",
	inputs: [{
		accepts: recipes.map(x => x.input.resource).filter(x => x !== "none"),
		capacity: () => 25,
		consumes: machine => {
			const prod = getConsumption(machine);
			return {
				amount: prod,
				maximum: machine.outputDiffs.main * prod
			};
		}
	}, {
		accepts: ["energy"],
		capacity: () => 10,
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
		capacity: () => 25,
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
	customLoop(diff) {
		this.inputResource = this.inputItem(0) ? this.inputItem(0).resource : "none";
		Machine.tickThisMachine(this, diff);
	},
	description: `Uses Energy to pound materials to dust.`
};