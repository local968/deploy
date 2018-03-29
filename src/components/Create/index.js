import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { inject, observer } from 'mobx-react';
import styles from './styles.module.css';
import New from './New';
import Replace from './Replace';
import createIcon from './icon-create.svg';
import replaceIcon from './icon-replace.svg';

const CreateBackground = ({ children }) => (
  <div className={styles.background}>
    {Array(40)
      .fill(1)
      .map((value, index) => {
        const height = Math.random() * index * 3;
        return (
          <div
            key={height}
            className={styles.column}
            style={{ height: height + '%' }}
          />
        );
      })}
    <div className={styles.circle}>
      <span className={styles.number}>
        75<span className={styles.percent}>%</span>
      </span>
    </div>
    <div className={styles.bgImage} />
  </div>
);

@inject('approachStore')
@observer
class Create extends Component {
  render() {
    const { approachStore, match } = this.props;
    const currentApproach = approachStore.approaches[match.params.id - 1];
    const modelName = currentApproach && currentApproach.modelDeploy[0];
    return (
      <div className={styles.create}>
        <div className={styles.panel}>
          <h2 className={styles.title}>Create a Deployment Project</h2>
          <div className={styles.selected}>
            <span className={styles.selectedText}>Selected Model:</span>
            <span className={styles.modelName}>{modelName}</span>
          </div>
          <div className={styles.selections}>
            <Link className={styles.new} to={`/create/${match.params.id}/new`}>
              <div className={styles.iconWrapper}>
                <img className={styles.icon} src={createIcon} alt="create" />
              </div>
              <span className={styles.text}>Create a New Project</span>
            </Link>
            <Link
              className={styles.modify}
              to={`/create/${match.params.id}/replace`}
            >
              <div className={styles.iconWrapper}>
                <img className={styles.icon} src={replaceIcon} alt="replace" />
              </div>
              <span className={styles.text}>Modify an Existing Deployment</span>
            </Link>
          </div>
          <a className={styles.back}>Back to The Training Project</a>
        </div>
      </div>
    );
  }
}

export { New, Create, Replace, CreateBackground };
