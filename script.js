// script.js
// Function to load HTML components
async function loadComponent(url, elementId) {
    try {
        const response = await fetch(url);
        const html = await response.text();
        document.getElementById(elementId).innerHTML = html;
    } catch (error) {
        console.error('Error loading component:', error);
    }
}

// Function to handle active navigation state
function setActiveNavLink() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    document.addEventListener('DOMContentLoaded', () => {
        const navLinks = document.querySelectorAll('.navbar a');
        navLinks.forEach(link => {
            if (link.getAttribute('href') === currentPage) {
                link.style.backgroundColor = '#555';
            }
        });
    });
}

// Initialize components
window.onload = function() {
    loadComponent('components/header.html', 'header');
    loadComponent('components/nav.html', 'nav');
    loadComponent('components/footer.html', 'footer');
    setActiveNavLink();
}