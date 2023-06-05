import { Towns } from "../../player-proxy";

import { TownsDatabase } from "../init";

import { Currencies } from "@/js/currencies/currencies";

TownsDatabase.set("home", {
	defaultMachines: [{
		type: "shoveller",
		x: -360,
		y: -270
	},
	{
		type: "cistern",
		x: -90,
		y: -270
	},
	{
		type: "quarry",
		x: 180,
		y: -270
	},
	{
		type: "essencePurifier",
		x: -360,
		y: 90
	}],
	sidebarShop: [
		{
			type: "waterMixer",
			cost: 6
		},
		{
			type: "furnaceBasic",
			cost: 12,
			currencyType: "wood"
		},
		{
			type: "steamEngine",
			cost: 800,
			isUnlocked: () => Currencies.coal.isUnlocked
		},
		{
			type: "pulverizer",
			cost: 15,
			currencyType: "energy",
			isUnlocked: () => Currencies.energy.isUnlocked
		},
		{
			type: "arcFurnace",
			cost: 15,
			currencyType: "fire",
			isUnlocked: () => Currencies.essence.isUnlocked || Currencies.fire.isUnlocked
		},
		{
			type: "transmuter",
			cost: 20,
			currencyType: "essence",
			isUnlocked: () => Currencies.vitriol.isUnlocked
		},
		{
			type: "essencePurifier",
			cost: 5,
			currencyType: "silver",
			isUnlocked: () => Currencies.copper.isUnlocked
		},
		{
			type: "elixirMaker",
			cost: 20,
			currencyType: "gold",
			isUnlocked: () => Currencies.gold.isUnlocked
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
			currencyType: "energy",
			isUnlocked: () => Towns("home").upgrades.pipesBasic.isBought
		}
	],
	upgrades: {
		pipesBasic: {
			id: 0,
			cost: 30,
			currencyType: "bricks",
			title: "Pipes",
			description: `Unlock basic pipes.
				They transport resources based on the capacity of the attached input containers.`,
			effect: 0.02
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
		},
		win: {
			id: 3,
			cost: 0.5,
			currencyType: "elixir",
			title: "########",
			description: "Consume the elixir.",
			effect: 1
		},
	}
});