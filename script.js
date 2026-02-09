document.addEventListener('DOMContentLoaded', () => {
    // Elements
    const btnJa = document.getElementById('btn-ja');
    const btnNein = document.getElementById('btn-nein');
    const neinReaction = document.getElementById('nein-reaction');
    const page1 = document.getElementById('page-1');
    const page2 = document.getElementById('page-2');
    const musicPlayer = document.getElementById('music-player');

    // Fun "Nein" reactions
    const neinTexts = [
        "Wirklich nicht? 🥺",
        "Bist du sicher? 😢",
        "Denk nochmal nach! 🙏",
        "Der Button ist kaputt 😉",
        "Okay, jetzt reicht's aber mit den Witzen! 😠",
        "Klick doch einfach auf Ja! ❤️"
    ];

    // "Nein" Button Interaction - Run Away!
    let movedToBody = false;
    let lastMoveTime = 0;
    const cooldown = 150; // reduced cooldown for better responsiveness

    const moveButton = (e) => {
        // Cooldown check - prevent rapid triggering
        const now = Date.now();
        if (now - lastMoveTime < cooldown) return;
        lastMoveTime = now;

        // First time: move button to body so it's not clipped by .page overflow:hidden
        if (!movedToBody) {
            document.body.appendChild(btnNein);
            movedToBody = true;
        }

        // Button and viewport dimensions
        const btnWidth = btnNein.offsetWidth;
        const btnHeight = btnNein.offsetHeight;
        const vw = window.innerWidth;
        const vh = window.innerHeight;

        // Get mouse position (if available from event)
        let mouseX = vw / 2;
        let mouseY = vh / 2;
        if (e && e.clientX !== undefined) {
            mouseX = e.clientX;
            mouseY = e.clientY;
        }

        // Current button center
        const btnRect = btnNein.getBoundingClientRect();
        const btnCenterX = btnRect.left + btnWidth / 2;
        const btnCenterY = btnRect.top + btnHeight / 2;

        // Calculate direction AWAY from mouse
        let dx = btnCenterX - mouseX;
        let dy = btnCenterY - mouseY;

        // Normalize
        let distance = Math.sqrt(dx * dx + dy * dy);

        // FOOLPROOF FIX for center touch / zero distance
        // If distance is small, or 0, pick a random angle to fly away
        if (distance < 20) {
            const angle = Math.random() * Math.PI * 2; // Random angle 0-360 deg
            dx = Math.cos(angle);
            dy = Math.sin(angle);
            distance = 1; // Normalized immediately
        } else {
            // Normal case: normalize
            dx = dx / distance;
            dy = dy / distance;
        }

        // Apply jump distance
        const jumpDistance = 200;
        dx *= jumpDistance;
        dy *= jumpDistance;

        // Calculate new position
        let newX = btnCenterX + dx - btnWidth / 2;
        let newY = btnCenterY + dy - btnHeight / 2;

        // Clamp to viewport with padding
        const pad = 40;
        const clampedX = Math.max(pad, Math.min(newX, vw - btnWidth - pad));
        const clampedY = Math.max(pad, Math.min(newY, vh - btnHeight - pad));

        // Check if button is cornered (position was clamped significantly)
        const wasCornered = (clampedX !== newX || clampedY !== newY);

        if (wasCornered) {
            // Randomly jump to a safe central area (not just dead center)
            // Area: middle 50% of screen
            const safeW = vw * 0.5;
            const safeH = vh * 0.5;
            const safeX = (vw - safeW) / 2;
            const safeY = (vh - safeH) / 2;

            newX = safeX + Math.random() * (safeW - btnWidth);
            newY = safeY + Math.random() * (safeH - btnHeight);
        } else {
            newX = clampedX;
            newY = clampedY;
        }

        // Apply styles
        btnNein.style.position = 'fixed';
        btnNein.style.zIndex = '9999';
        btnNein.style.left = `${newX}px`;
        btnNein.style.top = `${newY}px`;
    };

    // Desktop: Run away on hover (pass event for mouse position)
    btnNein.addEventListener('mouseenter', moveButton);

    // Mobile/Touch: Run away on touch
    btnNein.addEventListener('touchstart', (e) => {
        e.preventDefault();
        moveButton(e.touches[0]); // Pass touch position
    });

    // Fallback click
    btnNein.addEventListener('click', (e) => {
        e.preventDefault();
        moveButton(e);
    });

    // "Ja" Button Interaction (Page Transition + Music)
    btnJa.addEventListener('click', () => {
        // Start music immediately (user interaction allows this)
        musicPlayer.play().catch(e => console.log("Audio play failed:", e));

        // Hide the Nein button (it's now in body, so hide it)
        btnNein.style.display = 'none';

        // Fade out Page 1
        page1.style.opacity = '0';
        page1.style.transform = 'translateY(-20px)';

        // Wait for transition to finish, then switch visibility
        setTimeout(() => {
            page1.classList.remove('active');
            page1.classList.add('hidden');

            page2.classList.remove('hidden');
            // Force reflow
            void page2.offsetWidth;

            page2.classList.add('active');
        }, 500); // Matches CSS transition speed
    });
});
