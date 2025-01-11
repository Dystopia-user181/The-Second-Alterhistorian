<script setup lang="ts">
import ModalWrapper from "./ModalWrapper.vue";
</script>

<template>
	<ModalWrapper class="c-info">
		<template #header>
			Info
		</template>
		<br>
		<span class="c-info__body">
			This game was heavily inspired by
			<a
				href="https://nagshell.github.io/elemental-inception-incremental/"
				target="_blank"
			>
				The First Alkahistorian
			</a>
			and I owe it for giving me this idea. If you're enjoying this game
			you will definitely enjoy that too.
			<br>
			<br>
			If you want to contribute to this game, you may visit its github page below. Joining
			the discord for more in depth discussion of development work is also recommended.
			<br>
			<br>
			Credits:<br>
			Scarlet / Dystopia181: Main dev<br>
			Brian bugh: Co-dev<br><br>
			BaineGames: Contributor
		</span>
		<br>
		<br>
		<a
			href="https://discord.gg/DVy4XjB"
			target="_blank"
			class="fa-brands fa-discord"
			title="Discord"
		/>
		<a
			href="https://github.com/Dystopia-user181/The-Second-Alterhistorian"
			target="_blank"
			class="fa-brands fa-github"
			title="Contribute"
		/>
		<a
			href="https://buymeacoffee.com/s.composer"
			target="_blank"
			class="fas fa-dollar-sign"
			title="Donate"
		/>
	</ModalWrapper>
</template>

<style scoped>
.c-info {
	width: 600px;
}

.c-info__body {
	font-size: 16px;
}

.fa-brands, .fas {
	font-size: 60px;
	margin: 3px 20px;
}
</style>