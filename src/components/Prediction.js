import React, { Component } from 'react'
import PropTypes from 'prop-types';

export default class Prediction extends Component {
  constructor(props) {
    super(props);
    this.predictionClicked = this.predictionClicked.bind(this);
  }

  predictionClicked() {
    this.props.clickHandler(this.props.data.id);
  }

  render() {
    const { start, match, finish, country, id } = this.props.data;
    return (
      <div className="prediction" onClick={this.predictionClicked}>
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

Prediction.propTypes = {
  data: PropTypes.shape({
    start: PropTypes.string.isRequired,
    match: PropTypes.string.isRequired,
    finish: PropTypes.string.isRequired,
    country: PropTypes.string.isRequired,
    id: PropTypes.number.isRequired
  }).isRequired,
  clickHandler: PropTypes.func.isRequired
}
