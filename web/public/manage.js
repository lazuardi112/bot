document.addEventListener('DOMContentLoaded', () => {
    const botNameHeader = document.getElementById('bot-name-header');
    const addReplyForm = document.getElementById('add-reply-form');
    const replyListContainer = document.getElementById('reply-list');
    const buttonContainer = document.getElementById('button-container');
    const addButtonStyle = document.getElementById('add-button-btn');

    const urlParams = new URLSearchParams(window.location.search);
    const botId = urlParams.get('bot_id');

    if (!botId) {
        window.location.href = '/';
        return;
    }

    // --- Fetch Bot Details ---
    const fetchBotDetails = async () => {
        try {
            // Placeholder: In a real app, you'd fetch bot details
            // For now, we'll just use the ID.
            botNameHeader.textContent = `Kelola Bot: ID ${botId}`;
        } catch (error) {
            console.error('Error fetching bot details:', error);
            botNameHeader.textContent = 'Gagal memuat bot';
        }
    };

    // --- Render and Fetch Replies ---
    const renderReply = (reply) => {
        // ... Logic to display a reply with edit/delete buttons ...
    };

    const fetchReplies = async () => {
        // ... Logic to fetch replies for the current botId ...
        replyListContainer.innerHTML = '<p>Belum ada balasan yang dikonfigurasi.</p>';
    };

    // --- Add Dynamic Buttons to Form ---
    addButtonStyle.addEventListener('click', () => {
        const buttonRow = document.createElement('div');
        buttonRow.className = 'button-row';
        buttonRow.innerHTML = `
            <input type="text" class="button-text" placeholder="Teks Tombol">
            <input type="text" class="button-url" placeholder="URL Tombol">
            <button type="button" class="remove-button-btn">&times;</button>
        `;
        buttonContainer.appendChild(buttonRow);
    });

    buttonContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('remove-button-btn')) {
            e.target.parentElement.remove();
        }
    });

    // --- Handle Add Reply Form Submission ---
    addReplyForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        // ... Logic to collect form data (keyword, text, buttons) ...
        // ... and send it to a new API endpoint (e.g., POST /api/bots/:id/replies) ...
    });

    // --- Initial Load ---
    fetchBotDetails();
    fetchReplies();
});
