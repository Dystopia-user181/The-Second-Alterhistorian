import { GameDatabase } from "../game-database";

GameDatabase.machines.shoveller = {
	name: "shoveller",
	inputs: [],
	outputs: [{
		capacity: () => 10,
		produces: {
			resource: "earth",
			amount: 0.3
		}
	}],
	upgrades: {
		capacity: {
			id: 0,
			cost: 10,
			max: 1,
			title: "Capacity",
			description: "Incrcease capacity"
		}
	}
};