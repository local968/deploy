import * as React from 'react';
import * as _ from 'lodash';

import { makeStyles } from '@material-ui/styles';

import {
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  TextField,
  InputAdornment,
} from '@material-ui/core';

import { MuiCard } from './MuiModule';

import { Search } from '@material-ui/icons';

import { Coordinate } from '../types/Coordinate';

const useStyles = makeStyles({
  list: {
    height: 500,
    overflowY: 'auto',
  },
  textFiled: {
    width: '100%',
    marginTop: 8,
    padding: '0 16px',
  },
  textBadge: {
    display: 'inline-block',
    color: '#0DB3A6',
    background: 'rgba(13,179,166,.1)',
    padding: '0 8px',
    borderRadius: 10,
  },
});

interface VariablesProps {
  handleClick: (v: Coordinate, i: null) => void;
  variables: Array<Coordinate>;
}

function Variables(props: VariablesProps) {
  // initial styles
  const classes = useStyles({});

  const { handleClick, variables } = props;

  // initial state
  const [state, setState] = React.useState({ filterStr: '' });

  const _onSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setState({
      ...state,
      filterStr: e.target.value,
    });
  };

  // filter variable's function
  const values = variables.filter(o => {
    const str = state.filterStr.toLowerCase();
    return o.name && o.name.toLowerCase().indexOf(str) > -1;
  });

  return (
    <MuiCard>
      <TextField
        className={classes.textFiled}
        onChange={_onSearch}
        margin="normal"
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search />
            </InputAdornment>
          ),
        }}
      />
      <List component={'div'} dense disablePadding className={classes.list}>
        {_.map(values, (v: Coordinate, i: number) => (
          <ListItem
            button
            component={'div'}
            key={i}
            onClick={handleClick.bind(null, v, null)}
          >
            <ListItemText primary={v.name} />
            <ListItemSecondaryAction>
              <span className={classes.textBadge}>连续变量</span>
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>
    </MuiCard>
  );
}

export default Variables;
