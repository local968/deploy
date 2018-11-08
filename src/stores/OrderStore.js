import {observable, action, computed, toJS, when} from "mobx";
import {message as antdMessage} from 'antd';
import axios from 'axios';
import {runInAction} from 'mobx';

const host = process.env.NODE_ENV === 'development' ? 'http://loaclhost:54000' : 'http://community.r2.ai';

class OrderStore {

  @observable list = [];
  @observable total = 0;
  @observable orders = '';
  @observable limit = 12;
  @observable search = false;

  @action
  getOrderList(page) {
    axios.get(host + '/order/getList?page=' + page + '&pageSize=' + this.limit)
      .then(({list, total}) => runInAction(() => {
          this.list = list.map(JSON.parse);
          this.total = total;
        }
      )).catch(antdMessage.error);
  }

  @action
  getOrderByQuery(queryString, page = 1) {
    if (!queryString) {
      return antdMessage.error('content is not allowed empty');
    }
    axios.get(host + '/order/getListByQuery?query=' + queryString + '&page=' + page + '&pageSize=' + this.limit)
      .then(({list, total}) => runInAction(() => {
          this.list = list.map(JSON.parse);
          this.total = total;
          this.search = true;
        }
      )).catch(antdMessage.error);
  }
}

export default new OrderStore();
