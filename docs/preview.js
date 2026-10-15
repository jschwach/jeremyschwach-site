const frame = document.querySelector('#preview');
let observer;
function fit() {
  try { frame.style.height = frame.contentDocument.body.scrollHeight + 'px'; } catch (_) {}
}
frame.addEventListener('load', () => {
  if (observer) observer.disconnect();
  frame.style.height = '900px';
  fit();
  observer = new ResizeObserver(() => requestAnimationFrame(fit));
  observer.observe(frame.contentDocument.body);
});
document.querySelector('#page').addEventListener('change', event => { frame.src = event.target.value; });
document.querySelector('#width').addEventListener('change', event => {
  frame.style.width = event.target.value + 'px';
  frame.style.height = '900px';
  requestAnimationFrame(fit);
});
