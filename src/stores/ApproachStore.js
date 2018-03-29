import db from './db.js';
import { observable } from 'mobx';

class ApproachStore {
  @observable approaches = [];

  constructor() {
    db('approaches')
      .watch()
      .subscribe(approaches => (this.approaches = approaches));
  }
}

export default new ApproachStore();
