import { observer } from 'mobx-react';
import React, { Component } from 'react';
import styles from './styles.module.css';
import EN from '../../constant/en';
import { Search, Select, Pagination} from 'components/Common';

interface Interface {
  toolsOption:any
  total:any
  changeOption:any
  changePage:any
  keywords:any
  changeWords:any
}
@observer
export default class Tools extends Component<Interface> {
  render() {
    const { toolsOption, total, changeOption, changePage, keywords, changeWords } = this.props;
    return <div className={styles.tools}>
      <Search
        value={keywords}
        onChange={changeWords}
      />
      <Select
        title={EN.SortBy}
        autoWidth={null}
        options={{
          createTime: EN.LastCreated,
          updateTime: EN.LastModified,
        }}
        value={toolsOption.sort}
        onChange={changeOption.bind(null, "sort")}
      />
      <Select
        title={EN.ProPerPage}
        autoWidth
        options={{
          5: 5,
          10: 10,
          20: 20
        }}
        value={toolsOption.limit}
        onChange={(v) => {
          changeOption("limit",v );
          changePage(1)
        }
        }
      />
      <Pagination
        current={toolsOption.current}
        pageSize={toolsOption.limit}
        total={total}
        onChange={changePage}
      />
    </div>
  }
}
