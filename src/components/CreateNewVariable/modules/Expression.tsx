import * as React from 'react';

import { makeStyles } from '@material-ui/styles';

import { FormControl, Input } from '@material-ui/core';

import { Exp, Coordinate, Type } from '../types/Coordinate';

const useStyles = makeStyles({
  exp: {
    width: 400,
    flex: '1 1',
    overflowX: 'hidden',
    letterSpacing: 6,
  },
  input: {
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

// interface ExpressionState {
//   isDelete: boolean,
// }

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
  } = props; //setRange
  // const [state, setState] = React.useState({
  //   isDelete: false
  // } as ExpressionState)
  const {
    value,
    range: [start, end],
  } = exp;
  const startValue: Array<Coordinate> = value.slice(0, start);
  const rangeValue: Array<Coordinate> = value.slice(start, end);
  const endValue: Array<Coordinate> = value.slice(end);
  const classes = useStyles({});

  const onSelect = () => {
    const selection: any = getSelection();
    let curRange: [Node, Node] = [selection.anchorNode, selection.extentNode];
    let curOffset: [number, number] = [
      selection.anchorOffset,
      selection.extentOffset,
    ];
    let curIndex: Array<number> = curRange.map((n: Node) =>
      parseInt(
        n.parentElement ? n.parentElement.getAttribute('data-i') || '0' : '0',
        10,
      ),
    );

    const isRev: boolean =
      curIndex[0] > curIndex[1] ||
      (curIndex[0] === curIndex[1] && curOffset[0] > curOffset[1]);
    if (isRev) {
      curRange.reverse();
      curIndex.reverse();
      curOffset.reverse();
    }
    const left: number =
      curIndex[0] +
      (curOffset[0] === (curRange[0].textContent || '').length ? 1 : 0);
    const right: number = curIndex[1] + (curOffset[1] === 0 ? 0 : 1);
    if (start === left && end === right) {
      //还原range
      return console.log('same');
    }
    setRange(left, right);
  };

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
      <FormControl className={classes.exp}>
        <Input
          className={classes.input}
          onChange={handleChange}
          onKeyDown={onKeyDown}
          // onFocus={onFocus}
          onClick={onFocus}
          // onSelect={onSelect}
          inputProps={{
            id: 'expInput' + sign,
            style: {
              width: 6,
              position: 'relative'
            },
          }}
          startAdornment={
            <>
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
            </>
          }
          endAdornment={
            <>
              {endValue.map((v: Coordinate, k: number) => (
                <Block
                  key={k}
                  index={k + end}
                  data={v}
                  inRange={false}
                  onClick={onClick(k + end)}
                />
              ))}
            </>
          }
        />
      </FormControl>
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
    // backgroundColor: 'rgba(244,183,0,.1)',
    padding: '6px 5px 7px',
    margin: ' 0 1px',
    display: 'inline-flex',
    letterSpacing: 0,
  },
  id: {
    // color: '#0DB3A6',
    // backgroundColor: '#eaf7f6',
    padding: '6px 5px 7px',
    margin: ' 0 1px',
    display: 'inline-flex',
    letterSpacing: 0,
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
  // <Input
  // disableUnderline
  // fullWidth
  // margin='none'
  // className={getRenderClass()}
  // readOnly={true}
  // value={value}
  // data-i={index}
  // />
  // <span className={getRenderClass()} data-i={index}>{value}</span>
}

export default Expression;
