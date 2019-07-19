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
    const { [k]: value } = state;
    setState({ ...state, [k]: !value });
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
        {_.map(values, (v: Coordinate, k: number) => {
          return (
            <ListItem
              button
              component={'div'}
              key={k}
              onClick={() => onCosClick(k)}
            >
              <ListItemText primary={Reflect.get(EN, k)} />
              {state[k] ? <ExpandMore /> : <ExpandLess />}

              {/*<Collapse in={state[k]} unmountOnExit key={k + 'col'}>*/}
              {/*  <List disablePadding>*/}
              {/*    {_.map(v, (coor: Coordinate, i: number) => {*/}
              {/*      return (*/}
              {/*        <ListItem*/}
              {/*          button*/}
              {/*          component={'div'}*/}
              {/*          key={i}*/}
              {/*          className={classes.nested}*/}
              {/*        >*/}
              {/*          <ListItemText primary={coor.name} />*/}
              {/*        </ListItem>*/}
              {/*      );*/}
              {/*    })}*/}
              {/*  </List>*/}
              {/*</Collapse>*/}
            </ListItem>
          );
        })}
      </List>
    </MuiCard>
  );
}

export default Functions;
