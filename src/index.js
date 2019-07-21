import React from 'react';
import ReactDOM from 'react-dom';
import ThisWeather from './ThisWeather';
import './sass/main.css';
import { fcy } from './js/customConsole';

fcy('Welcome to this.weather!');

ReactDOM.render(<ThisWeather />, document.getElementById('root'));
