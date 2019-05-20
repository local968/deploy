import React, {ChangeEvent, useState} from 'react';
import {makeStyles} from '@material-ui/styles';
import {List, ListItem, ListItemText, TextField, Collapse} from '@material-ui/core';
import {ExpandLess, ExpandMore} from '@material-ui/icons';
import {Coordinate} from './model/Coordinate';
import {flatten, values, map} from 'lodash'
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
  nested: {
    paddingLeft: 44,
  }
});

export interface FunctionProps {
  onClick: (v: Coordinate, i: null) => void;
  onMouseOver: (v?: string) => void;
  functions: object
}

// interface FunctionState {
//   functions: Array<Coordinate>;
//   base: boolean
//   senior: boolean
// }


function Function(props: FunctionProps) {
  const classes = useStyles();
  const {onClick, onMouseOver, functions} = props;
  const flattenFuncs = flatten(values(functions));
  const initState: any = {functions: flattenFuncs, base: true, senior: true};
  const [state, setState] = React.useState(initState as any);
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
  const onCosClick = (k: string) => {
    const {[k]: value} = state;
    setState({...state, [k]: !value})
  }

  return (
    <List className={classes.list} disablePadding>
      <div className={classes.textFiled}>
        <TextField label="value" onChange={onChange} margin="normal"/>
      </div>
      {
        map(functions, (v, k) => <div key={k + 'div'}>
            <ListItem onClick={() => onCosClick(k)} key={k}>
              <ListItemText primary={k}/>
              {state[k] ? <ExpandMore/> : <ExpandLess/>}
            </ListItem>
            <Collapse in={state[k]} unmountOnExit key={k + 'col'}>
              <List disablePadding>
                {
                  map(v, (coor: Coordinate, i: number) => {
                    return (
                      <ListItem
                        key={'functions' + i}
                        className={classes.nested}
                        onClick={() => onClick(coor, null)}
                        onMouseOver={() => onMouseOver(coor.value)}
                      >
                        <ListItemText primary={coor.name}/>
                      </ListItem>
                    );
                  })
                }
              </List>
            </Collapse>
          </div>
        )
      }
    </List>
  );
}

export default Function;
