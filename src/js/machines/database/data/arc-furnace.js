import { Machine } from "../../logic";
import { machineUpg } from "../init";

import { GameDatabase } from "@/js/database/index";

import { arr } from "@/utils/index";

const metals = ["iron", "lead", "copper", "silver", "gold", "quicksilver"];

const recipes = [{
	input: { resource: "clay", amount: 1 },
	output: { resource: "bricks", amount: 1 },
	energyUsage: 0.08
},
{
	input: { resource: "water", amount: 1.5 },
	output: { resource: "steam", amount: 1.5 },
	energyUsage: 0.08
},
{
	input: { resource: "sand", amount: 1 },
	output: { resource: "glass", amount: 0.7 },
	energyUsage: 0.15
},
{
	input: { resource: "stone", amount: 0.5 },
	output: { resource: "lava", amount: 0.1 },
	energyUsage: 0.5
},
{
	input: { resource: "none", amount: 0 },
	output: { resource: "earth", amount: 0 },
	energyUsage: 0
}];

const recipesByInput = arr(recipes).mapToObject(x => x.input.resource, x => x);

function getConsumption(machine) {
	return recipesByInput[machine.inputResource || "none"].input.amount *
		(machine.catalystActive ? 1.6 : 1) *
		machine.upgrades.velocity.effect;
}

function getEnergyUsage(machine) {
	return recipesByInput[machine.inputResource || "none"].energyUsage * Math.sqrt(machine.upgrades.velocity.effect);
}

function getProduction(machine) {
	const out = recipesByInput[machine.inputResource || "none"].output;
	return {
		resource: out.resource,
		amount: out.amount * (machine.catalystActive ? 1.6 : 1) * machine.upgrades.velocity.effect
	};
}

GameDatabase.machines.arcFurnace = {
	name: "arcFurnace",
	inputs: [{
		accepts: () => recipes.filter(x => (x.isUnlocked ? run(x.isUnlocked) : true))
			.map(x => x.input.resource).filter(x => x !== "none"),
		capacity: () => 40,
		consumes: machine => {
			const prod = getConsumption(machine);
			return {
				amount: prod,
				maximum: machine.outputDiffs.main * prod
			};
		}
	},
	{
		accepts: ["energy"],
		capacity: () => 40,
		consumes: machine => {
			const prod = getEnergyUsage(machine);
			return {
				amount: prod,
				maximum: machine.outputDiffs.main * prod
			};
		}
	},
	{
		accepts: ["fire"],
		capacity: () => 20,
		consumes: () => 0.02,
		label: "Catalyst\n(5 Fire)",
		isUnlocked: machine => machine.upgrades.cat.effect
	}],
	outputs: [{
		id: "main",
		capacity: () => 40,
		produces: machine => getProduction(machine),
		requiresList: machine => [{
			resource: machine.inputResource || "none",
			amount: getConsumption(machine),
			inputId: 0,
		},
		{
			resource: "energy",
			amount: getEnergyUsage(machine),
			inputId: 1,
		}]
	}],
	upgrades: machineUpg([{
		name: "cat",
		cost: 12,
		currencyType: "lava",
		max: 1,
		title: "Catalysis",
		description: "Allows insertion of Fire for increased efficiency.",
		effect: count => Boolean(count),
		formatEffect: () => ""
	},
	{
		name: "velocity",
		cost: 4,
		currencyType: count => metals[count],
		max: 5,
		title: "Plater",
		description: "Increase operation speed but only increases Energy usage at sqrt the rate",
		effect: count => Math.pow(1.3, count),
	}]),
	customLoop(diff) {
		this.inputResource = this.inputItem(0) ? this.inputItem(0).resource : "none";
		this.catalystActive = this.inputItem(2) && this.inputItem(2).amount >= 5;
		Machine.tickThisMachine(this, diff);
	},
	description: `Arc furnace. Takes in Energy and the item to be heated.`
};