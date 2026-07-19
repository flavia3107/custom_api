export default async function handler(req, res) {
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
	res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
	res.setHeader('Content-Type', 'application/json');

	if (req.method === 'OPTIONS') return res.status(200).end();

	const { action, language, category, country, keyword, sentiment } = req.query;
	const APITUBE_KEY = process.env.APITube;

	if (!APITUBE_KEY) return res.status(500).json({ error: 'Server token configuration missing.' });

	let targetUrl = '';
	const baseUrl = 'https://api.apitube.io/v1';

	if (action === 'topHeadlines') {
		const langCode = language || 'en';
		const catId = category || 'general';

		targetUrl = `${baseUrl}/news/top-headlines?language.code=${encodeURIComponent(langCode)}&category.id=${encodeURIComponent(catId)}&per_page=10&page=1`;
		if (country) targetUrl += `&source.country.code=${encodeURIComponent(country)}`;

	} else if (action === 'sentimentSearch') {
		// Leverages APITube's advanced enrichment layer to look for specific keyword polarities
		if (!keyword || !sentiment) return res.status(400).json({ error: 'Missing keyword or sentiment parameters' });
		targetUrl = `${baseUrl}/news/everything?q=${encodeURIComponent(keyword)}&sentiment.polarity=${encodeURIComponent(sentiment)}&per_page=10&page=1`;

	} else if (action === 'locationNews') {
		// Filters articles based on designated publisher location boundaries
		if (!country) return res.status(400).json({ error: 'Missing country parameter for regional news' });
		targetUrl = `${baseUrl}/news/everything?source.country.code=${encodeURIComponent(country)}&per_page=10&page=1`;

	} else if (action === 'checkBalance') {
		// Essential utility endpoint checking your active daily point usage
		targetUrl = `${baseUrl}/balance`;

	} else {
		// Default Fallback: Fall through to standard search query array
		const defaultLang = language || 'en';
		const searchPhrase = keyword ? `&q=${encodeURIComponent(keyword)}` : '';
		targetUrl = `${baseUrl}/news/everything?language.code=${encodeURIComponent(defaultLang)}${searchPhrase}&per_page=10&page=1`;
	}

	try {
		// 4. Secure server-to-server request passing the custom validation header
		const response = await fetch(targetUrl, {
			headers: {
				'X-API-Key': APITUBE_KEY,
				'Accept': 'application/json'
			}
		});

		const data = await response.json();
		return res.status(response.status).json(data);

	} catch (error) {
		return res.status(500).json({ error: 'Failed to communicate with APITube API', details: error.message });
	}
}