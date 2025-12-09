import React, { useRef, useState } from 'react';
import Reaptcha from 'reaptcha';

import './NewsletterBanner.sass';

const endpoint =
  'https://api.io.italia.it/api/payportal/v1/newsletters/io/lists/6/recipients';

type NewsletterGroup = {
  label: string;
  value: number;
  checked: boolean;
};

const initialNewsletterGroups: NewsletterGroup[] = [
  {
    label: 'Cittadini',
    value: 47,
    checked: true,
  },
  {
    label: 'Pubbliche Amministrazioni',
    value: 48,
    checked: false,
  },
  {
    label: 'Aziende e Professionisti',
    value: 49,
    checked: false,
  },
  {
    label: 'Università e Centri di Ricerca',
    value: 50,
    checked: false,
  },
  {
    label: 'Giornalisti',
    value: 51,
    checked: false,
  },
];

type CheckboxProps = {
  label: string;
  value: number;
  checked: boolean;
  onChange: (value: number, checked: boolean) => void;
};

const Checkbox = ({ label, value, checked, onChange }: CheckboxProps) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(value, e.target.checked);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLLabelElement>) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      onChange(value, !checked);
    }
  };

  return (
    <div className="checkbox">
      <input
        type="checkbox"
        value={value}
        id={`cb-inp-${value}`}
        className="newsletter-group"
        checked={checked}
        onChange={handleChange}
        tabIndex={-1}
      />
      <label htmlFor={`cb-inp-${value}`} tabIndex={0} onKeyDown={handleKeyDown}>
        {label}
      </label>
    </div>
  );
};

export const NewsletterBanner = () => {
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [groups, setGroups] = useState<NewsletterGroup[]>(
    initialNewsletterGroups
  );
  const [validity, setValidity] = useState(false);
  const [isEmailValid, setIsEmailValid] = useState(false);
  const [isAtLeastOneChecked, setIsAtLeastOneChecked] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [submitStatus, setSubmitStatus] = useState<
    'idle' | 'success' | 'error'
  >('idle');

  const reaptchaRef = useRef<Reaptcha>(null);

  const handleCheckboxChange = (value: number, checked: boolean) => {
    const newGroups = groups.map(group =>
      group.value === value ? { ...group, checked } : group
    );
    setGroups(newGroups);
    checkValidity(email, newGroups);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    checkValidity(newEmail, groups);
  };

  const checkValidity = (
    currentEmail: string,
    currentGroups: NewsletterGroup[]
  ) => {
    const emailValid =
      currentEmail.trim() !== '' && /\S+@\S+\.\S+/.test(currentEmail);
    const atLeastOneChecked = currentGroups.some(group => group.checked);
    const isValid = emailValid && atLeastOneChecked;

    setIsEmailValid(emailValid);
    setIsAtLeastOneChecked(atLeastOneChecked);
    setValidity(isValid);

    if (!isValid) {
      if (!emailValid && !atLeastOneChecked) {
        setValidationError(
          'Inserisci un indirizzo email valido e seleziona almeno un gruppo'
        );
      } else if (!emailValid) {
        setValidationError(
          'Inserisci un indirizzo email valido, ad esempio nome@dominio.it'
        );
      } else if (!atLeastOneChecked) {
        setValidationError('Seleziona almeno un gruppo');
      }
    } else {
      setValidationError(null);
    }
  };

  const reaptchaVerify = () => {
    reaptchaRef.current?.execute();
    setLoading(true);
  };

  const newsletterReset = () => {
    reaptchaRef.current?.reset();
    setLoading(false);
    setSubmitStatus('idle');
  };

  const newsletterSubmit = async (recaptchaResponse: string) => {
    const emailValue = email.trim();
    const groupsValue: string[] = groups
      .filter(group => group.checked)
      .map(group => group.value.toString());

    const data = {
      recaptchaToken: recaptchaResponse,
      email: emailValue,
      groups: groupsValue,
    };

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (response.status === 200) {
        setSubmitStatus('success');
      }
    } catch (e) {
      console.log(e);
      setSubmitStatus('error');
    } finally {
      newsletterReset();
    }
  };

  return (
    <>
      <div id="newsletter" className="newsletter-banner-anchor"></div>
      <section
        className={`block block-newsletter-banner newsletter-banner ${
          submitStatus === 'success' ? 'is-success' : ''
        } ${submitStatus === 'error' || validationError ? 'is-error' : ''}`}
      >
        <div className="container-fluid">
          <div className="row">
            <div className="col-12 col-lg-10 offset-lg-1">
              <h3>
                Vuoi ricevere la
                <br />
                nostra Newsletter?
              </h3>
            </div>
          </div>
          <div className="row">
            <div className="col-12 col-lg-10 offset-lg-1">
              <p className="mb-3" aria-hidden="true">
                Segui le notizie per*:
              </p>
            </div>
          </div>

          <form onSubmit={e => e.preventDefault()}>
            <div className="row">
              <div className="col-12 col-md-6 col-lg-5 offset-lg-1">
                <fieldset className="newsletter-banner__fieldset">
                  <legend className="newsletter-banner__legend">
                    Segui le notizie per*:
                  </legend>
                  <ul
                    className="newsletter-banner__options"
                    aria-describedby={
                      validationError && !isAtLeastOneChecked
                        ? 'newsletter-validation-error'
                        : undefined
                    }
                  >
                    {groups.map(({ label, value, checked }) => (
                      <li key={value}>
                        <Checkbox
                          label={label}
                          value={value}
                          checked={checked}
                          onChange={handleCheckboxChange}
                        />
                      </li>
                    ))}
                  </ul>
                  <p className="alternative small">
                    <em>
                      * campo obbligatorio, con possibilità di risposta multipla
                    </em>
                  </p>
                </fieldset>
              </div>
              <div className="col-12 col-md-6 col-lg-5">
                <input
                  type="email"
                  autoComplete="email"
                  placeholder="Inserisci la tua email"
                  className="input newsletter-email"
                  required
                  value={email}
                  onChange={handleEmailChange}
                  aria-describedby={
                    validationError ? 'newsletter-validation-error' : undefined
                  }
                  aria-invalid={
                    validationError && !isEmailValid ? 'true' : 'false'
                  }
                />
                <button
                  className={`cta cta--white newsletter-submit${
                    loading ? ' is-loading' : ''
                  }`}
                  onClick={reaptchaVerify}
                  disabled={!validity}
                  aria-describedby={
                    submitStatus === 'error'
                      ? 'newsletter-submit-error'
                      : undefined
                  }
                >
                  <span>Iscriviti</span>
                  <span className="loader">
                    <span></span>
                    <span></span>
                    <span></span>
                    <span></span>
                  </span>
                </button>

                <Reaptcha
                  ref={reaptchaRef}
                  sitekey="6LcBa7AaAAAAAEb8kvsHtZ_09Ctd2l0XqceFUHTe"
                  size="invisible"
                  onVerify={newsletterSubmit}
                  onLoad={() => setLoading(false)}
                />
                <div>
                  {submitStatus === 'success' && (
                    <div
                      id="newsletter-success-message"
                      className="message success"
                      role="status"
                      aria-live="polite"
                      aria-atomic="true"
                    >
                      <span>
                        Richiesta inviata correttamente! A breve riceverai una
                        email per confermare la tua iscrizione.
                      </span>
                    </div>
                  )}
                  {validationError && (
                    <div
                      id="newsletter-validation-error"
                      className="message error"
                      role="alert"
                      aria-live="polite"
                    >
                      <span>{validationError}</span>
                    </div>
                  )}
                  {submitStatus === 'error' && (
                    <div
                      id="newsletter-submit-error"
                      className="message error"
                      role="alert"
                      aria-live="assertive"
                      aria-atomic="true"
                    >
                      <span>
                        Si è verificato un problema, si prega di riprovare più
                        tardi.
                      </span>
                    </div>
                  )}
                </div>

                <div className="mt-5 mt-md-4">
                  <p className="alternative small">
                    <em>
                      Inserendo il tuo indirizzo email stai accettando la{' '}
                      <a
                        href={'/it/privacy-policy/'}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        nostra informativa sul trattamento dei dati personali
                      </a>{' '}
                      per la newsletter.
                    </em>
                  </p>
                  <p className="alternative small">
                    <em>
                      Form protetto tramite reCAPTCHA e{' '}
                      <a
                        href="https://policies.google.com/privacy"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Google Privacy Policy
                      </a>{' '}
                      e{' '}
                      <a
                        href="https://policies.google.com/terms"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Termini di servizio
                      </a>{' '}
                      applicati.
                    </em>
                  </p>
                </div>
              </div>
            </div>
          </form>
        </div>
      </section>
    </>
  );
};
