import React, {ChangeEvent} from 'react';
import {makeStyles} from '@material-ui/styles';
import {List, ListItem, ListItemText, TextField} from '@material-ui/core';
import {Coordinate} from './model/Coordinate';
import _ from 'lodash'
// import { useImmer } from 'use-immer';

const useStyles = makeStyles({
  list: {
    height: "500px",
    overflowY: "auto",
    overflowX: "hidden"
  },
  textFiled: {
    width: 200,
    display: 'flex',
    paddingLeft: 16
  }
})

interface VariablesProps {
  handleClick: (v: Coordinate, i: null) => void;
  variables: Array<Coordinate>;
}

interface VariablesState {
  filterStr: string
}

function Variables(props: VariablesProps) {
  const {handleClick, variables} = props;
  const classes = useStyles()
  const [state, setState] = React.useState({filterStr: ''});
  const inputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setState({
      ...state,
      filterStr: e.target.value
    })
  };
  const {filterStr} = state;
  const validVariable = variables.filter((o) => {
    return o.value && !o.value.indexOf(filterStr);
  })
  return (
    <List className={classes.list} disablePadding>
      <div className={classes.textFiled}>
        <TextField
          label="value"
          onChange={inputChange}
          margin="normal"
        />
      </div>
      {_.map(validVariable, (v: Coordinate, i: number) => {
        return <ListItem style={{padding: 20}} button alignItems='flex-start' key={'functions' + i}
                         onClick={handleClick.bind(null, v, null)}>
          <ListItemText primary={v.name}/>
        </ListItem>
      })}
    </List>
  );
}

export default Variables;
