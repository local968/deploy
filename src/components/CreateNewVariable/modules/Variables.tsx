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
import { blue, cyan, orange } from '@material-ui/core/colors';

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
  textBadge: {
    display: 'inline-block',
    paddingRight: '0.5rem',
    paddingLeft: '0.5rem',
    borderRadius: '0.75rem',
    fontSize: '0.875rem',
    color: '#000',
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'Helvetica Neue', Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol'",
  },
  categorical: {
    backgroundColor: blue[100],
  },
  numerical: {
    backgroundColor: cyan[100],
  },
  raw: {
    backgroundColor: orange[100],
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
            component={'div'}
            button
            key={i}
            onClick={handleClick.bind(null, v, null)}
          >
            <ListItemText primary={v.name} />
            <ListItemSecondaryAction>
              <span className={`${classes.textBadge} ${classes[v.varType]}`}>
                {v.varType}
              </span>
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>
    </MuiCard>
  );
}

export default Variables;
