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
    fontWeight: 'bold',
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
  nested: {
    paddingLeft: 44,
  },
});

interface InterfaceFunctionProps {
  onClick?: (v: Coordinate, i: null) => void;
  onMouseOver?: (v?: string) => void;
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

  const { onClick, onMouseOver, functions } = props;

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
        {_.map(values, (v, i) => (
          <div key={i}>
            <ListItem
              button
              component={'div'}
              onClick={() => onCosClick(i)}
            >
              <ListItemText primary={Reflect.get(EN, i)} className={classes.listItemTitle} disableTypography={true}/>
              {state[i] ? <ExpandMore /> : <ExpandLess />}
            </ListItem>
            <Collapse in={state[i]} unmountOnExit>
              <List component={'div'} dense disablePadding>
                {_.map(v, (val: Coordinate, index: number) => {
                  return (
                    <ListItem
                      button
                      component={'div'}
                      key={`${i}-${index}`}
                      className={classes.nested}
                      onMouseOver={() => onMouseOver(val.value)}
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
