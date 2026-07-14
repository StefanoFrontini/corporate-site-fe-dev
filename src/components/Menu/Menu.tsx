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

  const makeHandleNavBlur =
    (navRef: React.RefObject<HTMLElement>): FocusEventHandler<HTMLElement> =>
    e => {
      const closeAllIfFocusLeftNav = (target: EventTarget | null) => {
        const nav = navRef.current;
        if (!nav) return;
        if (target instanceof Node && nav.contains(target)) return;
        nav.dispatchEvent(new CustomEvent(MENU_CLOSE_ALL_SUBMENUS_EVENT));
      };

      // Screen readers may not provide relatedTarget when swiping between
      // elements (same rationale as MenuNavigation's own handleFocusOut).
      if (!e.relatedTarget) {
        setTimeout(() => closeAllIfFocusLeftNav(document.activeElement), 150);
        return;
      }
      closeAllIfFocusLeftNav(e.relatedTarget);
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
        onBlur={makeHandleNavBlur(mainNavRef)}
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
        onBlur={makeHandleNavBlur(reservedNavRef)}
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
