/** Generic behavior for generated project pages. */

function honorReducedMotion() {
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  document.querySelectorAll('video[autoplay]').forEach((video) => {
    video.removeAttribute('autoplay');
    video.pause();
    video.controls = true;
  });
}

async function mountInteractiveApp(container) {
  const entry = container.dataset.entry;
  if (!entry) return;

  const mountPoint = container.querySelector('.interactive-mount');
  const errorElement = container.querySelector('.interactive-error');

  try {
    // Resolve against the document, not this file under static/js/. This keeps
    // ./static/wasm/demo.js portable on both root and project GitHub Pages URLs.
    const moduleUrl = new URL(entry, document.baseURI).href;
    const module = await import(moduleUrl);
    const exportName = container.dataset.export || 'mount';
    const mount = exportName === 'default' ? module.default : module[exportName];
    if (typeof mount !== 'function') {
      throw new TypeError(`Module does not export a ${exportName}() function`);
    }
    const options = JSON.parse(container.dataset.options || '{}');
    mountPoint.replaceChildren();
    await mount(mountPoint, options);
  } catch (error) {
    console.error('Could not start interactive application:', error);
    errorElement.textContent = 'The interactive demo could not be loaded.';
    errorElement.hidden = false;
  }
}

function startSyncedGifs(container) {
  const images = [...container.querySelectorAll('img')];
  if (images.length < 2) return;
  const sources = images.map((image) => image.getAttribute('src'));
  if (sources.some((src) => !src)) return;

  images.forEach((image) => {
    image.style.visibility = 'hidden';
  });

  const ready = images.map((image) => (
    typeof image.decode === 'function' ? image.decode().catch(() => {}) : Promise.resolve()
  ));
  Promise.all(ready).then(() => {
    images.forEach((image) => {
      image.removeAttribute('src');
    });
    images.forEach((image, index) => {
      image.src = sources[index];
    });
    images.forEach((image) => {
      image.style.visibility = '';
    });
  });
}

honorReducedMotion();
document.querySelectorAll('[data-sync-gifs]').forEach(startSyncedGifs);
document.querySelectorAll('.interactive-app').forEach(mountInteractiveApp);
