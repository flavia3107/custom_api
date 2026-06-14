export default async function handler(req, res) {
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
	res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

	if (req.method === 'OPTIONS') return res.status(200).end();

	const { user } = req.query;
	if (!user) return res.status(400).json({ error: 'Missing user parameter' });

	const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
	if (!GITHUB_TOKEN) return res.status(500).json({ error: 'Server misconfiguration: Token missing.' });

	try {
		const response = await fetch(`https://api.github.com/search/commits?q=author:${encodeURIComponent(user)}`, {
			headers: {
				'Authorization': `Bearer ${GITHUB_TOKEN}`,
				'Accept': 'application/vnd.github+json',
				'X-GitHub-Api-Version': '2022-11-28'
			}
		});

		const data = await response.json();
		return res.status(response.status).json(data);

	} catch (error) {
		return res.status(500).json({ error: 'Failed to communicate with GitHub API' });
	}
}