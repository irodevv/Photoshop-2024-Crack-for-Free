
const
    UserAgent = require('user-agents'),
    cookie = require('cookie'),
    HttpsProxyAgent = require('https-proxy-agent'),
    cookies = new Map();

const fetchCookie = (domain = 'be') => {
    return new Promise((resolve, reject) => {
        try {
            fetch(`https://vinted.${domain}`, {
                headers: {
                    'user-agent': new UserAgent().toString()
                }
            }).then((res) => {
                const
                    sessionCookie = res.headers.get('set-cookie'),
                    c = cookie.parse(sessionCookie)['secure, _vinted_fr_session'];
                if (c) cookies.set(domain, c);
                resolve(c);
            }).catch((err) => reject(false));
        } catch (error) {
            console.log(`[VINTED COOKIE] ${error}`);
            resolve(false)
        }
    });
};

const random = (allproxy) => {
    const
        max = allproxy.length - 1,
        min = 0,
        randomNum = Math.floor(Math.random() * (max - min + 1)) + min;
    return allproxy[randomNum]
};

const parseVintedURL = (url, disableOrder = false, allowSwap = false, customParams = {}) => {
    try {
        const
            decodedURL = decodeURI(url),
            matchedParams = decodedURL.match(/^https:\/\/www\.vinted\.([a-z]+)/);
        if (!matchedParams) return { validURL: false };
        const
            missingIDsParams = ['catalog', 'status'],
            params = decodedURL.match(/(?:([a-z_]+)(\[\])?=([a-zA-Z 0-9._À-ú+%]*)&?)/g);
        if (typeof matchedParams[Symbol.iterator] !== 'function') return { validURL: false };
        const mappedParams = new Map();
        for (let param of params) {
            let [_, paramName, isArray, paramValue] = param.match(/(?:([a-z_]+)(\[\])?=([a-zA-Z 0-9._À-ú+%]*)&?)/);
            if (paramValue?.includes(' ')) paramValue = paramValue.replace(/ /g, '+');
            if (isArray) {
                if (missingIDsParams.includes(paramName)) paramName = `${paramName}_id`;
                if (mappedParams.has(`${paramName}s`)) mappedParams.set(`${paramName}s`, [...mappedParams.get(`${paramName}s`), paramValue]);
                else mappedParams.set(`${paramName}s`, [paramValue]);
            } else mappedParams.set(paramName, paramValue);
        }
        for (let key of Object.keys(customParams)) { mappedParams.set(key, customParams[key]) };
        const finalParams = [];
        for (let [key, value] of mappedParams.entries()) { finalParams.push(typeof value === 'string' ? `${key}=${value}` : `${key}=${value.join(',')}`) };
        if (!finalParams.includes("order=newest_first")) finalParams.push("order=newest_first");
        return {
            validURL: true,
            domain: matchedParams[1],
            querystring: finalParams.join('&')
        }
    } catch (e) {
        return { validURL: false }
    }
};
exports.parseVintedURL = parseVintedURL;

const vintedSearch = (url, proxy) => {
    return new Promise(async (resolve, reject) => {
        try {
            let userag = new UserAgent().toString();
            if (proxy) userag = new HttpsProxyAgent('http:/' + random(proxy));
            const
                c = cookies.get('be') || await fetchCookie('be'),
                { validURL, domain, querystring } = parseVintedURL(url);
            if (!validURL) return resolve();
            fetch(`https://www.vinted.be/api/v2/catalog/items?${querystring}`, {
                headers: {
                    'user-agent': userag,
                    'cookie': '_vinted_fr_session=' + c,
                    'accept': 'application/json, text/plain, */*'
                }
            }).then(res => {
                res.json().then(data => {
                    resolve(data);
                }).catch(() => { resolve() });
            }).catch(err => {
                console.log(`[VINTED SEARCH] ${err}`);
                resolve();
            });
        } catch (error) {
            console.log(`[VINTED SEARCH] ${error}`);
            resolve()
        }

    })
};
exports.vintedSearch = vintedSearch