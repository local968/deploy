import React, {Component} from 'react';
import {Table} from 'antd';
import moment from 'moment';
import {inject, observer} from 'mobx-react';
import {observable} from 'mobx';
import btn from './btn.svg'
import styles from './styles.module.css';
import {Input, message as antdMessage} from 'antd';

const {Column} = Table;

const formatType = "YYYY-MM-DD HH:mm:ss";

const renderOrderType = (value) => value === 'month' ? '月付' : '年付';

const renderTime = (time, type = formatType) => {
  let text = time ? moment(Number(time) * 1000).format(formatType) : '-';
  return <div>{text}</div>;
};

const renderPayStatus = (paidId) => paidId ? '已付款' : '未支付';

@observer
@inject("orderStore")
export default class OrderManage extends Component {
  constructor(props) {
    super(props);
    props.orderStore.getOrderList(1);
  }

  @observable selectedIds = [];
  @observable queryString = '';

  onChange = (selectedRowKeys, selectedRows) => this.selectedIds = selectedRows.map(v => v.id);

  changePage = (page) => {
    const {orderStore, search} = this.props;
    search ? orderStore.getOrderList(this.queryString, page) :
      orderStore.getOrderList(page);
  };

  getOrderByQuery = () => {
    this.props.orderStore.getOrderByQuery(this.queryString);
  };

  render() {
    const {list, total} = this.props.orderStore;
    const rowSelection = {onChange: this.onChange};
    const pagination = {
      onChange: this.changePage,
      total
    };
    return (
      <div className={styles.content}>
        <div className={styles.header}>欢迎来到订单管理系统!</div>
        <div>
          <Input className={styles.input}
                 onChange={e => this.queryString = e.target.value} placeholder="请输入用户名或订单ID查询"/>
          <label onClick={this.getOrderByQuery}><img src={btn}/></label>
        </div>
        <div>
          <Table rowSelection={rowSelection} pagination={pagination}
                 dataSource={list} rowKey="id" scroll={{x: 2400}}>
            <Column title="订单ID" dataIndex="id" key="id"/>
            <Column title="客户名称" dataIndex="username" key="companyName"/>
            <Column title="客户ID" dataIndex="userID" key="userID"/>
            <Column title="产品名称" dataIndex="productName" key="productName"/>
            <Column title="产品ID" dataIndex="productId" key="productId"/>
            <Column title="订购数量" dataIndex="duration" key="duration"/>
            <Column title="订购单价" dataIndex="price" key="price"/>
            <Column title="订购金额" dataIndex="totalPrice" key="totalPrice"/>
            <Column title="下单时间" dataIndex="startTime" key="startTime" render={renderTime}/>
            <Column title="付款到期日" dataIndex="endTime" key="endTime" render={renderTime}/>
            <Column title="付款状态" dataIndex="paidId" key="paidId" render={renderPayStatus}/>
            <Column title="联系人" dataIndex="username" key="username"/>
            <Column title="订购类型" dataIndex="orderType" key="orderType" render={renderOrderType}/>
            <Column title="电话" dataIndex="phone" key="phone"/>
            <Column title="邮件" dataIndex="email" key="email"/>
            <Column title="账户开始时间" dataIndex="createTime" key="createTime" render={renderTime}/>
          </Table>
        </div>
        <div className={styles.operate}>
          <a download="selectedOrder.csv"
             href={'http://localhost:54000/order/downloadOrder?orderIds=' + this.selectedIds.join(',')}>下载已选订单</a>
          <a href={'http://localhost:54000/order/downloadOrder?all=true'} download="orders.csv">下载所有订单</a>
        </div>
      </div>
    )
  }
};
