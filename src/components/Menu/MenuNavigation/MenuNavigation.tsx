import classNames from 'classnames';
import React, { useState, useRef, FocusEventHandler, useId } from 'react';
import { MenuItem } from '../MenuItem';
import '../Menu.sass';
import { useLocation } from '@reach/router';
import { navigate } from 'gatsby';
import { useTranslation } from 'gatsby-plugin-react-i18next';

export const MenuNavigation = ({
  item,
  className,
}: {
  item: Queries.MainNavigationItemFragment;
  className: string;
}) => {
  const { t } = useTranslation();
  const [submenuOpen, setSubmenuOpen] = useState(false);
  const { pathname } = useLocation();
  const submenuId = useId();
  const menuRef = useRef<HTMLLIElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const handleSubmenu = () => {
    setSubmenuOpen(prev => !prev);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.target instanceof HTMLButtonElement) {
      if (e.key === 'Enter') {
        if (item.uiRouterKey.includes('media') && item.path) {
          navigate(item.path);
        } else {
          e.preventDefault();
          handleSubmenu();
        }
      } else if (e.key === ' ' || e.key === 'ArrowDown' || e.key === 'Enter') {
        e.preventDefault();
        handleSubmenu();
      } else if (e.key === 'Escape' && submenuOpen) {
        setSubmenuOpen(false);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleSubmenu();
      triggerRef.current.focus();
    }
  };

  const handleMouseEnter = () => {
    if (window.innerWidth >= 992 && hasChildren) {
      setSubmenuOpen(true);
    }
  };

  const handleMouseLeave = () => {
    if (window.innerWidth >= 992 && hasChildren) {
      setSubmenuOpen(false);
    }
  };

  const handleFocusOut: FocusEventHandler<HTMLLIElement> = e => {
    if (menuRef.current && !menuRef.current.contains(e.relatedTarget)) {
      setSubmenuOpen(false);
    }
  };

  const { items, highlight } = item;

  const isCurrent = pathname
    .split('/')
    .includes(item.uiRouterKey.replace(/-\d+/, '') as string);
  const hasChildren = !!items?.length;

  return (
    <li
      ref={menuRef}
      onBlur={handleFocusOut}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onKeyDown={handleKeyDown}
      className={classNames(
        className,
        hasChildren && 'w-sub',
        highlight && 'highlight',
        isCurrent && 'is-current',
        hasChildren && submenuOpen && 'is-sub-open'
      )}
    >
      {hasChildren ? (
        <button
          ref={triggerRef}
          className="menu-trigger"
          onClick={e => {
            e.preventDefault();
            if (window.innerWidth < 992) {
              handleSubmenu();
            } else {
              if (item.uiRouterKey.includes('media') && item.path) {
                navigate(item.path);
              }
            }
          }}
          onMouseDown={e => e.preventDefault()}
          aria-expanded={submenuOpen}
          aria-haspopup="true"
          aria-controls={submenuId}
        >
          <MenuItem item={item} disabled={true} />
          {item.uiRouterKey.includes('media') && (
            <span className="sr-only">{t('menuNavigationInstructions')}</span>
          )}
        </button>
      ) : (
        <MenuItem item={item} aria-current={isCurrent ? 'page' : undefined} />
      )}
      {hasChildren && (
        <ul id={submenuId}>
          {items?.map(item => {
            const isCurrentSubmenu = pathname
              .split('/')
              .includes(item.uiRouterKey.replace(/-\d+/, '') as string);
            return (
              item && (
                <li
                  key={item?.id}
                  className={classNames(
                    className,
                    item.highlight && 'alternative'
                  )}
                  aria-current={isCurrentSubmenu ? 'page' : undefined}
                >
                  <MenuItem item={item} />
                </li>
              )
            );
          })}
        </ul>
      )}
    </li>
  );
};
