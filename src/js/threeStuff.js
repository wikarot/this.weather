import * as THREE from 'three';
import { suc, dbg } from './customConsole';
import { Z_OFF, setInitDoneTrue } from '../components/WeatherMaps';

const merToEqrWorker = new Worker('mercatorToEquirectangular.js');
const TEXTURE = new THREE.TextureLoader().load('https://res.cloudinary.com/wikarot/image/upload/v1560488304/globe_src/texture.png');
const SPECULAR = new THREE.TextureLoader().load('https://res.cloudinary.com/wikarot/image/upload/v1560339154/globe_src/spec.png');
const BUMP = new THREE.TextureLoader().load('https://res.cloudinary.com/wikarot/image/upload/v1560339155/globe_src/bump.jpg');
TEXTURE.encoding = THREE.sRGBEncoding;
SPECULAR.encoding = THREE.sRGBEncoding;
BUMP.encoding = THREE.sRGBEncoding;
const URL = {
  base: 'https://tile.openweathermap.org/map/',
  last1: '.png?appid=b280c897878592322aafe56701248929',
  last2: '.png?appid=cdd659df7dc048884575b9451ddf1330'
};
const MAP = ['clouds_new', 'precipitation_new', 'pressure_new', 'wind_new', 'temp_new'];
const SPH_SUB_DIV = 64; // sphere sub divisions
export const SPH_RAD = 0.825; // sphere radius
const SPH_SCALE = 1.006; // for atmosphere and weather
export const RES = 512; // weather map resolution
const T = 2; // tiles by side (total tiles = T * T)
const T_SIZE = RES / T;
export const LIGHT_ON = 0.78;
export const LIGHT_OFF = 0.015;
const BASE_SPH_GEO = new THREE.SphereBufferGeometry(SPH_RAD, SPH_SUB_DIV, SPH_SUB_DIV);
BASE_SPH_GEO.rotateY(THREE.Math.degToRad(-90)); // horizontal rotation offset correction

export const SCENE = new THREE.Scene();
export const AMB = new THREE.AmbientLight(0xffffff, LIGHT_OFF);
export const SUN = new THREE.DirectionalLight(0xffffff, LIGHT_ON);
export const WEATHER_CTX_MAT = [ // context, material
  [undefined, undefined],
  [undefined, undefined],
  [undefined, undefined],
  [undefined, undefined],
  [undefined, undefined]
];

export async function init() {
  SCENE.fog = new THREE.Fog(0x74c0ff, Z_OFF - SPH_RAD * 0.82, Z_OFF);
  setSunPosition(SUN);

  ////////////////////////////////
  // MODELS
  ////////////////////////////////
  const PHYS = new THREE.Mesh(); // physic earth globe
  PHYS.geometry = BASE_SPH_GEO;
  PHYS.material = new THREE.MeshPhongMaterial({
    map: TEXTURE,
    specularMap: SPECULAR,
    specular: new THREE.Color(0x1a1a1a),
    shininess: 55.0,
    bumpMap: BUMP,
    bumpScale: 0.008,
  });
  PHYS.matrixAutoUpdate = false;
  //
  for (let i = 0; i < 5; i++) {
    WEATHER_CTX_MAT[i][0] = document.getElementById('weather_map_' + i).getContext('2d');
    WEATHER_CTX_MAT[i][1] = new THREE.MeshPhongMaterial();
    const AUX = new THREE.CanvasTexture(WEATHER_CTX_MAT[i][0].canvas);
    AUX.encoding = THREE.sRGBEncoding;
    WEATHER_CTX_MAT[i][1].map = AUX;
    WEATHER_CTX_MAT[i][1].shininess = 0.0;
    WEATHER_CTX_MAT[i][1].transparent = true;
    const WEATHER = new THREE.Mesh(BASE_SPH_GEO, WEATHER_CTX_MAT[i][1]);
    WEATHER.layers.set(i + 1);
    WEATHER.scale.multiplyScalar(SPH_SCALE);
    WEATHER.matrixAutoUpdate = false;
    AMB.layers.enable(i + 1);
    SUN.layers.enable(i + 1);
    SCENE.add(WEATHER);
  }
  //
  const ATMO = new THREE.Mesh(); // atmosphere
  ATMO.geometry = BASE_SPH_GEO;
  ATMO.material = new THREE.MeshPhongMaterial({
    color: 0xffffff,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.05,
    shininess: 0.0,
  });
  ATMO.scale.multiplyScalar(SPH_SCALE * .9);
  ATMO.matrixAutoUpdate = false;

  ////////////////////////////////
  // ALL TOGHETHER
  ////////////////////////////////
  SCENE.add(PHYS, ATMO, AMB, SUN);

  setInterval(updateSunPosition, 180000); // 3m
  setInitDoneTrue();
}

function updateSunPosition() {
  setSunPosition(SUN);
}

function setSunPosition(sun) {
  const HH = new Date().getUTCHours();
  const MM = new Date().getUTCMonth();
  const MATRIX = new THREE.Matrix4();
  let rotY = 0;
  let rotX = 0;
  // X axis 'inclination' (for months)
  if (MM <= 6) rotX = -(8 * MM) + 24; // y = -8x+24
  else rotX = 8 * MM - 72; // y = 8x-72
  // Y axis rotation (for hours)
  rotY = 180 - (HH / 24) * 360;
  MATRIX.makeRotationFromEuler(new THREE.Euler(
    THREE.Math.degToRad(rotX),
    THREE.Math.degToRad(rotY),
    0, 'YXZ'));
  sun.position.set(0, 0, Z_OFF * 10); // reset the position with just a Z axis displacement
  sun.position.applyMatrix4(MATRIX); // Rotation
  sun.lookAt(0, 0, 0);
}

/**
 * Launch the process of downloading mercator projection (tiles)
 * and convert them into a single equirectangular projection (map)
 * @param {Number} i Weather map option (index)
 */
export function createWeatherMap(i) {
  const MERCATOR_CANVAS = document.createElement('canvas');
  // 512x512
  MERCATOR_CANVAS.width = RES;
  MERCATOR_CANVAS.height = RES;
  const MERCATOR_CTX = MERCATOR_CANVAS.getContext('2d');
  let cont = 0;
  // merc. proj. images (2x2) to generate a single eqr. proj.
  let X00 = new Image(T_SIZE, T_SIZE);
  let X10 = new Image(T_SIZE, T_SIZE);
  let X01 = new Image(T_SIZE, T_SIZE);
  let X11 = new Image(T_SIZE, T_SIZE);
  X00.crossOrigin = 'Anonymous';
  X10.crossOrigin = 'Anonymous';
  X01.crossOrigin = 'Anonymous';
  X11.crossOrigin = 'Anonymous';
  X00.src = URL.base + MAP[i] + '/1/0/0' + URL.last1;
  X10.src = URL.base + MAP[i] + '/1/1/0' + URL.last1;
  X01.src = URL.base + MAP[i] + '/1/0/1' + URL.last2;
  X11.src = URL.base + MAP[i] + '/1/1/1' + URL.last2;
  X00.onload = async () => await drawMapTiles(X00, T_SIZE * 0, T_SIZE * 0);
  X10.onload = async () => await drawMapTiles(X10, T_SIZE * 1, T_SIZE * 0);
  X01.onload = async () => await drawMapTiles(X01, T_SIZE * 0, T_SIZE * 1);
  X11.onload = async () => await drawMapTiles(X11, T_SIZE * 1, T_SIZE * 1);
  async function drawMapTiles(img, x, y) {
    MERCATOR_CTX.drawImage(img, x, y);
    const T_DATA = MERCATOR_CTX.getImageData(x, y, T_SIZE, T_SIZE);
    const L = T_DATA.data.length;
    // Alpha and color adjust
    if (i === 0) { // Clouds
      for (let i = 0; i < L; i += 4) {
        let A = T_DATA.data[i + 3];
        A = (A - (255 * 0.6)) / 0.4; // range displacement and scale
        T_DATA.data[i + 0] = 255; // R
        T_DATA.data[i + 1] = 255; // G
        T_DATA.data[i + 2] = 255; // B
        T_DATA.data[i + 3] = A * 1.8;
      }
    } else if (i === 1) { // Precipitation
      for (let i = 0; i < L; i += 4) {
        T_DATA.data[i + 0] = 255; // R
        T_DATA.data[i + 1] = 255; // G
        T_DATA.data[i + 2] = 255; // B
        T_DATA.data[i + 3] *= 1.8;
      }
    } else if (i === 2) { // Pressure
      for (let i = 0; i < L; i += 4) {
        T_DATA.data[i + 3] *= 1.5;
      }
    } else if (i === 3) { // Wind
      for (let i = 0; i < L; i += 4) {
        const R = T_DATA.data[i + 0];
        const G = T_DATA.data[i + 1];
        //const B = TILE.data[i + 2];
        T_DATA.data[i + 0] = 255 - G * 0.75; // R
        T_DATA.data[i + 1] = 255 - R * 0.75; // G
        T_DATA.data[i + 2] = 255 - 255; // B
        T_DATA.data[i + 3] *= 1.5;
      }
    } else if (i === 4) { // Temp
      for (let i = 0; i < L; i += 4) {
        T_DATA.data[i + 3] *= 1.8;
      }
    }
    MERCATOR_CTX.putImageData(T_DATA, x, y);
    cont++;
    if (cont === T * T) { // When all tiles are done: convert Mer. to Eqr.
      for (let y = 0; y < RES; y++) { // Take each line to get his new position
        const LINE = MERCATOR_CTX.getImageData(0, y, RES, 1);
        merToEqrWorker.postMessage([LINE, y, RES, RES / 2, i]);
      }
    }
  }
}

/* function createWeatherMap16x16(i) {
  // const RES nedds to be 1024
  let canvasMer = document.createElement('canvas');
  // 1024x1024
  canvasMer.width = RES;
  canvasMer.height = RES;
  let ctxMer = canvasMer.getContext('2d');
  let cont = 0;
  // The Block Of Code
  let X0000 = new Image(T_SIZE, T_SIZE); X0000.crossOrigin = 'Anonymous'; X0000.src = URL.base + MAP[i] + '/2/0/0' + URL.last1; X0000.onload = async () => { await drawMapTiles(X0000, T_SIZE * 0, T_SIZE * 0); };
  let X0001 = new Image(T_SIZE, T_SIZE); X0001.crossOrigin = 'Anonymous'; X0001.src = URL.base + MAP[i] + '/2/1/0' + URL.last1; X0001.onload = async () => { await drawMapTiles(X0001, T_SIZE * 1, T_SIZE * 0); };
  let X0010 = new Image(T_SIZE, T_SIZE); X0010.crossOrigin = 'Anonymous'; X0010.src = URL.base + MAP[i] + '/2/2/0' + URL.last1; X0010.onload = async () => { await drawMapTiles(X0010, T_SIZE * 2, T_SIZE * 0); };
  let X0011 = new Image(T_SIZE, T_SIZE); X0011.crossOrigin = 'Anonymous'; X0011.src = URL.base + MAP[i] + '/2/3/0' + URL.last1; X0011.onload = async () => { await drawMapTiles(X0011, T_SIZE * 3, T_SIZE * 0); };
  let X0100 = new Image(T_SIZE, T_SIZE); X0100.crossOrigin = 'Anonymous'; X0100.src = URL.base + MAP[i] + '/2/0/1' + URL.last1; X0100.onload = async () => { await drawMapTiles(X0100, T_SIZE * 0, T_SIZE * 1); };
  let X0101 = new Image(T_SIZE, T_SIZE); X0101.crossOrigin = 'Anonymous'; X0101.src = URL.base + MAP[i] + '/2/1/1' + URL.last1; X0101.onload = async () => { await drawMapTiles(X0101, T_SIZE * 1, T_SIZE * 1); };
  let X0110 = new Image(T_SIZE, T_SIZE); X0110.crossOrigin = 'Anonymous'; X0110.src = URL.base + MAP[i] + '/2/2/1' + URL.last1; X0110.onload = async () => { await drawMapTiles(X0110, T_SIZE * 2, T_SIZE * 1); };
  let X0111 = new Image(T_SIZE, T_SIZE); X0111.crossOrigin = 'Anonymous'; X0111.src = URL.base + MAP[i] + '/2/3/1' + URL.last1; X0111.onload = async () => { await drawMapTiles(X0111, T_SIZE * 3, T_SIZE * 1); };
  let X1000 = new Image(T_SIZE, T_SIZE); X1000.crossOrigin = 'Anonymous'; X1000.src = URL.base + MAP[i] + '/2/0/2' + URL.last2; X1000.onload = async () => { await drawMapTiles(X1000, T_SIZE * 0, T_SIZE * 2); };
  let X1001 = new Image(T_SIZE, T_SIZE); X1001.crossOrigin = 'Anonymous'; X1001.src = URL.base + MAP[i] + '/2/1/2' + URL.last2; X1001.onload = async () => { await drawMapTiles(X1001, T_SIZE * 1, T_SIZE * 2); };
  let X1010 = new Image(T_SIZE, T_SIZE); X1010.crossOrigin = 'Anonymous'; X1010.src = URL.base + MAP[i] + '/2/2/2' + URL.last2; X1010.onload = async () => { await drawMapTiles(X1010, T_SIZE * 2, T_SIZE * 2); };
  let X1011 = new Image(T_SIZE, T_SIZE); X1011.crossOrigin = 'Anonymous'; X1011.src = URL.base + MAP[i] + '/2/3/2' + URL.last2; X1011.onload = async () => { await drawMapTiles(X1011, T_SIZE * 3, T_SIZE * 2); };
  let X1100 = new Image(T_SIZE, T_SIZE); X1100.crossOrigin = 'Anonymous'; X1100.src = URL.base + MAP[i] + '/2/0/3' + URL.last2; X1100.onload = async () => { await drawMapTiles(X1100, T_SIZE * 0, T_SIZE * 3); };
  let X1101 = new Image(T_SIZE, T_SIZE); X1101.crossOrigin = 'Anonymous'; X1101.src = URL.base + MAP[i] + '/2/1/3' + URL.last2; X1101.onload = async () => { await drawMapTiles(X1101, T_SIZE * 1, T_SIZE * 3); };
  let X1110 = new Image(T_SIZE, T_SIZE); X1110.crossOrigin = 'Anonymous'; X1110.src = URL.base + MAP[i] + '/2/2/3' + URL.last2; X1110.onload = async () => { await drawMapTiles(X1110, T_SIZE * 2, T_SIZE * 3); };
  let X1111 = new Image(T_SIZE, T_SIZE); X1111.crossOrigin = 'Anonymous'; X1111.src = URL.base + MAP[i] + '/2/3/3' + URL.last2; X1111.onload = async () => { await drawMapTiles(X1111, T_SIZE * 3, T_SIZE * 3); };
  async function drawMapTiles(img, x, y) {
    ctxMer.drawImage(img, x, y);
    cont++;
    const T_DATA = ctxMer.getImageData(x, y, T_SIZE, T_SIZE);
    const L = T_DATA.data.length;
    // Alpha and color adjust
    if (i === 0) { // Clouds
      for (let i = 0; i < L; i += 4) {
        let A = T_DATA.data[i + 3];
        A = (A - (255 * 0.6)) / 0.4; // range displacement and scale
        T_DATA.data[i + 0] = 255; // R
        T_DATA.data[i + 1] = 255; // G
        T_DATA.data[i + 2] = 255; // B
        T_DATA.data[i + 3] = A * 1.8;
      }
    } else if (i === 1) { // Precipitation
      for (let i = 0; i < L; i += 4) {
        T_DATA.data[i + 0] = 255; // R
        T_DATA.data[i + 1] = 255; // G
        T_DATA.data[i + 2] = 255; // B
        T_DATA.data[i + 3] *= 1.8;
      }
    } else if (i === 2) { // Pressure
      for (let i = 0; i < L; i += 4) {
        T_DATA.data[i + 3] *= 1.5;
      }
    } else if (i === 3) { // Wind
      for (let i = 0; i < L; i += 4) {
        const R = T_DATA.data[i + 0];
        const G = T_DATA.data[i + 1];
        //const B = TILE.data[i + 2];
        T_DATA.data[i + 0] = 255 - G * 0.75; // R
        T_DATA.data[i + 1] = 255 - R * 0.75; // G
        T_DATA.data[i + 2] = 255 - 255; // B
        T_DATA.data[i + 3] *= 1.5;
      }
    } else if (i === 4) { // Temp
      for (let i = 0; i < L; i += 4) {
        T_DATA.data[i + 3] *= 1.8;
      }
    }
    ctxMer.putImageData(T_DATA, x, y);
    if (cont === 16) { // When all tiles are done: convert Mer. to Eqr.
      for (let y = 0; y < RES; y++) { // Take each line to get his new position (Y axis)
        const LINE = ctxMer.getImageData(0, y, RES, 1);
        merToEqrWorker.postMessage([LINE, y, RES, RES / 2, i]);
      }
    }
  }
} */

let messageCount = 0;
merToEqrWorker.onmessage = (e) => {
  const I = e.data[0];
  e.data[1].forEach(async merY => {
    await WEATHER_CTX_MAT[I][0].putImageData(merY.content, 0, merY.newY);
  });
  /* for (let i = 0; i < 512; i++) {
    weatherPack[I][0].putImageData(e.data[1][i].content, 0, e.data[1][i].newY);
  } */
  dbg('Mapa equirectangular "' + MAP[I] + '": Creado...');
  WEATHER_CTX_MAT[I][1].map.needsUpdate = true;
  // Put data on map master canvas (from first/default map)
  if (I === 0)
    document.getElementById('map_canvas')
      .getContext('2d')
      .putImageData(WEATHER_CTX_MAT[0][0].getImageData(0, 0, RES, RES * .5), 0, 0);
  messageCount++;
  if (messageCount === 5) suc('Mapas equirectangulares: Finalizados (5 de 5)');
}

/*

LAYERS | NAME
---
0 phisic globe
1 clouds
2 pressipitation
3 pressure
4 wind
5 temperature

*/
