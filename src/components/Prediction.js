import React, { Component } from 'react'

export default class Prediction extends Component {
  constructor(props) {
    super(props);
    this.onClick = this.onClick.bind(this);
  }

  onClick() {
    const { start, match, finish, country } = this.props.data;
    this.props.onClick(start + match + finish + ', ' + country);
  }

  render() {
    const { start, match, finish, country } = this.props.data;
    return (
      <div className="prediction" onClick={e => this.onClick(e)}>
        <span>
          <p><strong>{start}</strong>{match}<strong>{finish}</strong><em> - {country}</em></p>
        </span>
        <input type="hidden"
          value={start + match + finish + ', ' + country}
          style={{ display: 'none' }} />
      </div>
    )
  }
}
