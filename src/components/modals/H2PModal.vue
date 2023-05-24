<script setup>
import ModalWrapper from "./ModalWrapper.vue";
</script>

<template>
	<modal-wrapper class="c-h2p">
		<template #header>
			How To Play
		</template>
		<span class="c-h2p__body">
			NOTE: This game is not optimised for play on mobile devices, or anything that doesn't
			have mouse controls.
			<br>
			<br>
			<table>
				<tr>
					<td>Left Click</td>
					<td>Extract/Insert resources slowly</td>
				</tr>
				<tr>
					<td>Right Click</td>
					<td>Extract/Insert resources instantly</td>
				</tr>
				<tr>
					<td>Arrow Keys/Dragging</td>
					<td>Pan the viewing grid</td>
				</tr>
				<tr>
					<td>Scrollwheel</td>
					<td>Zoom in/out</td>
				</tr>
				<tr><br></tr>
				<tr>
					<td>Glowing Green</td>
					<td>Upgrade partially available</td>
				</tr>
				<tr>
					<td>Glowing Yellow</td>
					<td>Upgrade fully available</td>
				</tr>
			</table>
		</span>
	</modal-wrapper>
</template>

<style scoped>
.c-h2p {
	width: 600px;
}

.c-h2p__body {
	font-size: 16px;
}

table {
	display: inline-block;
}

td {
	text-align: left;
	padding: 0 10px;
}
</style>