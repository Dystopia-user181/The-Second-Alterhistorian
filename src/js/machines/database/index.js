import "./init";

import "./data/shoveller";
import "./data/cistern";
import "./data/quarry";
import "./data/water-mixer";
import "./data/furnace-basic";
import "./data/steam-engine";
import "./data/essence-purifier";
import "./data/pulverizer";
import "./data/input-merger";
import "./data/arc-furnace";
import "./data/auto-seller";
import "./data/transmuter";
import "./data/elixir-maker";

import { MachineType } from "../classes";

import { GameDatabase } from "@/js/database/index";

import { objectMap } from "@/utils";

export const MachineTypes = objectMap(GameDatabase.machines, x => x, x => MachineType(x));