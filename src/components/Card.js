import React, { Component } from 'react'
import place from '../svg/place.svg';
import close from '../svg/close.svg';
import refresh from '../svg/refresh.svg';
/* import { not } from '../js/newConsole'; */

export default class Card extends Component {
    constructor(props) {
        super(props);
        this.state = {
            /* updating: 'false',
            updateTimer: undefined, */
            time: '00:00',
            timeTimer: undefined,
        };
    }

    componentDidMount() {
        // Update timing, around 15min.
        /* const t = (14 * 60000) + Math.round(Math.random() * 120000);
        this.autoUpdate(t); */
        this.setState({ timeTimer: setInterval(this.getTime.bind(this), 1000) });
    }

    componentWillUnmount() {
        /* clearInterval(this.state.updateTimer); */
        /* clearInterval(this.state.timeTimer); */
    }

    getTime() {
        const OFFSET = ((this.props.data.timezone / 60) / 60);
        const OFFSET_F = Math.floor(OFFSET);
        let mm_off = 0;

        if (OFFSET_F !== OFFSET) mm_off = Math.floor((OFFSET - OFFSET_F) * 60);

        let hh = new Date().getUTCHours() + OFFSET_F;
        let mm = new Date().getUTCMinutes() + mm_off;

        if (mm > 59) { hh = hh + 1; mm = mm - 60; }
        if (hh > 23) hh = hh - 24;
        if (hh < 10 && hh >= 0) hh = '0' + hh;
        if (hh < 0) hh = 24 + hh;
        if (mm < 10) mm = '0' + mm;

        this.setState({
            time: (hh + ':' + mm)
        });
    }

    /* autoUpdate(t) {
        this.setState({
            updateTimer: setInterval(() => {
                not(this.props.fullName + ': Actualizacion automatica...');
                this.callForUpdate();
            }, t)
        });
    } */

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
                            {DATA.temp}°
                        </p>
                        <p className="temp_max">
                            <span>Max</span>{DATA.tempMax}°
                        </p>
                        <p className="temp_min">
                            <span>Min</span>{DATA.tempMin}°
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
                        <button className="refresh" onClick={this.callForUpdate.bind(this)}>
                            <span>
                                <img src={refresh} alt="Actualizar" title="Actualizar" />
                            </span>
                        </button>
                        <div>
                            <span className="time">
                                {this.state.time}
                            </span>
                        </div>
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
