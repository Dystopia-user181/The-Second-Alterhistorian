<script>
import { Modals } from "@/js/ui/modals";

export default {
	name: "PopupModal",
	props: {
		modal: {
			type: Object,
			required: true,
		}
	},
	mounted() {
		this.on$("ESCAPE_PRESSED", () => {
			if (!Modals.isOpen) return;
			if (Modals.current.value.hide) Modals.current.value.hide();
			else Modals.hide();
		});
	},
	destroyed() {
		document.activeElement.blur();
	},
};
</script>

<template>
	<div
		v-if="modal"
		class="c-modal-background-overlay"
	>
		<div class="c-modal">
			<component
				:is="modal.component"
				v-bind="modal.props"
			/>
		</div>
	</div>
</template>

<style scoped>
@keyframes a-modal-overlay-fadein {
	from { background-color: rgba(0, 0, 0, 0%); }
	to { background-color: rgba(60, 60, 100, 50%); }
}

.c-modal-background-overlay {
	width: 100%;
	height: 100%;
	position: absolute;
	inset: 0;
	z-index: 6;
	animation: a-modal-overlay-fadein 1s forwards;
}

.c-modal {
	display: inline-block;
	position: absolute;
	top: 50%;
	left: 50%;
	z-index: 7;
	transform: translate(-50%, -50%);
	text-align: center;
	font-size: 14px;
	background-color: #262626;
	border: 2px solid #ffffff;
	padding: 10px;
	min-width: 300px;
	transition-duration: 0.2s;
	border-radius: 10px;
}
</style>