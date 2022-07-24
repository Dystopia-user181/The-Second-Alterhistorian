import { initializeMachines } from "./machines";

export const Player = {
	defaultStart() {
		return {
			money: 0,
			towns: {
				home: {
					machines: {
						0: {
							type: "shoveller",
							x: 20,
							y: 20,
							upgrades: {
								0: 0,
								1: 0
							},
							outputs: [[]]
						}
					}
				}
			},
			currentlyIn: "home",
			holding: {
				resource: "earth",
				amount: 0
			}
		};
	},
	load() {
		// some stuff here
		initializeMachines();
	}
};

window.player = Player.defaultStart();

Player.load();