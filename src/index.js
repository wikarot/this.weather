import React from 'react';
import { render } from 'react-dom';
import ThisWeather from './ThisWeather';
import './sass/main.css';
import { fcy } from './js/customConsole';

fcy('Welcome to this.weather!');

render(<ThisWeather />, document.getElementById('root'));
