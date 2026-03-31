import { useState, useEffect, useCallback, useRef } from 'react'
import { Link } from 'react-router-dom'
import { BirthdayButton } from '../components/BirthdayButton'
import { ClickCounter } from '../components/ClickCounter'
import { Leaderboard } from '../components/Leaderboard'
import { ClickEffect, makeEffect } from '../components/ClickEffect'
import type { ClickEffectItem } from '../components/ClickEffect'
import { useSignalR } from '../hooks/useSignalR'
import { useLeaderboard } from '../hooks/useLeaderboard'
import { useAuth } from '../context/AuthContext'
import { click, getTotal } from '../api/age'
import styles from './HomePage.module.css'

const AVATAR_URL = 'https://avatar-cyan.vercel.app/api/pfp/246249703044284426/bigimage'
const AVATAR_FALLBACK = 'https://cdn.discordapp.com/avatars/246249703044284426/277f651ba36185a75dd349ad97c5dd44.webp?size=1024'

export function HomePage() {
  const [total, setTotal] = useState(0)
  const [isClicking, setIsClicking] = useState(false)
  const [yourTotal, setYourTotal] = useState<number | null>(null)
  const [effects, setEffects] = useState<ClickEffectItem[]>([])
  const effectIdRef = useRef(0)
  const { isAuthenticated } = useAuth()
  const { entries, refresh } = useLeaderboard(10)

  useEffect(() => {
    getTotal().then((res) => setTotal(res.data.total))
  }, [])

  useSignalR(useCallback((newTotal: number) => setTotal(newTotal), []))

  const handleClick = async () => {
    setIsClicking(true)

    const count = 6 + Math.floor(Math.random() * 6)
    const newEffects = Array.from({ length: count }, () => makeEffect(effectIdRef.current++))
    setEffects((prev) => [...prev, ...newEffects])

    try {
      const res = await click()
      setYourTotal(res.data.yourTotal)
      refresh()
    } finally {
      setIsClicking(false)
    }
  }

  const removeEffect = useCallback((id: number) => {
    setEffects((prev) => prev.filter((e) => e.id !== id))
  }, [])

  return (
    <>
      <ClickEffect effects={effects} onDone={removeEffect} />
      <main className={styles.page}>
        <div className={styles.center}>
          <img
            src={AVATAR_URL}
            alt="Drax"
            className={styles.avatar}
            onError={(e) => { (e.currentTarget as HTMLImageElement).src = AVATAR_FALLBACK }}
          />
          <h1 className={styles.title}>Happy Birthday, Drax!</h1>
          <ClickCounter total={total} />
          {isAuthenticated ? (
            <>
              {yourTotal !== null && (
                <p className={styles.yourTotal}>
                  You've aged him <strong>{yourTotal.toLocaleString()}</strong> {yourTotal === 1 ? 'time' : 'times'}
                </p>
              )}
              <BirthdayButton onClick={handleClick} disabled={isClicking} />
            </>
          ) : (
            <Link to="/login" className={styles.loginPrompt}>
              Login to age Drax
            </Link>
          )}
          <div className={styles.leaderboard}>
            <Leaderboard entries={entries} />
          </div>
        </div>
      </main>
    </>
  )
}
