import { useI18next, useTranslation } from 'gatsby-plugin-react-i18next';
import React, { useState, useRef, useEffect } from 'react';
import ita from '../../images/ita.svg';
import eng from '../../images/eng.svg';
import { navigate } from 'gatsby';

export const LanguageSwitch = () => {
  const { languages, changeLanguage, language } = useI18next();
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const languageButtonsRef = useRef<(HTMLButtonElement | null)[]>([]);

  const getLanguageName = (lang: string) => {
    return lang === 'it' ? 'Italiano' : 'English';
  };

  const availableLanguages = languages.filter(lng => lng !== language);

  const handleChangeLanguage = (selectedLanguage: string) => {
    changeLanguage(selectedLanguage);
    navigate(
      `/${selectedLanguage}${selectedLanguage === 'it' ? '/' : '/homepage/'}`
    );
    setIsOpen(false);
  };

  const handleSubmenu = () => {
    setIsOpen(prev => !prev);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'Enter':
      case ' ':
      case 'ArrowDown':
        e.preventDefault();
        handleSubmenu();
        break;
      default:
        return;
    }
  };

  useEffect(() => {
    if (isOpen && availableLanguages.length > 0) {
      setTimeout(() => {
        languageButtonsRef.current[0]?.focus();
      }, 0);
    }
  }, [isOpen, availableLanguages.length]);

  useEffect(() => {
    const menuElement = menuRef.current;
    const handleFocusOut = (e: FocusEvent) => {
      if (menuElement && !menuElement.contains(e.relatedTarget as Node)) {
        setIsOpen(false);
      }
    };

    if (menuElement && isOpen) {
      menuElement.addEventListener('focusout', handleFocusOut);
      return () => menuElement.removeEventListener('focusout', handleFocusOut);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
        setTimeout(() => {
          (menuRef.current.children[0] as HTMLElement).focus();
        }, 0);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen]);

  return (
    <div
      ref={menuRef}
      className="language-switch"
      style={{
        position: 'relative',
      }}
      onKeyDown={handleKeyDown}
    >
      <button
        className="current-language"
        style={{
          display: 'flex',
          alignItems: 'center',
          border: '1px solid #E8EBF1',
          borderBottom: !isOpen ? '1px solid #E8EBF1' : 'none',
          padding: '6px',
          height: '28px',
          width: '60px',
          justifyContent: language === 'en' ? 'space-between' : undefined,
        }}
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label={t('languageSwitchLabel', {
          language: getLanguageName(language),
        })}
      >
        <img
          src={language === 'it' ? ita : eng}
          alt={language}
          style={{
            width: '20px',
            height: '20px',
            marginRight: language === 'it' ? '6px' : '5px',
            verticalAlign: 'middle',
          }}
        />
        <span style={{ verticalAlign: 'middle' }}>
          {language.toUpperCase()}
        </span>
      </button>
      {isOpen && (
        <div
          style={{
            width: '80%',
            height: '1px',
            margin: 'auto',
            border: 'none',
            borderBottom: '1px solid #E8EBF1',
            position: 'absolute',
            bottom: '0',
            left: '50%',
            transform: 'translateX(-50%)',
          }}
        />
      )}

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            width: '100%',
            backgroundColor: 'white',
            zIndex: 1000,
          }}
          role="menu"
          aria-label={t('languageMenuLabel')}
        >
          <ul
            className="language-list"
            style={{
              padding: 0,
              listStyle: 'none',
              margin: 0,
              position: 'absolute',
              width: '100%',
            }}
          >
            {availableLanguages.map((lng, index) => (
              <li
                key={lng}
                style={{
                  margin: 0,
                  padding: 0,
                }}
              >
                <button
                  ref={el => {
                    languageButtonsRef.current[index] = el;
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: lng === 'en' ? 'space-between' : undefined,
                    padding: '6px',
                    height: '28px',
                    width: '100%',
                    cursor: 'pointer',
                    border: '1px solid #E8EBF1',
                    borderTop: 'none',
                    backgroundColor: 'white',
                    font: 'inherit',
                    textAlign: 'left',
                  }}
                  onClick={() => handleChangeLanguage(lng)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleChangeLanguage(lng);
                    }
                  }}
                  role="menuitem"
                  aria-label={t('changeLanguageTo', {
                    language: getLanguageName(lng),
                  })}
                >
                  <img
                    src={lng === 'it' ? ita : eng}
                    alt={lng}
                    style={{
                      width: '20px',
                      height: '20px',
                      marginRight: '5px',
                      verticalAlign: 'middle',
                    }}
                  />
                  <span style={{ verticalAlign: 'middle' }}>
                    {lng.toUpperCase()}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
