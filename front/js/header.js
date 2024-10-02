const isEventFinished = true; // Définis cela selon ta condition
const menuItems = [
    { id: 1, label: 'Accueil', href: 'https://ia4sud.fr' },
    { id: 2, label: 'Les vainqueurs du Hackathon', href: 'https://ia4sud.fr/#winners' },
    { id: isEventFinished ? 3 : 2, label: 'Les sujets abordés', href: 'https://ia4sud.fr/#subjects' },
    { id: isEventFinished ? 4 : 3, label: 'Réalisations', href: 'https://ia4sud.fr/#teams' },
    { id: isEventFinished ? 5 : 4, label: 'À propos', href: 'https://ia4sud.fr/#about' },
];

const menuItemsWithoutWinners = menuItems.filter(item => item.label !== 'Les vainqueurs du Hackathon');

const drawer = document.getElementById('drawer');
const menuList = document.getElementById('menuList');
const menuToggle = document.getElementById('menuToggle');
const closeDrawer = document.getElementById('closeDrawer');

// Fonction pour ouvrir/fermer le tiroir
const toggleDrawer = () => {
    drawer.classList.toggle('hidden');
    document.body.classList.toggle('modal-open', !drawer.classList.contains('hidden'));
};

// Remplir le menu
const populateMenu = () => {
    const itemsToDisplay = isEventFinished ? menuItems : menuItemsWithoutWinners;
    itemsToDisplay.forEach(item => {
        const li = document.createElement('li');
        li.innerHTML = `<a href="${item.href}" class="menu-item" onclick="toggleDrawer()"><span class="item-id">${item.id} </span>${item.label}</a>`;
        menuList.appendChild(li);
    });
};

// Scroll effect
const handleScroll = () => {
    const nav = document.querySelector('nav');
    if (window.scrollY === 0) {
        nav.style.background = 'transparent';
        nav.style.boxShadow = 'none';
    } else {
        const scrollPercentage = Math.min(window.scrollY / (document.documentElement.scrollHeight - window.innerHeight), 1);
        const gradientColors = [
            [188, 104, 142],
            [109, 67, 142],
            [214, 100, 93]
        ];
        
        const interpolatedColor = gradientColors.reduce((acc, color, index) => {
            if (index === gradientColors.length - 1) return acc;
            const nextColor = gradientColors[index + 1];
            const segmentPercentage = Math.min(Math.max((scrollPercentage - index / (gradientColors.length - 1)) * (gradientColors.length - 1), 0), 1);
            const r = Math.round(color[0] + (nextColor[0] - color[0]) * segmentPercentage);
            const g = Math.round(color[1] + (nextColor[1] - color[1]) * segmentPercentage);
            const b = Math.round(color[2] + (nextColor[2] - color[2]) * segmentPercentage);
            return `rgb(${r}, ${g}, ${b})`;
        }, '');
        
        nav.style.background = interpolatedColor;
        nav.style.boxShadow = '0 0 10px 0 rgba(0, 0, 0, 0.5)';
    }
    nav.style.transition = 'background 0.3s ease-out';
};

// Écouteurs d'événements
menuToggle.addEventListener('click', toggleDrawer);
closeDrawer.addEventListener('click', toggleDrawer);
window.addEventListener('scroll', handleScroll);

// Initialiser le menu
populateMenu();
