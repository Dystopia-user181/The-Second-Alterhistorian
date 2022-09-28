import { MaybeResourceType, Recipe } from "@/types/resources";
import { ConfiguredMachine } from "./builder";

export type MetaConfiguredMachine<T extends string, M extends Record<string, any>> = Extract<
	ConfiguredMachine<string, M>,
	ConfiguredMachine<T, M>
>;

// FIXME: This is reused all over the place, why not store inputs as an object instead?
export function mapRecipesByInput(recipes: Recipe[]): Record<MaybeResourceType, Recipe> {
	return Object.fromEntries(recipes.map(recipe => [recipe.input.resource, recipe])) as Record<
		MaybeResourceType,
		Recipe
	>;
}