import CITY_LIST from '../apis/city.list.min.json';
import ALL_LIST from '../apis/all.json';

const OPEN_WEATHER = {
  api: 'https://api.openweathermap.org/data/2.5/weather?',
  fin: '&appid=b280c897878592322aafe56701248929&units=metric&lang=es'
};

export async function getPredictions(inputName) {
  return await (() => {
    let c = undefined;
    let newList = [];
    // Create prediction list (minimum of 3 characters typed)
    if (inputName.length > 2) {
      inputName = inputName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const TEST = new RegExp(' ' + inputName, 'i');
      const RE_A = new RegExp('(.*)' + inputName, 'i');
      const RE_B = new RegExp(inputName, 'i');
      const RE_C = new RegExp(inputName + '(.*)', 'i');
      // Search on city list (local API) & Maximum of 6 predictions
      for (let i = 0; (i < 209579) && (newList.length < 8); i++) {
        c = CITY_LIST[i];
        if (TEST.test(' ' + c.n)) { // n = name (city name)
          if (inputName.length === c.n.length)
            newList.unshift({
              start: RE_A.exec(c.n)[1],
              match: RE_B.exec(c.n)[0],
              finish: RE_C.exec(c.n)[1],
              country: c.c, id: i
            });
          else
            newList.push({
              start: RE_A.exec(c.n)[1],
              match: RE_B.exec(c.n)[0],
              finish: RE_C.exec(c.n)[1],
              country: c.c, id: i
            });
        }
      }
      return newList;
    } // else
    return [];
  })();
}

export async function getExtras(countryCode) {
  for (let i = 0; i < 250; i++) {
    if (ALL_LIST[i].alpha2Code === countryCode) {
      const ITEM = ALL_LIST[i];
      return {
        countryName: ITEM.translations.es,
        countryNameNative: ITEM.nativeName,
        timeZone: ITEM.timezones[0]
      }
    }
  }
}

export async function getUserLocation() {
  const RES = await fetch('https://api.ipgeolocation.io/ipgeo?apiKey=15d8e57eb4aa4015bb32a04d73b67b19');
  if (RES.status > 200) return RES.status;
  else {
    const RES_JSON = await RES.json();
    return `${RES_JSON.city}, ${RES_JSON.country_code2}`;
  }
}

export async function getWeather(inputName) {
  const URL = (
    OPEN_WEATHER.api +
    'q=' + inputName +
    OPEN_WEATHER.fin
  );
  const RES = await fetch(URL);
  if (RES.status > 200) return RES.status;
  else {
    const RES_JSON = await RES.json();
    return {
      id: RES_JSON.id,
      cloud: RES_JSON.clouds.all,
      coord: { lat: RES_JSON.coord.lat, lon: RES_JSON.coord.lon },
      countryCode: RES_JSON.sys.country,
      weatherId: RES_JSON.weather[0].id,
      desc: RES_JSON.weather[0].description,
      hum: RES_JSON.main.humidity,
      icon: RES_JSON.weather[0].icon,
      cityName: RES_JSON.name,
      temp: Math.round(RES_JSON.main.temp),
      tempMax: Math.round(RES_JSON.main.temp_max),
      tempMin: Math.round(RES_JSON.main.temp_min),
      timezone: RES_JSON.timezone,
      wind: Math.round(RES_JSON.wind.speed * 3.6)
    };
  }
}

/*
key: '&appid=b280c897878592322aafe56701248929',
units: '&units=metric',
lang: '&lang=es'
 */
