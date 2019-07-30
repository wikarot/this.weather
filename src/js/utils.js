export const NEAR = 1, FAR = 5, Z_OFF = 3;
export let city_labels = []; // id, cityName, label, dot, line, x, y

export function removeFromCityLabels(id) {
  city_labels = city_labels.filter(item => item.id !== id); // remove it from the "list"
}

export let initDone = false;
export function setInitDone() {
  // init makes a callback when run the last line
  // and calls for initWeatherMapsObj (camera, renderer and controls)
  initDone = true;
}