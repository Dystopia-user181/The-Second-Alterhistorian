<script setup lang="ts">
import { onMount } from "@/components/mixins";

import { Player } from "@/js/player";

import { str } from "@/utils";


function predictableRandom(x: number) {
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
	wordCycle(list: string[], noBuffer = false) {
		const len = list.length;
		const tick = Math.floor(Date.now() / 250) % (len * 5);
		const mod5 = ((Date.now() / 250) % (len * 5)) % 5;
		const largeTick = Math.floor(tick / 5);
		let v = list[largeTick];

		if (mod5 < 0.6) {
			v = WordShift.blendWords(list[(largeTick + list.length - 1) % list.length], list[largeTick],
				(mod5 + 0.6) / 1.2);
		} else if (mod5 > 4.4) {
			v = WordShift.blendWords(list[largeTick], list[(largeTick + 1) % list.length], (mod5 - 4.4) / 1.2);
		}

		v = WordShift.randomCrossWords(v, 0.1 * Math.pow(mod5 - 2.5, 4) - 0.6);
		if (noBuffer) return v;

		const maxWordLen = Math.max(...list.map(x => x.length));
		const bufferSpace = (maxWordLen - v.length) / 2;

		return " ".repeat(Math.ceil(bufferSpace)) + v + " ".repeat(Math.floor(bufferSpace));
	},
	randomCrossWords(string: string, frac = 0.7) {
		if (frac <= 0) return string;
		const x = string.split("");
		for (let i = 0; i < x.length * frac; i++) {
			const randomIdx = Math.floor(
				predictableRandom(Math.floor(Date.now() / 500) % 964372 + 1.618 * i) * x.length
			);
			x[randomIdx] = randomSymbol();
		}
		return x.join("");
	},
	blendWords(first: string, second: string, param: number) {
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
	line: () => "You've finally found your way here."
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
	line: () => `Is this all Alchemy is to you?                 \n${transmuteText()} of elements into the gold that you\
 so worth, using the ${elixirText()} that is so precious to you, to attain ${immortalText()} in a futile attempt?`
},
{
	cel: "sol",
	line: () => "I'm afraid it doesn't work like that.                 \nNothing works like that."
},
{
	cel: "sol",
	line: () => "My dearest disciple.                 What shall we do with this person?"
},
{
	cel: "luna",
	line: () => `They are a hack and a fraud, attempting to cheat their way through the system of Afterlife and Earth\
 to attain ${immortalText()}.`
},
{
	cel: "luna",
	line: () => "Banish them. Forever, from reaching the afterlife so many of them so seek."
},
{
	cel: "luna",
	line: () => "To punish them eternally for their hubris."
}];

let lineNumber = $ref(0);
let brightness = $ref(-0.5);
let currentLine = $ref("");
let currentCel = $ref("???");
let updateCycle = $ref(false);

function nextLine() {
	if (currentLine.length !== Quotes[lineNumber].line().length) return;
	lineNumber++;
	currentLine = "";
}

onMount({
	render() {
		if (lineNumber >= Quotes.length) {
			brightness -= 0.003;
			if (brightness <= -0.2) Player.reset();
		} else brightness = Math.min(brightness + 0.005, 1);
		if (brightness < 1) return;
		updateCycle = !updateCycle;
		if (updateCycle) return;
		const line = Quotes[lineNumber];
		currentCel = line.cel;
		const lineAnim = currentLine.length;
		currentLine = line.line().slice(0, lineAnim + 1);
	}
});
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
			{{ str(currentCel).capitalize }}
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