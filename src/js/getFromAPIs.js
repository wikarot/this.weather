import CITY_LIST from '../apis/city.list.min.json';
import ALL_LIST from '../apis/all.json';

const API = 'https://api.openweathermap.org/data/2.5/weather?';
const API_CITY_NAME_PREFIX = 'q=';
const API_CITY_ID_PREFIX = 'id=';
const API_OPTIONS = '&appid=b280c897878592322aafe56701248929&units=metric&lang=es';

export async function getPredictions(inputName) {
  return await (() => {
    let city = undefined;
    let newList = [];
    // Create prediction list (minimum of 3 characters typed)
    if (inputName.length > 2) {
      inputName = inputName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const TEST = new RegExp(' ' + inputName, 'i');
      const RE_A = new RegExp('(.*)' + inputName, 'i');
      const RE_B = new RegExp(inputName, 'i');
      const RE_C = new RegExp(inputName + '(.*)', 'i');
      // Search on city list (local API) & Maximum of 6 predictions
      for (let i = 0; (i < 209579) && (newList.length < 6); i++) {
        city = CITY_LIST[i];
        if (TEST.test(' ' + city.name)) {
          if (inputName.length === city.name.length) // 100% match at the top
            newList.unshift({
              start: RE_A.exec(city.name)[1],
              match: RE_B.exec(city.name)[0],
              finish: RE_C.exec(city.name)[1],
              country: city.country, id: city.id
            });
          else // partial match
            newList.push({
              start: RE_A.exec(city.name)[1],
              match: RE_B.exec(city.name)[0],
              finish: RE_C.exec(city.name)[1],
              country: city.country, id: city.id
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

export async function getWeather(inputName, option) {
  let PREFIX = '';
  if (option === 'name') PREFIX = API_CITY_NAME_PREFIX;
  else if (option === 'id') PREFIX = API_CITY_ID_PREFIX;
  const RES = await fetch(API + PREFIX + inputName + API_OPTIONS);
  if (RES.status > 200) return RES.status;
  else {
    const RES_JSON = await RES.json();
    return {
      id: RES_JSON.id,
      //cloud: RES_JSON.clouds.all,
      coord: { lat: RES_JSON.coord.lat, lon: RES_JSON.coord.lon },
      countryCode: RES_JSON.sys.country,
      weatherId: RES_JSON.weather[0].id,
      desc: RES_JSON.weather[0].description,
      //hum: RES_JSON.main.humidity,
      icon: RES_JSON.weather[0].icon,
      cityName: RES_JSON.name,
      temp: Math.round(RES_JSON.main.temp),
      tempMax: Math.round(RES_JSON.main.temp_max),
      tempMin: Math.round(RES_JSON.main.temp_min),
      timezone: RES_JSON.timezone,
      //wind: Math.round(RES_JSON.wind.speed * 3.6) // m/s to km/h
    };
  }
}

/*
key: '&appid=b280c897878592322aafe56701248929',
units: '&units=metric',
lang: '&lang=es'
 */
