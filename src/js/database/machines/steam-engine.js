import { GameDatabase } from "../game-database";

import { Stack } from "../../stack";

// import { machineUpg } from "./init";

GameDatabase.machines.steamEngine = {
	name: "steamEngine",
	inputs: [{
		accepts: ["steam"],
		capacity: () => 20,
		consumes: machine => ({
			amount: 0.6,
			maximum: machine.outputDiffs.main * 0.6
		})
	}],
	outputs: [{
		id: "main",
		capacity: () => 10,
		produces: () => ({
			resource: "energy",
			amount: 0.1
		}),
		requires: () => ({
			resource: "steam",
			amount: 0.6,
			inputId: 0,
		})
	},
	{
		capacity: () => 10,
		produces: machine => ({
			resource: "water",
			amount: Stack.volumeOfStack(machine.outputs[0].data) >= machine.outputs[0].config.capacity ? 0 : 0.3
		}),
		requires: () => ({
			resource: "steam",
			amount: 0.6,
			inputId: 0,
		})
	}],
	description: `Converts Steam into Energy. James Watt would be proud.`
};