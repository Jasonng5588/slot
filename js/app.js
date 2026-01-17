// LuckyDragon - Main App
const App = {
    init() {
        console.log('🐉 LuckyDragon Casino Initialized');

        // Create particles if container exists
        const particles = document.getElementById('particles');
        if (particles) {
            for (let i = 0; i < 25; i++) {
                const p = document.createElement('div');
                p.className = 'particle';
                p.style.left = Math.random() * 100 + '%';
                p.style.animationDelay = Math.random() * 8 + 's';
                p.style.animationDuration = (5 + Math.random() * 5) + 's';
                particles.appendChild(p);
            }
        }
    }
};

document.addEventListener('DOMContentLoaded', () => App.init());
