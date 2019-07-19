let intervalHandler = 0;
let target = 0;
let currentScroll = 0;
let step = 0;
let cont = 0;

/**
 * Init Smooth Scroll
 */
export function initSS(newTarget) {
  clearInterval(intervalHandler);
  cont = 0;
  target = newTarget;
  currentScroll = document.documentElement.scrollTop;
  step = (currentScroll - target) / 60;
  intervalHandler = setInterval(runSS, 0);
}

/**
 * Cancel Smooth Scroll
 */
export function cancelSS() {
  clearInterval(intervalHandler);
}

function runSS() {
  let diff = step * cont;
  window.scrollTo(0, currentScroll - diff);
  if (cont === 60) clearInterval(intervalHandler);
  cont++;
}