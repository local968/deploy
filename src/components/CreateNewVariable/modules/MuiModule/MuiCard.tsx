import * as React from 'react';
import { makeStyles } from '@material-ui/styles';

const useStyles = makeStyles({
  card: {
    paddingBottom: '.5rem',
    border: '1px solid #b5c2d8',
  },
});

interface InterfaceMuiCardProps {
  children: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
}

export default function MuiCard(props: InterfaceMuiCardProps) {
  // initial styles
  const classes = useStyles({});

  const { children, style, className } = props;

  return (
    <div className={`${classes.card} ${className}`} style={style}>
      {children}
    </div>
  );
}
