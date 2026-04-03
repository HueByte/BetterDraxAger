import { useEffect, useRef, useState } from "react";

export function useAnimatedCount(target: number, duration = 500) {
	const [display, setDisplay] = useState(target);
	const prevRef = useRef(target);
	const rafRef = useRef<number>(0);

	useEffect(() => {
		const from = prevRef.current;
		const diff = target - from;
		prevRef.current = target;

		if (diff === 0) return;

		const start = performance.now();

		function tick(now: number) {
			const elapsed = now - start;
			const progress = Math.min(elapsed / duration, 1);
			const eased = 1 - Math.pow(1 - progress, 3);
			setDisplay(Math.round(from + diff * eased));

			if (progress < 1) {
				rafRef.current = requestAnimationFrame(tick);
			}
		}

		rafRef.current = requestAnimationFrame(tick);

		return () => {
			if (rafRef.current) cancelAnimationFrame(rafRef.current);
		};
	}, [target, duration]);

	return display;
}
