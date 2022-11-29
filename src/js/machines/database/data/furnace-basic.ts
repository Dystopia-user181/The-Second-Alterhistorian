import { ConfiguredMachine, defineMachine } from "../builder";
import { mapRecipesByInput, MetaConfiguredMachine } from "../utils";
import { Machine } from "../../logic";

import { MaybeResourceType, Recipe, ResourceType } from "@/types/resources";
import { Currencies } from "@/js/currencies/currencies";
import { run } from "@/utils";

const recipes: Recipe[] = [
	{
		input: { resource: "clay", amount: 0.2 },
		output: { resource: "bricks", amount: 0.2 },
		fuelUsage: 0.2,
	},
	{
		input: { resource: "water", amount: 0.3 },
		output: { resource: "steam", amount: 0.3 },
		fuelUsage: 0.15,
	},
	{
		input: { resource: "sand", amount: 0.5 },
		output: { resource: "glass", amount: 0.32 },
		fuelUsage: 0.4,
		isUnlocked: () => Currencies.energy.isUnlocked,
	},
	{
		input: { resource: "none", amount: 0 },
		output: { resource: "earth", amount: 0 },
		fuelUsage: 0,
	},
];

const fuels: Partial<Record<MaybeResourceType, number>> = {
	none: 1e-300,
	wood: 1,
	coal: 7,
};

const recipesByInput = mapRecipesByInput(recipes);

function getConsumption(machine: ConfiguredMachine<"improve", { inputResource: MaybeResourceType }>) {
	// TODO: type effects
	// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
	return recipesByInput[machine.meta.inputResource || "none"].input.amount * machine.upgrades.improve.effect[0];
}

function getFuelUsage(
	machine: MetaConfiguredMachine<"improve", { inputResource: MaybeResourceType; inputFuel: MaybeResourceType }>
) {
	if (!machine.meta.inputResource || machine.meta.inputResource === "none") {
		return 0;
	}

	return (
		(recipesByInput[machine.meta.inputResource || "none"].fuelUsage ??
			// TODO: type effects
			// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
			0 * machine.upgrades.improve.effect[0]) /
		// TODO: type effects
		// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
		machine.upgrades.improve.effect[1] /
		(fuels[machine.meta.inputFuel || "none"] ?? 0)
	);
}

function getProduction(
	machine: ConfiguredMachine<string, { inputResource: MaybeResourceType; inputFuel: MaybeResourceType }>
) {
	const out = recipesByInput[machine.meta.inputResource || "none"].output;
	return {
		resource: out.resource,
		// TODO: type effects
		// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
		amount: out.amount * machine.upgrades.improve.effect[0],
	};
}

export default defineMachine({
	name: "furnaceBasic",
	meta: () => ({
		inputFuel: "none" as MaybeResourceType,
		inputResource: "none" as MaybeResourceType,
	}),
	inputs: [
		{
			accepts: machine =>
				recipes
					.filter(x => (x.isUnlocked ? run(x.isUnlocked, machine) : true))
					.map(x => x.input.resource)
					.filter(x => x !== "none") as ResourceType[],
			capacity: machine => 10 * machine.upgrades.capacity.effect,
			consumes: machine => {
				const prod = getConsumption(machine);
				return {
					amount: prod,
					maximum: machine.outputDiffs.main * prod,
				};
			},
		},
		{
			accepts: machine => {
				const accepts = ["wood"];
				if (machine.upgrades.improve.count) accepts.push("coal");
				return accepts as ResourceType[];
			},
			capacity: machine => 10 * machine.upgrades.capacity.effect,
			consumes: machine => {
				const prod = getFuelUsage(machine);
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
			capacity: machine => 10 * machine.upgrades.capacity.effect,
			produces: machine => getProduction(machine),
			requiresList: machine => [
				{
					resource: machine.meta.inputResource || "none",
					amount: getConsumption(machine),
					inputId: 0,
				},
				{
					resource: machine.meta.inputFuel || "none",
					amount: getFuelUsage(machine),
					inputId: 1,
				},
			],
		},
	],
	upgrades: {
		improve: {
			name: "improve",
			cost: 15,
			currencyType: count => (count >= 1 ? "glass" : "stone"),
			max: 2,
			title: "Improve",
			description: upgrade =>
				`Increase speed and fuel efficiency.
				${upgrade.count > 0 ? "" : "Unlocks ability to use coal as fuel."}`,
			effect: count => [Math.pow(1.5, count) + count * 0.5, Math.pow(1.1, count) + count * 0.2],
			formatEffect: () => "",
		},
		capacity: {
			name: "capacity",
			cost: count => (count >= 1 ? 1 : 3),
			currencyType: count => (count >= 1 ? "essence" : "energy"),
			max: 2,
			title: "Capacity",
			description: "Increase capacity.",
			effect: count => Math.pow(2, count) + count * 0.4,
		},
	},
	customLoop(diff) {
		this.meta.inputResource = this.inputItem(0)?.resource ?? "none";
		this.meta.inputFuel = this.inputItem(1)?.resource ?? "none";
		Machine.tickThisMachine(this, diff);
	},
	description: `Basic furnace. Takes in a fuel and the item to be heated.`,
});