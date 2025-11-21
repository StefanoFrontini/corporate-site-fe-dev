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
  const hamburgerRef = useRef<HTMLButtonElement>(null);
  const handleMobileMenu = () => setMobileMenuOpen(prev => !prev);
  const { language, navigate } = useI18next();

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileMenuOpen) {
        const isAnySubmenuOpen =
          document.querySelector('.is-sub-open') !== null;

        if (!isAnySubmenuOpen) {
          setMobileMenuOpen(false);
          hamburgerRef.current?.focus();
        }
      }
    };

    if (mobileMenuOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [mobileMenuOpen]);

  const route = language === 'it' ? '/' : '/en/homepage';

  const handleLogoClick = () => {
    navigate(route);
  };

  return (
    <header className={classNames('header', mobileMenuOpen && 'menu-is-open')}>
      <div className="header__top">
        <div className="container-fluid">
          <div className="row align-items-center justify-content-between">
            <div className="col-auto">
              <Logo
                title="PagoPA"
                menuOpen={mobileMenuOpen}
                onClick={handleLogoClick}
                version="default"
                language={language}
              />
            </div>
            <div className="col-auto d-block d-lg-none">
              <Hamburger
                ref={hamburgerRef}
                handler={handleMobileMenu}
                isOpen={mobileMenuOpen}
              />
            </div>

            <div className="col-auto d-none d-lg-block">
              <Menu reserved={reservedMenu} />
            </div>
          </div>
        </div>
      </div>

      <div className="header__bottom">
        <div className="container-fluid">
          <div className="row justify-content-between">
            <div className="col-auto">
              <Menu main={mainMenu} reserved={reservedMenu} />
            </div>
            <div className={'col-auto d-lg-flex align-items-center'}>
              <div>
                <Socials header />
              </div>
              <div className="divider" />
              <div className="header-language-switch">
                <LanguageSwitch />
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
