import React from 'react'


export default function Icon(props) {
  let classes = ['icon'];
  let viewbox = '';

  if (props.size !== undefined) classes.push('icon_' + props.size);
  else classes.push('icon_small');
  if (props.classes !== undefined) classes.push(...props.classes);

  // Special case for "loading loop"
  if (props.name === 'loading_loop') classes.push('icon_loading');

  if (props.viewbox !== undefined) viewbox = props.viewbox;
  else viewbox = '0 0 24 24';

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

/*

props

size ''
classes []
viewbox ''
name ''

*/