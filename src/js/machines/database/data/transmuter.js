import { Machine } from "../../logic";

import { GameDatabase } from "@/js/database/index";

import { arr } from "@/utils";


const recipes = [{
	input: { resource: "stone", amount: 0.5 },
	output: { resource: "iron", amount: 0.08 },
	vitriolUsage: 0.4
},
{
	input: { resource: "stoneDust", amount: 0.5 },
	output: { resource: "iron", amount: 0.25 },
	vitriolUsage: 0.2
},
{
	input: { resource: "iron", amount: 0.5 },
	output: { resource: "lead", amount: 0.4 },
	vitriolUsage: 0.3
},
{
	input: { resource: "lead", amount: 0.5 },
	output: { resource: "copper", amount: 0.3 },
	vitriolUsage: 0.4
},
{
	input: { resource: "copper", amount: 0.5 },
	output: { resource: "silver", amount: 0.25 },
	vitriolUsage: 0.5
},
{
	input: { resource: "silver", amount: 0.5 },
	output: { resource: "gold", amount: 0.2 },
	vitriolUsage: 0.6
},
{
	input: { resource: "gold", amount: 0.5 },
	output: { resource: "quicksilver", amount: 0.25 },
	vitriolUsage: 1.2
},
{
	input: { resource: "none", amount: 0 },
	output: { resource: "earth", amount: 0 },
	vitriolUsage: 0
}];

const recipesByInput = arr(recipes).mapToObject(x => x.input.resource, x => x);

function getConsumption(machine) {
	return recipesByInput[machine.inputResource || "none"].input.amount;
}

function getVitriolUsage(machine) {
	return recipesByInput[machine.inputResource || "none"].vitriolUsage;
}

function getProduction(machine) {
	const out = recipesByInput[machine.inputResource || "none"].output;
	return {
		resource: out.resource,
		amount: out.amount
	};
}

GameDatabase.machines.transmuter = {
	name: "transmuter",
	inputs: [{
		accepts: recipes.map(x => x.input.resource).filter(x => x !== "none"),
		capacity: () => 20,
		consumes: machine => {
			const prod = getConsumption(machine);
			return {
				amount: prod,
				maximum: machine.outputDiffs.main * prod
			};
		}
	},
	{
		accepts: ["vitriol"],
		capacity: () => 5,
		consumes: machine => {
			const prod = getVitriolUsage(machine);
			return {
				amount: prod,
				maximum: machine.outputDiffs.main * prod
			};
		}
	}],
	outputs: [{
		id: "main",
		capacity: () => 20,
		produces: machine => getProduction(machine),
		requiresList: machine => [{
			resource: machine.inputResource || "none",
			amount: getConsumption(machine),
			inputId: 0,
		},
		{
			resource: "vitriol",
			amount: getVitriolUsage(machine),
			inputId: 1,
		}]
	}],
	customLoop(diff) {
		this.inputResource = this.inputItem(0) ? this.inputItem(0).resource : "none";
		Machine.tickThisMachine(this, diff);
	},
	description: `You know what this is.`
};