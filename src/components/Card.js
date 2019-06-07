import React, { Component } from 'react'
import place from '../svg/place.svg';
import close from '../svg/close.svg';
import refresh from '../svg/refresh.svg';
import { not } from '../js/newConsole';

export default class Card extends Component {
    constructor(props) {
        super(props);
        this.state = {
            updating: 'false',
            updateTimer: undefined,
            /* time: undefined,
            timeTimer: undefined, */
        }
    }

    componentDidMount() {
        // Update timing, around 15min.
        const t = (14 * 60000) + Math.round(Math.random() * 120000);
        this.autoUpdate(t);
        /* this.setState({ timeTimer: setInterval(this.getTime.bind(this), 1000) }); */
    }

    componentWillUnmount() {
        clearInterval(this.state.updateTimer);
        /* clearInterval(this.state.timeTimer); */
    }

    /* getTime() {
        let hh = new Date().getHours();
        let mm = new Date().getMinutes();
        let ss = new Date().getSeconds();
        if (hh < 10) { hh = '0' + hh }
        if (mm < 10) { mm = '0' + mm }
        if (ss < 10) { ss = '0' + ss }
        this.setState({
            time: (hh + ':' + mm + ':' + ss)
        });
    } */

    autoUpdate(t) {
        this.setState({
            updateTimer: setInterval(() => {
                not(this.props.fullName + ': Actualizacion automatica...');
                this.callForUpdate();
            }, t)
        });
    }

    componentDidUpdate() {
        if (this.state.updating === 'true') {
            this.setState({ updating: 'false' });
        }
    }

    callForUpdate() {
        this.setState({ updating: 'true' });
        this.props.handleUpdate(this.props.fullName);
    }

    callForRemove() {
        this.props.handleRemove(this.props.fullName);
    }

    render() {
        const DATA = this.props.data;
        const EXTRAS = this.props.extras;
        return (
            <article className="card" id={this.props.fullName}>
                <div className="content">
                    <div className="head_box"
                        title={
                            DATA.cityName + ', ' +
                            EXTRAS.countryName + ' (' +
                            EXTRAS.countryNameNative + ')'
                        }
                    >
                        <h3 className="name" >
                            {DATA.cityName}, {DATA.countryCode}
                        </h3>
                        <div className="place_div">
                            <span>
                                <img
                                    className="place"
                                    src={place}
                                    alt="Ubicacion"
                                    title="Ubicacion"
                                />
                            </span>
                        </div>
                        <div className="flag_div">
                            <span>
                                <img
                                    className="flag"
                                    src={'https://www.countryflags.io/' + DATA.countryCode + '/shiny/16.png'}
                                    alt={'Bandera de ' + this.props.fullName}
                                />
                            </span>
                        </div>
                    </div>
                    <hr />
                    <div className="temp_box">
                        <p className="temp">
                            {Math.round(DATA.temp)}°
                        </p>
                        <p className="temp_max">
                            <span>Max.</span>{Math.round(DATA.temp_max)}°
                        </p>
                        <p className="temp_min">
                            <span>Min.</span>{Math.round(DATA.temp_min)}°
                        </p>
                    </div>
                    <hr />
                    <div className="desc_box">
                        <p className="desc">
                            {DATA.desc}
                        </p>
                        <div>
                            <span>
                                <img
                                    src={
                                        'https://res.cloudinary.com/wikarot/image/upload/v1559246003/weathericons/' +
                                        DATA.icon + '.png'
                                    }
                                    alt={DATA.desc}
                                />
                            </span>
                        </div>
                    </div>
                    <hr />
                    <div className="others_box">
                        <div className="hum">
                            <p>Humedad</p>
                            <span>{DATA.hum}%</span>
                        </div>
                        <div className="cloud">
                            <p>Nubosidad</p>
                            <span>{DATA.cloud}%</span>
                        </div>
                        <div className="wind">
                            <p>Viento</p>
                            <span>{DATA.wind} km/h</span>
                        </div>
                    </div>
                    <hr />
                    <div className="control_box">
                        {/* <div>
                            <span className="time" aux="{this.state.time}">
                                
                            </span>
                        </div> */}
                        <button className="refresh" onClick={this.callForUpdate.bind(this)}>
                            <span>
                                <img src={refresh} alt="Actualizar" title="Actualizar" />
                            </span>
                        </button>
                        <button className="close" onClick={this.callForRemove.bind(this)}>
                            <span>
                                <img src={close} alt="Cerrar" title="Cerrar" />
                            </span>
                        </button>
                    </div>
                </div>
            </article>
        );
    }
}
