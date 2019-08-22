import { observer } from 'mobx-react';
import React from 'react';
import styles from './styles.module.css';
import checkedIcon from './checked.svg';
import EN from '../../constant/en';
import deleteDarkIcon from './delete-dark.svg';
interface Interface {
  toggleSelect:any
  ids:any
  actions:any
}

const Bar = observer((props:Interface)=>{
  const { toggleSelect, ids, actions } = props;
  return <div className={styles.bar}>
    <div className={styles.select}>
      <img className={styles.checked} onClick={toggleSelect} src={checkedIcon} alt="checked" />
      <span><span className={styles.count}>{ids.length}</span> {EN.Project}{ids.length > 1 && EN.Ss} {EN.Selected}</span>
    </div>
    <div className={styles.action}>
      <img onClick={actions.bind(null, "delete", ids)} src={deleteDarkIcon} alt="delete" />
    </div>
  </div>
});

export default Bar;
