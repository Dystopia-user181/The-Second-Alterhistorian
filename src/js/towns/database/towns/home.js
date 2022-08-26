import { Towns } from "../../player-proxy";

import { GameDatabase } from "@/js/database/index";
import { player } from "@/js/player";

GameDatabase.towns.home = {
	defaultMachines: [{
		type: "shoveller",
		x: 50,
		y: 50
	},
	{
		type: "cistern",
		x: 50,
		y: 350
	},
	{
		type: "quarry",
		x: 50,
		y: 650
	},
	{
		type: "essencePurifier",
		x: 350,
		y: 50
	}],
	sidebarShop: [
		{
			type: "waterMixer",
			cost: 8
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
			type: "arcFurnace",
			cost: 15,
			currencyType: "fire",
			isUnlocked: () => player.unlockedCurrencies.essence || player.unlockedCurrencies.fire
		},
		{
			type: "transmuter",
			cost: 20,
			currencyType: "essence",
			isUnlocked: () => player.unlockedCurrencies.vitriol
		},
		{
			type: "essencePurifier",
			cost: 5,
			currencyType: "gold",
			isUnlocked: () => player.unlockedCurrencies.gold
		},
		{
			type: "elixirMaker",
			cost: 25,
			currencyType: "gold",
			isUnlocked: () => player.unlockedCurrencies.gold
		},
		{
			type: "inputMerger",
			cost: 10,
			currencyType: "stone",
			isUnlocked: () => Towns("home").upgrades.pipesBasic.isBought
		},
		{
			type: "autoSeller",
			cost: 0.2,
			currencyType: "essence",
			isUnlocked: () => Towns("home").upgrades.pipesBasic.isBought &&
				(player.unlockedCurrencies.essence || player.unlockedCurrencies.fire)
		}
	],
	upgrades: {
		pipesBasic: {
			id: 0,
			cost: 36,
			currencyType: "bricks",
			title: "Pipes",
			description: `Unlock basic pipes.
				They transport resources based on the capacity of the attached input containers.`
		},
		pipesSpeed1: {
			id: 1,
			cost: 13,
			currencyType: "energy",
			title: "Pipes II",
			description: "Increase efficiency of pipes by x4.",
			effect: 4,
			isUnlocked: () => Towns("home").upgrades.pipesBasic.isBought
		},
		pipesSpeed2: {
			id: 2,
			cost: 80,
			currencyType: "fire",
			title: "Pipes III",
			description: "Increase efficiency of pipes by x2.",
			effect: 2,
			isUnlocked: () => Towns("home").upgrades.pipesBasic.isBought
		}
	}
};