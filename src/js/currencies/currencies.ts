import { ResourceType, ResourceTypes } from "@/types/resources";

import { player } from "@/js/player";


export interface CurrencyDBEntry {
	readonly colour: string
	readonly value: number
	readonly description: string
}

class Currency {
	config: CurrencyDBEntry;
	type: ResourceType;

	constructor(config: CurrencyDBEntry, type: ResourceType) {
		this.config = config;
		this.type = type;
	}

	get colour() {
		return this.config.colour;
	}

	get value() {
		return this.config.value;
	}

	get description() {
		return this.config.description;
	}

	get isUnlocked(): boolean {
		// `player` isn't typed yet, ignore this monstrosity
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		// eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
		return player.unlockedCurrencies[this.type];
	}

	set isUnlocked(x) {
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
		player.unlockedCurrencies[this.type] = x;
	}

	sell(x : number) {
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		player.money += x * this.value;
	}
}

const CurrenciesDB: Record<ResourceType, CurrencyDBEntry> = {
	earth: {
		colour: "#008800",
		value: 0.1,
		description: "One of the basic elements. Produced by simple digging."
	},
	water: {
		colour: "#4296c7",
		value: 0.3,
		description: "One of the basic elements. Produced by collection by the river."
	},
	steam: {
		colour: "#8090a0",
		value: 0.4,
		description: "What happens if you burn water?"
	},
	clay: {
		colour: "#6e7379",
		value: 1.2,
		description: "The Tony Process invented in 1436 allows you to waterlog Earth."
	},
	bricks: {
		colour: "#aa5544",
		value: 2.2,
		description: "Sturdy kiln-fired material. Not very useful for alchemy, but useful for building."
	},
	wood: {
		colour: "#aa6644",
		value: 0.5,
		description: "One of the basic elements. Produced by basic extraction from trees."
	},
	coal: {
		colour: "#060302",
		value: 2.5,
		description: "Some Chinese scientist dug a hole in the ground and found this black tarry substance."
	},
	stone: {
		colour: "#888c8d",
		value: 1.5,
		description: "Not particularly useful on its own, but good for building."
	},
	stoneDust: {
		colour: "#8f806b",
		value: 1.5,
		description: `Not particularly useful on its own at all. But its high surface area make it a good reactant.
		If it even reacts with anything at all.`
	},
	sand: {
		colour: "#93a070",
		value: 1.1,
		description: "This powdery substance can be used to make a significantly less powdery one."
	},
	glass: {
		colour: "#41919b",
		value: 3,
		description: "Missing the boro part of borosilicate. I'm sure it'll be fine."
	},
	purity: {
		colour: "#ffffff88",
		value: 0,
		description: "Was the glass sample pure? I sure hope so."
	},
	energy: {
		colour: "#10c9d0",
		value: 3,
		description: "The ultimate enabler of all things alchemy."
	},
	fire: {
		colour: "#ff8000",
		value: 12,
		description: "One of the basic elements. Produced by complicated extraction from coal."
	},
	essence: {
		colour: "#966fcf",
		value: 20,
		description: "The most essence-est of essences."
	},
	lava: {
		colour: "#c83400",
		value: 15,
		description: "Now you have stone but hot. Please put it back inside the volcano it came from."
	},
	vitriol: {
		colour: "#b3ab57",
		value: 20,
		description: "The element of Luna. The enabler of transmutation"
	},
	iron: {
		colour: "#696B5e",
		value: 10,
		description: "The basis of transmutation."
	},
	lead: {
		colour: "#525a63",
		value: 20,
		description: "Very toxic, and very cheap too. Wonder if you could poison 1 or 2 people with it."
	},
	copper: {
		colour: "#cb6d41",
		value: 35,
		description: "Shiny red metal. Sadly circuitry hasn't been invented yet."
	},
	silver: {
		colour: "#a0a8ac",
		value: 60,
		description: "Shinier greyish metal. You're going into the noble metals now."
	},
	gold: {
		colour: "#debc35",
		value: 100,
		description: "If you were a Western Alchemist you'd be done here. But are you a Western Alchemist?"
	},
	quicksilver: {
		colour: "#876874",
		value: 200,
		description: "The element of Sol. The endpoint of transmutation."
	},
	elixir: {
		colour: "#6f2eb0",
		value: 0,
		description: "consumeCONSUMEconsumeCONSUMEconsume"
	}
};

export const CurrenciesList: Currency[] = [];
export const Currencies: Record<ResourceType, Currency> = (function() {
	const Currencies: Record<any, Currency> = {};
	for (const i of ResourceTypes) {
		const newC = new Currency(CurrenciesDB[i], i);
		Currencies[i] = newC;
		CurrenciesList.push(newC);
	}
	return Currencies as Record<ResourceType, Currency>;
}());