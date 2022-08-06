<script>
import { Player } from "./../js/player";

function predictableRandom(x) {
	let start = Math.pow(x % 97, 4.3) * 232344573;
	const a = 15485863;
	const b = 521791;
	start = (start * a) % b;
	for (let i = 0; i < (x * x) % 90 + 90; i++) {
		start = (start * a) % b;
	}
	return start / b;
}

function randomSymbol() {
	return String.fromCharCode(Math.floor(Math.random() * 50) + 192);
}

const WordShift = {
	wordCycle(list, noBuffer = false) {
		const len = list.length;
		const tick = Math.floor(Date.now() / 250) % (len * 5);
		const mod5 = ((Date.now() / 250) % (len * 5)) % 5;
		const largeTick = Math.floor(tick / 5);
		let v = list[largeTick];

		if (mod5 < 0.6) {
			v = this.blendWords(list[(largeTick + list.length - 1) % list.length], list[largeTick], (mod5 + 0.6) / 1.2);
		} else if (mod5 > 4.4) {
			v = this.blendWords(list[largeTick], list[(largeTick + 1) % list.length], (mod5 - 4.4) / 1.2);
		}

		v = this.randomCrossWords(v, 0.1 * Math.pow(mod5 - 2.5, 4) - 0.6);
		if (noBuffer) return v;

		const maxWordLen = Math.max(...list.map(x => x.length));
		const bufferSpace = (maxWordLen - v.length) / 2;

		return " ".repeat(Math.ceil(bufferSpace)) + v + " ".repeat(Math.floor(bufferSpace));
	},
	randomCrossWords(str, frac = 0.7) {
		if (frac <= 0) return str;
		const x = str.split("");
		for (let i = 0; i < x.length * frac; i++) {
			const randomIndex = Math.floor(predictableRandom(Math.floor(Date.now() / 500) % 964372 + 1.618 * i) * x.length);
			x[randomIndex] = randomSymbol();
		}
		return x.join("");
	},
	blendWords(first, second, param) {
		if (param <= 0) return first;
		if (param >= 1) return second;
		return first.substring(0, first.length * (1 - param)) +
			second.substring(second.length * (1 - param), second.length);
	}
};

function elixirText() {
	return WordShift.wordCycle(["elixir", "poison", "venom"]);
}

function transmuteText() {
	return WordShift.wordCycle(["Transmutation", "Metamorphosis", "Mutilation"]);
}

function immortalText() {
	return WordShift.wordCycle(["immortality", "perpetuity", "eternity"]);
}

const Quotes = [{
	cel: "sol",
	line: () => "Ah. The fabled alchemist I keep hearing about."
},
{
	cel: "sol",
	line: () => "You've finally brought yourself here."
},
{
	cel: "sol",
	line: () => "By cheating and plundering your way through, no less."
},
{
	cel: "sol",
	line: () => `Still holding onto your dearest ${elixirText()} the whole time you were coming up here.`
},
{
	cel: "sol",
	line: () => `Is this all Alchemy is to you?                    \n${transmuteText()} of elements into the gold that you so worth, using the\
 ${elixirText()} that is so precious to you, to attain ${immortalText()} in a futile attempt?`
},
{
	cel: "sol",
	line: () => "I'm afraid it doesn't work like that.                    \nNothing works like that."
},
{
	cel: "sol",
	line: () => "My dearest disciple.                    What shall we do with this person?"
},
{
	cel: "luna",
	line: () => `They are a hack and a fraud, attempting to cheat their way through the system of Afterlife and Earth to attain\
 ${immortalText()}.`
},
{
	cel: "luna",
	line: () => "Banish them. Forever, from reaching the afterlife so many of them so seek."
},
{
	cel: "luna",
	line: () => "To punish them eternally for their hubris."
}];

export default {
	name: "EndCutscene",
	data() {
		return {
			lineNumber: 0,
			brightness: -0.5,
			currentLine: "",
			currentCel: "???",
			updateCycle: 0
		};
	},
	methods: {
		update() {
			clearInterval(window.saveInterval);
			if (this.lineNumber >= Quotes.length) {
				this.brightness = this.brightness - 0.003;
				if (this.brightness <= -0.2) Player.reset();
			}
			else this.brightness = Math.min(this.brightness + 0.005, 1);
			if (this.brightness < 1) return;
			this.updateCycle = !this.updateCycle;
			if (this.updateCycle) return;
			const line = Quotes[this.lineNumber];
			this.currentCel = line.cel;
			const lineAnim = this.currentLine.length;
			this.currentLine = line.line().slice(0, lineAnim + 1);
		},
		nextLine() {
			if (this.currentLine.length !== Quotes[this.lineNumber].line().length) return;
			this.lineNumber++;
			this.currentLine = "";
		}
	}
}
</script>

<template>
	<div
		class="c-end-cutscene"
		:style="{ filter: `brightness(${Math.max(brightness, 0)})` }"
		@click="nextLine()"
	>
		<div :class="`c-end-cutscene__text c-end-cutscene__text--${currentCel}`">
			{{ currentLine }}
		</div>
		<div :class="`c-end-cutscene__cel-label c-end-cutscene__cel-label--${currentCel}`">
			{{ currentCel.capitalize() }}
		</div>
		<div :class="`c-end-cutscene__cel-image c-end-cutscene__cel-image--${currentCel}`" />
	</div>
</template>

<style scoped>
.c-end-cutscene {
	position: absolute;
	top: 0;
	left: 0;
	width: 100vw;
	height: 100vh;
	background-color: #242424;
	font-family: monospace;
}

.c-end-cutscene__cel-image {
	position: absolute;
	left: -70px;
	bottom: 275px;
	width: 200px;
	height: 200px;
	border-radius: 100%;
	background: #fff;
}

.c-end-cutscene__cel-image--sol {
	background: #ff0;
}

.c-end-cutscene__cel-image--luna {
	background: #cad;
}

.c-end-cutscene__cel-label {
	position: absolute;
	left: 90px;
	bottom: 299px;
	width: 100px;
	text-align: center;
	padding: 4px;
	font-size: 18px;
	transform: skewX(15deg);
	border: 2px solid #fff;
	background: #fff3;
	border-bottom: none;
}

.c-end-cutscene__cel-label--sol {
	border-color: #ff0;
	background: #ff03;
	color: #ff0a;
}

.c-end-cutscene__cel-label--luna {
	border-color: #cadb;
	background: #cad3;
	color: #cada;
}

.c-end-cutscene__text {
	position: absolute;
	left: 0;
	bottom: 0;
	width: 100%;
	height: 300px;
	padding: 30px;
	border-top: 2px solid #fff;
	background: #fff3;
}

.c-end-cutscene__text--sol {
	border-color: #ff0;
	background: #ff03;
	color: #ff0a;
}

.c-end-cutscene__text--luna {
	border-color: #cad;
	background: #cad3;
	color: #cada;
}
</style>
