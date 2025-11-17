/**
 * AuthPage - Pagina di autenticazione (Login/Register)
 * 
 * Layout split:
 * - Sinistra (40%): Logo e sfondo decorativo
 * - Destra (60%): Form di login/registrazione
 * 
 * Features:
 * - Toggle tra modalità Login e Register
 * - Validazione input
 * - Gestione errori
 * - Redirect automatico dopo login
 */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import nbpencil from '../assets/login/nb-pencil.png';
import checkbox1 from '../assets/login/checkbox-checked.png';
import checkbox2 from '../assets/login/checkbox-unchecked.png';


const AuthPage = () => {
  const navigate = useNavigate();
  const { login, register } = useAuth();

  useEffect(() => {
    document.body.classList.add('login-active');
    return () => {
      document.body.classList.remove('login-active');
    };
  }, []);

  // Stati del form
  const [isLogin, setIsLogin] = useState(true); // true = Login, false = Register
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  /**
   * Valida la complessità della password secondo criteri di sicurezza
   * Requisiti: min 8 char, maiuscola, minuscola, numero, simbolo
   */
  const validatePasswordStrength = (pwd) => {
    if (pwd.length < 8) {
      return 'La password deve contenere almeno 8 caratteri';
    }
    if (!/[A-Z]/.test(pwd)) {
      return 'La password deve contenere almeno una lettera maiuscola';
    }
    if (!/[a-z]/.test(pwd)) {
      return 'La password deve contenere almeno una lettera minuscola';
    }
    if (!/\d/.test(pwd)) {
      return 'La password deve contenere almeno un numero';
    }
    if (!/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(pwd)) {
      return 'La password deve contenere almeno un carattere speciale (!@#$%^&*()_+-=[]{}|;:,.<>?)';
    }
    return null;
  };

  /**
   * Gestisce il submit del form (login o register)
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validazione base
    if (!username.trim() || !password.trim()) {
      setError('Compila tutti i campi');
      return;
    }

    // Se è registrazione, valida password strength
    if (!isLogin) {
      const pwdError = validatePasswordStrength(password);
      if (pwdError) {
        setPasswordError(pwdError);
        setError(pwdError);
        return;
      }
      
      // Verifica che le password coincidano
      if (password !== confirmPassword) {
        setError('Le password non coincidono');
        return;
      }
    }

    setLoading(true);

    try {
      if (isLogin) {
        // Esegui login
        await login(username, password);
      } else {
        // Esegui registrazione (che fa automaticamente login)
        await register(username, password);
      }

      // Redirect alla dashboard dopo login/register
      navigate('/dashboard');
    } catch (err) {
      // Mostra errore (es: credenziali errate, username già esistente)
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Cambia modalità tra Login e Register
   */
  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Sezione sinistra illustrata */}
      <div className="relative flex-1 flex items-center justify-center p-8 lg:p-16 overflow-hidden">
        <div className="absolute inset-0 bg-login-bg" />
        <div className="relative z-10 flex flex-col items-center text-login-text gap-6">
          <div className="relative w-64 h-64 lg:w-80 lg:h-80">
            <img
              src={nbpencil}
              alt="Notebook and pencil illustration"
              className="w-full h-full object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.35)]"
            />
            <img
              src={checkbox1}
              alt="Checked box"
              className="absolute -left-6 top-10 w-16 rotate-[-8deg]"
            />
            <img
              src={checkbox2}
              alt="Unchecked box"
              className="absolute -right-6 bottom-6 w-16 rotate-[12deg]"
            />
          </div>

          <div className="text-center space-y-2">
            <h1 className="text-4xl lg:text-5xl font-semibold tracking-wide drop-shadow-md">
              My Planner
            </h1>
            <p className="text-login-text/80 max-w-sm text-base lg:text-lg">
            Pianifica, visualizza, gestisci — la tua produttività in un solo sguardo.
            </p>
          </div>
        </div>
        <div className="absolute inset-y-12 right-0 w-1/2 bg-login-card-light/40 blur-3xl" aria-hidden />
      </div>

      {/* Sezione destra - card form */}
      <div className="flex-1 flex items-center justify-center py-16 px-6 lg:px-20 bg-login-bg lg:bg-transparent relative">
        <div className="absolute inset-0 lg:left-auto lg:w-4/6 bg-login-card/30 blur-3xl" aria-hidden />
        <div className="relative z-10 w-full max-w-md bg-login-card/95 rounded-2xl shadow-login-card px-8 py-10 border border-white/10">
          <div className="text-center mb-8 space-y-2">
            <p className="text-login-text/70 text-sm uppercase tracking-[0.3em]">
              {isLogin ? 'Bentornato' : 'Benvenuto'}
            </p>
            <h2 className="text-3xl font-semibold text-login-text">
              {isLogin ? 'Accedi al tuo spazio' : 'Crea il tuo account'}
            </h2>
            <p className="text-login-text/70 text-sm">
              {isLogin
                ? 'Inserisci le tue credenziali per accedere'
                : 'Registrati per iniziare a pianificare'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="username" className="text-sm font-medium text-login-text/90">
                Nome utente
              </label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="input-field"
                placeholder="il_tuo_username"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-login-text/90">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (!isLogin) {
                    const pwdError = validatePasswordStrength(e.target.value);
                    setPasswordError(pwdError || '');
                  } else {
                    setPasswordError('');
                  }
                }}
                className="input-field"
                placeholder="••••••••"
                required
              />
              {!isLogin && passwordError && (
                <p className="text-sm text-red-300 mt-1">{passwordError}</p>
              )}
              {!isLogin && !passwordError && password && (
                <p className="text-sm text-green-300 mt-1">Password valida</p>
              )}
            </div>

            {!isLogin && (
              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="text-sm font-medium text-login-text/90">
                  Conferma Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="input-field"
                  placeholder="••••••••"
                  required
                />
              </div>
            )}

            {error && (
              <div className="bg-white/10 border border-red-200/60 text-white px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary text-base disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? 'Attendere...' : isLogin ? 'Accedi' : 'Registrati'}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-login-text/80 text-sm">
              {isLogin ? 'Sei nuovo su My Planner?' : 'Hai già un account?'}{' '}
              <button
                type="button"
                onClick={toggleMode}
                className="text-white font-semibold underline-offset-4 hover:underline"
              >
                {isLogin ? 'Registrati' : 'Accedi'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;

