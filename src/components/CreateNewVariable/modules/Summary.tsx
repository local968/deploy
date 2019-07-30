import * as React from 'react';

import { makeStyles } from '@material-ui/styles';

import { MuiCard } from './MuiModule';
import { Paper } from '@material-ui/core'
import Description from '../FunctionDescription';

const useStyles = makeStyles({
  detail: {
    height: 426,
    overflowY: 'auto',
    overflowX: 'hidden',
    textAlign: 'left',
    margin: '.75rem 0',
    padding: '0 1.5rem',
  },
});

export interface SummaryProps {
  detailKey: string;
}

function Summary(props: SummaryProps) {
  const classes = useStyles({});

  const { detailKey } = props;

  return (
    <MuiCard>
      <Paper className={classes.detail} elevation={0} square={true}>
        <Description funcName={detailKey}/>
      </Paper>
    </MuiCard>
  );
}

export default Summary;
