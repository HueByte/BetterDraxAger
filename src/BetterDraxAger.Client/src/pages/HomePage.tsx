import { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { BirthdayButton } from "../components/BirthdayButton";
import { ClickCounter } from "../components/ClickCounter";
import { Leaderboard } from "../components/Leaderboard";
import { ClickEffect, makeEffect } from "../components/ClickEffect";
import type { ClickEffectItem } from "../components/ClickEffect";
import { useSignalR } from "../hooks/useSignalR";
import { useLeaderboard } from "../hooks/useLeaderboard";
import { useAuth } from "../context/AuthContext";
import { click, getTotal } from "../api/age";
import styles from "./HomePage.module.css";

const AVATAR_URL =
	"https://cdn.discordapp.com/avatars/246249703044284426/277f651ba36185a75dd349ad97c5dd44.webp?size=256";

export function HomePage() {
	const [total, setTotal] = useState(0);
	const [yourTotal, setYourTotal] = useState<number | null>(null);
	const [rateLimited, setRateLimited] = useState(false);
	const [effects, setEffects] = useState<ClickEffectItem[]>([]);
	const effectIdRef = useRef(0);
	const { isAuthenticated } = useAuth();
	const { entries, setEntries } = useLeaderboard();

	useEffect(() => {
		getTotal().then((res) => setTotal(res.data.total));
	}, []);

	useSignalR(
		useCallback((newTotal: number) => setTotal(newTotal), []),
		useCallback((newEntries) => setEntries(newEntries), [setEntries])
	);

	const handleClick = () => {
		const count = 12 + Math.floor(Math.random() * 10);
		const newEffects = Array.from({ length: count }, () =>
			makeEffect(effectIdRef.current++),
		);
		setEffects((prev) => [...prev, ...newEffects]);

		click()
			.then(() => {
				setYourTotal((prev) => (prev ?? 0) + 1);
			})
			.catch((err) => {
				if (err?.response?.status === 429) {
					setRateLimited(true);
					setTimeout(() => setRateLimited(false), 2000);
				}
			});
	};

	const removeEffect = useCallback((id: number) => {
		setEffects((prev) => prev.filter((e) => e.id !== id));
	}, []);

	return (
		<>
			<ClickEffect effects={effects} onDone={removeEffect} />
			<main className={styles.page}>
				<div className={styles.center}>
					<img src={AVATAR_URL} alt="Drax" className={styles.avatar} />
					<h1 className={styles.title}>Happy Birthday Draxi!</h1>
					<ClickCounter total={total} />
					{isAuthenticated ? (
						<>
							{yourTotal !== null && (
								<p className={styles.yourTotal}>
									You've aged him <strong>{yourTotal.toLocaleString()}</strong>{" "}
									{yourTotal === 1 ? "time" : "times"}
								</p>
							)}
							{rateLimited && (
								<p className={styles.rateLimited}>🖐️ CHILL BRO. DRAX CAN ONLY AGE SO FAST.</p>
							)}
							<BirthdayButton onClick={handleClick} />
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
	);
}
