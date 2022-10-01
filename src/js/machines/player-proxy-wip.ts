import { TownType } from "../towns";

import { InputState, OutputState } from "./state";
import { ConfiguredMachine } from "./database/builder";

// This needed to be typed, but should be combined back into player-proxy.ts when that gets typed
export const MachinesById: Partial<Record<TownType, Record<number, ConfiguredMachine<string, any>>>> = {};

// export const Pipes = {};
interface PipeConnection<InputUpgrades extends string, OutputUpgrades extends string> {
	in: [ConfiguredMachine<InputUpgrades, any>, InputState<InputUpgrades, Record<string, any>>];
	out: [ConfiguredMachine<OutputUpgrades, any>, OutputState<OutputUpgrades, Record<string, any>>];
}

export const Pipes: Record<TownType, PipeConnection<string, string>[]> = {
	home: [],
};