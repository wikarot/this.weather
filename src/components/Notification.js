import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Icon from './Icon';

export default class Notification extends Component {
  constructor(props) {
    super(props);
    this.iconWord = 'not_' + this.props.data.type;
  }

  componentDidMount() {
    this.waitAndRemove();
  }

  waitAndRemove() {
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

Notification.propTypes = {
  data: PropTypes.shape({
    msg: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    id: PropTypes.number.isRequired
  }).isRequired,
  remove: PropTypes.func.isRequired
}
