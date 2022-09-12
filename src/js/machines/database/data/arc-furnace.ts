import { getConsumption, getEnergyUsage, getProduction, mapRecipesByInput } from "../utils";
import { defineMachine } from "../builder";
import { Machine } from "../../logic";

import { MaybeResourceType, Recipe, ResourceType } from "@/types/resources";
import { run } from "@/utils";

const metals = ["iron", "lead", "copper", "silver", "gold", "quicksilver"];

const recipes: Recipe[] = [
	{
		input: { resource: "clay", amount: 1 },
		output: { resource: "bricks", amount: 1 },
		energyUsage: 0.08,
	},
	{
		input: { resource: "water", amount: 1.5 },
		output: { resource: "steam", amount: 1.5 },
		energyUsage: 0.08,
	},
	{
		input: { resource: "sand", amount: 1 },
		output: { resource: "glass", amount: 0.7 },
		energyUsage: 0.15,
	},
	{
		input: { resource: "stone", amount: 0.5 },
		output: { resource: "lava", amount: 0.1 },
		energyUsage: 0.5,
	},
	{
		input: { resource: "none", amount: 0 },
		output: { resource: "earth", amount: 0 },
		energyUsage: 0,
	},
];

const recipesByInput = mapRecipesByInput(recipes);

export default defineMachine({
	name: "arcFurnace",
	meta: () => ({
		inputResource: "none" as MaybeResourceType,
		catalystActive: false,
	}),
	inputs: [
		{
			accepts: machine =>
				recipes
					.filter(x => (x.isUnlocked ? run(x.isUnlocked, machine) : true))
					.map(x => x.input.resource)
					.filter(x => x !== "none") as ResourceType[],
			capacity: () => 40,
			consumes: machine => {
				const prod = getConsumption(machine, recipesByInput);
				return {
					amount: prod,
					maximum: machine.outputDiffs.main * prod,
				};
			},
		},
		{
			accepts: ["energy"],
			capacity: () => 40,
			consumes: machine => {
				const prod = getEnergyUsage(machine, recipesByInput);
				return {
					amount: prod,
					maximum: machine.outputDiffs.main * prod,
				};
			},
		},
		{
			accepts: ["fire"],
			capacity: () => 20,
			consumes: () => 0.02,
			label: "Catalyst\n(5 Fire)",
			isUnlocked: machine => Boolean(machine.upgrades.cat.effect),
		},
	],
	outputs: [
		{
			id: "main",
			capacity: () => 40,
			produces: machine => getProduction(machine, recipesByInput),
			requiresList: machine => [
				{
					resource: machine.meta.inputResource || "none",
					amount: getConsumption(machine, recipesByInput),
					inputId: 0,
				},
				{
					resource: "energy",
					amount: getEnergyUsage(machine, recipesByInput),
					inputId: 1,
				},
			],
		},
	],
	upgrades: {
		cat: {
			name: "cat",
			cost: 12,
			currencyType: "lava",
			max: 1,
			title: "Catalysis",
			description: "Allows insertion of Fire for increased efficiency.",
			effect: count => Boolean(count),
			formatEffect: () => "",
		},
		velocity: {
			name: "velocity",
			cost: 4,
			currencyType: count => metals[count] as ResourceType,
			max: 5,
			title: "Plater",
			description: "Increase operation speed but only increases Energy usage at sqrt the rate",
			effect: count => Math.pow(1.3, count),
		},
	},
	customLoop(diff) {
		this.meta.inputResource = this.inputItem(0) ? this.inputItem(0).resource : "none";
		this.meta.catalystActive = this.inputItem(2) && this.inputItem(2).amount >= 5;
		Machine.tickThisMachine(this, diff);
	},
	description: `Arc furnace. Takes in Energy and the item to be heated.`,
});