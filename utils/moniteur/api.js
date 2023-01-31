/* 
   * Merci à:
   * https://github.com/Zepje/vinted.js
*/

const fetch = require('cross-fetch');
const UserAgent = require('user-agents');
const cookie = require('cookie');
const HttpsProxyAgent = require('https-proxy-agent')

const cookies = new Map();

//fetches a Vinted cookie to authenticate the requests
const fetchCookie = (domain = 'be') => {
    return new Promise((resolve, reject) => {
        const controller = new AbortController();
        fetch(`https://vinted.${domain}`, {
            signal: controller.signal,
            headers: {
                'user-agent': new UserAgent().toString()
            }
        }).then((res) => {
            const sessionCookie = res.headers.get('set-cookie');
            controller.abort();
            const c = cookie.parse(sessionCookie)['secure, _vinted_fr_session'];
            if (c) {
                //console.log(c);
                cookies.set(domain, c);
            }
            resolve(c);
        }).catch((err) => {
            controller.abort();
            reject(err);
        });
    });
};

//gets a bunch of parameters right into the url, not really used but just handy in case :)
const parseVintedURL = (url, disableOrder = false, allowSwap = false, customParams = {}) => {
    try {
        const decodedURL = decodeURI(url);
        const matchedParams = decodedURL.match(/^https:\/\/www\.vinted\.([a-z]+)/);
        if (!matchedParams) return {
            validURL: false
        };

        const missingIDsParams = ['catalog', 'status'];
        const params = decodedURL.match(/(?:([a-z_]+)(\[\])?=([a-zA-Z 0-9._À-ú+%]*)&?)/g);
        if (typeof matchedParams[Symbol.iterator] !== 'function') return {
            validURL: false
        };
        const mappedParams = new Map();
        for (let param of params) {
            let [_, paramName, isArray, paramValue] = param.match(/(?:([a-z_]+)(\[\])?=([a-zA-Z 0-9._À-ú+%]*)&?)/);
            if (paramValue?.includes(' ')) paramValue = paramValue.replace(/ /g, '+');
            if (isArray) {
                if (missingIDsParams.includes(paramName)) paramName = `${paramName}_id`;
                if (mappedParams.has(`${paramName}s`)) {
                    mappedParams.set(`${paramName}s`, [...mappedParams.get(`${paramName}s`), paramValue]);
                } else {
                    mappedParams.set(`${paramName}s`, [paramValue]);
                }
            } else {
                mappedParams.set(paramName, paramValue);
            }
        }
        for (let key of Object.keys(customParams)) {
            mappedParams.set(key, customParams[key]);
        }
        const finalParams = [];
        for (let [key, value] of mappedParams.entries()) {
            finalParams.push(typeof value === 'string' ? `${key}=${value}` : `${key}=${value.join(',')}`);
        }

        return {
            validURL: true,
            domain: matchedParams[1],
            querystring: finalParams.join('&')
        }
    } catch (e) {
        return {
            validURL: false
        }
    }
}
exports.parseVintedURL = parseVintedURL;
//searches something on vinted, using the 'newest first' order by default 

/**
 * Search an item on vinted
 *
 * @param {string} search_text - The text to search
 * @param {string} order - The order of the results (optional, default is newest_first)
 * @returns {Promise} A promise that resolves to the results
 */
const vintedSearch = (url, ip) => {
    return new Promise(async (resolve, reject) => {
        var userag = new UserAgent();
        if (ip) userag = new HttpsProxyAgent('http:/' + ip);
        var c = cookies.get('be') || await fetchCookie('be')
        const controller = new AbortController();
        const { validURL, domain, querystring } = parseVintedURL(url);
        if (!validURL) return resolve(false);
        fetch(`https://www.vinted.be/api/v2/catalog/items?${querystring}`, {
            headers: {
                'user-agent': userag,
                'cookie': '_vinted_fr_session=' + c,
                'accept': 'application/json, text/plain, */*'
            }
        }).then(res => {
            controller.abort();
            res.json().then(data => {
                resolve(data);
            });
        }).catch(err => {
            controller.abort();
            reject(err);
        });
    })
}

exports.vintedSearch = vintedSearch;