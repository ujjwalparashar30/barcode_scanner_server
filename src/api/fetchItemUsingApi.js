// services/externalApiService.js
const request = require('request-promise-native');

// Function to fetch item from the external UPC API
async function fetchItemFromExternalApi(upcCode) {
    try {
        const options = {
            uri: 'https://api.upcitemdb.com/prod/trial/lookup',
            headers: {
                "Content-Type": "application/json",
            },
            gzip: true,
            json: { "upc": upcCode }
        };

        const body = await request.post(options);
        return body;  // Return the response body
    } catch (error) {
        throw new Error(`Error occurred during the external API request: ${error.message}`);
    }
}

module.exports = {
    fetchItemFromExternalApi
};
