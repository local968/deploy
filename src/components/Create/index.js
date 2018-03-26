import React from 'react';
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
  </div>
);

const Create = () => (
  <div className={styles.create}>
    <div className={styles.panel}>
      <h2 className={styles.title}>Create a Deployment Project</h2>
      <div className={styles.selected}>
        <span className={styles.selectedText}>Selected Model:</span>
        <span className={styles.modelName}>RandomForect.auto23</span>
      </div>
      <div className={styles.selections}>
        <a className={styles.new}>
          <div className={styles.iconWrapper}>
            <img className={styles.icon} src={createIcon} alt="create" />
          </div>
          <span className={styles.text}>Create a New Project</span>
        </a>
        <a className={styles.modify}>
          <div className={styles.iconWrapper}>
            <img className={styles.icon} src={replaceIcon} alt="replace" />
          </div>
          <span className={styles.text}>Modify an Existing Deployment</span>
        </a>
      </div>
      <a className={styles.back}>Back to The Training Project</a>
    </div>
  </div>
);

export { New, Create, Replace, CreateBackground };
