import React, { Component } from 'react'

export default class Prediction extends Component {
  constructor(props) {
    super(props);
    this.onClick = this.onClick.bind(this);
  }

  onClick() {
    this.props.onClick(this.props.data.id);
  }

  render() {
    const { start, match, finish, country, id } = this.props.data;
    return (
      <div className="prediction" onClick={this.onClick}>
        <span>
          <p><strong>{start}</strong>{match}<strong>{finish}</strong><em> ({country})</em></p>
        </span>
        <input type="hidden"
          value={id}
          style={{ display: 'none' }} />
      </div>
    )
  }
}
