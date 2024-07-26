import React, { useEffect } from 'react';
import styles from './Header.module.scss';
import { useAuth } from '../context/AppContext';

const Header: React.FC = () => {
  const { state, dispatch } = useAuth();

  const handleLogout = () => {
    dispatch({ type: 'LOGOUT' });
    localStorage.removeItem('authState');
  };

  useEffect(() => {
    const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
    dispatch({ type: 'LOGOUT', payload: loggedIn });
  }, []);

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <h1 className={styles.title}>My Application</h1>
        <nav className={styles.nav}>
          {state?.isLoggedIn ? (
            <div style={{ display: 'flex', gap: '20px' }}>
              <span className={styles.loggedIn}>
                {state.googleInfo?.profileObj?.name
                  ? `Welcome back! ${state.googleInfo.profileObj.name}`
                  : "Welcome back!"}
              </span>
              <button onClick={handleLogout} className={styles.logoutButton}>
                Logout
              </button>
            </div>
          ) : (
            <a href="/auth" className={styles.loginLink}>Login</a>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
