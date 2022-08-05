import { GameDatabase } from "../game-database";

import { machineUpg } from "./init";

const recipes = [{
	input: { resource: "coal", amount: 0.3 },
	output: { resource: "fire", amount: 0.2 },
	energyUsage: 0.3
}, {
	input: { resource: "energy", amount: 0.25 },
	output: { resource: "essence", amount: 0.02 },
	energyUsage: 0.15
}, {
	input: { resource: "lava", amount: 0.2 },
	output: { resource: "vitriol", amount: 0.08 },
	energyUsage: 0.5,
	isUnlocked: machine => machine.upgrades.power.count > 0
}, {
	input: { resource: "glass", amount: 1 },
	output: { resource: "purity", amount: 0.01 },
	energyUsage: 0.5,
	isUnlocked: machine => machine.upgrades.power.count > 1
}, {
	input: { resource: "none", amount: 0 },
	output: { resource: "earth", amount: 0 },
	energyUsage: 0
}];

const recipesByInput = mapToObject(recipes, x => x.input.resource, x => x);

function getConsumption(machine) {
	return recipesByInput[machine.inputResource || "none"].input.amount * machine.upgrades.velocity.effect;
}

function getEnergyUsage(machine) {
	return recipesByInput[machine.inputResource || "none"].energyUsage;
}

function getProduction(machine) {
	const out = recipesByInput[machine.inputResource || "none"].output;
	return {
		resource: out.resource,
		amount: out.amount * machine.upgrades.velocity.effect
	}
}

GameDatabase.machines.essencePurifier = {
	name: "essencePurifier",
	inputs: [{
		accepts: machine => recipes.filter(x => !x.isUnlocked ? true : run(x.isUnlocked, machine))
			.map(x => x.input.resource).filter(x => x !== "none"),
		capacity: machine => 5 * machine.upgrades.capacity.effect,
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
		capacity: machine => 5 * machine.upgrades.capacity.effect,
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
		capacity: machine => 5 * machine.upgrades.capacity.effect,
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
		cost: 150,
		currencyType: () => player.unlockedCurrencies.energy ? "energy" : "???",
		max: 1,
		title: "Power",
		description: "Supply Power to the EssencePurifier.",
		effect: count => Boolean(count),
		formatEffect: () => "",
		isUnlocked: machine => !machine.upgrades.unlock.effect
	},
	{
		name: "velocity",
		cost: count => Math.pow(2.5, count) * 30,
		currencyType: "lava",
		max: 4,
		title: "Efficiency",
		description: "Increase operation speed without increasing energy usage",
		effect: count => Math.pow(1.5, count) + count * 0.2,
		isUnlocked: machine => machine.upgrades.unlock.effect
	},
	{
		name: "power",
		cost: count => Math.pow(2, count) * 40,
		currencyType: "essence",
		max: 2,
		title: "Power",
		description: "Increase the power level to extract essences from 1 more raw material",
		effect: count => count,
		formatEffect: () => "",
		isUnlocked: machine => machine.upgrades.unlock.effect
	},
	{
		name: "capacity",
		cost: count => Math.pow(4, count) * 20,
		max: 2,
		currencyType: "vitriol",
		title: "Capacity",
		description: "Increase capacity",
		effect: count => Math.pow(2, count - 1) + count + 0.5,
		isUnlocked: machine => machine.upgrades.power.count || player.unlockedCurrencies.vitriol
	}]),
	customLoop(diff) {
		this.inputResource = this.inputItem(0) ? this.inputItem(0).resource : "none";
		Machine.tickThisMachine(this, diff);
	},
	description: `Extracts Basic Essences from raw materials.`
};