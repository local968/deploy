import React from 'react';
import styles from './styles.module.css';
import New from './New';
import Replace from './Replace';

const CreateBackground = ({ children }) => (
  <div className={styles.background}>
    <div className={styles.columns}>
      {Array(30)
        .fill(1)
        .map((value, index) => {
          const height = Math.random() * index * 4;
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
    <div>{children}</div>
  </div>
);

const Create = () => (
  <div className={styles.create}>
    <span>create</span>
  </div>
);

export { New, Create, Replace, CreateBackground };
