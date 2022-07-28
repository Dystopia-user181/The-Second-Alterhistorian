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
		}
	]
};