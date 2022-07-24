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
			cost: 10,
			max: 1,
			id: 0
		}
	}
};