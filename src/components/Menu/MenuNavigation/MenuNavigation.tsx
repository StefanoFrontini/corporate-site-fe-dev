import classNames from 'classnames';
import React, { useState, useRef, useEffect } from 'react';
import { MenuItem } from '../MenuItem';
import '../Menu.sass';
import { useLocation } from '@reach/router';
import { navigate } from 'gatsby';

export const MenuNavigation = ({
  item,
  className,
}: {
  item: Queries.MainNavigationItemFragment;
  className: string;
}) => {
  const [submenuOpen, setSubmenuOpen] = useState(false);
  const { pathname } = useLocation();
  const submenuId = `submenu-${item.id}`;
  const menuRef = useRef<HTMLLIElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const handleSubmenu = () => {
    setSubmenuOpen(prev => !prev);
  };
  console.log(item);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (item.uiRouterKey.includes('media') && item.path) {
        console.log('handleKeyDown', item);
        navigate(item.path);
      } else {
        e.preventDefault();
        handleSubmenu();
      }
    } else if (e.key === ' ' || e.key === 'ArrowDown') {
      e.preventDefault();
      handleSubmenu();
    } else if (e.key === 'Escape') {
      setSubmenuOpen(false);
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

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && submenuOpen) {
        setSubmenuOpen(false);
        setTimeout(() => {
          triggerRef.current?.focus();
        }, 0);
      }
    };

    if (submenuOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [submenuOpen]);

  useEffect(() => {
    const handleFocusOut = (e: FocusEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.relatedTarget as Node)
      ) {
        setSubmenuOpen(false);
      }
    };

    const menuElement = menuRef.current;
    if (menuElement && submenuOpen) {
      menuElement.addEventListener('focusout', handleFocusOut);
      return () => menuElement.removeEventListener('focusout', handleFocusOut);
    }
  }, [submenuOpen]);

  const { items, highlight } = item;

  const handleSubmenuItemKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case ' ':
        e.preventDefault();
        break;
      case 'ArrowUp':
      case 'ArrowDown':
      case 'Home':
      case 'End':
        e.preventDefault();
        break;
    }
  };

  const isCurrent = pathname
    .split('/')
    .includes(item.uiRouterKey.replace(/-\d+/, '') as string);
  const hasChildren = !!items?.length;

  return (
    <li
      ref={menuRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
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
          onKeyDown={handleKeyDown}
          onMouseDown={e => e.preventDefault()}
          aria-expanded={submenuOpen}
          aria-haspopup="true"
          aria-controls={submenuId}
        >
          <MenuItem item={item} disabled={true} />
          {item.uiRouterKey.includes('media') && (
            <span className="sr-only">
              Premi Invio per visitare la pagina, premi Spazio o Freccia Giù per
              aprire il sottomenu.
            </span>
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
                  <MenuItem item={item} onKeyDown={handleSubmenuItemKeyDown} />
                </li>
              )
            );
          })}
        </ul>
      )}
    </li>
  );
};
