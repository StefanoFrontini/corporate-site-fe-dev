import React from 'react';
import { graphql, Link } from 'gatsby';

import '../Menu.sass';

export const navigationItemFragment = graphql`
  fragment NavigationItem on StrapiNavigationItems {
    external
    highlight
    type
    id
    title
    uiRouterKey
    path
  }
`;

export const MenuItem = ({
  item,
  disabled,
  'aria-current': ariaCurrent,
  onKeyDown,
}: {
  item: Queries.NavigationItemFragment | Queries.MainNavigationItemFragment;
  disabled?: boolean;
  'aria-current'?: 'page' | undefined;
  onKeyDown?: (e: React.KeyboardEvent) => void;
}) => {
  const { title, external, path, type } = item;

  const commonProps = {
    'aria-current': ariaCurrent,
    onKeyDown,
  };

  if (external) {
    return (
      <a
        {...commonProps}
        href={path || '#'}
        target="_blank"
        rel="noopener noreferrer"
      >
        {title}
      </a>
    );
  } else if (type == 'INTERNAL') {
    return (
      <a {...commonProps} href={path || '#'}>
        {title}
      </a>
    );
  } else if (disabled) {
    return <span {...commonProps}>{title}</span>;
  } else {
    return (
      <Link {...commonProps} activeClassName="is-current" to={path || '#'}>
        {title}
      </Link>
    );
  }
};
