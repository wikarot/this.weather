import React, { Component } from 'react';
import CustomChk from './CustomChk';

export default class About extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showRss: false
    }
  }

  componentDidMount() {
    document.getElementById('custom_chk_about_chevron').onchange = () => {
      this.setState({ showRss: !this.state.showRss });
    }
  }

  render() {
    return (
      <article id="about" >
        <div id="about_header">
          <h3><em>Acerca de</em></h3>
          <div className="isotipo icon_small">
            <span><img src="favicon-16x16.png" alt="Icono de this.weather" /></span>
          </div>
        </div>
        <hr />
        <div id="about_body">
          <p>Un medio de acceso <br /> al estado del tiempo.</p>
        </div>
        <hr />
        <div id="about_rss">
          <div id="about_rss_header">
            <h4><em>Recursos</em></h4>
            <CustomChk idWord="about_chevron" iconWordA="chevron" titleWord="Expandir/Contraer" />
          </div>
          <article id="about_rss_body" expanded={`${this.state.showRss}`}>
            <hr />
            <h5><em>Información</em></h5>
            <ul>
              <li>Geolocalización - <a href="https://ipgeolocation.io">ipgeolocation</a></li>
              <li>Meteorología - <a href="https://openweathermap.org">OpenWeatherMaps</a></li>
              <li>Datos - <a href="https://restcountries.eu">REST Countries</a></li>
            </ul>
            <hr />
            <h5><em>Media</em></h5>
            <ul>
              <li>Mapas - <a href="http://www.shadedrelief.com/natural3/">Natural Earth III</a></li>
              <li>Mapas - <a href="https://visibleearth.nasa.gov">NASA Visible Earth</a></li>
              <li>Banderas - <a href="https://www.countryflags.io">CountryFlags</a></li>
              <li>Fuentes - <a href="https://fonts.google.com">Google Fonts</a></li>
              <li>Iconos - <a href="https://material.io">Material design</a></li>
              <li>Favicon - <a href="https://realfavicongenerator.net">RealFaviconGenerator</a></li>
            </ul>
          </article>
        </div>
      </article>
    )
  }
}
