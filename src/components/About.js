import React from 'react';

export default function About() {
  return (
    <article id="about" >
      <div id="about_header">
        <h3><em>Acerca de</em></h3>
        <div className="isotipo icon_small">
          <span><img src="favicon-16x16.png" alt="Icono de this.weather" /></span>
        </div>
      </div>
      <hr />
      <div id="about_body">
        <p>Un medio de acceso <br /> al estado del tiempo.</p>
      </div>
    </article>
  )
}
