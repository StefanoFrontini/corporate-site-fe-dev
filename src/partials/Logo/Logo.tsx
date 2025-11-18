import React from 'react';

import pagopaColor from '../../images/pagopa.svg';
import pagopaLight from '../../images/pagopa-light.svg';
import './Logo.sass';

export const Logo = ({ title, version, menuOpen }) => {
  const logoSrc =
    version === 'light' ? pagopaLight : menuOpen ? pagopaLight : pagopaColor;
  return (
    <>
      <div className="logo" tabIndex={0}>
        <img src={logoSrc} alt={title} />
      </div>
    </>
  );
};
