import React, { Component } from 'react'

export default class Notification extends Component {
  constructor(props) {
    super(props);
    this.state = {
      timeout: undefined
    }
  }

  componentDidMount() {
    this.waitAndRemove();
  }

  waitAndRemove() {
    this.setState({
      timeout: setTimeout(() => {
        this.props.handleRemove(this.props.data.time);
      }, 2500)
    });
  }

  render() {
    return (
      <div>
        <p>{this.props.data.msg}</p>
      </div>
    )
  }
}
