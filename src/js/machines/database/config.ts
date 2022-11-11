import { UpgradeState } from "@/js/machines/state";

import { MaybeResourceType, ResourceData, ResourceType } from "@/types/resources";
import { ConfiguredMachine } from "./builder";

export type InputConfig<Instance> = {
	accepts: readonly ResourceType[] | ((machine: Instance) => ResourceType[]);
	capacity: number | ((machine: Instance) => number);
	consumes: number | ((machine: Instance) => number) | ((machine: Instance) => { amount: number; maximum: number; });
	label?: string | ((machine: Instance) => string);
	isUnlocked?: boolean | ((machine: Instance) => boolean);
};

export interface OutputConfigRequirement {
	// TODO: combine resource and resource list
	resource: MaybeResourceType;
	resourceList?: ResourceData[];
	amount: number;
	inputId: number;
}

export interface OutputConfig<Instance> {
	id?: "main";
	capacity: number | ((machine: Instance) => number);
	produces: ResourceData | ((machine: Instance) => ResourceData);
	isUnlocked?: (machine: Instance) => boolean;
	// TODO: Combine requires and requiresList, seems to do the same thing
	requires?: (machine: Instance) => OutputConfigRequirement;
	requiresList?: (machine: Instance) => Array<OutputConfigRequirement>;
}

export interface UpgradeConfig<UpgradeKeys extends string, Meta extends Record<string, any>, E = any> {
	cost: number | ((count: number) => number);
	description: string | ((upgrade: UpgradeState<UpgradeKeys, Meta>) => string);
	effect: number | ((count: number) => E);
	max: number;
	name: string;
	title: string | ((upgrade: UpgradeState<UpgradeKeys, Meta>) => string);

	currencyType?: ResourceType | undefined | null | ((count: number) => ResourceType | undefined | null);
	formatEffect?: (effect: E) => string;
	isUnlocked?: (machine: ConfiguredMachine<UpgradeKeys, Meta>) => boolean;
}

export interface MachineConfig<UpgradeKeys extends string, Meta extends Record<string, any>> {
	name: string;

	/** The description of the machine that will be displayed to the user */
	description: string;
	upgrades: Record<UpgradeKeys, UpgradeConfig<UpgradeKeys, Meta>>;
	inputs: InputConfig<ConfiguredMachine<UpgradeKeys, Meta>>[];
	outputs: OutputConfig<ConfiguredMachine<UpgradeKeys, Meta>>[];

	meta?: () => Meta;

	customLoop?: (this: ConfiguredMachine<UpgradeKeys, Meta>, diff: number) => void;
}

export interface MachineData {
	inputs: ResourceData[][];
	outputs: ResourceData[][];
	// inputs: unknown[];
	// outputs: unknown[]
	isDefault: boolean;
	minimized: boolean;
	pipes: Array<[number, number][]>;
	type: string;
	upgrades: number[];
	upgradesPrepay: number[];
	x: number;
	y: number;

	name?: string;
}