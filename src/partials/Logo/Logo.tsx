import React from 'react';

import pagopaColor from '../../images/pagopa.svg';
import pagopaLight from '../../images/pagopa-light.svg';
import './Logo.sass';

export const Logo = ({ title, version, menuOpen, onClick, language }) => {
  const logoSrc =
    version === 'light' ? pagopaLight : menuOpen ? pagopaLight : pagopaColor;

  return (
    <button
      className="logo"
      aria-label={`${
        language === 'it' ? 'Torna alla homepage' : 'Back to homepage'
      } ${title}`}
      onClick={onClick}
    >
      <img src={logoSrc} alt={title} />
    </button>
  );
};
