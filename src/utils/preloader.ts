const RESOURCES = [
  './royalty.mp3',
  './transition.mp3',
  './earth.jpg',
  './background.jpg',
  './avatar.jpg',
  './icons.svg',
];

export function preloadResources() {
  for (const url of RESOURCES) {
    if (url.endsWith('.mp3')) {
      fetch(url).catch(() => {});
    } else {
      const img = new Image();
      img.src = url;
    }
  }
}
