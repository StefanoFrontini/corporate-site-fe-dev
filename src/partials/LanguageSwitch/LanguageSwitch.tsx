import { useI18next, useTranslation } from 'gatsby-plugin-react-i18next';
import React, {
  useState,
  useRef,
  useEffect,
  KeyboardEvent,
  useId,
} from 'react';
import ita from '../../images/ita.svg';
import eng from '../../images/eng.svg';

export const LanguageSwitch = () => {
  const { languages, changeLanguage, language } = useI18next();
  const { t } = useTranslation();
  const uniqueId = useId();
  const menuId = `language-menu-${uniqueId}`;

  const [isOpen, setIsOpen] = useState(false);
  const [liveText, setLiveText] = useState('');

  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const itemsRef = useRef<(HTMLButtonElement | null)[]>([]);

  const getLanguageName = (lang: string) => {
    return lang === 'it' ? 'Italiano' : 'English';
  };

  const handleChangeLanguage = async (selectedLanguage: string) => {
    const langName = getLanguageName(selectedLanguage);
    const langCode = selectedLanguage.toUpperCase();

    if (selectedLanguage === language) {
      const activeFeedbackMsg =
        selectedLanguage === 'it'
          ? `Lingua impostata: ${langCode} - ${langName}`
          : `Language set: ${langCode} - ${langName}`;

      setLiveText(activeFeedbackMsg);
      setIsOpen(false);
      setTimeout(() => triggerRef.current?.focus(), 0);
      return;
    }

    setLiveText(t('languageChangedFeedback', { language: langName }));
    setIsOpen(false);
    const targetPath = selectedLanguage === 'it' ? '/' : '/en/homepage/';
    await changeLanguage(selectedLanguage, targetPath);
  };

  const toggleMenu = () => {
    setIsOpen(prev => !prev);
  };

  const findNextFocusableInMobileMenu = (
    currentElement: HTMLElement | null
  ): HTMLElement | null => {
    if (!currentElement) return null;

    const mobileMenu = currentElement.closest(
      '.header__mobile-menu, .menu-header'
    );
    if (!mobileMenu) return null;

    const focusableElements = mobileMenu.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    if (focusableElements.length === 0) return null;

    const currentIndex = Array.from(focusableElements).indexOf(currentElement);

    if (currentIndex === -1) {
      return focusableElements[0] as HTMLElement;
    }

    if (currentIndex === focusableElements.length - 1) {
      return focusableElements[0] as HTMLElement;
    }

    return focusableElements[currentIndex + 1] as HTMLElement;
  };

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        const firstItem = itemsRef.current[0];
        if (firstItem) firstItem.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (
        isOpen &&
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen]);

  const handleTriggerKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setIsOpen(true);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
    } else if (e.key === 'Tab' && isOpen) {
      e.preventDefault();
      if (e.shiftKey) {
        itemsRef.current[languages.length - 1]?.focus();
      } else {
        itemsRef.current[0]?.focus();
      }
    }
  };

  const handleMenuKeyDown = (e: KeyboardEvent, index: number) => {
    switch (e.key) {
      case 'ArrowDown': {
        e.preventDefault();
        const nextIndex = (index + 1) % languages.length;
        itemsRef.current[nextIndex]?.focus();
        break;
      }
      case 'ArrowUp': {
        e.preventDefault();
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
        e.stopPropagation();
        setIsOpen(false);
        setTimeout(() => {
          triggerRef.current?.focus();
        }, 0);
        break;
      }
      case 'Tab': {
        if (e.shiftKey) {
          if (index === 0) {
            e.preventDefault();
            setIsOpen(false);
            setTimeout(() => {
              triggerRef.current?.focus();
            }, 0);
          } else {
            e.preventDefault();
            const prevIndex = index - 1;
            itemsRef.current[prevIndex]?.focus();
          }
        } else {
          if (index === languages.length - 1) {
            e.preventDefault();
            setIsOpen(false);

            setTimeout(() => {
              const nextElement = findNextFocusableInMobileMenu(
                triggerRef.current
              );
              if (nextElement) {
                nextElement.focus();
              } else {
                triggerRef.current?.focus();
              }
            }, 0);
          } else {
            e.preventDefault();
            const nextIndex = index + 1;
            itemsRef.current[nextIndex]?.focus();
          }
        }
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
    <div ref={menuRef} onBlur={handleBlur} style={{ position: 'relative' }}>
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
        aria-controls={menuId}
        aria-label={`${t('languageSwitchLabel')}. ${t('currentLanguage', {
          language: `${currentLanguageCode} - ${currentLanguageName}`,
        })}`}
        style={{
          display: 'flex',
          alignItems: 'center',
          border: '1px solid #7C8395',
          borderBottom: '1px solid #7C8395',
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

      <div
        hidden={!isOpen}
        style={{
          position: 'absolute',
          width: '100%',
          backgroundColor: 'white',
          zIndex: 1000,
          boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
          display: isOpen ? 'block' : 'none',
        }}
      >
        <ul
          id={menuId}
          role="menu"
          style={{
            padding: 0,
            listStyle: 'none',
            margin: 0,
            width: '60px',
            display: 'flex',
            flexDirection: 'column',
            gap: '0px',
          }}
        >
          {languages.map((lng, index) => {
            const lngName = getLanguageName(lng);
            const lngCode = lng.toUpperCase();
            const isCurrent = lng === language;

            const ariaLabelText = isCurrent
              ? `${lngCode} - ${lngName}`
              : `${
                  lngCode === 'IT' ? 'Cambia lingua in:' : 'Change language to:'
                } ${lngCode} - ${lngName}`;

            return (
              <li key={lng} role="none" style={{ margin: 0, padding: 0 }}>
                <button
                  ref={el => (itemsRef.current[index] = el)}
                  role="menuitem"
                  tabIndex={-1}
                  lang={lng}
                  aria-current={isCurrent ? 'true' : undefined}
                  onClick={() => handleChangeLanguage(lng)}
                  onKeyDown={e => handleMenuKeyDown(e, index)}
                  aria-label={ariaLabelText}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: lng === 'en' ? 'space-between' : undefined,
                    padding: '6px',
                    height: '28px',
                    width: '100%',
                    cursor: 'pointer',
                    border: '1px solid #7C8395',
                    borderTop: 'none',
                    backgroundColor: isCurrent ? '#dfe3eb' : 'white',
                    font: 'inherit',
                    textAlign: 'left',
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
    </div>
  );
};
