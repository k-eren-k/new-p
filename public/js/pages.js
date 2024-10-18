const itemsPerPageDesktop = 6;
const itemsPerPageMobile = 3; 
let itemsPerPage = window.innerWidth <= 768 ? itemsPerPageMobile : itemsPerPageDesktop;
let currentPage = 1;

function displayItems() {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const allCards = document.querySelectorAll('.github-list .card');

    allCards.forEach(card => card.style.display = 'none');

    allCards.forEach((card, index) => {
        if (index >= start && index < end) {
            card.style.display = 'block';
        }
    });

    document.getElementById('prevBtn').disabled = currentPage === 1;
    document.getElementById('nextBtn').disabled = currentPage === Math.ceil(allCards.length / itemsPerPage);
    document.getElementById('pageInfo').innerText = `${currentPage} / ${Math.ceil(allCards.length / itemsPerPage)}`;
}

document.getElementById('prevBtn').addEventListener('click', () => {
    if (currentPage > 1) {
        currentPage--;
        displayItems();
    }
});

document.getElementById('nextBtn').addEventListener('click', () => {
    if (currentPage < Math.ceil(document.querySelectorAll('.github-list .card').length / itemsPerPage)) {
        currentPage++;
        displayItems();
    }
});

function handleResize() {
    const isMobile = window.innerWidth <= 768;
    itemsPerPage = isMobile ? itemsPerPageMobile : itemsPerPageDesktop;
    currentPage = 1; 
    displayItems();
}

window.addEventListener('resize', handleResize);

displayItems();
