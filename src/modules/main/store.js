function parseServices(data) {
  return Object.fromEntries(
    Object
      .entries(data)
      .reduce((acc, [name, endpoints]) => acc.set(
        name,
        endpoints.map((v) => v.replace(/http.?:\/\//, '')),
      ), new Map()),
  );
}

let services;

try {
  services = JSON.parse(process.env.VUE_APP_SERVICES);
} catch (e) {
  services = {
    user: ['http://172.20.6.11:5678'],
    sync: ['http://172.20.6.12:5020'],
    claim: ['http://172.20.6.11:5213'],
  };
}

export default {
  namespaced: true,
  state: () => ({
    services: parseServices(services),
  }),
  mutations: {
    servicesSet(state, data) {
      if (!data) state.services = [];
      else state.services = parseServices(data);
    },

    userSet(state, data) {
      state.user = {
        ...data,
        _isAdmin: data.role === 'admin',
      };
    },
  },
  actions: {},
};
