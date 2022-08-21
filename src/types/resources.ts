export type ResourceType =
	"bricks" |
	"clay" |
	"coal" |
	"copper" |
	"earth" |
	"elixir" |
	"energy" |
	"essence" |
	"fire" |
	"glass" |
	"gold" |
	"iron" |
	"lava" |
	"lead" |
	"purity" |
	"quicksilver" |
	"sand" |
	"silver" |
	"steam" |
	"stone" |
	"stoneDust" |
	"vitriol" |
	"water" |
	"wood";

export interface ResourceData {
	resource: ResourceType,
	amount: number
}