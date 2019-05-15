import React, { ChangeEvent } from 'react';
import { makeStyles } from '@material-ui/styles';
import { List, ListItem, ListItemText, TextField } from '@material-ui/core';
import functions from './functions';
import { Coordinate } from './model/Coordinate';
// import { useImmer } from 'use-immer';

const useStyles = makeStyles({
  list: {
    height: '500px',
    overflowY: 'auto',
    overflowX: 'hidden',
  },
  textFiled: {
    width: 200,
    display: 'flex',
    paddingLeft: 16,
  },
});

export interface FunctionProps {
  onClick: (v: Coordinate, i: null) => void;
  onMouseOver: (v?: string) => void;
}

interface FunctionState {
  functions: Array<Coordinate>;
}

function Function(props: FunctionProps) {
  const classes = useStyles();
  const { onClick, onMouseOver } = props;
  const initState: FunctionState = { functions }
  const [state, setState] = React.useState(initState as FunctionState);
  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value: string = e.target.value;
    const newFunctions: Array<Coordinate> = initState.functions.filter(o => {
      return o.value && !o.value.indexOf(value);
    });
    setState({
      ...state,
      functions: newFunctions
    });
  };
  return (
    <List className={classes.list} disablePadding>
      <div className={classes.textFiled}>
        <TextField label="value" onChange={onChange} margin="normal" />
      </div>
      {state.functions.map((v: Coordinate, i: number) => {
        return (
          <ListItem
            button
            alignItems="flex-start"
            key={'functions' + i}
            onClick={() => onClick(v, null)}
            onMouseOver={() => onMouseOver(v.value)}
          >
            <ListItemText primary={v.name} />
          </ListItem>
        );
      })}
    </List>
  );
}

export default Function;
