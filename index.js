const express = require('express');
const path = require('path');
const axios = require('axios');
const NodeCache = require('node-cache');
const compression = require('compression');
require('dotenv').config(); // Çevresel değişkenleri yükle

const app = express();
const cache = new NodeCache({ stdTTL: 600 }); // Cache süresi 10 dakika
const PORT = process.env.PORT || 3000; // PORT çevresel değişken yoksa 3000 kullan
const GITHUB_TOKEN = process.env.GITHUB_TOKEN; // GitHub token'ı .env dosyasından al

// EJS şablon motorunu ayarla ve 'views' klasörünü kullan
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Statik dosyalar için 'public' klasörünü kullan
app.use(express.static(path.join(__dirname, 'public')));
app.use(compression()); // İstekleri sıkıştırarak gönder
const checkRateLimit = async () => {
    try {
        const rateLimitResponse = await axios.get('https://api.github.com/rate_limit', {
            headers: { Authorization: `token ${GITHUB_TOKEN}` }
        });
        console.log('Rate limit:', rateLimitResponse.data.rate);
    } catch (error) {
        console.error('Error checking rate limit:', error.response ? error.response.data : error.message);
    }
};

checkRateLimit();


const fetchGitHubRepos = async (githubUsername) => {
    const cacheKey = `github_repos_${githubUsername}`;
    const cachedRepos = cache.get(cacheKey);

    if (cachedRepos) {
        return cachedRepos;
    }

    try {
        // GitHub API isteği, yetkilendirme başlığı ile
        const githubResponse = await axios.get(`https://api.github.com/users/${githubUsername}/repos`, {
            headers: { Authorization: `Bearer ${GITHUB_TOKEN}` }, // 'Bearer' kullanarak token gönderiyoruz
            params: { per_page: 5, sort: 'updated' }
        });

        const repos = githubResponse.data;
        cache.set(cacheKey, repos);
        return repos;
    } catch (error) {
        console.error('Error fetching GitHub repos:', error.response ? error.response.data : error.message);
        return [];
    }
};


// NPM paketleri çekme fonksiyonu
const fetchNpmPackages = async (npmUsername) => {
    const cacheKey = `npm_packages_${npmUsername}`; // Cache anahtarı oluştur
    const cachedPackages = cache.get(cacheKey); // Cache'de varsa çek

    if (cachedPackages) {
        return cachedPackages; // Cache'de varsa onu döndür
    }

    try {
        // NPM API isteği
        const response = await axios.get(`https://registry.npmjs.org/-/v1/search?text=maintainer:${npmUsername}&size=5`);
        const packages = response.data.objects.map(pkg => pkg.package); // Paket verilerini al

        cache.set(cacheKey, packages); // Cache'e kaydet
        return packages;
    } catch (error) {
        console.error('Error fetching NPM packages:', error.message);
        return []; // Hata durumunda boş array döndür
    }
};

// Anasayfa rotası
app.get('/', async (req, res) => {
    try {
        const githubUsername = 'k-eren-k'; // GitHub kullanıcı adı
        const npmUsername = 'dis.dev'; // NPM kullanıcı adı

        // Promise.allSettled ile GitHub ve NPM isteklerini aynı anda yap
        const [repos, npmPackages] = await Promise.allSettled([
            fetchGitHubRepos(githubUsername),
            fetchNpmPackages(npmUsername)
        ]);

        // Hata kontrolü ve sayfaya verileri gönder
        res.render('pages/home', {
            repos: repos.status === 'fulfilled' ? repos.value : [],
            npmPackages: npmPackages.status === 'fulfilled' ? npmPackages.value : []
        });
    } catch (error) {
        console.error('Error fetching data:', error);
        res.render('pages/home', { repos: [], npmPackages: [] }); // Hata durumunda boş verilerle sayfayı render et
    }
});

// Projeler sayfası
app.get('/projects', (req, res) => {
    res.render('pages/projects');
});

// İletişim sayfası
app.get('/contact', (req, res) => {
    res.render('pages/contact');
});

// Sunucuyu başlat
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
