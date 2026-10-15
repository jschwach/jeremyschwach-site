const frame = document.querySelector('#preview');
function fit() { try { frame.style.height = frame.contentDocument.documentElement.scrollHeight + 'px'; } catch (_) {} }
frame.addEventListener('load', () => { frame.style.height = '900px'; fit(); });
document.querySelector('#page').addEventListener('change', event => { frame.src = event.target.value; });
document.querySelector('#width').addEventListener('change', event => { frame.style.width = event.target.value + 'px'; frame.style.height = '900px'; requestAnimationFrame(fit); });
