export const ResourceTypes = [
	"earth",
	"water",
	"clay",
	"wood",
	"bricks",
	"stone",
	"coal",
	"steam",
	"energy",
	"fire",
	"essence",
	"sand",
	"glass",
	"lava",
	"stoneDust",
	"vitriol",
	"iron",
	"lead",
	"copper",
	"silver",
	"gold",
	"quicksilver",
	"purity",
	"elixir",
] as const;

export type ResourceType = typeof ResourceTypes[number];

export interface ResourceData {
	resource: ResourceType,
	amount: number
}

export interface Recipe {
  input: {
    resource: ResourceType | "none";
    amount: number;
  };
  output: {
		resource: ResourceType;
		amount: number
	};
  energyUsage?: number;
  fuelUsage?: number;
  isUnlocked?: () => boolean;
}