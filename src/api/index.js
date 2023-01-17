/* eslint-disable import/no-dynamic-require */
/* eslint-disable global-require */

const API_URL = process.env.VUE_APP_SERVICES ? '/services' : 'http:/';
const MOCK_LATENCY = 10;

export const mock = false;

export async function useMock(name) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(require(`./mock/${name}`));
    }, MOCK_LATENCY);
  });
}

export async function useFetch(url, data, _options) {
  const { query, body } = data || {};
  const queryString = query ? `?${new URLSearchParams(query).toString()}` : '';

  const token = localStorage.getItem('token');
  const authorizationHeader = token ? { Authorization: `Bearer ${token}` } : {};

  const options = {
    method: 'POST',
    body: JSON.stringify(body),
    mode: 'cors', // no-cors, *cors, same-origin
    headers: {
      ...authorizationHeader,
      'Content-Type': 'application/json',
    },

    // cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
    // credentials: 'same-origin', // include, *same-origin, omit
    // redirect: 'follow', // manual, *follow, error
    // referrerPolicy: 'no-referrer', // no-referrer, *client

    ..._options,
  };

  const response = await fetch(`${API_URL}${url}${queryString}`, options)
    .catch((e) => ({ status: -1, statusText: e.message }));

  const { status } = response;
  let { statusText } = response;

  let isError = false;

  const { router } = window;

  switch (status) {
    case 200: break;
    case 401:
      isError = true;
      statusText = 'Неверный логин / пароль';
      if (router.currentRoute.value.name === 'login') break;
      else return router.push({ name: 'login' });
    default:
      isError = true;
  }

  let parsed;
  if (!isError) {
    const contentType = response.headers.get('content-type');
    parsed = (contentType && contentType.indexOf('application/json') !== -1)
      ? await response.json()
      : await response.text();
  }

  return {
    status, statusText, body: parsed, isError,
  };
}

export function setToken(token) {
  localStorage.setItem('token', token);
}
