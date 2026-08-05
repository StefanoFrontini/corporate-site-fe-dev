import React, { FocusEventHandler, useRef } from 'react';
import { graphql } from 'gatsby';

import { MenuNavigation } from './MenuNavigation';
import './Menu.sass';
import { LanguageSwitch } from '../../partials/LanguageSwitch/LanguageSwitch';
import { useTranslation } from 'gatsby-plugin-react-i18next';
import { MENU_CLOSE_ALL_SUBMENUS_EVENT } from '../../types';

export const mainNavigationItemFragment = graphql`
  fragment MainNavigationItem on StrapiNavigation {
    type
    external
    highlight
    id
    order
    key
    title
    uiRouterKey
    locale
    path
    items {
      ...NavigationItem
    }
  }
`;

export const Menu = ({
  main,
  reserved,
}: {
  main?: Queries.MainNavigationItemFragment[];
  reserved?: Queries.MainNavigationItemFragment[];
}) => {
  const { t } = useTranslation();
  const mainNavRef = useRef<HTMLElement>(null);
  const reservedNavRef = useRef<HTMLElement>(null);

  const closeAllIfFocusLeftNav = (
    navRef: React.RefObject<HTMLElement>,
    target: EventTarget | null
  ) => {
    const nav = navRef.current;
    if (!nav) return;
    if (target instanceof Node && nav.contains(target)) return;
    nav.dispatchEvent(new CustomEvent(MENU_CLOSE_ALL_SUBMENUS_EVENT));
  };

  const handleMainNavBlur: FocusEventHandler<HTMLElement> = e => {
    // Screen readers may not provide relatedTarget when swiping between
    // elements (same rationale as MenuNavigation's own handleFocusOut).
    if (!e.relatedTarget) {
      setTimeout(
        () => closeAllIfFocusLeftNav(mainNavRef, document.activeElement),
        150
      );
      return;
    }
    closeAllIfFocusLeftNav(mainNavRef, e.relatedTarget);
  };

  const handleReservedNavBlur: FocusEventHandler<HTMLElement> = e => {
    if (!e.relatedTarget) {
      setTimeout(
        () => closeAllIfFocusLeftNav(reservedNavRef, document.activeElement),
        150
      );
      return;
    }
    closeAllIfFocusLeftNav(reservedNavRef, e.relatedTarget);
  };

  const sortMenuByOrder = (
    menu: Queries.MainNavigationItemFragment[] | undefined
  ) =>
    menu?.sort((item, nextItem) =>
      item?.order && nextItem?.order ? item.order - nextItem.order : 0
    );

  const sortedMain = sortMenuByOrder(main);
  const sortedReserved = sortMenuByOrder(reserved);

  return (
    <div className="menu-header">
      <nav
        className="menu-main"
        ref={mainNavRef}
        onBlur={handleMainNavBlur}
        aria-label={t('navigationMain') ?? undefined}
      >
        <ul>
          {sortedMain?.map((item: Queries.MainNavigationItemFragment) => {
            return (
              <MenuNavigation
                className="main-navigation"
                item={item}
                key={item.id}
              />
            );
          })}
        </ul>
      </nav>
      <nav
        className="menu-reserved"
        ref={reservedNavRef}
        onBlur={handleReservedNavBlur}
        aria-label={t('navigationReserved') ?? undefined}
      >
        <ul>
          {sortedReserved?.map((item: Queries.MainNavigationItemFragment) => {
            return (
              <MenuNavigation
                className="reserved-navigation menu-reserved__item "
                item={item}
                key={item.id}
              />
            );
          })}
        </ul>
        <div className="language-switch-container">
          <span style={{ marginBottom: '8px' }}>{t('siteLanguage')}</span>
          <LanguageSwitch />
        </div>
      </nav>
    </div>
  );
};
