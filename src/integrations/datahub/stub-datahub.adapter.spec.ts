import { runDataHubAdapterContract } from './datahub.adapter.contract.js';
import { StubDataHubAdapter } from './stub-datahub.adapter.js';

runDataHubAdapterContract(() => new StubDataHubAdapter());
