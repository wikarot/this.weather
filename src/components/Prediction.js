import React, { Component } from 'react'

export default class Prediction extends Component {
  render() {
    return (
      <option
        value={this.props.data.name + ', ' + this.props.data.country}
      />
    )
  }
}
