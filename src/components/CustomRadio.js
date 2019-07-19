import React from 'react'
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

/*

idle props

idWord
iconWord
iconClasses
titleWord
defaultChk

*/