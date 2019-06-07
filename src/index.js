import React from 'react';
import ReactDOM from 'react-dom';
import './sass/index.css';
import App from './App';
import { fcy } from './js/newConsole';

fcy('Welcome to this.weather!');

ReactDOM.render(<App />, document.getElementById('root'));