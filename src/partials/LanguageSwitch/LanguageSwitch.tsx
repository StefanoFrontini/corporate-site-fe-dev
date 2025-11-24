import { useI18next, useTranslation } from 'gatsby-plugin-react-i18next';
import React, { useState, useRef, FocusEventHandler } from 'react';
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
      case ' ':
      case 'ArrowDown':
      case 'Enter': {
        e.preventDefault();
        handleSubmenu();
        if (availableLanguages.length > 0) {
          setTimeout(() => {
            languageButtonsRef.current[0].focus();
          }, 0);
        }
        break;
      }
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        (menuRef.current.children[1] as HTMLElement).focus();
        break;
      default:
        return;
    }
  };

  const handleFocusOut: FocusEventHandler<HTMLDivElement> = e => {
    if (menuRef.current && !menuRef.current.contains(e.relatedTarget)) {
      setIsOpen(false);
    }
  };

  const currentLanguageName = getLanguageName(language);

  return (
    <div
      ref={menuRef}
      onBlur={handleFocusOut}
      className="language-switch"
      style={{
        position: 'relative',
      }}
      onKeyDown={handleKeyDown}
    >
      <div
        aria-live="polite"
        aria-atomic="true"
        style={{
          position: 'absolute',
          left: '-10000px',
          width: '1px',
          height: '1px',
          overflow: 'hidden',
        }}
      >
        {t('languageChangedFeedback', { language: currentLanguageName })}
      </div>
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
          language: currentLanguageName,
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
