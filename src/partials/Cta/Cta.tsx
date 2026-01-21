import React from 'react';
import { Link } from 'gatsby';
import classNames from 'classnames';
import { useTranslation } from 'gatsby-plugin-react-i18next';

import './Cta.sass';
type CtaProps = {
  label: string;
  blank?: boolean;
  variant?: string;
  className?: string;
  innerClassName?: string;
  href?: string;
  as?: React.ElementType;
  showArrow?: boolean;
};

export const Cta = ({
  label,
  blank = false,
  variant,
  className,
  innerClassName,
  href = '#',
  as: Component = 'span',
  showArrow,
}: CtaProps) => {
  const { t } = useTranslation();
  const isPdf = href?.includes('.pdf');
  const isExternal = href && href.startsWith('http');

  const shouldShowArrow = showArrow ?? variant === 'link';

  const commonClasses = classNames(
    'cta',
    variant && `cta--${variant}`,
    isExternal && 'external-link',
    !shouldShowArrow && 'cta--no-arrow',
    className
  );

  const screenReaderOpenText = (
    <span className="sr-only">{t('cta.screenReaderExternal')}</span>
  );
  const screenReaderPDFText = (
    <span className="sr-only">{t('cta.screenReaderPDF')}</span>
  );
  const screenReaderInternalText = (
    <span className="sr-only">{t('cta.screenReaderInternal', { label })}</span>
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
          <Component className={innerClassName}>{label}</Component>
          {isPdf ? screenReaderPDFText : screenReaderOpenText}
        </a>
      ) : (
        <Link to={href} className={commonClasses}>
          <Component className={innerClassName}>{label}</Component>
          {screenReaderInternalText}
        </Link>
      )}
    </>
  );
};
