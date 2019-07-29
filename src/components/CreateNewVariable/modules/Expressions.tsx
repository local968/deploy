import * as React from 'react';
import * as _ from 'lodash';

import { withStyles } from '@material-ui/core/styles';

import { MuiCard } from './MuiModule';

import {
  Table,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
  TextField,
  IconButton, Grid,
} from '@material-ui/core';

import DeleteIcon from '@material-ui/icons/Delete';
import AddIcon from '@material-ui/icons/Add';
import { Exp, Coordinate, Type } from '../types/Coordinate';
import Expression from './Expression';

import EN from '../../../constant/en';
import { styled } from '@material-ui/styles';

const useStyles = withStyles({
  table: {
    minWidth: '40rem',
  },
  textField: {
    backgroundColor: '#FFF',
  },
});

const MyTableCell = styled(TableCell)({
  paddingRight: 14,
});

interface ExpressionsProps {
  classes;
  exps: Exp[];
  index: number;
  setIndex: (k: number) => void;
  addLine: () => void;
  deleteIndex: (k: number) => void;
  setRange: (s: number, e: number) => void;
  deleteExp: () => void;
  left: () => void;
  right: () => void;
  func: Coordinate | undefined;
  addExp: (s: string) => void;
  changeExpLabel: (s: string) => void;
  handleFunction: (v: Coordinate, i: number) => void;
  handleVariables: (v: Coordinate, i: number) => void;
  functions: Coordinate[];
  variables: Coordinate[];
}

interface ExpressionsState {
  suggestions: Array<Coordinate>;
  isOpen: boolean;
  isTipOpen: boolean;
  el: string;
}

interface recommendObj {
  value: string;
  start: number;
}

class Expressions extends React.Component<ExpressionsProps, ExpressionsState> {
  constructor(props) {
    super(props);

    this.state = {
      suggestions: [],
      isOpen: false,
      isTipOpen: false,
      el: '',
    };
  }

  public selectOne = (k: number) => (e: React.MouseEvent<HTMLElement>) => {
    const input = e.currentTarget.getElementsByTagName('input')[0];
    if (k === this.props.index) return;
    this.props.setIndex(k);
    this.setState({
      el: input ? input.id : '',
    });
    input.focus();
  };

  public _onChangeExpLabel = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.props.changeExpLabel(e.target.value);
  };

  public deleteOne = (k: number) => (
    e: React.MouseEvent<HTMLButtonElement>,
  ) => {
    e.stopPropagation();
    this.props.deleteIndex(k);
  };

  public getRecommendValue = () => {
    const { exps, index } = this.props;
    const currentExp: Exp = exps[index];
    const {
      value,
      range: [start, end],
    } = currentExp;
    let obj: recommendObj = {
      value: '',
      start: end,
    };
    for (let i: number = end - 1; i >= (start === end ? 0 : start); i--) {
      const v: Coordinate = value[i];
      if (Type.Char !== v.type) break;
      if (!isNaN(+(v.value || ''))) break;
      obj.value = v.value + obj.value;
      obj.start = i;
    }
    return obj;
  };

  private recommend: recommendObj = this.getRecommendValue();

  public handleClickAway = () => {
    this.setState({
      isOpen: false,
    });
  };

  public hideGrammarTip = () => {
    this.setState({
      isTipOpen: false,
    });
  };

  public onFocus = (k: number) => (e: React.MouseEvent<HTMLInputElement>) => {
    const { setRange, setIndex } = this.props;
    const input: HTMLInputElement = e.currentTarget.parentElement.getElementsByTagName(
      'input',
    )[0];
    this.setState({
      isOpen: true,
      el: input ? input.id : '',
    });
    const len = this.props.exps[k]['value'].length;
    setRange(len, len);
    setIndex(k);
    input.focus();
    e.stopPropagation();
  };

  public getSuggestions = () => {
    let suggestions: Array<Coordinate> = [];
    if (this.recommend.value) {
      let _v: string = this.recommend.value;
      let list: Array<Coordinate> = [
        ...this.props.functions,
        ...this.props.variables,
      ];
      if (this.recommend.value.indexOf('@') === 0) {
        _v = this.recommend.value.slice(1);
        list = [...this.props.variables];
      }
      suggestions = list.filter(
        (i: Coordinate) => (i.value || '').indexOf(_v) > -1,
      );
    }
    return suggestions;
  };

  public estimateAdd = (exp: Exp, k: number, expSize: number) => {
    const { label, value } = exp;
    return !label || !_.size(value) || k + 1 != expSize;
  };

  public selectItem = (v: Coordinate) => () => {
    switch (v.type) {
      case Type.Func:
        this.props.handleFunction(v, this.recommend.start);
        return;
      case Type.ID:
        this.props.handleVariables(v, this.recommend.start);
        return;
      default:
        return;
    }
  };

  private get expSize() {
    return _.size(this.props.exps);
  }

  render() {
    const input: HTMLElement | null = this.state.el
      ? document.getElementById(this.state.el)
      : null;

    const {
      classes,
      exps,
      index,
      setIndex,
      addLine,
      setRange,
      deleteExp,
      left,
      right,
      addExp,
      handleFunction,
      handleVariables,
      changeExpLabel,
      variables,
      functions,
      func,
    } = this.props;

    return (
      <MuiCard style={{ paddingBottom: 0 }}>
        <Table className={classes.table}>
          <TableHead>
            <TableRow>
              <MyTableCell style={{ width: 252 }}>{EN.Variablename}</MyTableCell>
              <MyTableCell style={{ width: 10 }} />
              <MyTableCell style={{ width: 360 }}>{EN.formula}</MyTableCell>
              <MyTableCell align={'right'} />
            </TableRow>
          </TableHead>
          <TableBody>
            {exps.map((exp: Exp, k: number) => (
              <TableRow
                key={k}
                selected={k === index}
                onClick={e => this.selectOne(k)(e)}
              >
                <MyTableCell>
                  <TextField
                    autoFocus={true}
                    placeholder={`Name`}
                    className={classes.textField}
                    value={exp.label}
                    onChange={this._onChangeExpLabel}
                    margin={'dense'}
                    variant={'outlined'}
                  />
                </MyTableCell>
                <MyTableCell>=</MyTableCell>
                <MyTableCell>
                  <Expression
                    exp={exp}
                    setRange={setRange}
                    deleteExp={deleteExp}
                    left={left}
                    right={right}
                    addExp={addExp}
                    onFocus={this.onFocus.bind(this, k)}
                    sign={k}
                    setIndex={() => setIndex(k)}
                    toogleTooltip={() => this.setState({ isTipOpen: true })}
                  />
                </MyTableCell>
                <MyTableCell>
                  <IconButton
                    onClick={e => this.deleteOne(k)(e)}
                    disabled={this.expSize === 1}
                  >
                    <DeleteIcon />
                  </IconButton>
                  <IconButton
                    onClick={addLine}
                    disabled={!!this.estimateAdd(exp, k, this.expSize)}
                  >
                    <AddIcon />
                  </IconButton>
                </MyTableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </MuiCard>
    );
  }
}

export default useStyles(Expressions);
