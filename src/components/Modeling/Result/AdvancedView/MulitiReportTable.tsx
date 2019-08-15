import { Table } from 'antd';
import * as React from 'react';
import styles from './AdvancedView.module.css'

interface Interface {
  data: any;
}

export default function MultiReportTable(props: Interface) {
  const {
    data: { names,precision,recall,support,'f1-score':F1Score},
  } = props;

  const columns = ['','Precision','Recall','F1-score','Support'].map(itm=>{
    return  {
      title: itm,
      width: 100,
      dataIndex: itm||"name",
      key: itm||"name",
    }
  });


  const data = [...new Set(names)].map((itm,index)=>{
    return {
      name:itm,
      Precision:precision[index].toFixed(2),
      Recall:recall[index].toFixed(2),
      Support:support[index],
      'F1-score':F1Score[index].toFixed(2),
    }
  });

  return <section
    className={styles.mytable}
  >
    <Table
      columns={columns}
      pagination={false}
      bordered={true}
      size={'small'}
      dataSource={data}
      scroll={{ y: 300 }} />
  </section>
}
