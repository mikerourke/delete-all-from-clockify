const qs = require("querystring");
const { isNil } = require("lodash");
const fetch = require("node-fetch");
const { CLOCKIFY_API_URL, API_DELAY, API_PAGE_SIZE } = require("./constants");
const { pause } = require("./utils");
const { apiKey } = require("../creds.json");

/**
 * Makes a fetch call to the Clockify API to the specified endpoint with
 * specified options.
 */
async function fetchFromClockify(endpoint, options) {
  const fullUrl = `${CLOCKIFY_API_URL}${endpoint}`;

  const requestOptions = {
    headers: {
      "X-Api-Key": apiKey,
      "Content-Type": "application/json",
    },
    ...options,
  };

  // Make sure the request body is stringified and the "Accept" header is
  // present (for POST request):
  if (!isNil(requestOptions.body)) {
    Object.assign(requestOptions.headers, {
      Accept: "application/json",
    });
    requestOptions.body = JSON.stringify(requestOptions.body);
  }

  try {
    const response = await fetch(fullUrl, requestOptions);
    return await response.json();
  } catch (err) {
    if (!/invalid json/.test(err.message)) {
      throw err;
    }
  }
}

async function fetchSingle(endpoint, options = {}, isObject = false) {
  let response;

  for (let attempt = 0; attempt < 5; attempt += 1) {
    try {
      response = await fetchFromClockify(endpoint, options);
      break;
    } catch (err) {
      if (err.code === 429) {
        await pause(API_DELAY);
      } else {
        throw err;
      }
    }
  }

  if (isNil(response)) {
    return isObject ? {} : [];
  }

  return response;
}

async function fetchPaginated(endpoint, options = {}) {
  let currentPage = 1;
  let keepFetching = true;

  const allEntities = [];

  while (keepFetching) {
    const query = qs.stringify({
      page: currentPage,
      "page-size": API_PAGE_SIZE,
    });
    const fullUrl = `${endpoint}?${query}`;

    const entities = await fetchSingle(fullUrl, options);
    keepFetching = entities.length === API_PAGE_SIZE;

    allEntities.push(...entities);
    await pause(API_DELAY);
    currentPage += 1;
  }

  return allEntities;
}

module.exports = {
  fetchPaginated,
  fetchSingle,
};
