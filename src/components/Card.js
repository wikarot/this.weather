import React, { Component } from 'react'
import Icon from './Icon';
import * as THREE from 'three';
import { SCENE, SPH_RAD, RES } from '../js/threeStuff';
import { CITY_LABELS } from './WeatherMaps';
import { initSS } from '../js/smoothScroll';
import { not } from '../js/customConsole';

const TIME_TO_UPDATE = 20 * 60000; // ms
const H = RES / 2;
const DOT_GEO = new THREE.SphereBufferGeometry(0.001, 3, 2);
const DOT_MAT = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, precision: "lowp" });
const LINE_MAT = new THREE.LineBasicMaterial({ fog: false, color: '#b4b4b4' });

export default class Card extends Component {
  constructor(props) {
    super(props);
    this.state = {
      time: '',
      timeTimer: undefined,
      updateTimer: undefined,
    };
    this.id = this.props.data.id; // city id
    this.iconId = this.props.data.icon; // icon code
    this.weatherId = this.props.data.weatherId; // weather code (more speciffic than icon code)
    /* if (
      (this.props.data.weatherId > 701 &&
        this.props.data.weatherId < 741) ||
      (this.props.data.weatherId > 741 &&
        this.props.data.weatherId < 781)
    ) {
      this.iconId = '50'; // neither sun nor moon
    } else */
    if (this.props.data.weatherId === 781) this.iconId = '50tornado'; //tornado
    this.update = this.update.bind(this);
    this.remove = this.remove.bind(this);
    this.createTag = this.createTag.bind(this);
  }

  componentWillMount() {
    clearInterval(this.state.updateTimer);
    clearInterval(this.state.timeTimer);
  }

  componentDidMount() {
    this.getTime();
    this.createTag();
    this.setState({
      timeTimer: setInterval(() => {
        this.getTime()
      }, 60000),
      /* updateTimer: setInterval(() => {
        not(this.props.fullName + ': Actualización automática...');
        this.update();
      }, TIME_TO_UPDATE) */
    });
    document.getElementById('search_btn').classList.remove('loading');
  }

  componentWillUnmount() {
    let dot, line;
    CITY_LABELS.forEach(item => {
      if (item.id === this.id) { dot = item.dot; line = item.line; }
    });
    SCENE.remove(dot, line); // remove it from the scene
    CITY_LABELS.filter(item => item.id !== this.id); // remove it from the "list"
    document.getElementById('city_label_' + this.id).remove(); // remove it from the DOM
    clearInterval(this.state.updateTimer);
    clearInterval(this.state.timeTimer);
  }

  getTime() {
    const OFFSET = ((this.props.data.timezone / 60) / 60); // timezone = seconds --> OFFSET hours
    const OFFSET_F = Math.floor(OFFSET); // Integer from OFFSET (the offset can be XX hours AND 30 minutes in some cases)
    let mm_off = 0;
    if (OFFSET_F !== OFFSET) mm_off = Math.floor((OFFSET - OFFSET_F) * 60);
    let hh = new Date().getUTCHours() + OFFSET_F;
    let mm = new Date().getUTCMinutes() + mm_off;
    if (mm > 59) { hh++; mm -= 60; }
    if (hh > 23) hh -= 24;
    if (hh < 0) hh = 24 + hh;
    if (hh < 10 && hh >= 0) hh = '0' + hh;
    if (mm < 10) mm = '0' + mm;
    this.setState({ time: (hh + ':' + mm) });
  }

  createTag() {
    let lbl = document.createElement('div');
    lbl.textContent = this.props.data.cityName;
    lbl.className = 'city_label';
    lbl.id = 'city_label_' + this.id;
    document.getElementById('labels').appendChild(lbl);
    lbl.onclick = () => {
      const offsetTop = document.getElementById('card_' + this.id).offsetTop;
      initSS(100 + offsetTop - 16); // 100 header and 16 card margin
    };

    // Rotation matrix
    const MTX = new THREE.Matrix4();
    const { lat, lon } = this.props.data.coord;
    MTX.makeRotationFromEuler(new THREE.Euler(
      THREE.Math.degToRad(-lat), // X axe, horizontal rotation
      THREE.Math.degToRad(+lon), // Y axe, Vectical rotation
      0, 'YXZ'));
    // Invisible dot to hold the label position
    const DOT = new THREE.Mesh(DOT_GEO, DOT_MAT);
    DOT.name = this.id;
    DOT.position.set(0, 0, SPH_RAD * 1.4).applyMatrix4(MTX);
    const LINE_GEO = new THREE.Geometry();
    LINE_GEO.vertices.push(
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, 0, SPH_RAD * 1.4).applyMatrix4(MTX));
    const LINE = new THREE.Line(LINE_GEO, LINE_MAT);

    // Add line and dot to global scene
    SCENE.add(DOT, LINE);
    // Coordinates to print the label on "flat" map
    const X = (180 + lon) / 360 * RES;
    const Y = -(lat * (H / 180)) + H * 0.5;
    // Add a city name label to labels public container
    CITY_LABELS.push({ id: this.id, label: lbl, dot: DOT, line: LINE, x: X, y: Y });
  }

  update() {
    this.props.update(this.id, this.props.fullName);
  }

  remove() {
    this.props.remove(this.id, this.props.fullName);
  }

  render() {
    return (
      <section id={'card_' + this.id}
        className="card"
        rotated={this.state.rotated} >
        <div className="card_header"
          title={
            this.props.fullName + ' (' +
            this.props.extras.countryNameNative + ')'}>
          <h2 className="name"><em>{this.props.fullName}</em></h2>
          <div className="icon_small">
            <span>
              <img
                src={'https://www.countryflags.io/' + this.props.data.countryCode + '/shiny/16.png'}
                alt={'Bandera de ' + this.props.extras.countryName}
                title={'Bandera de ' + this.props.extras.countryName} />
            </span>
          </div>
        </div>
        <hr />
        <div className="temp">
          <p className="temp_current">{this.props.data.temp}°</p>
          <p className="temp_max"><span>Máx</span>{this.props.data.tempMax}°</p>
          <p className="temp_min"><span>Mín</span>{this.props.data.tempMin}°</p>
        </div>
        <hr />
        <div className="desc">
          <p className="desc">{this.props.data.desc}</p>
          <Icon name={this.iconId} classes={['perma_active']} />
        </div>
        <hr />
        <div className="card_control">
          <button className="loading_box" onClick={this.update} title="Actualizar">
            <Icon name="refresh" classes={['btn']} />
            <Icon name="loading_loop" />
          </button>
          <span className="time">
            {this.state.time}
          </span>
          <button onClick={this.remove} title="Cerrar" >
            <Icon name="close" classes={['btn']} />
          </button>
        </div>
      </section>
    );
  }
}
