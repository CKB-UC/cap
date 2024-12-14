document.addEventListener('DOMContentLoaded', () => {
    const announceToggle = document.getElementById('announce-toggle');
    const announcePopup = document.getElementById('announce-popup');
    const closeAnnounce = document.querySelector('.close-announce');

    // Toggle annnouncement popup
    announceToggle.addEventListener('click', (e) => {
        e.preventDefault();
        announcePopup.style.display = 'block';
    });

    // Close annnouncement popup
    closeAnnounce.addEventListener('click', () => {
        announcePopup.style.display = 'none';
    });

    // Close popup if clicked outside
    window.addEventListener('click', (e) => {
        if (e.target === announcePopup) {
            announcePopup.style.display = 'none';
        }
    });
});