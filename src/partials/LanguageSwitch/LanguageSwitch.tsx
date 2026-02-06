import { useI18next, useTranslation } from 'gatsby-plugin-react-i18next';
import React, { useState, useRef, useEffect, KeyboardEvent } from 'react';
import ita from '../../images/ita.svg';
import eng from '../../images/eng.svg';
import { navigate } from 'gatsby';

export const LanguageSwitch = () => {
  const { languages, changeLanguage, language } = useI18next();
  const { t } = useTranslation();

  const [isOpen, setIsOpen] = useState(false);
  const [liveText, setLiveText] = useState('');

  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  // Array of refs to manage focus on each individual menu option
  const itemsRef = useRef<(HTMLButtonElement | null)[]>([]);

  const getLanguageName = (lang: string) => {
    return lang === 'it' ? 'Italiano' : 'English';
  };

  const handleChangeLanguage = async (selectedLanguage: string) => {
    // If clicking the currently active language, just close the menu and do nothing
    if (selectedLanguage === language) {
      setIsOpen(false);
      return;
    }

    const langName = getLanguageName(selectedLanguage);
    setLiveText(t('languageChangedFeedback', { language: langName }));
    setIsOpen(false);
    await changeLanguage(selectedLanguage);

    navigate(
      `/${selectedLanguage}${selectedLanguage === 'it' ? '/' : '/homepage/'}`
    );
  };

  const toggleMenu = () => {
    setIsOpen(prev => !prev);
  };

  // --- FOCUS MANAGEMENT ---
  useEffect(() => {
    // Reset refs when the number of languages or open state changes
    itemsRef.current = itemsRef.current.slice(0, languages.length);

    if (isOpen) {
      // When the menu opens, move focus to the FIRST menu item
      // setTimeout ensures the DOM is rendered before focusing
      const timer = setTimeout(() => {
        const firstItem = itemsRef.current[0];
        if (firstItem) firstItem.focus();
      }, 50);
      return () => clearTimeout(timer);
    } else {
      // When closing, return focus to the main trigger button (if focus was inside the menu)
      if (menuRef.current?.contains(document.activeElement)) {
        triggerRef.current?.focus();
      }
    }
  }, [isOpen, languages.length]);

  // --- KEYBOARD NAVIGATION ---

  // 1. On the main button (Trigger)
  const handleTriggerKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
      e.preventDefault(); // Prevent page scroll
      setIsOpen(true);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
    }
  };

  // 2. On menu options
  const handleMenuKeyDown = (e: KeyboardEvent, index: number) => {
    switch (e.key) {
      case 'ArrowDown': {
        e.preventDefault();
        // Move focus to next element (cyclic)
        const nextIndex = (index + 1) % languages.length;
        itemsRef.current[nextIndex]?.focus();
        break;
      }
      case 'ArrowUp': {
        e.preventDefault();
        // Move focus to previous element (cyclic)
        const prevIndex = (index - 1 + languages.length) % languages.length;
        itemsRef.current[prevIndex]?.focus();
        break;
      }
      case 'Home': {
        e.preventDefault();
        itemsRef.current[0]?.focus();
        break;
      }
      case 'End': {
        e.preventDefault();
        itemsRef.current[languages.length - 1]?.focus();
        break;
      }
      case 'Escape': {
        e.preventDefault();
        setIsOpen(false);
        // Focus will return to the trigger thanks to the useEffect
        break;
      }
      case 'Tab': {
        // Standard behavior: close menu and let focus move to the next page element
        setIsOpen(false);
        break;
      }
      default:
        break;
    }
  };

  const handleBlur = (e: React.FocusEvent) => {
    if (!menuRef.current?.contains(e.relatedTarget as Node)) {
      setIsOpen(false);
    }
  };

  const currentLanguageName = getLanguageName(language);
  const currentLanguageCode = language.toUpperCase();

  return (
    <div
      ref={menuRef}
      className="language-switch"
      onBlur={handleBlur}
      style={{ position: 'relative' }}
    >
      <div
        aria-live="polite"
        style={{
          position: 'absolute',
          width: '1px',
          height: '1px',
          padding: 0,
          margin: '-1px',
          overflow: 'hidden',
          clip: 'rect(0, 0, 0, 0)',
          whiteSpace: 'nowrap',
          border: 0,
        }}
      >
        {liveText}
      </div>

      <button
        ref={triggerRef}
        className="current-language"
        onClick={toggleMenu}
        onKeyDown={handleTriggerKeyDown}
        aria-haspopup="true"
        aria-expanded={isOpen}
        aria-controls="language-menu-list"
        aria-label={`${t('languageSwitchLabel')}. ${t('currentLanguage', {
          language: `${currentLanguageCode} - ${currentLanguageName}`,
        })}`}
        style={{
          display: 'flex',
          alignItems: 'center',
          border: '1px solid $c-gray-border',
          borderBottom: '1px solid $c-gray-border',
          padding: '6px',
          height: '28px',
          width: '60px',
          justifyContent: language === 'en' ? 'space-between' : undefined,
          cursor: 'pointer',
        }}
      >
        <img
          src={language === 'it' ? ita : eng}
          alt=""
          style={{
            width: '20px',
            height: '20px',
            marginRight: language === 'it' ? '6px' : '5px',
            verticalAlign: 'middle',
          }}
        />
        <span style={{ verticalAlign: 'middle' }}>{currentLanguageCode}</span>
      </button>

      {isOpen && (
        <>
          <div
            id="language-menu-list"
            role="menu"
            style={{
              position: 'absolute',
              width: '100%',
              backgroundColor: 'white',
              zIndex: 1000,
              boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
            }}
          >
            <ul
              style={{
                padding: 0,
                listStyle: 'none',
                margin: 0,
                width: '100%',
              }}
            >
              {languages.map((lng, index) => {
                const lngName = getLanguageName(lng);
                const lngCode = lng.toUpperCase();
                const isCurrent = lng === language;

                return (
                  <li key={lng} role="none" style={{ margin: 0, padding: 0 }}>
                    <button
                      ref={el => (itemsRef.current[index] = el)}
                      role="menuitem"
                      lang={lng}
                      aria-current={isCurrent ? 'true' : undefined}
                      onClick={() => handleChangeLanguage(lng)}
                      onKeyDown={e => handleMenuKeyDown(e, index)}
                      aria-label={`${
                        lngCode === 'IT'
                          ? 'Cambia lingua in:'
                          : 'Change language to:'
                      } ${lngCode} - ${lngName}`}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent:
                          lng === 'en' ? 'space-between' : undefined,
                        padding: '6px',
                        height: '28px',
                        width: '100%',
                        cursor: 'pointer',
                        border: '1px solid $c-gray-border',
                        borderTop: 'none',
                        backgroundColor: isCurrent ? '#dfe3eb' : 'white',
                        font: 'inherit',
                        textAlign: 'left',
                        fontWeight: isCurrent ? 'bold' : 'normal',
                      }}
                    >
                      <img
                        src={lng === 'it' ? ita : eng}
                        alt=""
                        style={{
                          width: '20px',
                          height: '20px',
                          marginRight: '5px',
                          verticalAlign: 'middle',
                        }}
                      />
                      <span style={{ verticalAlign: 'middle' }}>{lngCode}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </>
      )}
    </div>
  );
};
