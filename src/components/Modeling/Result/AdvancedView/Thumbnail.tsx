import React, { ReactElement, useEffect, useState } from 'react';
import styles from './DetailCurves.module.css';

interface Interface {
  readonly curSelected: any;
  readonly value: any;
  readonly thumbnail: any;
  readonly onClick: any;
  readonly style?: Object;
}

export default function Thumbnail(props: Interface): ReactElement {
  const {
    curSelected,
    value,
    thumbnail: { selectedIcon, normalIcon, text },
    onClick,
    style = {},
  } = props;
  const [clickActive, upClickActive] = useState(curSelected === value);

  useEffect(() => {
    upClickActive(curSelected === value);
  }, [curSelected, value]);

  const handleClick = e => {
    e.stopPropagation();
    upClickActive(true);
    onClick(value);
  };

  const icon = clickActive ? selectedIcon : normalIcon;
  return (
    <div className={styles.thumbnail} style={style} onClick={handleClick}>
      <img src={icon} alt="icon" />
      <div>{text}</div>
    </div>
  );
}
