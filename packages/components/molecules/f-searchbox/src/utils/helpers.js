/**
 * Checks to see if the postcode is populated, accounts for spaces.
 *
 * @param postcode
 */
const isPostcodeEmpty = postcode => !postcode.trim();

/**
 * Regex to test UK postcode formats. Method will pass `true` if the
 * `postcode` passed in passes the regex test.
 *
 * @param postcode
 * @returns {boolean}
 */
const doesPostcodeMatchRegex = postcode => {
    // regex: https://stackoverflow.com/questions/164979/uk-postcode-regex-comprehensive#164994
    const postcodeRegex = /^([Gg][Ii][Rr]\s?0[Aa]{2})|((([A-Za-z][0-9]{1,2})|(([A-Za-z][A-Ha-hJ-Yj-y][0-9]{1,2})|(([A-Za-z][0-9][A-Za-z])|([A-Za-z][A-Ha-hJ-Yj-y][0-9][A-Za-z]?))))\s?[0-9][A-Za-z]{2})$/;
    return postcodeRegex.test(postcode);
};

/**
 * Returns a postcode format to a more consistent form by setting it to uppercase and removing spaces.
 * @param postcode
 */
const normalisePostcode = postcode => (postcode ? postcode.toUpperCase().replace(/\s/g, '').trim() : '');

const millisecondsPerDay = 86400000; // 24 * 60 * 60 * 1000

/**
 * This should removed soon. Once f-service contains this logic
 * (There's a ticket in the teams backlog).
 *
 * @param name
 * @param value
 * @param days
 */
const setCookie = (name, value, days) => {
    let expires = '';
    if (days) {
        const date = new Date();
        date.setTime(date.getTime() + (days * millisecondsPerDay));
        expires = `; expires=${date.toUTCString()}`;
    }
    document.cookie = `${name}=${(value || '') + expires}; path=/`;
};

/**
 * Returns a location object that contains previous searches from stored cookies.
 * Example return if a `je-location` cookie existed (from en-GB):
 *
 * {postcode: "AR511AR"}
 *
 * @returns Object
 */
const getLastLocation = () => window.document.cookie
    .split('; ')
    .reduce((location, data) => {
        const [name, value] = data.split('=');
        const [prefix, key] = name.split('_');
        if (prefix === 'je-last') {
            location[key] = value;
        } else if (prefix === 'je-location') {
            location.postcode = value;
        } else if (name === 'preferred_zip') {
            location.postcode = value;
        }
        return location;
    }, {});


const generatePostForm = (url, data) => {
    let html = '';
    const form = document.createElement('form');
    form.method = 'post';
    form.action = url;

    Object.keys(data).forEach(key => {
        html += `<input name="${key}" value="${data[key] || ''}" />`;
    });

    form.innerHTML = html;
    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);
};

/**
 * Sets `je-last_*` based cookies. The `name` param is based of the response from google.
 * For example: `city` or `sublocality` would be transformed to:
 *
 * 1. `je-last_city_used`
 * 2. `je-last_sublocality_used`
 *
 * TODO: Use universal cookie helper when consuming apps are ready.
 *
 * @param name
 * @param value
 */
const setJeCookie = (name, value) => setCookie(`je-last_${name}_used`, value
    ? value.toString().trim()
    : '', 365);

/**
 * Gets a specific cookie based on the cookie name you provide it.
 *
 * TODO: Use universal cookie helper when consuming apps are ready.
 *
 * @param name
 * @returns {*}
 */
const getCookie = name => {
    const nameEQ = `${name}=`;
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
};

/**
 * Wraps JSON.parse and returns null if it fails. Intended for use cases
 * where the input could be from an untrusted source and we dont want
 * malformed json throwing and halting execution.
 *
 * @param {string} json string
 * @returns {object}
 */
const safeParseJson = string => {
    try {
        return JSON.parse(string);
    } catch (e) {
        return null;
    }
};

/**
 * Remove whitespace from a string.
 *
 * @param {string} item string
 */
const removeWhitespace = item => item.trim().replace(/\s/g, '');


export {
    isPostcodeEmpty,
    doesPostcodeMatchRegex,
    normalisePostcode,
    setCookie,
    getCookie,
    getLastLocation,
    generatePostForm,
    setJeCookie,
    safeParseJson,
    removeWhitespace
};
