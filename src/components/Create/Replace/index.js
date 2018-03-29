import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { Link } from 'react-router-dom';
import { Icon } from 'antd';
import styles from './styles.module.css';
import { BlackButton } from 'components/Common';
import List from './list';

@inject('approachStore', 'deployStore')
@observer
export default class Replace extends Component {
  render() {
    const { approachStore, deployStore, match } = this.props;
    console.log(deployStore);
    const currentApproach = approachStore.approaches[match.params.id - 1];
    const modelName = currentApproach && currentApproach.modelDeploy[0];
    return (
      <div className={styles.replace}>
        <Link className={styles.back} to={`/create/${match.params.id}`}>
          <Icon className={styles.icon} type="arrow-left" />
        </Link>
        <h2 className={styles.title}>Replace an Existing Project</h2>
        <div className={styles.selected}>
          <span className={styles.selectedText}>Selected Model:</span>
          <span className={styles.modelName}>{modelName}</span>
        </div>
        <List />
        <div className={styles.gap} />
        <div className={styles.confirm}>
          <BlackButton>Modify the Project</BlackButton>
        </div>
      </div>
    );
  }
}
