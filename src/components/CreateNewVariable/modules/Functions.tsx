import * as React from 'react';
import * as _ from 'lodash';

import { makeStyles } from '@material-ui/styles';

import {
  List,
  ListItem,
  ListItemText,
  TextField,
  InputAdornment,
  Collapse,
} from '@material-ui/core';

import { MuiCard } from './MuiModule';

import { Search, ExpandLess, ExpandMore } from '@material-ui/icons';

import EN from '../../../constant/en';

import { Coordinate } from '../types/Coordinate';

const useStyles = makeStyles({
  list: {
    height: 500,
    overflowY: 'auto',
  },
  textFiled: {
    width: '100%',
    marginTop: 8,
    padding: '0 1rem',
  },
  listItemTitle: {
    fontSize: '.875rem',
    fontWeight: 'bold',
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'Helvetica Neue', Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol'",
  },
  nested: {
    fontSize: '1rem',
    paddingLeft: '2rem',
  },
});

interface InterfaceFunctionProps {
  handleClick?;
  handleMouseOver?;
  functions?: { [key: string]: Array<Coordinate> };
}

interface InterfaceFunctionState {
  functions?: Array<Coordinate>;
  base: boolean;
  senior: boolean;
  filterStr: string;
}

function Functions(props: InterfaceFunctionProps) {
  // initial styles
  const classes = useStyles({});

  const { handleClick, handleMouseOver, functions } = props;

  // initial state
  const [state, setState] = React.useState({
    filterStr: '',
    base: true,
    senior: true,
  } as InterfaceFunctionState);

  const _onSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setState({
      ...state,
      filterStr: e.target.value,
    });
  };

  const onCosClick = (k: string) => {
    // const { [k]: value } = state;
    // setState({ ...state, [k]: !value });
  };

  // filter
  const values = _.mapValues(functions, v =>
    _.filter(v, ({ value }) => {
      const str = state.filterStr.toLowerCase();
      return value && value.toLowerCase().includes(str);
    }),
  );

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
        {_.map(values, (v, i) => (
          <div key={i}>
            <ListItem component={'div'} button onClick={() => onCosClick(i)}>
              <ListItemText
                primary={Reflect.get(EN, i)}
                className={classes.listItemTitle}
                disableTypography={true}
              />
              {state[i] ? <ExpandMore /> : <ExpandLess />}
            </ListItem>
            <Collapse in={state[i]} unmountOnExit>
              <List component={'div'} disablePadding dense>
                {_.map(v, (val: Coordinate, index: number) => {
                  return (
                    <ListItem
                      component={'div'}
                      button
                      key={`${i}-${index}`}
                      className={classes.nested}
                      onClick={handleClick.bind(this, val.value)}
                      onMouseOver={handleMouseOver.bind(this, val.value)}
                    >
                      <ListItemText primary={val.name} />
                    </ListItem>
                  );
                })}
              </List>
            </Collapse>
          </div>
        ))}
      </List>
    </MuiCard>
  );
}

export default Functions;
