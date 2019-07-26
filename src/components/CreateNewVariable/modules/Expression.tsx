import * as React from 'react';

import { makeStyles } from '@material-ui/styles';

import { TextField, InputAdornment } from '@material-ui/core';

import { Exp, Coordinate, Type } from '../types/Coordinate';

const useStyles = makeStyles({
  exp: {
    width: '360px',
    flex: '1 1',
    overflowX: 'hidden',
  },
  textField: {
    flexWrap: 'wrap',
    backgroundColor: '#fff',
  },
  index: {
    display: 'inline-flex',
    justifyContent: 'center',
    transition: 'all .5s ease-in',
  },
});

interface ExpressionProps {
  sign: number;
  exp: Exp;
  setRange: (s: number, e: number) => void;
  deleteExp: () => void;
  left: () => void;
  right: () => void;
  addExp: (s: string) => void;
  toogleTooltip: () => void;
  onFocus: (e: React.MouseEvent<HTMLInputElement>) => void;
  setIndex: () => void;
}

function Expression(props: ExpressionProps) {
  const {
    exp,
    deleteExp,
    left,
    right,
    addExp,
    setRange,
    onFocus,
    sign,
    toogleTooltip,
    setIndex,
  } = props;

  const {
    value,
    range: [start, end],
  } = exp;
  const startValue: Array<Coordinate> = value.slice(0, start);
  const rangeValue: Array<Coordinate> = value.slice(start, end);
  const endValue: Array<Coordinate> = value.slice(end);
  const classes = useStyles({});

  //46 8
  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const key: number = e.keyCode;
    switch (key) {
      //退格
      case 8:
        deleteExp();
        // setDelete(true)
        break;
      //左
      case 37:
        left();
        break;
      //右
      case 39:
        right();
        break;
      default:
        break;
    }
    // e.preventDefault()
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    toogleTooltip();
    const value: string = e.target.value.trim();
    if (!value) return;
    addExp(value);
  };

  const onClick = (k: number) => (e: React.MouseEvent<HTMLSpanElement>) => {
    const input = e.currentTarget.parentElement.getElementsByTagName(
      'input',
    )[0];
    setRange(k + 1, k + 1);
    setIndex();
    input.focus();
    e.stopPropagation();
  };

  return (
    <>
      <TextField
        className={classes.textField}
        onChange={handleChange}
        onKeyDown={onKeyDown}
        onClick={onFocus}
        margin={'dense'}
        variant={'outlined'}
        InputProps={{
          // id: 'expInput' + sign,
          // style: {
          //   width: '6px',
          //   position: 'relative',
          // },
          startAdornment: (
            <InputAdornment position="start">
              {startValue.map((v: Coordinate, k: number) => (
                <Block
                  key={k}
                  index={k}
                  data={v}
                  inRange={false}
                  onClick={onClick(k)}
                />
              ))}
              {rangeValue.map((v: Coordinate, k: number) => (
                <Block
                  key={k}
                  index={k + start}
                  data={v}
                  inRange={true}
                  onClick={onClick(k + start)}
                />
              ))}
              (((((
            </InputAdornment>
          ),
          endAdornment: (
            <InputAdornment position="end">
              {endValue.map((v: Coordinate, k: number) => (
                <Block
                  key={k}
                  index={k + end}
                  data={v}
                  inRange={false}
                  onClick={onClick(k + end)}
                />
              ))}
              ))))))
            </InputAdornment>
          ),
        }}
      />
    </>
  );
}

interface BlockProps {
  index: number;
  data: Coordinate;
  inRange: boolean;
  onClick: (e: React.MouseEvent<HTMLDivElement>) => void;
}

const blockStyle = makeStyles({
  func: {
    color: '#F4B700',
    backgroundColor: 'rgba(244,183,0,.1)',
    padding: '6px 5px 7px',
    margin: ' 0 1px',
    display: 'inline-flex',
  },
  id: {
    color: '#0DB3A6',
    backgroundColor: '#eaf7f6',
    padding: '6px 5px 7px',
    margin: ' 0 1px',
    display: 'inline-flex',
  },
  selected: {
    backgroundColor: '#3f51b5',
    color: '#fff',
    padding: '6px 0 7px',
    display: 'inline-flex',
  },
  default: {
    display: 'inline-flex',
    padding: '6px 0 7px',
  },
});

function Block(props: BlockProps) {
  const { index, data, inRange, onClick } = props;
  const { name, type } = data;
  const classes = blockStyle({});

  const getRenderClass = () => {
    if (inRange) return classes.selected;
    switch (type) {
      case Type.Func:
        return classes.func;
      case Type.ID:
        return classes.id;
      default:
        return classes.default;
    }
  };

  return (
    <span className={getRenderClass()} data-i={index} onClick={onClick}>
      {name}
    </span>
  );
}

export default Expression;
