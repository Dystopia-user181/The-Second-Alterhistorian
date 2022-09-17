import { TownType } from "../towns";

import { ConfiguredMachine } from "./database/builder";

// This needed to be typed, but should be combined back into player-proxy.ts when that gets typed
export const MachinesById: Partial<Record<TownType, Record<number, ConfiguredMachine<string, any>>>> = {};