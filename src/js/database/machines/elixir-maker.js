import { GameDatabase } from "../game-database";

// import { machineUpg } from "./init";

GameDatabase.machines.elixirMaker = {
	name: "elixirMaker",
	inputs: [{
		accepts: ["quicksilver"],
		capacity: 10,
		consumes: machine => ({
			amount: 1,
			maximum: machine.outputDiffs.main
		})
	},
	{
		accepts: ["wood"],
		capacity: 10,
		consumes: machine => ({
			amount: 1,
			maximum: machine.outputDiffs.main
		})
	},
	{
		accepts: ["water"],
		capacity: 10,
		consumes: machine => ({
			amount: 1,
			maximum: machine.outputDiffs.main
		})
	},
	{
		accepts: ["fire"],
		capacity: 10,
		consumes: machine => ({
			amount: 1,
			maximum: machine.outputDiffs.main
		})
	},
	{
		accepts: ["earth"],
		capacity: 10,
		consumes: machine => ({
			amount: 1,
			maximum: machine.outputDiffs.main
		})
	},
	{
		accepts: ["purity"],
		capacity: 1,
		consumes: machine => ({
			amount: 0.1,
			maximum: machine.outputDiffs.main * 0.1
		})
	}],
	outputs: [{
		id: "main",
		capacity: 10,
		produces: {
			resource: "elixir",
			amount: 0.1
		},
		requiresList: machine => [{
			resource: "quicksilver",
			amount: 1,
			inputId: 0,
		},
		{
			resource: "wood",
			amount: 1,
			inputId: 1,
		},
		{
			resource: "water",
			amount: 1,
			inputId: 2,
		},
		{
			resource: "fire",
			amount: 1,
			inputId: 3,
		},
		{
			resource: "earth",
			amount: 1,
			inputId: 4,
		},
		{
			resource: "purity",
			amount: 0.1,
			inputId: 5,
		}]
	}],
	description: `consumeCONSUMEconsumeCONSUMEconsumeCONSUMEconsume`
};