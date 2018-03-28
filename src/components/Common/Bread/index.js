import React from 'react';
import styles from './styles.module.css';

export default ({ list }) => (
  <div className={styles.bread}>
    {list &&
      list.map((link, index) => (
        <a
          key={link.name || link}
          href={link.href || ''}
          className={index === list.length - 1 ? styles.current : styles.link}
        >
          {link.name || link}
        </a>
      ))}
  </div>
);
