import React from 'react';
import { render } from 'react-dom';
import ThisWeather from './ThisWeather';
import './sass/main.css';

import('./js/customConsole').then(module => module.fcy('Welcome to this.weather!'));

render(<ThisWeather />, document.getElementById('root'));
