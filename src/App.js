import React, { Component } from 'react';
import Card from './components/Card';
import Prediction from './components/Prediction';
import { ext, alt, err, dbg } from './js/newConsole';
import search from './svg/search.svg';
import CITY_LIST from './apis/city.list.min.json';
import ALL_LIST from './apis/all.json'
import Notification from './components/Notification';

const API_WEATHER = {
  api: 'http://api.openweathermap.org/data/2.5/weather?q=',
  key: '&appid=cdd659df7dc048884575b9451ddf1330',
  units: '&units=metric',
  lang: '&lang=es'
};
const PRELOAD_CITIES = [
  'Cairo,EG',             // africa
  'Kingston,JM',          // america c
  'Alaska,US',            // america n
  'Amazonas,BR',          // america s
  'McMurdo Station,AQ',   // antartida
  'Tokyo,JP',             // asia
  'Berlin,DE',            // europa
  'Sydney,AU',            // oceania
  /* 'Cape Town,ZA',         // -africa
  'Panama,PA',            // -america c
  'Ottawa,CA',            // -america n
  'Montevideo,UY',        // -america s
  'Busan,KR',             // -asia
  'Moscow,RU',            // -europa
  'Wellington,NZ',        //- oceania */
]

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      input: '',
      inputTimer: 0,
      inputBox: undefined,
      cardList: [],
      predictionList: [],
      notificationList: [],
    }
  }

  /* BUILT-IN */
  componentWillMount() {
    PRELOAD_CITIES.forEach(item => {
      this.addCard(item);
    });
  }

  componentDidMount() {
    this.setState({ inputBox: document.getElementById('input') });
    this.focusID('input');
  }

  /* UI-UX */
  inputChanged(e) {
    // Clear typing timer
    if (this.state.inputTimer) clearTimeout(this.state.inputTimer);
    // Start typing timer
    this.setState({
      input: e.target.value,
      predictionList: [],
      typingTimeout: setTimeout(() => {
        this.getPredictions(this.state.input);
      }, 0)
    });
  }

  fireSearch() {
    if (this.state.input !== '') this.addCard(this.state.input);
    else alt('Nada para buscar :c');
    this.focusID('input');
  }

  focusID(id) {
    document.getElementById(id).focus();
  }

  /* CARD */
  async addCard(inputName) {
    dbg(inputName + ': Consultando API...');
    const DATA = await this.getWeather(inputName);
    // Manual catch error
    if (DATA > 200) {
      const MSG = 'Cuidad no encontrada';
      this.addNotification(MSG);
      err(inputName + ': ' + MSG + ' (error ' + DATA + ')');
      return;
    }
    // Possitive result
    const FULL_NAME = DATA.cityName + ',' + DATA.countryCode;
    dbg(inputName + ' --> ' + FULL_NAME + '...');
    // Check if exists
    let exist = false;
    if (this.state.cardList.length > 0) {
      this.state.cardList.forEach(card => {
        if (FULL_NAME === card.fullName) { exist = true; }
        if (exist) return;
      });
      if (exist) {
        const MSG = 'Cuidad incluida';
        this.addNotification(MSG);
        alt(FULL_NAME + ': ' + MSG);
        return;
      }
    }
    // Add the card
    const EXTRAS = await this.getExtras(DATA.countryCode);
    let newCardList = this.state.cardList;
    newCardList.push({ fullName: FULL_NAME, data: DATA, extras: EXTRAS });
    this.setState({ cardList: newCardList, input: '', predictionList: [] });
    this.focusID('input');
    ext(FULL_NAME + ': Agregado');
  }

  async updateCard(fullName) {
    dbg(fullName + ': Actualizando...');
    const DATA = await this.getWeather(fullName);
    // Manual catch error
    if (DATA > 200) {
      const MSG = fullName + ': No se ha podido actualizar';
      this.addNotification(MSG);
      err(MSG + ' (error ' + DATA + ')');
      return;
    }
    // Find card index
    let i = undefined;
    this.state.cardList.forEach(card => {
      if (card.fullName === fullName) {
        i = this.state.cardList.indexOf(card);
      }
    });
    // Update card
    const EXTRAS = await this.getExtras(DATA.countryCode);
    let newCardList = this.state.cardList;
    newCardList[i] = { fullName: fullName, data: DATA, extras: EXTRAS };
    this.setState({ cardList: newCardList });
    ext(fullName + ': Actualizado');
  }

  removeCard(fullName) {
    // Find card index
    let i = undefined;
    this.state.cardList.forEach(card => {
      if (card.fullName === fullName) {
        i = this.state.cardList.indexOf(card);
      }
    });
    // Update card list
    let newCardList = this.state.cardList;
    newCardList = [
      ...newCardList.slice(0, i),
      ...newCardList.slice(i + 1)
    ];
    this.setState({ cardList: newCardList });
    this.focusID('input');
    ext(fullName + ': Eliminado');
  }

  /* NOTIFICATION */
  addNotification(msg) {
    let newNotificationList = this.state.notificationList;
    newNotificationList.push({ msg: msg, time: new Date().getTime() });
    this.setState({ notificationList: newNotificationList });
  }

  removeNotification(time) {
    // Find card index
    let i = undefined;
    this.state.notificationList.forEach(item => {
      if (item.time === time) i = this.state.notificationList.indexOf(item);
    });
    // Update card list
    let newNotificationList = this.state.notificationList;
    newNotificationList = [
      ...newNotificationList.slice(0, i),
      ...newNotificationList.slice(i + 1)
    ];
    this.setState({ notificationList: newNotificationList });
  }

  /* DATA */
  async getWeather(inputName) {
    const URL = (
      API_WEATHER.api + inputName + API_WEATHER.key +
      API_WEATHER.units + API_WEATHER.lang
    );
    const RES = await fetch(URL);
    if (RES.status > 200) return RES.status;
    else {
      const RES_JSON = await RES.json();
      return {
        cloud: RES_JSON.clouds.all,
        countryCode: RES_JSON.sys.country,
        desc: RES_JSON.weather[0].description,
        hum: RES_JSON.main.humidity,
        icon: RES_JSON.weather[0].icon,
        cityName: RES_JSON.name,
        temp: Math.round(RES_JSON.main.temp),
        temp_max: Math.round(RES_JSON.main.temp_max),
        temp_min: Math.round(RES_JSON.main.temp_min),
        wind: Math.round(RES_JSON.wind.speed * 3.6)
      };
    }
  }

  async getExtras(countryCode) {
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

  async getPredictions(inputName) {
    const NEW_PREDICTION_LIST = await (() => {
      let newList = [];
      // Create prediction list (minimum of 3 characters typed)
      if (inputName.length > 2) {
        // Search on city list (local API) & Maximum of 6 predictions
        for (let i = 0; i < 209579 && newList.length < 6; i++) {
          const C = CITY_LIST[i];
          // RegExp to test
          const EX = ['\\b', inputName, '\\.*'].join('');
          const RE = new RegExp(EX, 'i');
          if (RE.test(C.n)) newList.push({ name: C.n, country: C.c });
        }
        return newList;
      }
      return [];
    })();
    this.setState({ predictionList: NEW_PREDICTION_LIST });
  }

  render() {
    return (
      <>
        <header>
          <div id="search_box">
            <input id="input" type="text" list="prediction_box"
              value={this.state.input} placeholder="Buscar una cuidad"
              onChange={e => this.inputChanged(e)}
              onKeyUp={e => { if (e.keyCode === 13) this.fireSearch() }}
              autoComplete="off" />
            <datalist id="prediction_box">
              {this.state.predictionList.map(item => (
                <Prediction
                  data={item}
                  key={this.state.predictionList.indexOf(item)}
                />
              ))}
            </datalist>
            <button id="search" onClick={this.fireSearch.bind(this)}>
              <span>
                <img src={search} alt="Buscar" title="Buscar" />
              </span>
            </button>
          </div>
        </header>
        <main>
          <section id="card_box" >
            {this.state.cardList.map(item => (
              <Card
                fullName={item.fullName}
                data={item.data}
                extras={item.extras}
                key={this.state.cardList.indexOf(item)}
                handleUpdate={this.updateCard.bind(this)}
                handleRemove={this.removeCard.bind(this)}
              />
            ))}
          </section>
          <div id="notification_box">
            {this.state.notificationList.map(item => (
              <Notification
                data={item}
                key={item.time}
                handleRemove={this.removeNotification.bind(this)}
              />
            ))}
          </div>
        </main>
        <footer>
          <div id="footer_box">
            <a href="http://wikarot.github.io/this.weather">
              <h1><span>this</span>.Weather( );</h1>
            </a>
            <div>
              <span>
                <p>Copyright (c) 2019 - <a href="https://github.com/Wikarot"
                  blank="null">Wikarot</a></p>
              </span>
            </div>
          </div>
        </footer>
      </>
    );
  }
}

export default App;

// AUX_MS_ACC b280c897878592322aafe56701248929
