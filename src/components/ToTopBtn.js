import React from 'react'
import Icon from './Icon';
import { initSS } from '../js/smoothScroll';

export default function ToTopBtn() {
  return (
    <button id="to_top_btn" onClick={() => initSS(0)} title="Volver arriba">
      <Icon name="top_arrow" classes={['btn']} />
    </button>
  )
}
