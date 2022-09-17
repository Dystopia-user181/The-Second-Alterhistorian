import "./init";

import arcFurnace from "./data/arc-furnace";
import autoSeller from "./data/auto-seller";
import cistern from "./data/cistern";
import elixirMaker from "./data/elixir-maker";
import essencePurifier from "./data/essence-purifier";
import furnaceBasic from "./data/furnace-basic";
import inputMerger from "./data/input-merger";
import pulverizer from "./data/pulverizer";
import quarry from "./data/quarry";
import shoveller from "./data/shoveller";
import steamEngine from "./data/steam-engine";
import transmuter from "./data/transmuter";
import waterMixer from "./data/water-mixer";

export const MachineTypes = {
	arcFurnace,
	autoSeller,
	cistern,
	elixirMaker,
	essencePurifier,
	furnaceBasic,
	inputMerger,
	pulverizer,
	quarry,
	shoveller,
	steamEngine,
	transmuter,
	waterMixer,
};

export type MachineId = keyof typeof MachineTypes