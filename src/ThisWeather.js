import React, { Component, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Route, Link } from 'react-router-dom';
import Card from './components/Card';
import WeatherMaps from './components/WeatherMaps';
import Icon from './components/Icon';
import Prediction from './components/Prediction';
import Notification from './components/Notification';
import ToTopBtn from './components/ToTopBtn';
//import About from './components/About';
import { getPredictions, getUserLocation, getExtras, getWeather } from './js/getFromAPIs';
import { initSS, cancelSS } from './js/smoothScroll';
import { suc, alt, err, dbg } from './js/customConsole';

/* const PRELOAD_CITIES = [
  'Cairo,EG',             // africa
  'Kingston,JM',          // america c
  'Alaska,US',            // america n
  'Amazonas,BR',          // america s
  'McMurdo Station,AQ',   // antartida
  'Tokyo,JP',             // asia
  'Berlin,DE',            // europa
  'Sydney,AU',            // oceania
  'Cape Town,ZA',         // -africa
  'Panama,PA',            // -america c
  'Ottawa,CA',            // -america n
  'Montevideo,UY',        // -america s
  'Busan,KR',             // -asia
  'Moscow,RU',            // -europa
  'Wellington,NZ',        //- oceania
]; */

const LoadingMsg = () => ('');

const About = (lazy(() => (import(/* webpackChunkName: "About" */ './components/About'))));

export default class ThisWeather extends Component {
  constructor(props) {
    super(props);
    this.state = {
      input: '',
      cardList: [],
      predictionList: [],
      notificationList: [],
    };
    this.inputBox = undefined;
    this.predictionListBox = undefined;
    this.toTopBtn = undefined;
    this.currentFocus = -1;
    this.inputKeyDown = this.inputKeyDown.bind(this);
    this.inputChanged = this.inputChanged.bind(this);
    this.fireSearch = this.fireSearch.bind(this);
    this.stopSearchingLoop = this.stopSearchingLoop.bind(this);
    this.addCard = this.addCard.bind(this);
    this.updateCard = this.updateCard.bind(this);
    this.removeCard = this.removeCard.bind(this);
    this.removeNotification = this.removeNotification.bind(this);
    this.fireSearchFromPrediction = this.fireSearchFromPrediction.bind(this);
  }

  async componentDidMount() {
    getUserLocation().then(res => {
      if (res > 200)
        err('Error al localizar el dispositivo (error ' + res + ')');
      else {
        dbg(`Dispositivo localizado...`);
        this.addCard(res, 'name');
      }
    });
    this.focusID('input_query');
    this.inputBox = document.getElementById('input_query');
    this.predictionListBox = document.getElementById('prediction_box');
    this.toTopBtn = document.getElementById('to_top_btn');
    document.addEventListener('click', e => {
      if ((e.target !== this.inputBox) && (this.state.predictionList.length > 0))
        this.resetPredictionList(e.target);
    });
    window.addEventListener('scroll', () => {
      if (document.documentElement.scrollTop > 100) this.toTopBtn.style.transform = 'scale(1)';
      else this.toTopBtn.style.transform = '';
    });
    window.addEventListener('wheel', () => cancelSS());
  }

  /**
   * App functionality & utils
   */

  async inputKeyDown(e) {
    // Current predictions displayed
    let predListDOM = this.predictionListBox.getElementsByClassName('prediction');
    if (e.keyCode === 40) { // key down
      e.preventDefault();
      if (this.state.predictionList.length) {
        // Change/add the active prediction
        this.currentFocus++;
        this.addActivePrediction(predListDOM);
      } else {
        // Create a prediction list
        const PREDS = await getPredictions(e.target.value);
        this.setState({ predictionList: PREDS });
      }
    } else if (e.keyCode === 38) { // key up
      e.preventDefault();
      if (this.state.predictionList.length) {
        // Change/add the active prediction        
        this.currentFocus--;
        this.addActivePrediction(predListDOM);
      } else {
        // Create a prediction list
        const PREDS = await getPredictions(e.target.value);
        this.setState({ predictionList: PREDS });
      }
    } else if (e.keyCode === 27) { // escape
      // Clean the input
      this.setState({ input: '', predictionList: [] });
    } else if (e.keyCode === 13) { // enter
      e.preventDefault();
      this.resetPredictionList(e.target); // hide predlist while searching
      if ((this.state.predictionList.length > 0) &&
        (document.querySelector('.active_prediction') !== null)) {
        // if there are predictions AND there is an active one, search that
        const VAL = document.querySelector('.active_prediction input').value;
        this.fireSearchFromPrediction(VAL);
      } else {
        // else, try to search based on input value
        this.setState({ input: e.target.value });
        this.fireSearch();
      }
    }
  }

  async inputChanged(e) {
    this.resetPredictionList();
    this.setState({
      input: e.target.value,
      predictionList: [],
    });
    const PREDS = await getPredictions(e.target.value);
    this.setState({ predictionList: PREDS });
  }

  fireSearch(inputName, option) {
    if (!this.isOnLine()) return; // if it's online, continue
    if (inputName) // if there is an specific input (parameter)
      this.addCard(inputName, option);
    else if (this.state.input.length > 0) // else, if there is text in the input box
      this.addCard(this.state.input, 'name');
    this.focusID('input_query'); // if not, return focus to the input box
  }

  isOnLine() {
    if (window.navigator.onLine) return true;
    const MSG = 'Equipo offline';
    this.addNotification(MSG, 'error');
    err(MSG);
    return false;
  }

  focusID(id) {
    document.getElementById(id).focus();
  }

  stopSearchingLoop() {
    document.getElementById('search_btn').classList.remove('loading');
  }

  stopUpdatingLoop(id) {
    document.querySelector('#card_' + id + ' > .card_control .loading_box')
      .classList.remove('loading');
  }

  /**
   * Weather Card functionality
   */

  async addCard(inputName, option) {
    document.getElementById('search_btn').classList.add('loading');
    dbg(inputName + ': Consultando API...');
    const DATA = await getWeather(inputName, option).catch(() => 0);

    // Manual catch error
    if (DATA > 200) {
      const MSG = 'No se encontraron resulados';
      this.addNotification(MSG, 'alert');
      this.stopSearchingLoop();
      err(inputName + ': ' + MSG + ' (error ' + DATA + ')');
      return;
    } else if (DATA === 0) {
      const MSG = 'Error al consultar API';
      this.addNotification(MSG, 'error');
      this.stopSearchingLoop();
      err(inputName + ': ' + MSG + ' (error ' + DATA + ')');
      return;
    }
    const FULL_NAME = DATA.cityName + ', ' + DATA.countryCode; // Complete name used for the card title

    // Check if it already exists
    if (this.state.cardList.length > 0) {
      let exist = false;
      this.state.cardList.forEach(card => {
        // id correspondant to 'weather station id',
        // city and country name can be the same
        if (DATA.id === card.data.id) return exist = true;
      });
      if (exist) {
        const MSG = 'Resultado ya incluido';
        this.addNotification(MSG, 'info');
        alt(FULL_NAME + ': ' + MSG);
        this.stopSearchingLoop();
        return;
      }
    }

    // Add the card
    const EXTRAS = await getExtras(DATA.countryCode); // get extra data
    this.setState({
      cardList: [...this.state.cardList, { fullName: FULL_NAME, data: DATA, extras: EXTRAS }],
      input: '', // Clean input box
      predictionList: [] // Clean predictions
    });
    this.stopSearchingLoop();
    dbg(inputName + ' --> ' + FULL_NAME + '...');
    suc(FULL_NAME + ': Agregado');
  }

  async updateCard(id, fullName) {
    if (!this.isOnLine()) return;
    document.querySelector('#card_' + id + ' > .card_control .loading_box')
      .classList.add('loading');
    dbg(fullName + ': Actualizando...');
    const DATA = await getWeather(fullName, 'name').catch(() => 0);

    // Manual catch error
    if (DATA > 200) {
      const MSG = fullName + ': Error al actualizar';
      this.addNotification(MSG, 'error');
      this.stopUpdatingLoop(id);
      err(MSG + ' (error ' + DATA + ')');
      return;
    } else if (DATA === 0) {
      const MSG = 'Error al consultar API';
      this.addNotification(MSG, 'error');
      this.stopUpdatingLoop(id);
      err(fullName + ': ' + MSG + ' (error ' + DATA + ')');
      return;
    }

    // Find card index in list
    let i = undefined;
    this.state.cardList.forEach(card => {
      if (card.data.id === id) i = this.state.cardList.indexOf(card);
    });

    // Update card
    let newCardList = this.state.cardList;
    newCardList[i].data = DATA;
    this.setState({ cardList: newCardList });
    const MSG = fullName + ': Actualizado';
    this.addNotification(MSG, 'success');
    this.stopUpdatingLoop(id);
    suc(MSG);
  }

  removeCard(id, fullName) {
    this.setState(prevState => ({
      cardList: prevState.cardList.filter(item => item.data.id !== id)
    }));
    suc(fullName + ': Eliminado');
  }

  /**
   * Notification functionality
   */

  addNotification(msg, type) {
    let newNotList = this.state.notificationList;
    if (newNotList.length >= 6) newNotList.shift();
    this.setState({
      notificationList: [...newNotList, { msg: msg, type: type, id: new Date().getTime() }]
    });
  }

  removeNotification(id) {
    this.setState(prevState => ({
      notificationList: prevState.notificationList.filter(item => item.id !== id)
    }));
  }

  /**
   * Prediction functionality
   */

  fireSearchFromPrediction(value) {
    this.resetPredictionList();
    this.fireSearch(value, 'id');
  }

  addActivePrediction(predListDOM) {
    // Actually add/set
    this.removeActivePrediction(predListDOM);
    if (this.currentFocus >= predListDOM.length) this.currentFocus = 0;
    if (this.currentFocus < 0) this.currentFocus = (predListDOM.length - 1);
    if (predListDOM.length) predListDOM[this.currentFocus].classList.add('active_prediction');
  }

  removeActivePrediction(predListDOM) {
    for (var i = 0; i < predListDOM.length; i++)
      predListDOM[i].classList.remove('active_prediction');
  }

  resetPredictionList() {
    this.currentFocus = -1;
    this.setState({ predictionList: [] });
  }

  render() {
    return (
      <Router>
        <header>
          <div id="search_box" predvisible={this.state.predictionList.length > 0 ? 'true' : 'false'}>
            <button id="search_btn"
              className="loading_box loading"
              title="Buscar"
              onClick={this.fireSearch} >
              <Icon name="search" classes={['btn', 'perma_active']} viewbox="0 0 48 48" />
              <Icon name="loading_loop" />
            </button>
            <input id="input_query"
              type="text"
              value={this.state.input}
              placeholder="Buscar una cuidad"
              onKeyDown={e => this.inputKeyDown(e)}
              onChange={e => this.inputChanged(e)}
              onFocus={e => this.inputChanged(e)}
              autoComplete="off"
              alt="Buscar una cuidad" />
            <div id="prediction_box" >
              {this.state.predictionList.map(item => (
                <Prediction
                  data={item}
                  clickHandler={this.fireSearchFromPrediction}
                  key={item.id} />
              ))}
            </div>
          </div>
          <hr />
          <nav>
            <ul>
              <li>
                <Link to="/this.weather/">Inicio</Link>
              </li>
              <li>
                <Link to="/this.weather/about">Acerca de</Link>
              </li>
            </ul>
          </nav>
        </header>
        <main>
          <Route exact path="/this.weather/" render={props => (
            <div id="main_content">
              <div id="card_box">
                {this.state.cardList.map(item => (
                  <Card
                    fullName={item.fullName}
                    data={item.data}
                    extras={item.extras}
                    update={this.updateCard}
                    remove={this.removeCard}
                    key={item.data.id} />
                ))}
              </div>
              <hr />
              <button id="to_maps_btn"
                onClick={() => initSS(64 + document.getElementById('weather_maps').offsetTop - 16)} >
                <Icon name="chevron" classes={['chevron_down', 'btn']} />
              </button>
              <div id="weather_maps_box">
                <WeatherMaps />
              </div>
              <div id="notification_box">
                <div id="notification_content">
                  {this.state.notificationList.map(item => (
                    <Notification
                      data={item}
                      remove={this.removeNotification}
                      key={item.id} />
                  ))}
                </div>
              </div>
            </div>
          )} />
          <Suspense fallback={<LoadingMsg />}>
            <Route path="/this.weather/about" component={About} />
          </Suspense>
          <div id="to_top_btn_box">
            <ToTopBtn />
          </div>
        </main>
        <footer>
          <div id="footer_content">
            <div id="brand_box">
              <a id="imagotipo" href="http://wikarot.github.io/this.weather" title="this.weather">
                <div className="isotipo icon_small">
                  <span>
                    <img src="favicon-16x16.png" alt="Icono de this.weather" />
                  </span>
                </div>
                <h1 id="logotipo"><em>this</em>.weather</h1>
              </a>
            </div>
            <div id="cc">
              <span>
                <p>Copyright 2019 <a href="https://github.com/Wikarot">Leo de S.L.F</a></p>
              </span>
            </div>
          </div>
        </footer>
        <div id="weather_maps_container" style={{ display: 'none' }} >
          <canvas id="weather_map_0" width="512" height="256" />
          <canvas id="weather_map_1" width="512" height="256" />
          <canvas id="weather_map_2" width="512" height="256" />
          <canvas id="weather_map_3" width="512" height="256" />
          <canvas id="weather_map_4" width="512" height="256" />
        </div>
      </Router>
    )
  }
}

// MS_ACC b280c897878592322aafe56701248929
// GG_Acc cdd659df7dc048884575b9451ddf1330
