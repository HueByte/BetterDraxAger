import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import styles from './NavBar.module.css'

export function NavBar() {
  const { isAuthenticated, username, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav className={styles.nav}>
      <Link to="/" className={styles.brand}>BetterDraxAger</Link>
      <div className={styles.actions}>
        {isAuthenticated ? (
          <>
            <span className={styles.username}>{username}</span>
            <button className={styles.btn} onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" className={styles.link}>Login</Link>
            <Link to="/register" className={styles.btnLink}>Register</Link>
          </>
        )}
      </div>
    </nav>
  )
}
