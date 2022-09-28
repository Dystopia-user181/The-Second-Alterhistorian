import { MaybeResourceType, Recipe } from "@/types/resources";
import { ConfiguredMachine } from "./builder";

export type MetaConfiguredMachine<T extends string, M extends Record<string, any>> = Extract<
	ConfiguredMachine<string, M>,
	ConfiguredMachine<T, M>
>;

// TODO: This is used in every machine and inputs require more transformations,
// it might be better to change the structure of how recipes are defined, as
// they are (almost?) never referenced without this.
export function mapRecipesByInput(recipes: Recipe[]): Record<MaybeResourceType, Recipe> {
	return Object.fromEntries(recipes.map(recipe => [recipe.input.resource, recipe])) as Record<
		MaybeResourceType,
		Recipe
	>;
}