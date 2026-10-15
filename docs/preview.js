const frame = document.querySelector('#preview');
let observer;
function fit() {
  const fixed = document.querySelector('#viewport').checked;
  const height = document.querySelector('#height').value;
  try { frame.style.height = (fixed ? (height === 'auto' ? Math.max(480, innerHeight - 150) : Number(height)) : frame.contentDocument.body.scrollHeight) + 'px'; } catch (_) {}
  const width = Number(document.querySelector('#width').value);
  const scale = Math.min(1, (document.documentElement.clientWidth - 48) / width);
  frame.style.transform = `scale(${scale})`;
  frame.style.transformOrigin = 'top left';
  frame.style.marginLeft = Math.max(0, (document.documentElement.clientWidth - 48 - width * scale) / 2) + 'px';
  frame.parentElement.style.height = (parseFloat(frame.style.height) * scale + 48) + 'px';
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

document.querySelector('#viewport').addEventListener('change', fit);
addEventListener('resize', fit);

document.querySelector('#height').addEventListener('change',fit);
