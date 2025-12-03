import React from 'react';
import { Link } from 'gatsby';
import classNames from 'classnames';

import './Cta.sass';
type CtaProps = {
  label: string;
  blank?: boolean;
  variant?: string;
  className?: string;
  href?: string;
};

export const Cta = ({
  label,
  blank = false,
  variant,
  className,
  href = '#',
}: CtaProps) => {
  const isPdf = href?.includes('.pdf');

  return (
    <>
      {href && href.startsWith('http') ? (
        <a
          target={blank ? '_blank' : null}
          rel="noopener noreferrer"
          href={href}
          className={classNames('cta', variant && `--${variant}`, className)}
        >
          <span>{label}</span>
          {isPdf && (
            <span className="sr-only">PDF - Apre una nuova scheda</span>
          )}
        </a>
      ) : (
        <Link
          to={href}
          className={classNames('cta', variant && `--${variant}`, className)}
        >
          <span>{label}</span>
          {isPdf && (
            <span className="sr-only">PDF - Apre una nuova scheda</span>
          )}
        </Link>
      )}
    </>
  );
};
