const themeControl = document.querySelector('#theme');
if (new URLSearchParams(location.search).get('theme') === 'charcoal') themeControl.value = 'charcoal';
function applyTheme() {
  const doc = frame.contentDocument;
  doc.querySelector('#review-theme')?.remove();
  if (themeControl.value === 'charcoal') {
    const link = doc.createElement('link');
    link.id = 'review-theme'; link.rel = 'stylesheet';
    link.href = '/docs/charcoal-preview.css';
    doc.head.append(link);
  }
}
themeControl.addEventListener('change', applyTheme);
const frame = document.querySelector('#preview');
let observer;
function fit() {
  if (document.querySelector('#viewport').checked) { frame.style.height = Math.max(480, innerHeight - 150) + 'px'; return; }
  try { frame.style.height = frame.contentDocument.body.scrollHeight + 'px'; } catch (_) {}
}
frame.addEventListener('load', () => {
  if (observer) observer.disconnect();
  applyTheme();
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
