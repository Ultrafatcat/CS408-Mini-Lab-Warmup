// makes one request to canvas and returns the data plus the link header
// (the link header is how we find the next page)
async function canvasRequest(url) {
    // stop early with a clear message if the .env values are missing
    const token = process.env.CANVAS_API_TOKEN;
    if (!token) {
        const error = new Error('Canvas API token is not set in environment variables.');
        error.status = 500;
        throw error;
    }
    // couldn't reach canvas at all (wifi down, wrong url, etc)
    const baseUrl = process.env.CANVAS_BASE_URL;
    if (!baseUrl) {
        const error = new Error('Canvas base URL is not set in environment variables.');
        error.status = 500;
        throw error;
    }

    let response;

    try{
        response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })

    }catch (error) {
        const err = new Error(`Failed to fetch from Canvas API: ${error.message}`);
        err.status = 502;
        throw err;
    }
    // canvas answered, but with an error (bad token, no permission, not found)
    if (!response.ok) {
        
         let canvasMessage = '';

        try {
            const body = await response.json();
            canvasMessage = body?.errors?.[0]?.message || '';
        } 
        catch {
           // body wasn't JSON, carry on without it 
        }

        let message;
        if (response.status === 401) {
            message = 'Your Canvas token is invalid or expired. Check CANVAS_API_TOKEN in your .env file.';
        } 
        else if (response.status === 403) {
            message = "You don't have permission to view that in Canvas.";
        } 
        else if (response.status === 404) {
            message = 'Canvas could not find that resource.';
        } 
        else {
            message = `Canvas returned an error (${response.status}). ${canvasMessage}`;
        }

        const err = new Error(message);
        err.status = response.status;
        throw err;
    }

    const data = await response.json();
    const linkHeader = response.headers.get('link');

    return { data: data, linkHeader: linkHeader };
}
// canvas puts the next page's url in the link header, like <url>; rel="next"
// returns that url, or null if this was the last page
function getNextUrl(linkHeader) {
    if (!linkHeader) {
        return null;
    }

    const parts = linkHeader.split(',');

    for (const part of parts) {
        if (part.includes('rel="next"')) {
            const start = part.indexOf('<') + 1;
            const end = part.indexOf('>');
            return part.slice(start, end);
        }
    }

    return null;
}
// keeps asking for pages until there isn't a next one, then returns everything in one list
async function canvasGetAll(startUrl) {
    // ask for 100 per page unless the url already says otherwise (fewer requests)
    const firstUrl = new URL(startUrl);
    if (!firstUrl.searchParams.has('per_page')) {
        firstUrl.searchParams.set('per_page', '100');
    }

    const results = [];
    let currentUrl = firstUrl.toString();
    let pageCount = 0;
    const MAX_PAGES = 50;

    while (currentUrl && pageCount < MAX_PAGES) {
        const { data, linkHeader } = await canvasRequest(currentUrl);
        // spread so each item gets added, not the whole array as one item
        results.push(...data);
        currentUrl = getNextUrl(linkHeader);
        pageCount++;
    }

    return results;
}

module.exports = { canvasRequest, canvasGetAll }