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
  IconButton,
  Popper,
  MenuItem,
  MenuList,
  Paper,
  ClickAwayListener,
} from '@material-ui/core';

import DeleteIcon from '@material-ui/icons/Delete';
import AddIcon from '@material-ui/icons/Add';
import { Exp, Coordinate, Type } from '../types/Coordinate';
import Expression from './Expression';

import EN from '../../../constant/en';
import { styled } from '@material-ui/styles';
import { toJS } from 'mobx';

const useStyles = withStyles({
  table: {
    minWidth: '40rem',
  },
  textField: {
    width: '100%',
    backgroundColor: '#FFF',
  },
  suggestPaper: {
    minWidth: 200,
    maxWidth: 400,
    maxHeight: 400,
    overflowY: 'auto',
  },
  popper: {
    zIndex: 900,
  },
  list: {
    maxHeight: '300px',
    overflowY: 'auto',
    backgroundColor: '#fff',
  },
  suggPape: {
    maxHeight: '300px',
    overflowY: 'auto',
  },
  grammar: {
    padding: '.5rem 0.75rem',
    minWidth: 200,
    maxWidth: 300,
    wordWrap: 'break-word',
    backgroundColor: '#f0f4f8',
  },
});

const MyTableCell = styled(TableCell)({
  padding: '10px 14px 10px',
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
}

interface recommendObj {
  value: string;
  start: number;
}

class Expressions extends React.Component<ExpressionsProps, ExpressionsState> {
  private selectedNodes?: {
    [key: string]: HTMLDivElement | null | undefined;
  } = {};

  private popperNode?: HTMLDivElement | null | undefined;

  constructor(props) {
    super(props);

    this.state = {
      suggestions: [],
      isOpen: false,
      isTipOpen: false,
    };
  }

  public selectOne = (k: number) => {
    if (k === this.props.index) return;
    this.props.setIndex(k);
    this.selectedNodes[k].focus();
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

  private get recommend(): recommendObj {
    return this.getRecommendValue();
  }

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

  public onFocus = (el: HTMLInputElement | null | undefined) => {
    // const { setRange, setIndex, index } = this.props;
    this.popperNode = el;
    this.setState({
      isOpen: true,
    });
    // const len = this.props.exps[index]['value'].length;
    // setRange(len, len);
    // setIndex(index);
    // this.popperNode.focus();
    // e.stopPropagation();
  };

  public getSuggestions = () => {
    let suggestions: Array<Coordinate> = [];
    if (this.recommend.value) {
      let _v: string = this.recommend.value;
      let list: Array<Coordinate> = [
        ...toJS(this.props.functions),
        ...toJS(this.props.variables),
      ];

      if (this.recommend.value.indexOf('@') === 0) {
        _v = this.recommend.value.slice(1);
        list = [...this.props.variables];
      }
      suggestions = list.filter(
        (i: Coordinate) =>
          i.value &&
          i.value.toLocaleUpperCase().indexOf(_v.toLocaleUpperCase()) === 0,
      );
    }
    return suggestions;
  };

  public estimateAdd = (exp: Exp, k: number, expSize: number) => {
    const { label, value } = exp;
    return !label || !_.size(value) || k + 1 != expSize;
  };

  public selectItem = (v: Coordinate) => {
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

  private setSelectedNodes = (k, el) => {
    if (el) {
      this.selectedNodes[k] = el;
    }
  };

  private get expSize() {
    return _.size(this.props.exps);
  }

  render() {
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
      func,
    } = this.props;

    return (
      <MuiCard style={{ paddingBottom: 0, maxHeight: 276, overflowY: 'auto' }}>
        <Table className={classes.table}>
          <TableHead>
            <TableRow>
              <MyTableCell style={{ width: 252 }}>
                {EN.Variablename}
              </MyTableCell>
              <MyTableCell style={{ width: 8, padding: 0 }} />
              <MyTableCell style={{ width: 360 }}>{EN.formula}</MyTableCell>
              <MyTableCell align={'right'} />
            </TableRow>
          </TableHead>
          <TableBody>
            {exps.map((exp: Exp, k: number) => (
              <TableRow
                key={k}
                selected={k === index}
                onClick={this.selectOne.bind(this, k)}
              >
                <MyTableCell>
                  <TextField
                    autoFocus={true}
                    placeholder={`name`}
                    className={classes.textField}
                    value={exp.label}
                    onChange={this._onChangeExpLabel}
                    margin={'dense'}
                    variant={'outlined'}
                    inputRef={el => this.setSelectedNodes(k, el)}
                  />
                </MyTableCell>
                <MyTableCell style={{ padding: 0 }}>=</MyTableCell>
                <MyTableCell>
                  <Expression
                    exp={exp}
                    setRange={setRange}
                    deleteExp={deleteExp}
                    left={left}
                    right={right}
                    addExp={addExp}
                    onFocus={this.onFocus.bind(k)}
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
        <Popper
          open={this.state.isOpen && !!this.recommend.value}
          anchorEl={this.popperNode}
          placement={'bottom-start'}
          className={classes.popper}
        >
          <Paper square className={classes.suggestPaper}>
            <ClickAwayListener onClickAway={this.handleClickAway}>
              <div>
                {this.getSuggestions().map((item: Coordinate, k: number) => {
                  return (
                    <MenuItem
                      button={true}
                      component={'div'}
                      key={k}
                      onClick={this.selectItem.bind(this, item)}
                    >
                      {item.name}
                    </MenuItem>
                  );
                })}
              </div>
            </ClickAwayListener>
          </Paper>
        </Popper>
        <Popper
          open={!!func && this.state.isTipOpen}
          anchorEl={this.popperNode}
          placement={'bottom-end'}
          transition
          className={classes.popper}
        >
          <Paper square>
            <ClickAwayListener onClickAway={this.hideGrammarTip}>
              <div className={classes.grammar}>
                {func ? func.grammar : null}
              </div>
            </ClickAwayListener>
          </Paper>
        </Popper>
      </MuiCard>
    );
  }
}

export default useStyles(Expressions);
