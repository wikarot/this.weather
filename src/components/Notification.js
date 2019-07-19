import React, { Component } from 'react';
import Icon from './Icon';

export default class Notification extends Component {
  constructor(props) {
    super(props);
    this.iconWord = 'not_';
    switch (this.props.data.type) {
      case 'success':
        this.iconWord += 'success';
        break;
      case 'info':
        this.iconWord += 'info';
        break;
      case 'alert':
        this.iconWord += 'alert';
        break;
      case 'error':
        this.iconWord += 'error';
        break;
      default:
        /* that's bad */
        break;
    }
  }

  componentDidMount() {
    this.remove();
  }

  remove() {
    setTimeout(() => {
      this.props.remove(this.props.data.id);
    }, 4000);
  }

  render() {
    return (
      <div className={'notification ' + this.props.data.type}>
        <Icon name={this.iconWord} />
        <p>{this.props.data.msg}</p>
      </div>
    )
  }
}
