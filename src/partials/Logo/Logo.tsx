import React from 'react';

import pagopaColor from '../../images/pagopa.svg';
import pagopaLight from '../../images/pagopa-light.svg';
import './Logo.sass';

type LogoProps = {
  title: string;
  version?: string;
  menuOpen?: boolean;
  language: string;
  onClick?: () => void;
};

export const Logo = ({
  title,
  version,
  menuOpen,
  onClick,
  language,
}: LogoProps) => {
  const logoSrc =
    version === 'light' ? pagopaLight : menuOpen ? pagopaLight : pagopaColor;

  return (
    <>
      {onClick ? (
        <button
          className="logo"
          aria-label={`${
            language === 'it' ? 'Torna alla homepage' : 'Back to homepage'
          } ${title}`}
          onClick={onClick}
        >
          <img src={logoSrc} alt={title} />
        </button>
      ) : (
        <div className="logo">
          <img src={logoSrc} alt={title} />
        </div>
      )}
    </>
  );
};
