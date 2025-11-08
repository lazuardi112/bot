const symbols = [
    'assets/slots-7.png',
    'assets/slots-bar.png',
    'assets/slots-crown.png',
    'assets/slots-diamond.png',
    'assets/slots-lemon.png',
    'assets/slots-melon.png',
    'assets/slots-10.png'
];

let credits = 100;
let betAmount = 10;

const creditsDisplay = document.getElementById('credits');
const betAmountDisplay = document.getElementById('bet-amount');
const spinButton = document.getElementById('spin-button');
const reels = document.querySelectorAll('.reel');
const winImage = document.getElementById('win-image');
const messageContainer = document.getElementById('message-container');

spinButton.addEventListener('click', () => {
    if (credits >= betAmount) {
        credits -= betAmount;
        creditsDisplay.textContent = credits;
        winImage.style.display = 'none';
        messageContainer.textContent = '';
        document.getElementById('spin-sound').play();
        spin();
    }
});

function spin() {
    let finalSymbols = [];

    reels.forEach((reel, index) => {
        const animation = reel.animate([
            { transform: 'translateY(-300%)' },
            { transform: 'translateY(0)' }
        ], {
            duration: 3000 + index * 700,
            easing: 'cubic-bezier(0.25, 0.1, 0.25, 1)'
        });

        animation.onfinish = () => {
            const randomSymbol = symbols[Math.floor(Math.random() * symbols.length)];
            reel.innerHTML = `<img src="${randomSymbol}">`;
            finalSymbols[index] = randomSymbol;

            if (index === reels.length - 1) {
                checkWin(finalSymbols);
            }
        };
    });
}

function checkWin(symbols) {
    const counts = {};
    symbols.forEach(symbol => counts[symbol] = (counts[symbol] || 0) + 1);

    const maxCount = Math.max(...Object.values(counts));

    if (maxCount >= 4) { // Win condition: 4 or more of the same symbol
        const winAmount = betAmount * (maxCount * 2);
        credits += winAmount;
        creditsDisplay.textContent = credits;
        messageContainer.textContent = `You won ${winAmount}!`;
        winImage.src = 'assets/big-win.png';
        winImage.style.display = 'block';
        document.getElementById('win-sound').play();
    } else {
        messageContainer.textContent = 'No win this time.';
    }
}
