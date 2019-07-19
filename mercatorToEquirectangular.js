const RES = 512; // weather map resolution
const PI = Math.PI;
const PI_2 = PI / 2;
const E = Math.E;
const ORIGIN00 = RES / 2;
const PX_PER_LON_DEG = RES / 360;
const PX_PER_LON_RAD = RES / (2 * PI);

let maps = [
  new Array(RES), // clouds
  new Array(RES), // pressipitation
  new Array(RES), // pressure
  new Array(RES), // wind
  new Array(RES), // temperature
];

function fromMerXYToLatLon(x, y) {
  return {
    lat: (2 * Math.atan(E ** ((y - ORIGIN00) / -PX_PER_LON_RAD)) - PI_2) / (PI / 180),
    lon: (x - ORIGIN00) / PX_PER_LON_DEG
  }
}

function fromLatLonToEqrXY(lat, lon, w, h) {
  return { x: (180 + lon) / 360 * w, y: -(lat * (h / 180)) + h * 0.5 };
}

self.onmessage = (e) => {
  const LINE = e.data[0]; // 1px height image
  const Y = e.data[1]; // Y position
  const EQRW = e.data[2]; // Eqr. map width
  const EQRH = e.data[3]; // Eqr. map height
  const I = e.data[4]; // Map type (index)
  const LAST = Y === (RES - 1) ? true : false;
  const FROM = fromMerXYToLatLon(0, Y);
  const TO = fromLatLonToEqrXY(FROM.lat, FROM.lon, EQRW, EQRH);
  // Save an arry  new Y and content
  maps[I][Y] = { newY: TO.y, content: LINE }
  // When the line is the last one, send back all the info.
  if (LAST === true) self.postMessage([I, maps[I]]);
}

/**
 * Latitude, Longitude to X, Y
 * https://stackoverflow.com/questions/14329691/convert-latitude-longitude-point-to-a-pixels-x-y-on-mercator-projection
 */
