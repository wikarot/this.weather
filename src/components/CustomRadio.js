import React from 'react'
import PropTypes from 'prop-types';
import Icon from './Icon';

export default function CustomRadio(props) {
  let iconClasses = [];
  if (props.iconClasses !== undefined) {
    iconClasses.push(...props.iconClasses);
  }

  return (
    <div className="custom_radio_container">
      <input id={'custom_radio_' + props.idWord}
        className="custom_radio"
        name={props.groupWord + '_radio_group'}
        type="radio"
        defaultChecked={props.defaultChk} />
      <label className="custom_radio_lbl icon_small"
        title={props.titleWord}
        htmlFor={'custom_radio_' + props.idWord} />
      <Icon name={props.iconWord} classes={[...iconClasses]} />
    </div>
  )
}

CustomRadio.propTypes = {
  idWord: PropTypes.string.isRequired,
  iconWord: PropTypes.string.isRequired,
  groupWord: PropTypes.string.isRequired,
  iconClasses: PropTypes.arrayOf(PropTypes.string),
  titleWord: PropTypes.string.isRequired,
  defaultChk: PropTypes.bool.isRequired
}
