import { defineMachine } from "../builder";

import { mapRecipesByInput } from "../utils";

import { Machine } from "../../logic";

import { MaybeResourceType, Recipe, ResourceType } from "@/types/resources";

const recipes: Recipe[] = [
	{
		input: { resource: "earth", amount: 0.2 },
		output: { resource: "clay", amount: 0.2 },
		waterUsage: 0.3,
	},
	{
		input: { resource: "none", amount: 0 },
		output: { resource: "earth", amount: 0 },
		waterUsage: 0.1,
	},
];

const recipesByInput = mapRecipesByInput(recipes);

export default defineMachine({
	name: "waterMixer",
	meta: () => ({
		inputResource: "none" as MaybeResourceType
	}),
	inputs: [
		{
			accepts: recipes.map(x => x.input.resource).filter(x => x !== "none") as ResourceType[],
			capacity: machine => 15 * machine.upgrades.capacity.effect,
			consumes: machine => ({
				amount: recipesByInput[machine.meta.inputResource || "none"].input.amount,
				maximum:
					machine.outputDiffs.main * recipesByInput[machine.meta.inputResource || "none"].input.amount,
			}),
		},
		{
			accepts: ["water"],
			capacity: machine => 15 * machine.upgrades.capacity.effect,
			consumes: machine =>
				(machine.outputDiffs.main === 0
					? 0.1
					: recipesByInput[machine.meta.inputResource || "none"].waterUsage ?? 0),
		},
	],
	outputs: [
		{
			id: "main",
			capacity: machine => 15 * machine.upgrades.capacity.effect,
			produces: machine => ({
				resource: recipesByInput[machine.meta.inputResource || "none"].output.resource,
				amount: recipesByInput[machine.meta.inputResource || "none"].output.amount,
			}),
			requiresList: machine => [
				{
					resource: machine.meta.inputResource || "none",
					amount: recipesByInput[machine.meta.inputResource || "none"].input.amount,
					inputId: 0,
				},
				{
					resource: "water",
					amount: recipesByInput[machine.meta.inputResource || "none"].waterUsage ?? 0,
					inputId: 1,
				},
			],
		},
	],
	upgrades: {
		capacity: {
			name: "capacity",
			cost: 6,
			currencyType: "stone",
			max: 1,
			title: "Volume",
			description: "Increase capacity.",
			effect: count => count * 0.5 + Math.pow(1.5, count),
		},
	},
	customLoop(diff) {
		this.meta.inputResource = this.inputItem(0) ? this.inputItem(0).resource : "none";
		Machine.tickThisMachine(this, diff);
	},
	description: `Mixes water and another element. It's leaky.`,
});