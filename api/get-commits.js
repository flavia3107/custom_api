export default async function handler(req, res) {
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
	res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
	res.setHeader('Content-Type', 'application/json');
	res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
	res.setHeader('Pragma', 'no-cache');
	res.setHeader('Expires', '0');

	if (req.method === 'OPTIONS') return res.status(200).end();

	const { user, repo, action, since, until } = req.query;
	const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
	if (!GITHUB_TOKEN) return res.status(500).json({ error: 'Server token missing.' });

	const cacheBuster = Date.now();
	let targetUrl = '';
	if (action === 'repoDetails') {
		if (!user || !repo) return res.status(400).json({ error: 'Missing parameters' });
		targetUrl = `https://api.github.com/repos/${encodeURIComponent(user)}/${encodeURIComponent(repo)}?cb=${cacheBuster}`;

	} else if (action === 'languages') {
		if (!user || !repo) return res.status(400).json({ error: 'Missing parameters' });
		targetUrl = `https://api.github.com/repos/${encodeURIComponent(user)}/${encodeURIComponent(repo)}/languages?cb=${cacheBuster}`;

	} else if (action === 'weeklyStats') {
		if (!user || !repo) return res.status(400).json({ error: 'Missing parameters' });
		targetUrl = `https://api.github.com/repos/${encodeURIComponent(user)}/${encodeURIComponent(repo)}/stats/participation?cb=${cacheBuster}`;

	} else if (action === 'filteredCommits') {
		if (!user || !repo) return res.status(400).json({ error: 'Missing parameters' });
		targetUrl = `https://api.github.com/repos/${encodeURIComponent(user)}/${encodeURIComponent(repo)}/commits?since=${encodeURIComponent(since)}&until=${encodeURIComponent(until)}&per_page=1000&cb=${cacheBuster}`;

	} else {
		if (!user) return res.status(400).json({ error: 'Missing user parameter' });
		targetUrl = `https://api.github.com/search/commits?q=author:${encodeURIComponent(user)}&cb=${cacheBuster}`;
	}

	try {
		const response = await fetch(targetUrl, {
			headers: {
				'Authorization': `Bearer ${GITHUB_TOKEN}`,
				'Accept': 'application/vnd.github+json',
				'X-GitHub-Api-Version': '2022-11-28',
				'Cache-Control': 'no-cache',
				'If-None-Match': '',
				'If-Modified-Since': ''
			}
		});

		if (response.status === 304) {
			console.warn("GitHub stubbornly returned a 304.");
		}
		const data = await response.json();
		return res.status(response.status).json(data);

	} catch (error) {
		return res.status(500).json({ error: 'Failed to communicate with GitHub API' });
	}
}