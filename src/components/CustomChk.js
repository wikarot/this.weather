import React from 'react'
import PropTypes from 'prop-types';
import Icon from './Icon';

export default function CustomChk(props) {
  let iconClasses = [];
  let customChkClasses = ['custom_chk_container', 'btn'];
  if (props.iconWordB !== undefined) {
    customChkClasses.push('dual_icon');
    iconClasses.push('perma_active');
  } else customChkClasses.push('single_icon');
  if (props.iconClasses !== undefined) iconClasses.push(...props.iconClasses);

  return (
    <div className={customChkClasses.join(' ')}>
      <input id={'custom_chk_' + props.idWord}
        className="custom_chk"
        type="checkbox"
        defaultChecked={props.defaultChk} />
      <label className="custom_chk_lbl"
        title={props.titleWord}
        htmlFor={'custom_chk_' + props.idWord} />
      <Icon name={props.iconWordA} classes={[...iconClasses]} />
      {(props.iconWordB !== undefined) ?
        (<Icon name={props.iconWordB} classes={[...iconClasses]} />) : null}
    </div>
  )
}

CustomChk.propTypes = {
  idWord: PropTypes.string.isRequired,
  iconWordA: PropTypes.string.isRequired,
  iconWordB: PropTypes.string,
  iconClasses: PropTypes.arrayOf(PropTypes.string),
  titleWord: PropTypes.string.isRequired,
  defaultChk: PropTypes.bool.isRequired
}
