import { MaybeResourceType, Recipe } from "@/types/resources";
import { ConfiguredMachine } from "./builder";

export type ConfiguredMachineWithUpgrades<T extends string> = Extract<
	ConfiguredMachine<string, any>,
	ConfiguredMachine<T, any>
>;

// FIXME: This is reused all over the place, why not store inputs as an object instead?
export function mapRecipesByInput(recipes: Recipe[]): Record<MaybeResourceType, Recipe> {
	return Object.fromEntries(recipes.map(recipe => [recipe.input.resource, recipe])) as Record<
		MaybeResourceType,
		Recipe
	>;
}

export function getConsumption(
	machine: ConfiguredMachineWithUpgrades<"velocity">,
	recipesByInput: Record<MaybeResourceType, Recipe>
) {
	if (!machine.inputResource) {
		return 0;
	}

	return (
		recipesByInput[machine.inputResource].input.amount *
		(machine.catalystActive ? 1.6 : 1) *
		machine.upgrades.velocity.effect
	);
}

export function getEnergyUsage(
	machine: ConfiguredMachineWithUpgrades<"velocity">,
	recipesByInput: Record<MaybeResourceType, Recipe>
) {
	if (!machine.inputResource) {
		return 0;
	}

	// FIXME: effect is incorrectly forced to be a number here
	return (
		(recipesByInput[machine.inputResource || "none"].energyUsage ?? 0) *
		Math.sqrt(machine.upgrades.velocity.effect as number)
	);
}

export function getProduction(
	machine: ConfiguredMachineWithUpgrades<"velocity">,
	recipesByInput: Record<MaybeResourceType, Recipe>
) {
	const out = recipesByInput[machine.inputResource || "none"].output;
	return {
		resource: out.resource,
		amount: out.amount * (machine.catalystActive ? 1.6 : 1) * machine.upgrades.velocity.effect,
	};
}