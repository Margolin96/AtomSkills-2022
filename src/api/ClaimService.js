import Service from '@/api/Service';

import { store } from '@/store';

export default class ClaimService extends Service {
  constructor(props) {
    super(props);

    this.endpoints = store.state.main.services?.claim;
    this.mock = {};
  }

  GetClaimList = (body) => this.post('GetClaimList', '/Claim/GetClaimList', { body });

  GetAllClaimTypes = () => this.get('GetAllClaimTypes', '/Utils/ClaimTypes');

  GetEnums = () => this.post('GetEnums', '/Utils/GetEnums');

  GetClaimById = (query) => this.post('GetClaimById', '/Claim/GetClaimById', { query });

  CreateClaim = (body) => this.post('CreateClaim', '/Claim/CreateClaim', { body });

  ToProcessing = (body) => this.post('ToProcessing', '/Claim/ToProcessing', { body });

  ToExecution = (body) => this.post('ToExecution', '/Claim/ToExecution', { body });

  ToWork = (body) => this.post('ToWork', '/Claim/ToWork', { body });

  ToPerformed = (body) => this.post('ToPerformed', '/Claim/ToPerformed', { body });

  ToRejected = (body) => this.post('ToRejected', '/Claim/ToRejected', { body });

  ToClarification = (body) => this.post('ToClarification', '/Claim/ToClarification', { body });

  GetRemainingSlaTime = (query) => this.get('GetRemainingSlaTime', '/Claim/GetRemainingSlaTime', { query });
}
