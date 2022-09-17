import { MaybeResourceType, Recipe } from "@/types/resources";
import { ConfiguredMachine } from "./builder";

export type MetaConfiguredMachine<T extends string, M extends Record<string, any>> = Extract<
	ConfiguredMachine<string, M>,
	ConfiguredMachine<T, M>
>;

// export type MetaConfiguredMachine<T extends string, M extends Record<string, any>> = ConfiguredMachine<T, M>

// FIXME: This is reused all over the place, why not store inputs as an object instead?
export function mapRecipesByInput(recipes: Recipe[]): Record<MaybeResourceType, Recipe> {
	return Object.fromEntries(recipes.map(recipe => [recipe.input.resource, recipe])) as Record<
		MaybeResourceType,
		Recipe
	>;
}

// export function getConsumption2(inputAmount: number, velocity: number, catalystActive = false) {
// 	return inputAmount * (catalystActive ? 1.6 : 1) * velocity;
// }

// export function getConsumption(
// 	machine: MetaConfiguredMachine<"velocity", { inputResource: MaybeResourceType; catalystActive?: boolean }>,
// 	recipesByInput: Record<MaybeResourceType, Recipe>
// ) {
// 	if (!machine.meta.inputResource) {
// 		return 0;
// 	}

// 	return (
// 		recipesByInput[machine.meta.inputResource].input.amount *
// 		(machine.meta.catalystActive ? 1.6 : 1) *
// 		machine.upgrades.velocity.effect
// 	);
// }

// export function getEnergyUsage(
// 	machine: MetaConfiguredMachine<"velocity", { inputResource: MaybeResourceType }>,
// 	recipesByInput: Record<MaybeResourceType, Recipe>
// ) {
// 	if (!machine.meta.inputResource) {
// 		return 0;
// 	}

// 	// FIXME: effect is incorrectly forced to be a number here
// 	return (
// 		(recipesByInput[machine.meta.inputResource || "none"].energyUsage ?? 0) *
// 		Math.sqrt(machine.upgrades.velocity.effect as number)
// 	);
// }

// export function getProduction(
// 	machine: MetaConfiguredMachine<"velocity", { inputResource: MaybeResourceType; catalystActive?: boolean }>,
// 	recipesByInput: Record<MaybeResourceType, Recipe>
// ) {
// 	const out = recipesByInput[machine.meta.inputResource || "none"].output;
// 	return {
// 		resource: out.resource,
// 		amount: out.amount * (machine.meta.catalystActive ? 1.6 : 1) * machine.upgrades.velocity.effect,
// 	};
// }