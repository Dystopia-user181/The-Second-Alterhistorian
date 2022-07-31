export const migrations = [
	player => {
		for (const machine of Object.values(player.towns.home.machines)) {
			if (machine.type === "essencePurifier") machine.upgrades[0] = 0;
		}
	}
]