import React, { Component } from 'react'
import { Vector3, Raycaster, PerspectiveCamera, WebGLRenderer, Matrix4, Euler } from 'three';
import OrbitControls from 'orbit-controls-es6';
import dragscroll from 'dragscroll';
import CustomRadio from './CustomRadio';
import CustomChk from './CustomChk';
import { AMB, createWeatherMap, init, SUN, WEATHER_CTX_MAT, LIGHT_ON, LIGHT_OFF } from '../js/threeStuff';
import SCENE, { NEAR, FAR, Z_OFF, city_labels, initDone, RES } from '../js/threeStuffUtils';

const VEC = new Vector3();
const RAY_CASTER = new Raycaster();
const MAPS = [
  { id: 0, label: 'Terreno', ref: [''], icon: 'terrain' },
  { id: 1, label: 'Nubosidad', ref: ['0%', '100%'], icon: 'cloud' },
  { id: 2, label: 'Precipitación', ref: ['0mm', '200mm'], icon: 'precipitation' },
  { id: 3, label: 'Presión', ref: ['950hPa', '1070hPa'], icon: 'tachometer' },
  { id: 4, label: 'Viento', ref: ['0m/s', '200m/s'], icon: 'wind' },
  { id: 5, label: 'Temperatura', ref: ['-40°C', '0°C', '40°C'], icon: 'thermometer' }
];
const N_MAPS_TO_LOAD = 1; // 1 to 6
const DEFAULT_OPTION = 1;
const SMALL_MEDIA = window.matchMedia('(max-width: 679px)');

let camera, renderer, controls;

export default class WeatherMaps extends Component {
  constructor(props) {
    super(props);
    this.state = {
      option: DEFAULT_OPTION,
      label: MAPS[DEFAULT_OPTION].label,
      ref: MAPS[DEFAULT_OPTION].ref,
      showContent: 'inline-block',
      showGlobe: 'flex',
      showMap: 'none'
    }
    this.setGlobe = this.setGlobe.bind(this);
    this.setMap = this.setMap.bind(this);
    this.setWeatherOption = this.setWeatherOption.bind(this);
    this.animateRaf = 0;
    this.labelsRaf = 0;

    // Globe stuff
    this.animate = this.animate.bind(this);
    this.setCameraPosition = this.setCameraPosition.bind(this);
    this.toggleLights = this.toggleLights.bind(this);
    this.toggleRotation = this.toggleRotation.bind(this);
    this.resetRedererSize = this.resetRedererSize.bind(this);
    //this.resetRendererPixelRatio = this.resetRendererPixelRatio.bind(this);
    this.updateLabels = this.updateLabels.bind(this);

    // Map stuff
    this.mapCanvas = undefined;
  }

  async componentDidMount() {
    // most be done only one time
    if (!initDone) {
      // wait for three stuff (globe, weather map, and atmosphere '3D objects')
      await init();
      // launch weather maps requests (2D images from OpenWeatherMaps)
      for (let i = 0; i < N_MAPS_TO_LOAD - 1; i++) createWeatherMap(i);
      // init local three staff
      camera = new PerspectiveCamera(45, RES / RES, NEAR, FAR);
      camera.layers.enable(DEFAULT_OPTION);
      renderer = new WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
        stencil: false,
      });
      renderer.setSize(RES, RES);
      renderer.setPixelRatio(2);
      renderer.gammaFactor = 2.2;
      renderer.gammaOutput = true;
      renderer.domElement.id = 'globe_canvas';
      controls = new OrbitControls(camera, renderer.domElement);
      controls.rotateSpeed = 0.3;
      controls.autoRotate = false;
      controls.autoRotateSpeed = 2.0;
      controls.enablePan = false;
      controls.enableZoom = false;
      controls.enableKeys = false;
      controls.minPolarAngle = Math.PI - Math.PI * .90;
      controls.maxPolarAngle = Math.PI * .90;
    }
    // every time it mounts...
    document.getElementById('globe_box').appendChild(renderer.domElement); // add renderer canvas to dom
    document.getElementById('weather_maps_body').style.overflowX = 'visible';
    this.mapCanvas = document.getElementById('map_canvas'); // identify map canvas
    this.setCameraPosition(0, 0);
    this.resetRedererSize(); // resize renderer based on media queries
    this.animate(); // init three stuff animation loop
    city_labels.forEach(item => item.label = document.getElementById('city_label_' + item.id));
    this.updateLabels(); // init labels updating loop
    //window.addEventListener('resize', this.resetRendererPixelRatio, false); // listen for window resize
    for (let i = 0; i < 6; i++)  // listen to each weather map option
      document.getElementById('custom_radio_' + i).addEventListener('change', () => { this.setWeatherOption(i); });
    // listen to 'toggle buttons' (actually checkbox and radio)
    document.getElementById('custom_radio_globe_radio').addEventListener('change', () => { this.setGlobe(); });
    document.getElementById('custom_radio_map_radio').addEventListener('change', () => { this.setMap(); });
    document.getElementById('custom_chk_rotation_chk').addEventListener('change', e => { this.toggleRotation(e); });
    document.getElementById('custom_chk_day_night_day_chk').addEventListener('change', e => { this.toggleLights(e); });
    // listen for scroll on map to resize 'progress marks'
    document.getElementById('weather_maps_body').addEventListener('scroll', e => {
      const W = SMALL_MEDIA.matches ? 512 : 1024;
      const OFFSET = (SMALL_MEDIA.matches ? 7 : 14) + 1; // margin + border
      const SCROLLABLE = ((W + OFFSET * 2) * .5) + OFFSET; // expected 272 or 542
      const SCROLLED = e.target.scrollLeft / SCROLLABLE;
      document.getElementById('mark_left').style.width = (32 * SCROLLED) + 'px';
      document.getElementById('mark_right').style.width = 32 - (32 * SCROLLED) + 'px';
    });
    SMALL_MEDIA.addListener(this.resetRedererSize);
    dragscroll.reset(); // update dragscroll listeners
  }

  componentWillUnmount() {
    // stop all lops
    cancelAnimationFrame(this.animateRaf);
    cancelAnimationFrame(this.labelsRaf);
  }

  /**
   * Basic
   */

  setGlobe() {
    document.getElementById('weather_maps_body').style.overflowX = 'visible';
    if (this.state.showGlobe !== 'flex') this.setState({ showMap: 'none', showGlobe: 'flex' });
  }

  setMap() {
    document.getElementById('weather_maps_body').style.overflowX = 'hidden';
    if (this.state.showMAp !== 'flex') this.setState({ showGlobe: 'none', showMap: 'flex' });
  }

  setWeatherOption(option) {
    this.setState({
      option: option,
      label: MAPS[option].label,
      ref: MAPS[option].ref
    });
    let i = 1; // layer 0 = globe
    do {
      if (option === MAPS[i].id) camera.layers.enable(i);
      else camera.layers.disable(i);
      i++;
    } while (i < 6);
    if (option === 0) this.mapCanvas.getContext('2d').clearRect(0, 0, RES, RES * .5);
    else this.mapCanvas.getContext('2d').putImageData(
      WEATHER_CTX_MAT[option - 1][0].getImageData(0, 0, RES, RES * .5), 0, 0);
  }

  /**
   * Globe functionality
   */

  animate() {
    this.animateRaf = requestAnimationFrame(this.animate);
    controls.update();
    renderer.render(SCENE, camera);
  }

  setCameraPosition(alpha, theta) {
    let matrix = new Matrix4();
    matrix.makeRotationFromEuler(new Euler(alpha, theta, 0, 'YXZ'));
    camera.position.set(0, 0, Z_OFF).applyMatrix4(matrix);
    camera.lookAt(0, 0, 0);
  }

  /* resetRendererPixelRatio() {
    const DPR = window.devicePixelRatio || 1;
    if (DPR < 0.5) { renderer.setPixelRatio(0.5); return; }
    if (DPR > 3) { renderer.setPixelRatio(3); return; }
    // renderer.setPixelRatio(window.devicePixelRatio); // Performance in danger :c
  } */

  toggleLights(e) {
    if (e.target.checked === true) {
      AMB.intensity = LIGHT_ON;
      SUN.intensity = 0.0;
      //scene.fog.color = new THREE.Color(0x686868);
    } else {
      AMB.intensity = LIGHT_OFF;
      SUN.intensity = LIGHT_ON;
      //scene.fog.color = new THREE.Color(0x80bfff);
    }
  }

  toggleRotation(e) {
    controls.autoRotate = e.target.checked;
  }

  resetRedererSize() {
    const currentSize = renderer.getSize.x;
    if (SMALL_MEDIA.matches && currentSize !== RES * .5) renderer.setSize(RES * .5, RES * .5);
    else if (!SMALL_MEDIA.matches && currentSize !== RES) renderer.setSize(RES, RES);
  }

  updateLabels() {
    this.labelsRaf = requestAnimationFrame(this.updateLabels);
    const W = renderer.domElement.clientWidth;
    const H = renderer.domElement.clientHeight;
    // iterate on each label object (THREE & DOM stuff)
    city_labels.forEach(item => {
      let { label, dot, x, y } = item;
      if (this.state.showGlobe === 'flex') { // Move & show/hide label over the globe canvas
        dot.updateWorldMatrix(true, false);
        dot.getWorldPosition(VEC);
        VEC.project(camera);
        RAY_CASTER.setFromCamera(VEC, camera);
        const VEC_X = (VEC.x * .5 + .5) * W;
        const VEC_Y = (VEC.y * -.5 + .5) * H;
        label.style.transform = 'translate(-50%, -50%) translate(' + Math.round(VEC_X) + 'px, ' + Math.round(VEC_Y) + 'px)';
        if (VEC.z > .8) label.style.display = 'none';
        else label.style.display = '';
      } else { // Print labels on map
        label.style.display = '';
        if (!SMALL_MEDIA.matches) { x *= 2; y *= 2; }
        label.style.transform = 'translate(-50%, -50%) translate(' + Math.round(x) + 'px, ' + Math.round(y) + 'px)';
      }
    });
  }

  render() {
    return (
      <div id="weather_maps_box">
        <article id="weather_maps">
          <div id="weather_maps_header">
            <h3>
              <em>{this.state.label}</em>
            </h3>
            <CustomRadio
              idWord="globe_radio"
              iconWord="globe"
              groupWord="weather_maps"
              titleWord="Globo"
              defaultChk={true}
              key="custom_radio_key_globe_radio" />
            <CustomRadio
              idWord="map_radio"
              iconWord="map"
              groupWord="weather_maps"
              titleWord="Mapa"
              defaultChk={false}
              key="custom_radio_key_map_radio" />
          </div>
          <hr />
          <div id="weather_maps_body" className="dragscroll">
            <div id="globe_box" style={{ display: this.state.showGlobe }} >
              <div id="globe_shadow"><span></span></div>
              {/* renderer canvas here */}
            </div>
            <div id="map_box" style={{ display: this.state.showMap }} >
              <div id="map_canvas_container">
                <canvas id="map_canvas" width={RES} height={RES * .5} />
              </div>
            </div>
            <div id="labels">
              {city_labels.map(item => (
                <Label
                  id={item.id}
                  cityName={item.cityName}
                  key={'city_label_' + item.id} />
              ))}
            </div>
          </div>
          <hr />
          <div id="ref">
            <div id="ref_data" title="Referencia de magnitudes y valores">
              {MAPS[this.state.option].ref.map(item => (
                <p key={'ref_data_' + item}>{item}</p>
              ))}
            </div>
            <hr />
            <div id="ref_gradient_bg"></div>
            <div className={'ref_gradient ref_gradient_' + MAPS[this.state.option].id}
              title="Referencia de colores">
            </div>
          </div>
          <hr />
          <div id="weather_maps_control">
            <div id="globe_controls" style={{ display: this.state.showGlobe }} >
              <CustomChk
                idWord="rotation_chk"
                iconWordA="rotation_360"
                titleWord="Alternar rotación"
                defaultChk={false} />
              <CustomChk
                idWord="day_night_day_chk"
                iconWordA="day_night"
                iconWordB="day"
                titleWord="Alternar iluminación"
                defaultChk={false} />
            </div>
            <div id="generic_controls">
              {MAPS.map(option => (
                <CustomRadio
                  idWord={String(option.id)}
                  iconWord={option.icon}
                  groupWord={'map_option'}
                  titleWord={option.label}
                  defaultChk={option.id === 1 ? true : false}
                  key={'custom_radio_key_' + option.id} />
              ))}
            </div>
          </div>
          <div id="mark_box" style={{ display: this.state.showMap }} >
            <div id="mark_content">
              <div id="mark_left"></div>
              <div id="mark_right"></div>
            </div>
          </div>
        </article>
      </div>
    )
  }
}

function Label(props) {
  return (
    <div id={'city_label_' + props.id} className={'city_label'} >
      {props.cityName}
    </div>
  )
}