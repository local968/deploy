import React from 'react';
import styles from './styles.module.css';

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

export default CreateBackground;
