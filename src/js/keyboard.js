window.shiftDown = false;

window.addEventListener("keydown", e => {
	shiftDown = e.shiftKey;
});

window.addEventListener("keyup", e => {
	shiftDown = e.shiftKey;
});