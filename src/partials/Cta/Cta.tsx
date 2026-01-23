import React from 'react';
import { Link } from 'gatsby';
import classNames from 'classnames';
import { useTranslation } from 'gatsby-plugin-react-i18next';

import './Cta.sass';
type CtaProps = {
  label: string;
  title?: string;
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
  title,
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

  function getScreenReaderKey() {
    const discoverMoreLabel = t('cta.discoverMoreLabel');
    const projectVisionTitle = t('cta.projectVisionTitle');
    const isDiscoverMore = label === discoverMoreLabel;
    const isProjectVision = title === projectVisionTitle;

    if (isPdf) {
      return 'cta.screenReaderPDF';
    }

    if (isExternal) {
      if (isDiscoverMore) {
        if (isProjectVision) {
          return 'cta.screenReaderExternalSpecial';
        }
        return 'cta.screenReaderExternalWithTitle';
      }
      return 'cta.screenReaderExternal';
    } else {
      if (isDiscoverMore) {
        if (isProjectVision) {
          return 'cta.screenReaderInternalSpecial';
        }
        return 'cta.screenReaderInternalWithTitle';
      }
      return 'cta.screenReaderInternal';
    }
  }

  const screenReaderKey = getScreenReaderKey();
  const screenReaderText = (
    <span className="sr-only">{t(screenReaderKey, { label, title })}</span>
  );

  return (
    <>
      {isExternal ? (
        <a
          target={blank ? '_blank' : null}
          rel="noopener noreferrer"
          href={href}
          className={commonClasses}
          title={title}
        >
          <Component className={innerClassName}>{label}</Component>
          {screenReaderText}
        </a>
      ) : (
        <Link to={href} className={commonClasses} title={title}>
          <Component className={innerClassName}>{label}</Component>
          {screenReaderText}
        </Link>
      )}
    </>
  );
};
