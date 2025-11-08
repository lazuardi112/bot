const symbols = [
    'assets/slots-7.png',
    'assets/slots-bar.png',
    'assets/slots-crown.png',
    'assets/slots-diamond.png',
    'assets/slots-lemon.png',
    'assets/slots-melon.png'
];

let credits = 100;
let betAmount = 10;

const creditsDisplay = document.getElementById('credits');
const betAmountDisplay = document.getElementById('bet-amount');
const spinButton = document.getElementById('spin-button');
const reels = document.querySelectorAll('.reel');

spinButton.addEventListener('click', () => {
    if (credits >= betAmount) {
        credits -= betAmount;
        creditsDisplay.textContent = credits;
        spin();
    }
});

function spin() {
    let finalSymbols = [];

    reels.forEach((reel, index) => {
        const animation = reel.animate([
            { transform: 'translateY(-200%)' },
            { transform: 'translateY(0)' }
        ], {
            duration: 2000 + index * 500,
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
    const allSame = symbols.every(symbol => symbol === symbols[0]);
    const threeOfAKind = symbols.filter((item, index) => symbols.indexOf(item) !== index).length > 0;

    if (allSame) {
        const winAmount = betAmount * 10;
        credits += winAmount;
        creditsDisplay.textContent = credits;
        // Add win message/animation
    } else if (threeOfAKind) {
        const winAmount = betAmount * 2;
        credits += winAmount;
        creditsDisplay.textContent = credits;
        // Add win message/animation
    }
}
