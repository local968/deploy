import * as React from 'react';
import * as _ from 'lodash';

import { makeStyles } from '@material-ui/styles';

import {
  List,
  ListItem,
  ListItemText,
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
    marginTop: '0.5rem',
    padding: '0 1rem',
  },
  primary: {
    fontSize: '1rem',
  },
  secondary: {
    color: 'rgba(0, 0, 0, 0.4)',
  },
});

interface VariablesProps {
  handleClick;
  variables: Array<Coordinate>;
}

function Variables(props: VariablesProps) {
  // initial styles
  const classes = useStyles({});

  const { handleClick, variables } = props;

  // initial state
  const [state, setState] = React.useState({ filterStr: '' });

  // search variable
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
        margin={'normal'}
        className={classes.textFiled}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search />
            </InputAdornment>
          ),
        }}
        onChange={_onSearch}
      />
      <List
        component={'div'}
        disablePadding
        dense={true}
        className={classes.list}
      >
        {_.map(values, (v: Coordinate, i: number) => (
          <ListItem
            component={'li'}
            button
            key={i}
            onClick={handleClick.bind(this, v)}
          >
            <ListItemText
              primary={v.name}
              secondary={v.varType}
              classes={{
                primary: classes.primary,
                secondary: classes.secondary,
              }}
            />
          </ListItem>
        ))}
      </List>
    </MuiCard>
  );
}

export default Variables;
