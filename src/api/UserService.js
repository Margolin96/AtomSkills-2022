import Service from '@/api/Service';

import { setToken } from '@/api/index';

import { store } from '@/store';

export default class UserService extends Service {
  constructor(props) {
    super(props);

    this.endpoints = store.state.main.services?.user;
    this.mock = {};
  }

  GetAllUsers = () => this.get('GetAllUsers', '/User/GetAllUsers');

  CheckAdmin = () => this.get('CheckAdmin', '/User/CheckAdmin');

  GetCurrentUser = () => this.get('GetCurrentUser', '/User/GetCurrentUser');

  GetAllRoles = () => this.get('GetAllRoles', '/Role/GetAllRoles');

  SearchUsers = (body) => this.post('SearchUsers', '/User/SearchUsers', { body });

  Login = async (data) => {
    const response = await this.post('Login', '/Login', { query: data });
    const { status, body } = response;
    if (status === 200) {
      setToken(body);
    }
    return response;
  }

  Logout = async () => {
    localStorage.removeItem('token');
    return this.post('Logout', '/Logout');
  }

  Update = (body) => this.post('Update', '/User/Update', { body });

  Create = (body) => this.post('Create', '/User/Create', { body });

  SetPassword = (query) => this.post('SetPassword', '/User/SetPassword', { query });

  GetUser = (query) => this.get('GetUser', '/User/GetUser', { query });
}
