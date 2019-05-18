import React, { ChangeEvent } from 'react';
import { makeStyles } from '@material-ui/styles';
import { List, ListItem, ListItemText, TextField } from '@material-ui/core';
import { Coordinate } from './model/Coordinate';
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
  variables: Array<Coordinate>
}

function Variables(props: VariablesProps) {
  const { handleClick, variables } = props;
  const classes = useStyles()
  const initState: VariablesState = { variables };
  const [state, setState] = React.useState(initState as VariablesState);
  const inputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newList: Array<Coordinate> = initState.variables.filter((o) => {
      return o.value && !o.value.indexOf(e.target.value);
    });
    setState({
      ...state,
      variables: newList
    })
  };
  return (
    <List className={classes.list} disablePadding>
      <div className={classes.textFiled}>
        <TextField
          label="value"
          onChange={inputChange}
          margin="normal"
        />
      </div>
      {_.map(state.variables, (v: Coordinate, i: number) => {
        return <ListItem style={{ padding: 20 }} button alignItems='flex-start' key={'functions' + i} onClick={handleClick.bind(null, v, null)}>
          <ListItemText primary={v.name} />
        </ListItem>
      })}
    </List>
  );
}

export default Variables;
