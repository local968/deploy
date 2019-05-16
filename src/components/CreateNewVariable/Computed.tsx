import React from 'react';
import {
  Paper,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Typography
} from '@material-ui/core';
// import { useImmer } from 'use-immer';
import Funcions from './Funcions';
import Variables from './Variables';
import Summary from './Summary';
import Expressions from './Expressions';
import {Exp, Type, Coordinate} from './model/Coordinate';
import {withStyles} from '@material-ui/core/styles';
import {string} from "prop-types";

const OPARRAY = ['+', '-', '*', "/"]

const useStyles = withStyles({
  root: {
    flexGrow: 1,
  },
  paper: {
    padding: 0,
    textAlign: 'center'
  },
  top: {
    zIndex: 10,
  },
  actions: {
    margin: '0 8px'
  },
  save: {
    backgroundImage: 'linear-gradient(to bottom, #5b657b, #243448)',
    color: '#fff',
    border: '1px solid transparent',
    minWidth: '120px'
  },
  cancel: {
    backgroundColor: '#fff',
    color: '#27374B',
    border: '1px solid #27374B',
    minWidth: '120px',
    marginLeft: '15px'
  }
});

interface ComputedProps {
  classes: any,
  onClose: () => void,
  addNewVariable: (variableName: string, variables: Array<string>, exp: string, type: string) => void,
}

export interface ComputedState {
  exps: Array<Exp>;
  detailKey: string;
  index: number
}

function initExp(): Exp {
  return {value: [], label: '', range: [0, 0]}
}

function Computed(props: ComputedProps) {
  const {classes, onClose, addNewVariable} = props
  const [state, setState] = React.useState({
    exps: [initExp()],
    detailKey: '',
    index: 0
  } as ComputedState)

  const handleFunction = (func: Coordinate, startIndex: number | null) => {
    const {exps, index} = state;
    const LPAREN: Coordinate = {
      value: '(',
      name: '(',
      type: Type.Lparen,
    };
    const RPAREN: Coordinate = {
      value: ')',
      name: ')',
      type: Type.Rparen,
    };
    const newExp: Exp = exps[index]
    const {range: [start, end], value} = newExp
    const curStart: number = typeof startIndex === 'number' ? startIndex : start
    newExp.value = [
      ...value.slice(0, curStart),
      func,
      LPAREN,
      RPAREN,
      ...value.slice(end),
    ];
    newExp.range = [curStart + 2, curStart + 2];
    exps[index] = newExp
    setState({
      ...state,
      exps
    })
    // setState((state: ComputedState) => {
    //   state.exps[index] = newExp;
    //   // state.range = [start + 2, start + 2];
    //   return state;
    // });
  };

  const handleVariables = (v: Coordinate, startIndex: number | null) => {
    const {exps, index} = state;
    const newExp: Exp = exps[index]
    const {range: [start, end], value} = newExp
    const curStart: number = typeof startIndex === 'number' ? startIndex : start

    const splitValue: Coordinate = {
      name: ',',
      value: ',',
      type: Type.Split
    }

    const pre: Coordinate | undefined = [...value.slice(0, start)].pop()
    const next: Coordinate | undefined = [...value.slice(end)].shift()
    let before: Coordinate | undefined, after: Coordinate | undefined
    if (!!pre && (pre.type === Type.ID || pre.type === Type.Number || pre.type === Type.Char)) before = splitValue
    if (!!next && (next.type === Type.ID || next.type === Type.Number || next.type === Type.Char)) after = splitValue
    const arr: Array<Coordinate> = []
    if (before) arr.push(before)
    arr.push(v)
    if (after) arr.push(after)
    const n: number = 1 + (!!before ? 1 : 0)

    newExp.value = [...value.slice(0, curStart), ...arr, ...value.slice(end)];
    newExp.range = [curStart + n, curStart + n];
    exps[index] = newExp
    setState({
      ...state,
      exps
    })
    // setState((state: ComputedState) => {
    //   state.exps[index] = newExp;
    //   // state.range = [start + 1, start + 1];
    //   return state;
    // });
  };

  const onMouseOver = (v?: string) => {
    setState({
      ...state,
      detailKey: v || ''
    })
    // setState((state: ComputedState) => {
    //   state.detailKey = v || '';
    //   return state;
    // });
  };

  const setIndex = (k: number) => {
    console.log(k, 5555)
    setState({
      ...state,
      index: k
    })
    // setState((state: ComputedState) => {
    //   state.index = k;
    //   return state;
    // });
  }

  const addLine = () => {
    const {exps} = state
    exps.push(initExp())
    setState({
      ...state,
      exps
    })
    // setState((state: ComputedState) => {
    //   state.exps.push(initExp())
    //   return state;
    // });
  }

  const deleteIndex = (k: number) => {
    if (k === 0) return
    const {exps, index} = state
    exps.splice(k, 1)
    setState({
      ...state,
      exps,
      index: Math.min(index, exps.length - 1)
    })
    // setState((state: ComputedState) => {
    //   // const exps = state.exps
    //   const exps = state.exps.filter((...args) => args[1] !== k)
    //   // state.exps = exps
    //   const index = Math.min(state.index, exps.length - 1)
    //   console.log(exps.length - 1, index, "state.index !!!!!!!!!!!!!!")
    //   console.log({ ...state, ...{ exps, index } })
    //   return { ...state, ...{ exps, index } };
    // });
  }

  const deleteExp = () => {
    const {exps, index} = state;
    const exp: Exp = exps[index]
    const {range: [start, end]} = exp
    if (end <= 0) return;
    const newExp: Array<Coordinate> = [...exp.value];
    const isEq: boolean = start === end
    const _index: number = start + (isEq ? -1 : 0)
    //没有拖选
    if (isEq) {
      newExp.splice(start - 1, 1);
    } else {
      newExp.splice(start, end - start);
    }
    exps[index].value = newExp
    exps[index].range = [_index, _index]
    setState({
      ...state,
      exps
    });
  };

  const changeExpLabel = (v: string) => {
    const {exps, index} = state;
    const exp = exps[index];
    exps[index].label = v;
    setState({
      ...state,
      exps
    });
  };

  const addExp = (v: string) => {
    const {exps, index} = state;
    const exp = exps[index]
    let {range: [start, end]} = exp
    console.log(exps, index, 99999)
    const isNumber: boolean = !isNaN(parseFloat(v))
    const isOp: boolean = OPARRAY.includes(v)
    const isLParen: boolean = v === '('
    const isRParen: boolean = v === ')'
    const isSplit: boolean = v === ','
    const type: Type = isNumber ? Type.Number : isOp ? Type.Op : isLParen ? Type.Lparen : isRParen ? Type.Rparen : isSplit ? Type.Split : Type.Char
    let value: Coordinate = {
      name: v,
      value: v,
      type
    }
    const splitValue: Coordinate = {
      name: ',',
      value: ',',
      type: Type.Split
    }

    const pre: Coordinate | undefined = [...exp.value.slice(0, start)].pop()
    const next: Coordinate | undefined = [...exp.value.slice(end)].shift()
    let before: Coordinate | undefined, after: Coordinate | undefined
    if (!isSplit) {
      if (!!pre) {
        if (pre.type === Type.ID) {
          before = splitValue
        } else {
          if (pre.type === Type.Number && !isNumber) {
            // if (isNumber) {
            //   value = {
            //     name: (pre.name || '') + value.name,
            //     value: (pre.value || '') + value.value,
            //     type: type
            //   }
            //   start--
            // } else {
            before = splitValue
            // }
          }
        }
      }
      if (!!next) {
        if (next.type === Type.ID) {
          after = splitValue
        } else {
          if (next.type === Type.Number && !isNumber) {
            // if (isNumber) {
            //   value = {
            //     name: value.name + (next.name || ''),
            //     value: value.value + (next.value || ''),
            //     type: type
            //   }
            //   end++
            // } else {
            after = splitValue
            // }
          }
        }
      }
    }
    const arr: Array<Coordinate> = []
    if (before) arr.push(before)
    arr.push(value)
    if (after) arr.push(after)
    const n: number = 1 + (!!before ? 1 : 0)

    const newExp: Array<Coordinate> = [...exp.value.slice(0, start), ...arr, ...exp.value.slice(end)];
    exps[index].value = newExp;
    exps[index].range = [start + n, start + n];
    setState({
      ...state,
      exps
    });
  };

  const left = () => {
    const {exps, index} = state;
    console.log(exps, index, 9999)
    const exp: Exp = exps[index]
    const {range: [start]} = exp;
    if (start <= 0) {
      return;
    }
    exps[index].range = [start - 1, start - 1];
    setState({
      ...state,
      exps
    });
  };

  const right = () => {
    const {exps, index} = state;
    const exp: Exp = exps[index]
    const end: number = exp.range[1]
    if (end >= exp.value.length) {
      return;
    }
    exps[index].range = [end + 1, end + 1];
    setState({
      ...state,
      exps
    });
  };

  const setRange = (start: number, end: number) => {
    const {exps, index} = state;
    const exp: Exp = exps[index]
    const l: number = exp.value.length;
    if (end > l || start < 0) {
      return;
    }
    exps[index].range = [start, end];
    setState({
      ...state,
      exps
    });
  };

  const processAndSave = () => {
    const {exps}=state;
    console.log(exps,66666)
  }

  const Elevation: number = 1;
  console.log(state, 'state');
  return (
    <Card>
      {/*<CardHeader*/}
      {/*  subheader="September 14, 2016"*/}
      {/*/>*/}
      <CardContent>
        <Grid container spacing={16}>
          <Grid item xs={12} className={classes.top}>
            <Typography align='left' variant='h6' noWrap gutterBottom>Variable Formula</Typography>
            <Paper elevation={Elevation} className={classes.paper}>
              <Expressions
                exps={state.exps}
                index={state.index}
                setIndex={setIndex}
                addLine={addLine}
                deleteIndex={deleteIndex}
                setRange={setRange}
                deleteExp={deleteExp}
                left={left}
                right={right}
                addExp={addExp}
                changeExpLabel={changeExpLabel}
                handleFunction={handleFunction}
                handleVariables={handleVariables}
              />
            </Paper>
          </Grid>
          <Grid item xs={3}>
            <Typography align='left' variant='h6' noWrap gutterBottom>Form Field</Typography>
            <Paper elevation={Elevation} className={classes.paper}>
              <Variables handleClick={handleVariables}/>
            </Paper>
          </Grid>
          <Grid item xs={3}>
            <Typography align='left' variant='h6' noWrap gutterBottom>Function</Typography>
            <Paper elevation={Elevation} className={classes.paper}>
              <Funcions onClick={handleFunction} onMouseOver={onMouseOver}/>
            </Paper>
          </Grid>
          <Grid item xs={6}>
            <Typography align='left' variant='h6' noWrap gutterBottom>Project Description</Typography>
            <Paper elevation={Elevation} className={classes.paper}>
              <Summary detailKey={state.detailKey}/>
            </Paper>
          </Grid>
        </Grid>
      </CardContent>
      <CardActions disableActionSpacing className={classes.actions}>
        <Button variant="contained" onClick={processAndSave} className={classes.save}>
          OK
        </Button>
        <Button
          variant="contained"
          className={classes.cancel}
          onClick={onClose}
        >
          Cancel
        </Button>
      </CardActions>
    </Card>
  );
}

export default useStyles(Computed);
