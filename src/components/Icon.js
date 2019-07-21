import React from 'react'
import PropTypes from 'prop-types';


export default function Icon(props) {
  let classes = ['icon'];
  let viewbox = '0 0 24 24';

  if (props.size !== undefined) classes.push('icon_' + props.size);
  else classes.push('icon_small');
  if (props.classes !== undefined) classes.push(...props.classes);
  if (props.viewbox !== undefined) viewbox = props.viewbox;

  // Special case for "loading loop"
  if (props.name === 'loading_loop') classes.push('icon_loading');


  return (
    <div className={classes.join(' ')} >
      <span>
        <svg viewBox={viewbox} >
          <use xlinkHref={'#' + props.name}></use>
        </svg>
      </span>
    </div>
  )
}

Icon.propTypes = {
  name: PropTypes.string.isRequired,
  classes: PropTypes.arrayOf(PropTypes.string),
  viewbox: PropTypes.string,
  size: PropTypes.string,
}
