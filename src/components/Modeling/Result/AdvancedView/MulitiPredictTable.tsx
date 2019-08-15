import { Table } from 'antd';
import * as React from 'react';
import _ from 'lodash';
import styles from './AdvancedView.module.css'

interface Interface {
  project: any;
  data: any;
}

export default function MulitiPredictTable(props: Interface) {
  const {
    project: { targetArray, targetCounts, targetUnique },
    data: { matrix, error, error_0, error_1 },
  } = props;
  const title = targetArray
    ? targetArray
    : Object.keys(targetCounts).splice(0, targetUnique);
  const columns: any = [
    {
      title: ' ',
      width: 50,
      dataIndex: 'title_title',
      key: 'title_title',
      fixed: 'left',
    },
  ];

  title.forEach(itm => {
    columns.push({
      title: itm,
      width: 90,
      dataIndex: itm,
      key: itm,
    });
  });

  columns.push(
    ...[
      {
        title: 'Total',
        dataIndex: 'total_total',
        key: 'total_total',
        fixed: 'right',
      },
      {
        title: 'Error',
        dataIndex: 'error_error',
        key: 'error_error',
        fixed: 'right',
      },
    ],
  );
  const data = [];
  const _matrix = _.cloneDeep(matrix);
  const _title = [...title, 'Total'];
  _matrix.forEach((itm, index) => {
    const dt: any = {
      key: index,
      total_total: itm.pop(),
      title_title: _title[index],
      error_error: error_1[index],
    };
    title.forEach((it,ind) => {
      if(ind === index){
         return dt[it] = <strong>{itm.shift()}</strong>;
      }
      dt[it] = itm.shift();
    });
    data.push(dt);
  });

  const last_last = {
    key: 'last_last',
    title_title: 'Error',
    error_error: error,
  };
  title.forEach(it => {
    last_last[it] = error_0.shift();
  });
  data.push(last_last);
  return <section
    className={styles.mytable}
  >
    <Table
      columns={columns}
      pagination={false}
      size={'small'}
      dataSource={data}
      scroll={{ x: 300, y: 300 }} />
  </section>
}
