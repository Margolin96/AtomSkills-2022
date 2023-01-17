import { useFetch, useMock, mock } from '@/api';

export default class Service {
  endpoints;

  mock;

  fetch = async (url, data, options) => {
    const endpoint = this.endpoints?.[Math.floor(Math.random() * this.endpoints.length)];
    if (!endpoint) return { status: -1, statusText: 'No endpoints specified' };
    return useFetch(`/${endpoint}/api${url}`, data, options);
  }

  get = (name, url, data) => {
    if (!mock && !this.mock[name]) return this.fetch(url, data, { method: 'GET' });
    return useMock(name);
  }

  post = (name, url, data) => {
    if (!mock && !this.mock[name]) return this.fetch(url, data, { method: 'POST' });
    return useMock(name);
  }
}
