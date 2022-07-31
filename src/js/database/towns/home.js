import { GameDatabase } from "../game-database";

GameDatabase.towns.home = {
	defaultMachines: [{
		type: "shoveller",
		x: 50,
		y: 50
	}, {
		type: "cistern",
		x: 50,
		y: 350
	}, {
		type: "quarry",
		x: 50,
		y: 650
	}, {
		type: "essencePurifier",
		x: 350,
		y: 50
	}],
	sidebarShop: [
		{
			type: "waterMixer",
			cost: 15
		},
		{
			type: "furnaceBasic",
			cost: 12,
			currencyType: "wood"
		},
		{
			type: "steamEngine",
			cost: 800,
			isUnlocked: () => player.unlockedCurrencies.coal
		},
		{
			type: "pulverizer",
			cost: 15,
			currencyType: "energy",
			isUnlocked: () => player.unlockedCurrencies.energy
		},
		{
			type: "inputMerger",
			cost: 10,
			currencyType: "stone",
			isUnlocked: () => Towns.home.upgrades.pipesBasic.isBought
		}
	],
	upgrades: {
		pipesBasic: {
			id: 0,
			cost: 36,
			currencyType: "bricks",
			title: "Pipes",
			description: "Unlock basic pipes."
		},
		pipesSpeed1: {
			id: 1,
			cost: 13,
			currencyType: "energy",
			title: "Pipes II",
			description: "Increase efficiency of pipes by 4.",
			effect: 4,
			isUnlocked: () => Towns.home.upgrades.pipesBasic.isBought
		}
	}
};