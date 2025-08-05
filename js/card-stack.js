/*  card-stack.js
 *  Swipe-to-cycle “card stack”
 *  • Card-stack section bị ẩn bằng class .is-hidden khi trang load
 *  • Main script (main.js) sẽ gỡ class đó sau 3 s → card-stack xuất hiện
 *  • File này tự khởi tạo khi section đã hiển thị (hoặc ngay lập tức nếu không ẩn)
 *  ------------------------------------------------------------------------- */

(() => {
	/* ───────── Helper đọc biến CSS (trả về ms) ───────── */
	const cssDuration = (varName, el = document.documentElement) => {
		const v = getComputedStyle(el).getPropertyValue(varName).trim();
		if (!v) return 0;
		return v.endsWith('ms') ? parseFloat(v) :
		       v.endsWith('s')  ? parseFloat(v) * 1000 :
		       parseFloat(v)    || 0;
	};

	/* ───────── Khởi tạo swipe cho stack ───────── */
	function initCardStack(stack) {
		if (stack.dataset.cardStackInit) return;             // tránh khởi tạo 2 lần
		stack.dataset.cardStackInit = 'true';

		let cards       = [...stack.querySelectorAll('.card')];
		let isSwiping   = false;
		let startX      = 0;
		let currentX    = 0;
		let rafId       = null;

		const getActive = () => cards[0];

		const resetPositions = () => {
			cards.forEach((c, i) => {
				c.style.setProperty('--i', i + 1);
				c.style.setProperty('--swipe-x', '0px');
				c.style.setProperty('--swipe-rotate', '0deg');
				c.style.opacity = '1';
			});
		};

		const applySwipe = (dx) => {
			const card = getActive();
			if (!card) return;
			card.style.setProperty('--swipe-x', `${dx}px`);
			card.style.setProperty('--swipe-rotate', `${dx * 0.2}deg`);
			card.style.opacity = 1 - Math.min(Math.abs(dx) / 100, 1) * 0.75;
		};

		/* ───── pointer handlers ───── */
		const onStart = (clientX) => {
			if (isSwiping) return;
			isSwiping = true;
			startX = currentX = clientX;
			const card = getActive();
			card && (card.style.transition = 'none');
		};

		const onMove = (clientX) => {
			if (!isSwiping) return;
			cancelAnimationFrame(rafId);
			rafId = requestAnimationFrame(() => {
				currentX = clientX;
				const dx = currentX - startX;
				applySwipe(dx);
				if (Math.abs(dx) > 50) finishSwipe();        // auto-finish nếu kéo đủ xa
			});
		};

		const finishSwipe = () => {
			if (!isSwiping) return;
			cancelAnimationFrame(rafId);

			const dx       = currentX - startX;
			const card     = getActive();
			const dur      = cssDuration('--card-swap-duration', stack);
			const threshold = 50;

			if (card) {
				card.style.transition = `transform ${dur}ms ease, opacity ${dur}ms ease`;

				if (Math.abs(dx) > threshold) {
					const dir = Math.sign(dx);
					card.style.setProperty('--swipe-x', `${dir * 300}px`);
					card.style.setProperty('--swipe-rotate', `${dir * 20}deg`);

					/* flip nhỏ ở nửa thời gian */
					setTimeout(() => {
						card.style.setProperty('--swipe-rotate', `${-dir * 20}deg`);
					}, dur * 0.5);

					/* Sau khi bay khỏi màn: đổi thứ tự mảng → reset */
					setTimeout(() => {
						cards = [...cards.slice(1), card];
						resetPositions();
					}, dur);
				} else {
					applySwipe(0);   // trả về vị trí cũ
				}
			}
			isSwiping = false;
			startX = currentX = 0;
		};

		/* ───── Gán sự kiện ───── */
		stack.addEventListener('pointerdown',  e => onStart(e.clientX));
		stack.addEventListener('pointermove',  e => onMove(e.clientX));
		stack.addEventListener('pointerup',    finishSwipe);
		stack.addEventListener('pointercancel',finishSwipe);
		resetPositions();
	}

	/* ───────── Quan sát khi .card-stack hiện ra ───────── */
	document.addEventListener('DOMContentLoaded', () => {
		const stack = document.querySelector('.card-stack');
		if (!stack) return;

		if (!stack.classList.contains('is-hidden')) {
			initCardStack(stack);
		} else {
			/* Theo dõi attribute “class” cho tới khi gỡ .is-hidden */
			const obs = new MutationObserver((mut) => {
				if (!stack.classList.contains('is-hidden')) {
					obs.disconnect();
					initCardStack(stack);
				}
			});
			obs.observe(stack, { attributes: true, attributeFilter: ['class'] });
		}
	});
})();