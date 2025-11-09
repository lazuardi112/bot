document.addEventListener('DOMContentLoaded', () => {
    const reelsContainer = document.getElementById('reels-container');
    const spinButton = document.getElementById('spin-button');
    const balanceElement = document.getElementById('balance');

    const symbols = [
        'images/symbol_0.png',
        'images/symbol_1.png',
        'images/symbol_2.png',
        'images/symbol_3.png',
        'images/symbol_4.png',
        'images/symbol_5.png',
        'images/symbol_6.png',
        'images/symbol_7.png',
        'images/symbol_8.png',
        'images/symbol_9.png'
    ];

    const paylines = [
        [0, 0, 0, 0, 0], // Top row
        [1, 1, 1, 1, 1], // Middle row
        [2, 2, 2, 2, 2], // Bottom row
        [3, 3, 3, 3, 3], // Last row
        [0, 1, 2, 1, 0], // V shape
        [2, 1, 0, 1, 2]  // Inverse V shape
    ];

    const payouts = {
        'images/symbol_0.png': 10,
        'images/symbol_1.png': 20,
        'images/symbol_2.png': 30,
        'images/symbol_3.png': 40,
        'images/symbol_4.png': 50,
        'images/symbol_5.png': 60,
        'images/symbol_6.png': 70,
        'images/symbol_7.png': 250, // Jackpot symbol
        'images/symbol_8.png': 80,
        'images/symbol_9.png': 90
    };

    const reelCount = 5;
    const rowCount = 4;
    let balance = 1000;

    const reels = [];

    function createReels() {
        reelsContainer.innerHTML = '';
        for (let i = 0; i < reelCount; i++) {
            const reel = document.createElement('div');
            reel.classList.add('reel');
            const reelStrip = document.createElement('div');
            reelStrip.classList.add('reel-strip');

            for (let j = 0; j < symbols.length * 10; j++) { // Populate with more symbols for a better spin effect
                const symbol = document.createElement('div');
                symbol.classList.add('symbol');
                symbol.style.backgroundImage = `url(${symbols[Math.floor(Math.random() * symbols.length)]})`;
                reelStrip.appendChild(symbol);
            }
            reel.appendChild(reelStrip);
            reels.push(reelStrip);
            reelsContainer.appendChild(reel);
        }
    }

    function spin() {
        if (balance <= 0) {
            alert("Saldo Anda habis!");
            return;
        }
        balance -= 10;
        updateBalance();

        playSound('sounds/start_reel.mp3');

        let completedReels = 0;

        reels.forEach((reelStrip, index) => {
            const randomOffset = Math.floor(Math.random() * (symbols.length * 9));
            const targetPosition = -randomOffset * 100;
            reelStrip.style.transition = `transform ${2 + index * 0.5}s cubic-bezier(0.25, 0.1, 0.25, 1)`;
            reelStrip.style.transform = `translateY(${targetPosition}px)`;

            reelStrip.addEventListener('transitionend', () => {
                completedReels++;
                if (completedReels === reelCount) {
                    checkWin();
                }
            }, { once: true });
        });
    }

    function getSymbolAt(reelIndex, rowIndex) {
        const reelStrip = reels[reelIndex];
        const transform = window.getComputedStyle(reelStrip).transform;
        const matrix = new DOMMatrixReadOnly(transform);
        const translateY = matrix.m42;
        const symbolIndex = (Math.abs(Math.round(translateY / 100)) + rowIndex) % (symbols.length * 10);
        const children = Array.from(reelStrip.children);
        return children[symbolIndex].style.backgroundImage;
    }

    function checkWin() {
        let totalWin = 0;
        let winningPaylines = [];

        for (const payline of paylines) {
            const firstSymbolUrl = getSymbolAt(0, payline[0]);
            const firstSymbol = firstSymbolUrl.substring(firstSymbolUrl.lastIndexOf('/') + 1);

            let allSame = true;
            for (let i = 1; i < reelCount; i++) {
                const currentSymbolUrl = getSymbolAt(i, payline[i]);
                const currentSymbol = currentSymbolUrl.substring(currentSymbolUrl.lastIndexOf('/') + 1);
                if (currentSymbol !== firstSymbol) {
                    allSame = false;
                    break;
                }
            }

            if (allSame) {
                const payoutKey = `images/${firstSymbol}`;
                if (payouts[payoutKey]) {
                    totalWin += payouts[payoutKey];
                    winningPaylines.push(payline);
                }
            }
        }

        if (totalWin > 0) {
            balance += totalWin;
            updateBalance();

            if (totalWin >= 250) {
                playSound('sounds/bonus_soundtrack.mp3');
                reelsContainer.classList.add('jackpot-animation');
                setTimeout(() => reelsContainer.classList.remove('jackpot-animation'), 4000);
            } else if (totalWin >= 100) {
                playSound('sounds/freespin_soundtrack.mp3');
                reelsContainer.classList.add('big-win-animation');
                setTimeout(() => reelsContainer.classList.remove('big-win-animation'), 3000);
            } else {
                playSound('sounds/press_but.mp3');
                reelsContainer.classList.add('win-animation');
                setTimeout(() => reelsContainer.classList.remove('win-animation'), 2000);
            }
            highlightWinningPaylines(winningPaylines);
        } else {
            playSound('sounds/reel_stop.mp3');
            reelsContainer.classList.add('lose-animation');
            setTimeout(() => reelsContainer.classList.remove('lose-animation'), 1000);
        }
    }

    function highlightWinningPaylines(winningPaylines) {
        winningPaylines.forEach(payline => {
            const highlight = document.createElement('div');
            highlight.classList.add('payline-highlight');

            const reelWidth = 100;
            const symbolHeight = 100;
            const startX = 0;
            const startY = payline[0] * symbolHeight;

            highlight.style.width = `${reelCount * reelWidth}px`;
            highlight.style.height = `${symbolHeight}px`;
            highlight.style.top = `${startY}px`;
            highlight.style.left = `${startX}px`;

            reelsContainer.appendChild(highlight);

            setTimeout(() => {
                highlight.remove();
            }, 2000);
        });
    }

    function updateBalance() {
        balanceElement.textContent = balance;
    }

    function playSound(soundFile) {
        const audio = new Audio(soundFile);
        audio.play();
    }

    spinButton.addEventListener('click', spin);

    createReels();
    updateBalance();
});