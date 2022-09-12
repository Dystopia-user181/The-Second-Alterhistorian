import { defineMachine } from "../builder";

import { getConsumption, getEnergyUsage, getProduction, mapRecipesByInput } from "../utils";

import { Machine } from "../../logic";

import { MaybeResourceType, Recipe, ResourceType } from "@/types/resources";

const recipes: Recipe[] = [
	{
		input: { resource: "earth", amount: 1.5 },
		output: { resource: "sand", amount: 1.1 },
		energyUsage: 0.1,
	},
	{
		input: { resource: "stone", amount: 0.6 },
		output: { resource: "stoneDust", amount: 0.6 },
		energyUsage: 0.1,
	},
	{
		input: { resource: "none", amount: 0 },
		output: { resource: "earth", amount: 0 },
		energyUsage: 0,
	},
];

const recipesByInput = mapRecipesByInput(recipes);

function poundForce() {
	return Math.tan((Date.now() / 1000) % 1.293);
}

function getPoundForceProduction(machine: Parameters<typeof getProduction>[0]) {
	const production = getProduction(machine, recipesByInput);
	production.amount *= poundForce();
	return production;
}

export default defineMachine({
	name: "pulverizer",
	meta: () => ({
		inputResource: "none" as MaybeResourceType,
	}),
	inputs: [
		{
			accepts: recipes.map(x => x.input.resource).filter(x => x !== "none") as ResourceType[],
			capacity: () => 25,
			consumes: machine => {
				const prod = getConsumption(machine, recipesByInput) * poundForce();
				return {
					amount: prod,
					maximum: machine.outputDiffs.main * prod,
				};
			},
		},
		{
			accepts: ["energy"],
			capacity: () => 10,
			consumes: machine => {
				const prod = getEnergyUsage(machine, recipesByInput) * poundForce();
				return {
					amount: prod,
					maximum: machine.outputDiffs.main * prod,
				};
			},
		},
	],
	outputs: [
		{
			id: "main",
			capacity: () => 25,
			produces: machine => getPoundForceProduction(machine),
			requiresList: machine => [
				{
					resource: machine.meta.inputResource || "none",
					amount: getConsumption(machine, recipesByInput) * poundForce(),
					inputId: 0,
				},
				{
					resource: "energy",
					amount: getEnergyUsage(machine, recipesByInput) * poundForce(),
					inputId: 1,
				},
			],
		},
	],
	upgrades: {},
	customLoop(diff) {
		this.meta.inputResource = this.inputItem(0) ? this.inputItem(0).resource : "none";
		Machine.tickThisMachine(this, diff);
	},
	description: `Uses Energy to pound materials to dust.`,
});