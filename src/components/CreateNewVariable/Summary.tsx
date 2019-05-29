import React from 'react';
import {Paper} from '@material-ui/core';
import {makeStyles} from '@material-ui/styles';
import details from './details';
import {Detail} from './model/Coordinate';
import FunctionTips from './FunctionTips'

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
  const {detailKey} = props;
  const current: Detail | undefined =
    details.find(d => d.name === detailKey);
  // console.log(current)
  return (
    <Paper className={classes.detail} elevation={0} square={true}>
      {
        current ?
          <div>
            <h3>{current.name}</h3>
            <p dangerouslySetInnerHTML={{__html:current.value}}/></div> :
          <FunctionTips value={detailKey}/>
      }
    </Paper>
  );
}

export default Summary;
