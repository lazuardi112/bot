document.addEventListener('DOMContentLoaded', () => {
    // Pengambilan Elemen DOM
    const slotMachine = document.getElementById('slot-machine');
    const spinBtn = document.getElementById('spin-btn');
    const betUpBtn = document.getElementById('bet-up-btn');
    const betDownBtn = document.getElementById('bet-down-btn');
    const balanceDisplay = document.getElementById('balance-display');
    const betDisplay = document.getElementById('bet-display');
    const winDisplay = document.getElementById('win-display');
    const spinSound = document.getElementById('spin-sound');
    const winSound = document.getElementById('win-sound');

    // Status Game
    let balance = 1000;
    let currentBet = 10;
    const betStep = 10;
    const numRows = 4;
    const numCols = 5;
    let isSpinning = false;

    // Aset Simbol
    const symbols = {
        'zeus': 'zeusbrabo.jpeg',
        'apollo': 'apolo.jpg',
        'hermes': 'hermes.jpg',
        'pegasus': 'str.jpeg', // Menggunakan gambar yang ada sebagai placeholder
        'temple': 'zeusl.jpeg', // Placeholder
        'wild': 'logopr.jpeg', // Placeholder
        'scatter': 'cont.jpeg' // Placeholder
    };
    const symbolKeys = Object.keys(symbols);

    // --- Inisialisasi ---
    function init() {
        createGrid();
        updateDisplays();
    }

    function createGrid() {
        slotMachine.innerHTML = '';
        for (let i = 0; i < numRows * numCols; i++) {
            const reel = document.createElement('div');
            reel.classList.add('reel');
            const img = document.createElement('img');
            // Mulai dengan simbol acak
            const randomSymbol = symbolKeys[Math.floor(Math.random() * symbolKeys.length)];
            img.src = `assets/${symbols[randomSymbol]}`;
            img.alt = randomSymbol;
            reel.appendChild(img);
            slotMachine.appendChild(reel);
        }
    }

    // --- Logika Game ---
    function spin() {
        if (isSpinning) return;
        if (balance < currentBet) {
            alert("Kredit tidak cukup!");
            return;
        }

        isSpinning = true;
        balance -= currentBet;
        winDisplay.textContent = '0';
        updateDisplays();
        spinSound.play();

        const reels = slotMachine.children;
        let completedReels = 0;

        for (let i = 0; i < reels.length; i++) {
            const reel = reels[i];
            const img = reel.querySelector('img');

            // Animasi putaran sederhana
            const spinInterval = setInterval(() => {
                const randomSymbol = symbolKeys[Math.floor(Math.random() * symbolKeys.length)];
                img.src = `assets/${symbols[randomSymbol]}`;
            }, 100);

            // Hentikan putaran setelah beberapa saat
            setTimeout(() => {
                clearInterval(spinInterval);
                // Tetapkan simbol akhir (ini akan menjadi hasil sebenarnya)
                const finalSymbol = symbolKeys[Math.floor(Math.random() * symbolKeys.length)];
                img.src = `assets/${symbols[finalSymbol]}`;
                img.alt = finalSymbol;

                completedReels++;
                if (completedReels === reels.length) {
                    endSpin();
                }
            }, 1000 + i * 100); // Penundaan berjenjang untuk efek yang bagus
        }
    }

    function endSpin() {
        isSpinning = false;
        checkForWins();
    }

    function checkForWins() {
        // Placeholder untuk logika kemenangan
        // TODO: Implementasikan 50 garis pembayaran dan deteksi kemenangan nyata

        // Contoh logika kemenangan sederhana: jika ada 3 'zeus' di baris pertama
        const reels = slotMachine.children;
        let zeusCount = 0;
        for(let i = 0; i < 5; i++) {
            if (reels[i].querySelector('img').alt === 'zeus') {
                zeusCount++;
            }
        }

        if (zeusCount >= 3) {
            const winAmount = currentBet * 10; // Kemenangan 10x
            balance += winAmount;
            winDisplay.textContent = winAmount;
            winSound.play();
            updateDisplays();
        }
    }

    // --- Kontrol UI ---
    function updateDisplays() {
        balanceDisplay.textContent = balance;
        betDisplay.textContent = currentBet;
    }

    function adjustBet(amount) {
        let newBet = currentBet + amount;
        if (newBet > 0 && newBet <= balance) {
            currentBet = newBet;
            updateDisplays();
        }
    }

    // --- Event Listeners ---
    spinBtn.addEventListener('click', spin);
    betUpBtn.addEventListener('click', () => adjustBet(betStep));
    betDownBtn.addEventListener('click', () => adjustBet(-betStep));

    // Mulai game
    init();
});
