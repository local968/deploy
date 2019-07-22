import * as React from 'react';
import { makeStyles } from '@material-ui/styles';

const useStyles = makeStyles({
  card: {
    paddingBottom: 8,
    border: '1px solid #b5c2d8',
  },
});

interface InterfaceMuiCardProps {
  children: React.ReactNode;
}

export default function MuiCard(props: InterfaceMuiCardProps) {
  // initial styles
  const classes = useStyles({});

  const { children } = props;

  return <div className={classes.card}>{children}</div>;
}
