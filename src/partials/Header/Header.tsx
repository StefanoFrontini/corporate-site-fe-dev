import classNames from 'classnames';
import React, { useState, useRef, useEffect } from 'react';
import { Menu } from '../../components/Menu';
import { Hamburger } from '../Hamburger';
import { Logo } from '../Logo';
import { Socials } from '../Socials';
import './Header.sass';
import { useI18next } from 'gatsby-plugin-react-i18next';
import { LanguageSwitch } from '../LanguageSwitch/LanguageSwitch';

export const Header = ({
  reservedMenu,
  mainMenu,
}: {
  reservedMenu: Queries.MainNavigationItemFragment[];
  mainMenu: Queries.MainNavigationItemFragment[];
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [scrolled, setScrolled] = useState<boolean>(false);
  const hamburgerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 0;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [scrolled]);

  const handleMobileMenu = () => setMobileMenuOpen(prev => !prev);
  const { language, navigate } = useI18next();

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'Escape': {
        e.preventDefault();
        if (!mobileMenuOpen) return;
        const isAnySubmenuOpen =
          document.querySelector('.is-sub-open') !== null;

        if (!isAnySubmenuOpen) {
          setMobileMenuOpen(false);
          hamburgerRef.current?.focus();
        }
        break;
      }
      default:
        return;
    }
  };

  const route = language === 'it' ? '/' : '/en/homepage';

  const handleLogoClick = () => {
    navigate(route);
  };

  return (
    <header
      onKeyDown={handleKeyDown}
      className={classNames(
        'header',
        mobileMenuOpen && 'menu-is-open',
        scrolled && 'header--scrolled'
      )}
    >
      <div className="header__single">
        <div className="header__left">
          <Logo
            title="PagoPA"
            menuOpen={mobileMenuOpen}
            onClick={handleLogoClick}
            version="default"
          />
          <div className="header__main-menu d-none d-xl-block">
            <Menu main={mainMenu} />
          </div>
          <div className="header__right d-none d-xl-flex">
            <div className="header__right-top">
              <Menu reserved={reservedMenu} />
            </div>
            <div className="header__right-bottom">
              <div className="header__socials">
                <Socials header />
              </div>
              <div className="divider" />
              <div className="header-language-switch">
                <LanguageSwitch />
              </div>
            </div>
          </div>
        </div>

        <div className="header__mobile d-block d-xl-none">
          <Hamburger
            ref={hamburgerRef}
            handler={handleMobileMenu}
            isOpen={mobileMenuOpen}
          />
        </div>
      </div>

      {/* Menu mobile - shown when hamburger is clicked */}
      <div className="header__mobile-menu d-xl-none">
        <Menu main={mainMenu} reserved={reservedMenu} />
      </div>
    </header>
  );
};
