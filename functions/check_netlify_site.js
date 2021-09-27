"use strict";

const axios = require("axios");
const serverUtils = require("../functions-common/server_utils.js");
const netlifySiteApi = "https://api.netlify.com/api/v1/sites";

/**
 * Support the endpoint /api/check_netlify_site
 * Check if the GitHub repository defined via process.env.WORDLES_REPO_OWNER & process.env.WORDLES_REPO_NAME
 * is a Netlify site.
 */

exports.handler = async function (event) {
    console.log("Received check_netlify_site request at " + new Date());

    // Reject the request when:
    // 1. Not a GET request;
    // 2. Doesn’t provide required values
    if (event.httpMethod !== "GET" || !process.env.WORDLES_REPO_OWNER || !process.env.WORDLES_REPO_NAME || !process.env.NETLIFY_TOKEN) {
        return serverUtils.invalidRequestResponse;
    }

    try {
        const expectedRepoUrl = "https://github.com/" + process.env.WORDLES_REPO_OWNER + "/" + process.env.WORDLES_REPO_NAME;
        const netlifyResponse = await axios.get(netlifySiteApi, {
            headers: {
                "Authorization": "Bearer " + process.env.NETLIFY_TOKEN
            }
        });

        const isNetlifySite = netlifyResponse.data.some(oneSite => oneSite.build_settings.repo_url === expectedRepoUrl) ? true : false;

        console.log("Done: if the current site is a Netlify site: " + isNetlifySite);
        return {
            statusCode: 200,
            body: JSON.stringify({
                isNetlifySite
            })
        };
    } catch (e) {
        console.log("check_netlify_site error: ", e);
        return {
            statusCode: 400,
            body: JSON.stringify({
                error: e
            })
        };
    }
};
