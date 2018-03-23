import React from 'react';
import styles from './styles.module.css';
import New from './New';
import Replace from './Replace';

const CreateBackground = ({ children }) => (
  <div className={styles.background}>{children}</div>
);

const Create = () => (
  <div className={styles.create}>
    <span>create</span>
  </div>
);

export { New, Create, Replace, CreateBackground };
