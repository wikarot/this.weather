import {
  TextureLoader, sRGBEncoding, SphereBufferGeometry, Math as THREE_MATH,
  AmbientLight, DirectionalLight, Fog, Mesh, Euler, MeshPhongMaterial,
  Color, Matrix4, CanvasTexture, DoubleSide
} from 'three';
import SCENE, { Z_OFF, setInitDone, SPH_RAD, RES } from './threeStuffUtils';
import { suc, dbg } from './customConsole';

const merToEqrWorker = new Worker('mercatorToEquirectangular.js');
const URL = {
  base: 'https://tile.openweathermap.org/map/',
  last1: '.png?appid=b280c897878592322aafe56701248929',
  last2: '.png?appid=cdd659df7dc048884575b9451ddf1330'
};
const MAP = ['clouds_new', 'precipitation_new', 'pressure_new', 'wind_new', 'temp_new'];
const SPH_SUB_DIV = 64; // sphere sub divisions
const SPH_SCALE = 1.006; // for atmosphere and weather
const T = 2; // tiles by side (total tiles = T * T)
const T_SIZE = RES / T;
export const LIGHT_ON = 0.78;
export const LIGHT_OFF = 0.015;
const BASE_SPH_GEO = new SphereBufferGeometry(SPH_RAD, SPH_SUB_DIV, SPH_SUB_DIV);
BASE_SPH_GEO.rotateY(THREE_MATH.degToRad(-90)); // horizontal rotation offset correction

export const AMB = new AmbientLight(0xffffff, LIGHT_OFF);
export const SUN = new DirectionalLight(0xffffff, LIGHT_ON);
export const WEATHER_CTX_MAT = [ // context, material
  [undefined, undefined],
  [undefined, undefined],
  [undefined, undefined],
  [undefined, undefined],
  [undefined, undefined]
];

export async function init() {
  const TEXTURE = new TextureLoader().load('/this.weather/images/texture-512.png');
  const SPECULAR = new TextureLoader().load('/this.weather/images/spec-512.png');
  const BUMP = new TextureLoader().load('/this.weather/images/bump-512.jpg');
  TEXTURE.encoding = sRGBEncoding;
  SPECULAR.encoding = sRGBEncoding;
  BUMP.encoding = sRGBEncoding;
  SCENE.fog = new Fog(0x74c0ff, Z_OFF - SPH_RAD * 0.82, Z_OFF);
  setSunPosition(SUN);

  ////////////////////////////////
  // MODELS
  ////////////////////////////////
  const PHYS = new Mesh(); // physic earth globe
  PHYS.geometry = BASE_SPH_GEO;
  PHYS.material = new MeshPhongMaterial({
    map: TEXTURE,
    specularMap: SPECULAR,
    specular: new Color(0x1a1a1a),
    shininess: 55.0,
    bumpMap: BUMP,
    bumpScale: 0.008,
  });
  PHYS.matrixAutoUpdate = false;
  //
  for (let i = 0; i < 5; i++) {
    WEATHER_CTX_MAT[i][0] = document.getElementById('weather_map_' + i).getContext('2d');
    WEATHER_CTX_MAT[i][1] = new MeshPhongMaterial();
    const AUX = new CanvasTexture(WEATHER_CTX_MAT[i][0].canvas);
    AUX.encoding = sRGBEncoding;
    WEATHER_CTX_MAT[i][1].map = AUX;
    WEATHER_CTX_MAT[i][1].shininess = 0.0;
    WEATHER_CTX_MAT[i][1].transparent = true;
    const WEATHER = new Mesh(BASE_SPH_GEO, WEATHER_CTX_MAT[i][1]); // wether map
    WEATHER.layers.set(i + 1);
    WEATHER.scale.multiplyScalar(SPH_SCALE);
    WEATHER.matrixAutoUpdate = false;
    AMB.layers.enable(i + 1);
    SUN.layers.enable(i + 1);
    SCENE.add(WEATHER);
  }
  //
  const ATMO = new Mesh(); // atmosphere
  ATMO.geometry = BASE_SPH_GEO;
  ATMO.material = new MeshPhongMaterial({
    color: 0xffffff,
    side: DoubleSide,
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
  setInitDone();
}

function updateSunPosition() {
  setSunPosition(SUN);
}

function setSunPosition(sun) {
  const HH = new Date().getUTCHours();
  const MM = new Date().getUTCMonth();
  const MATRIX = new Matrix4();
  let rotY = 0;
  let rotX = 0;
  // X axis 'inclination' (for months)
  if (MM <= 6) rotX = -(8 * MM) + 24; // y = -8x+24
  else rotX = 8 * MM - 72; // y = 8x-72
  // Y axis rotation (for hours)
  rotY = 180 - (HH / 24) * 360;
  MATRIX.makeRotationFromEuler(new Euler(
    THREE_MATH.degToRad(rotX),
    THREE_MATH.degToRad(rotY),
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
