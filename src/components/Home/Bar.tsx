import { observer } from 'mobx-react';
import React, { Component } from 'react';
import styles from './styles.module.css';
import checkedIcon from './checked.svg';
import EN from '../../constant/en';
import deleteDarkIcon from './delete-dark.svg';
interface Interface {
  toggleSelect:any
  ids:any
  actions:any
}
@observer
export default class Bar extends Component<Interface> {
  render() {
    const { toggleSelect, ids, actions } = this.props;
    return <div className={styles.bar}>
      <div className={styles.select}>
        <img className={styles.checked} onClick={toggleSelect} src={checkedIcon} alt="checked" />
        <span><span className={styles.count}>{ids.length}</span> {EN.Project}{ids.length > 1 && EN.Ss} {EN.Selected}</span>
      </div>
      <div className={styles.action}>
        <img onClick={actions.bind(null, "delete", ids)} src={deleteDarkIcon} alt="delete" />
      </div>
    </div>
  }
}
