import classNames from 'classnames';
import React, { useState, useRef, useEffect } from 'react';
import { MenuItem } from '../MenuItem';
import '../Menu.sass';
import { useLocation } from '@reach/router';

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
    if (window.innerWidth < 1200) {
      setSubmenuOpen(prev => !prev);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleSubmenu();
    } else if (e.key === 'Escape') {
      setSubmenuOpen(false);
    }
  };

  // Gestione ESC globale
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && submenuOpen) {
        setSubmenuOpen(false);
        // Riporta il focus al trigger
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

  // Gestione focus-out
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

  // Gestione tasti per elementi del sottomenu
  const handleSubmenuItemKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case ' ':
        e.preventDefault(); // Previene il page scroll
        break;
      case 'ArrowUp':
      case 'ArrowDown':
      case 'Home':
      case 'End':
        e.preventDefault(); // Previene il comportamento predefinito delle frecce
        break;
    }
  };
  const isCurrent = pathname.split('/').includes(item.uiRouterKey as string);
  const hasChildren = !!items?.length;

  return (
    <li
      ref={menuRef}
      onClick={hasChildren ? handleSubmenu : undefined}
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
          onClick={handleSubmenu}
          onKeyDown={handleKeyDown}
          aria-expanded={submenuOpen}
          aria-haspopup="true"
          aria-controls={submenuId}
          aria-current={isCurrent ? 'page' : undefined}
        >
          <MenuItem item={item} disabled={true} />
        </button>
      ) : (
        <MenuItem item={item} aria-current={isCurrent ? 'page' : undefined} />
      )}
      {hasChildren && (
        <ul id={submenuId}>
          {items?.map(item => {
            return (
              item && (
                <li
                  key={item?.id}
                  className={classNames(
                    className,
                    item.highlight && 'alternative'
                  )}
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
