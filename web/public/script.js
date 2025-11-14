document.addEventListener('DOMContentLoaded', () => {
  const addBotForm = document.getElementById('add-bot-form');
  const botListContainer = document.getElementById('bot-list');

  // --- Function to render bots in the UI ---
  const renderBot = (bot) => {
    const botItem = document.createElement('div');
    botItem.className = 'bot-item';
    botItem.dataset.botId = bot.id;

    botItem.innerHTML = `
      <div>
        <h3>${bot.bot_username || 'N/A'}</h3>
        <p>ID: ${bot.id}</p>
      </div>
      <div class="bot-item-actions">
        <div class="status-toggle">
          <span>Off</span>
          <label class="switch">
            <input type="checkbox" class="toggle-status" ${bot.is_active ? 'checked' : ''}>
            <span class="slider"></span>
          </label>
          <span>On</span>
        </div>
        <button class="btn btn-secondary manage-bot">Kelola</button>
        <button class="btn btn-danger delete-bot">Hapus</button>
      </div>
    `;
    botListContainer.appendChild(botItem);
  };

  // --- Function to fetch and display all bots ---
  const fetchBots = async () => {
    try {
      const response = await fetch('/api/bots');
      if (!response.ok) throw new Error('Gagal mengambil bot');

      const data = await response.json();
      botListContainer.innerHTML = ''; // Clear the loading message
      if (data.bots.length === 0) {
        botListContainer.innerHTML = '<p>Anda belum menambahkan bot apa pun.</p>';
      } else {
        data.bots.forEach(renderBot);
      }
    } catch (error) {
      console.error('Error:', error);
      botListContainer.innerHTML = '<p>Gagal memuat bot. Silakan coba lagi nanti.</p>';
    }
  };

  // --- Event Listener for adding a new bot ---
  addBotForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const botTokenInput = document.getElementById('bot-token');
    const botToken = botTokenInput.value.trim();

    if (!botToken) return;

    try {
      const response = await fetch('/api/bots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ botToken }),
      });

      if (!response.ok) throw new Error('Gagal menambahkan bot');

      const newBot = await response.json();
      if (botListContainer.querySelector('p')) {
        botListContainer.innerHTML = ''; // Clear the "no bots" message
      }
      renderBot(newBot);
      botTokenInput.value = ''; // Clear the input
    } catch (error) {
      console.error('Error:', error);
      alert('Gagal menambahkan bot. Pastikan token valid.');
    }
  });

  // --- Event Delegation for bot actions (toggle, delete, manage) ---
  botListContainer.addEventListener('click', async (e) => {
    const target = e.target;
    const botItem = target.closest('.bot-item');
    if (!botItem) return;

    const botId = botItem.dataset.botId;

    // Handle status toggle
    if (target.classList.contains('toggle-status')) {
      try {
        const response = await fetch(`/api/bots/${botId}/toggle`, { method: 'PUT' });
        if (!response.ok) throw new Error('Gagal mengubah status bot');
        // The UI updates optimistically, no server response needed to re-render
      } catch (error) {
        console.error('Error:', error);
        alert('Gagal mengubah status bot.');
        target.checked = !target.checked; // Revert the toggle on error
      }
    }

    // Handle delete
    if (target.classList.contains('delete-bot')) {
      if (confirm('Apakah Anda yakin ingin menghapus bot ini?')) {
        try {
          const response = await fetch(`/api/bots/${botId}`, { method: 'DELETE' });
          if (!response.ok) throw new Error('Gagal menghapus bot');
          botItem.remove(); // Remove from the DOM
        } catch (error) {
          console.error('Error:', error);
          alert('Gagal menghapus bot.');
        }
      }
    }

    // Handle manage (redirect to a new page)
    if (target.classList.contains('manage-bot')) {
      window.location.href = `/manage.html?bot_id=${botId}`;
    }
  });

  // --- Initial fetch of bots when the page loads ---
  fetchBots();
});
