import { GameDatabase } from "../game-database";

import { machineUpg } from "./init";

const recipes = [{
	input: { resource: "coal", amount: 0.3 },
	output: { resource: "fire", amount: 0.2 },
	energyUsage: 0.4
}, {
	input: { resource: "energy", amount: 0.2 },
	output: { resource: "essence", amount: 0.02 },
	energyUsage: 0.2
}, {
	input: { resource: "none", amount: 0 },
	output: { resource: "earth", amount: 0 },
	energyUsage: 0
}];

const recipesByInput = mapToObject(recipes, x => x.input.resource, x => x);

function getConsumption(machine) {
	return recipesByInput[machine.inputResource || "none"].input.amount;
}

function getEnergyUsage(machine) {
	return recipesByInput[machine.inputResource || "none"].energyUsage;
}

function getProduction(machine) {
	const out = recipesByInput[machine.inputResource || "none"].output;
	return {
		resource: out.resource,
		amount: out.amount
	}
}

GameDatabase.machines.essencePurifier = {
	name: "essencePurifier",
	inputs: [{
		accepts: recipes.map(x => x.input.resource).filter(x => x !== "none"),
		capacity: () => 5,
		consumes: machine => {
			const prod = getConsumption(machine);
			return {
				amount: prod,
				maximum: machine.outputDiffs.main * prod
			};
		},
		isUnlocked: machine => machine.upgrades.unlock.effect
	}, {
		accepts: ["energy"],
		capacity: () => 5,
		consumes: machine => {
			const prod = getEnergyUsage(machine);
			return {
				amount: prod,
				maximum: machine.outputDiffs.main * prod
			};
		},
		isUnlocked: machine => machine.upgrades.unlock.effect
	}],
	outputs: [{
		id: "main",
		capacity: () => 5,
		produces: machine => getProduction(machine),
		requiresList: machine => [{
			resource: machine.inputResource || "none",
			amount: getConsumption(machine),
			inputId: 0,
		}, {
			resource: "energy",
			amount: getEnergyUsage(machine),
			inputId: 1,
		}],
		isUnlocked: machine => machine.upgrades.unlock.effect
	}],
	upgrades: machineUpg([{
		name: "unlock",
		cost: 25000,
		currencyType: () => player.unlockedCurrencies.energy ? "energy" : "????",
		max: 1,
		title: "Power",
		description: "Supply Power to the EssencePurifier.",
		effect: count => Boolean(count),
		formatEffect: () => "",
		isUnlocked: machine => !machine.upgrades.unlock.effect
	}]),
	customLoop(diff) {
		this.inputResource = this.inputItem(0) ? this.inputItem(0).resource : "none";
		Machine.tickThisMachine(this, diff);
	},
	description: `Extracts Basic Essences from raw materials.`
};