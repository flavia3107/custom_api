export default async function handler(req, res) {
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
	res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
	res.setHeader('Content-Type', 'application/json');

	if (req.method === 'OPTIONS') return res.status(200).end();

	const GNEWS_KEY = process.env.GNEWS_KEY;
	if (!GNEWS_KEY) return res.status(500).json({ error: 'Server token configuration missing.' });


	const { search, lang = 'en', country = 'us', category = 'general', max = '10' } = req.query;
	const endpoint = search ? 'search' : 'top-headlines';
	const baseUrl = `https://gnews.io/api/v4/${endpoint}`;
	const queryParams = new URLSearchParams({ apikey: GNEWS, lang, country, max });

	if (search) queryParams.append('q', `"${search}"`);
	else queryParams.append('category', category);

	try {
		const response = await fetch(`${baseUrl}?${queryParams.toString()}`);
		const data = await response.json();
		return res.status(response.status).json(data);
	} catch (error) {
		return res.status(500).json({
			error: 'Failed to communicate with GNews API',
			details: error.message
		});
	}
}