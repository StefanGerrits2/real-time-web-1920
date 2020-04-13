const fetch = require('node-fetch');

// Source used https://codeburst.io/fetch-api-was-bringing-darkness-to-my-codebase-so-i-did-something-to-illuminate-it-7f2d8826e939
function checkStatus(response) {
    if (response.ok) {
        return response;
    } 
    else {
        const error = new Error(response.statusText);
        error.response = response;
        throw error;
    }
};

const Fetcher = {
    get: (url) =>
        fetch(url)
            .then(checkStatus)
            .then(res => res.json())
};

module.exports = Fetcher;