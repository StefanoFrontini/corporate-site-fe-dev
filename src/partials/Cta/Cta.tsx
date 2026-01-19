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
  const isExternal = href && href.startsWith('http');

  const commonClasses = classNames(
    'cta',
    variant && `cta--${variant}`,
    isExternal && 'external-link',
    className
  );

  const screenReaderOpenText = (
    <span className="sr-only">link esterno - apre in una nuova scheda</span>
  );
  const screenReaderPDFText = (
    <span className="sr-only">
      Documento PDF - link esterno - apre in una nuova scheda
    </span>
  );

  return (
    <>
      {isExternal ? (
        <a
          target={blank ? '_blank' : null}
          rel="noopener noreferrer"
          href={href}
          className={commonClasses}
        >
          <span>{label}</span>
          {isPdf ? screenReaderPDFText : screenReaderOpenText}
        </a>
      ) : (
        <Link to={href} className={commonClasses}>
          <span>{label}</span>
          {isPdf ? screenReaderPDFText : screenReaderOpenText}
        </Link>
      )}
    </>
  );
};
