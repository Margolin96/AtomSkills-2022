import Service from '@/api/Service';

import { store } from '@/store';

export default class SyncService extends Service {
  constructor(props) {
    super(props);

    this.endpoints = store.state.main.services?.sync;
    this.mock = {};
  }

  Synchronize = () => this.post('Sync', '/Synchronize');
}
