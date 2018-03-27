import React from 'react';
import styles from './styles.module.css';

export default props => {
  const className = (props.className || '') + ' ' + styles.blackButton;
  const _props = { ...props, className };
  return <button {..._props} />;
};
