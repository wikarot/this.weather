import React from 'react';
import ReactDOM from 'react-dom';
import './sass/main.css';
import ThisWeather from './ThisWeather';
import { fcy } from './js/customConsole';

fcy('Welcome to this.weather!');

ReactDOM.render(<ThisWeather />, document.getElementById('root'));
