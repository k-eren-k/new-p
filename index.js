const express = require('express');
const path = require('path');
const axios = require('axios');
const NodeCache = require('node-cache');
const compression = require('compression');
require('dotenv').config();

const app = express();
const cache = new NodeCache({ stdTTL: 600 }); 
const PORT = process.env.PORT || 3000; 
const GITHUB_TOKEN = process.env.GITHUB_TOKEN; 

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));
app.use(compression()); 
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
        const githubResponse = await axios.get(`https://api.github.com/users/${githubUsername}/repos`, {
            headers: { Authorization: `Bearer ${GITHUB_TOKEN}` },
            params: { per_page: 10, sort: 'updated' }
        });

        const repos = githubResponse.data;

        const reposWithLanguages = await Promise.all(
            repos.map(async (repo) => {
                try {
                    const languageResponse = await axios.get(repo.languages_url, {
                        headers: { Authorization: `Bearer ${GITHUB_TOKEN}` }
                    });
                    repo.languages = Object.keys(languageResponse.data);
                } catch (error) {
                    console.error(`Error fetching languages for repo ${repo.name}:`, error.message);
                    repo.languages = [];
                }
                return repo;
            })
        );

        cache.set(cacheKey, reposWithLanguages); 
        return reposWithLanguages;
    } catch (error) {
        console.error('Error fetching GitHub repos:', error.response ? error.response.data : error.message);
        return [];
    }
};


const fetchNpmPackages = async (npmUsername) => {
    const cacheKey = `npm_packages_${npmUsername}`; 
    const cachedPackages = cache.get(cacheKey);

    if (cachedPackages) {
        return cachedPackages;
    }

    try {
        const response = await axios.get(`https://registry.npmjs.org/-/v1/search?text=maintainer:${npmUsername}&size=5`);
        const packages = response.data.objects.map(pkg => pkg.package); 

        cache.set(cacheKey, packages); 
        return packages;
    } catch (error) {
        console.error('Error fetching NPM packages:', error.message);
        return [];
    }
};

app.get('/', async (req, res) => {
    try {
        const githubUsername = 'k-eren-k'; 
        const npmUsername = 'dis.dev'; 

        const [repos, npmPackages] = await Promise.allSettled([
            fetchGitHubRepos(githubUsername),
            fetchNpmPackages(npmUsername)
        ]);

        res.render('pages/home', {
            repos: repos.status === 'fulfilled' ? repos.value : [],
            npmPackages: npmPackages.status === 'fulfilled' ? npmPackages.value : []
        });
    } catch (error) {
        console.error('Error fetching data:', error);
        res.render('pages/home', { repos: [], npmPackages: [] });
    }
});

app.get('/projects', (req, res) => {
    res.render('pages/projects');
});

app.get('/contact', (req, res) => {
    res.render('pages/contact');
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
