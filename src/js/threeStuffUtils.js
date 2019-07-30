import { Scene } from 'three';

export const NEAR = 1; // near, posible visible distance from camera
export const FAR = 5; // far, visible distance from camera
export const Z_OFF = 3; // camera offset from 0 (Z axis)
export let city_labels = []; // id, cityName, label, dot, line, x, y
export const SPH_RAD = 0.825; // sphere radius
export const RES = 512; // weather map resolution

export function removeFromCityLabels(id) {
  city_labels = city_labels.filter(item => item.id !== id); // remove it from the "list"
}

export let initDone = false;
export function setInitDone() {
  // init makes a callback when run the last line
  // and calls for initWeatherMapsObj (camera, renderer and controls)
  initDone = true;
}

const SCENE = new Scene();

export default SCENE;