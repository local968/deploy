import * as React from 'react';

import { makeStyles } from '@material-ui/styles';

import { MuiCard } from './MuiModule';
import { Paper } from '@material-ui/core';

import details from '../details';

import { Detail } from '../types/Coordinate';
import FunctionTips from '../FunctionTips';

const useStyles = makeStyles({
  detail: {
    height: 426,
    overflowY: 'auto',
    overflowX: 'hidden',
    textAlign: 'left',
    margin: '.75rem 0',
    padding: '1rem',
  },
});

export interface SummaryProps {
  detailKey: string;
}

function Summary(props: SummaryProps) {
  const classes = useStyles({});

  const { detailKey } = props;

  const current: Detail | undefined = details.find(d => d.name === detailKey);

  return (
    <MuiCard>
      <Paper className={classes.detail} elevation={0} square={true}>
        {current ? (
          <>
            <h3>{current.name}</h3>
            <p dangerouslySetInnerHTML={{ __html: current.value }} />
          </>
        ) : (
          <FunctionTips value={detailKey} />
        )}
      </Paper>
    </MuiCard>
  );
}

export default Summary;
