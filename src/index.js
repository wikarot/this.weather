import React from 'react';
import { render } from 'react-dom';
//import ThisWeather from './ThisWeather';
import './sass/main.css';

import('./js/customConsole').then(module => module.fcy('Welcome to this.weather!'));

import(/* webpackChunkName: "this.weather" */ './ThisWeather')
  .then(module => render(<module.default />, document.getElementById('root')));
