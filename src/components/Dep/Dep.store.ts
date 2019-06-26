import { modelTableStore } from './ModelTable.store';
import { deployTableStore } from './DeployTable.store';
import { observable } from 'mobx';

export class CommonStore {
  @observable
  show: string = 'aa';
}

export class DepStore {
  commonStore: any;
  modelTableStore: any;
  deployTableStore: any;

}

export const depStore = new DepStore();
