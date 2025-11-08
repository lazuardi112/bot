document.addEventListener('DOMContentLoaded', () => {
    const reelsContainer = document.getElementById('reels-container');
    const spinButton = document.getElementById('spin-button');
    const balanceElement = document.getElementById('balance');

    const symbols = [
        'images/apolo.jpg',
        'images/hermes.jpg',
        'images/zeusbrabo.jpeg',
        'images/zeusl.jpeg'
    ];

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

    function checkWin() {
        // Simple win condition: check if the middle row has matching symbols
        const middleRowSymbols = [];
        reels.forEach(reelStrip => {
            const transform = window.getComputedStyle(reelStrip).transform;
            const matrix = new DOMMatrixReadOnly(transform);
            const translateY = matrix.m42;
            const symbolIndex = Math.abs(Math.round(translateY / 100)) % symbols.length;
            const children = Array.from(reelStrip.children);
            const visibleSymbol = children.find((child, index) => index * 100 >= Math.abs(translateY) && index * 100 < Math.abs(translateY) + 400);
            if(visibleSymbol){
                 middleRowSymbols.push(visibleSymbol.style.backgroundImage);
            }
        });

        const allSame = middleRowSymbols.every(val => val === middleRowSymbols[0]);

        if (allSame) {
            balance += 100;
            updateBalance();
            reelsContainer.classList.add('win-animation');
            playSound('sounds/Its-gonna-be-alrigh.mp3');
            setTimeout(() => {
                reelsContainer.classList.remove('win-animation');
            }, 2000);
        } else {
            playSound('sounds/sloth-inspired-fall-sound-no1-124165.mp3');
        }
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