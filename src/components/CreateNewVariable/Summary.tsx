import React from 'react';
import { Paper } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import details from './details';
import { Detail } from './model/Coordinate';

const useStyles = makeStyles({
  detail: {
    height: '500px',
    overflowY: 'auto',
    overflowX: 'hidden',
    textAlign: 'left',
    paddingLeft: 16,
  },
});

export interface SummaryProps {
  detailKey: string;
}

function Summary(props: SummaryProps) {
  const classes = useStyles();
  const { detailKey } = props;
  const defaultDetail: Detail = {
    name: '',
    value: '',
  };
  const current: Detail =
    details.find(d => d.name === detailKey) || defaultDetail;
  return (
    <Paper className={classes.detail} elevation={0} square={true}>
      <h3>{current.name}</h3>
      <p>{current.value}</p>
    </Paper>
  );
}

export default Summary;
