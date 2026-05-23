import { createBlackHoleScene } from './blackhole.js';

const container = document.getElementById('container');
const params = new URLSearchParams(window.location.search);
const returnUrl = params.get('return') || '/';

createBlackHoleScene(container, () => {
  setTimeout(() => {
    window.location.href = returnUrl + '#scene=whiteout1';
  }, 8000);
});
