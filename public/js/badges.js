const colorClasses = [
    { bg: 'rgba(236, 72, 153, 0.1)', text: 'rgba(236, 72, 153, 0.8)' }, // Pembe
    { bg: 'rgba(56, 189, 248, 0.1)', text: 'rgba(56, 189, 248, 0.8)' }, // Açık Mavi
    { bg: 'rgba(34, 197, 94, 0.1)', text: 'rgba(34, 197, 94, 0.8)' },  // Yeşil
    { bg: 'rgba(252, 165, 165, 0.1)', text: 'rgba(252, 165, 165, 0.8)' }, // Kırmızı
    { bg: 'rgba(250, 204, 21, 0.1)', text: 'rgba(250, 204, 21, 0.8)' }, // Sarı
    { bg: 'rgba(168, 85, 247, 0.1)', text: 'rgba(168, 85, 247, 0.8)' }, // Mor
    { bg: 'rgba(251, 191, 36, 0.1)', text: 'rgba(251, 191, 36, 0.8)' }, // Turuncu
    { bg: 'rgba(125, 211, 252, 0.1)', text: 'rgba(125, 211, 252, 0.8)' }, // Turkuaz
    { bg: 'rgba(217, 119, 6, 0.1)', text: 'rgba(217, 119, 6, 0.8)' },  // Kahverengi
    { bg: 'rgba(163, 163, 163, 0.1)', text: 'rgba(163, 163, 163, 0.8)' }  // Gri
];

const badges = document.querySelectorAll('.badge');

badges.forEach(badge => {
    const randomColor = colorClasses[Math.floor(Math.random() * colorClasses.length)];
    badge.style.backgroundColor = randomColor.bg;
    badge.style.color = randomColor.text;

    badge.addEventListener('mouseenter', () => {
        const darkenedBg = darkenColor(randomColor.bg, 0.2);
        const darkenedText = darkenColor(randomColor.text, 0.2);
        badge.style.backgroundColor = darkenedBg;
        badge.style.color = darkenedText;
    });

    badge.addEventListener('mouseleave', () => {
        badge.style.backgroundColor = randomColor.bg;
        badge.style.color = randomColor.text;
    });
});

function darkenColor(rgba, amount) {
    const [r, g, b, a] = rgba.match(/\d+(\.\d+)?/g).map(Number);
    const newAlpha = Math.min(a + amount, 1);
    return `rgba(${r}, ${g}, ${b}, ${newAlpha})`;
}