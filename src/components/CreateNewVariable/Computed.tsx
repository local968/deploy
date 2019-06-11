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
import {map, filter, includes, get, findIndex, findLastIndex, slice} from 'lodash';
// import { useImmer } from 'use-immer';
import Funcions from './Funcions';
import Variables from './Variables';
import Summary from './Summary';
import Expressions from './Expressions';
import {Exp, Type, Coordinate} from './model/Coordinate';
import {withStyles} from '@material-ui/core/styles';
import {string} from "prop-types";
import EN from '../../constant/en';
import FUNCTIONS from './functions';
import {message} from 'antd';

// const FUNCTIONS = {
//   base: [] as any[],
//   senior: [] as any[]
// }

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
  addNewVariable: (newVariables: any[], type: any) => void,
  colType: any,
  expression: any
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
  const {classes, onClose, addNewVariable, colType, expression} = props
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
    const parenId = (func.value || '') + new Date().getTime();
    newExp.value = [
      ...value.slice(0, curStart),
      func,
      {...LPAREN, id: parenId},
      {...RPAREN, id: parenId},
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
    const preList = [...value.slice(0, curStart)];
    const pre: Coordinate | undefined = preList.pop()
    const next: Coordinate | undefined = [...value.slice(end)].shift()
    let before: Coordinate | undefined, after: Coordinate | undefined
    // const aaa = pre
    if (!!pre && (pre.type === Type.ID || pre.type === Type.Number || pre.type === Type.Char)) before = splitValue
    if (!!next && (next.type === Type.ID || next.type === Type.Number || next.type === Type.Char)) after = splitValue
    // const furtherPre: Coordinate | undefined = (preList || []).pop();
    // console.log(furtherPre, 'furtherPre')
    // if (!!pre && pre.value === '@' && (!furtherPre || furtherPre.type === Type.Lparen || furtherPre.type === Type.Op)) before = undefined;
    // console.log(before, 'before')
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
    const isNumber: boolean = !isNaN(parseFloat(v))
    const isOp: boolean = OPARRAY.includes(v)
    const isLParen: boolean = v === '('
    const isRParen: boolean = v === ')'
    const isSplit: boolean = v === ','
    const isLc: boolean = v === '['
    const isRc: boolean = v === ']'
    const isAt: boolean = v === '@'
    const type: Type = isNumber ? Type.Number : isOp ? Type.Op : isLParen ? Type.Lparen : isRParen ? Type.Rparen : isSplit ? Type.Split : isLc ? Type.Lc : isRc ? Type.RC : Type.Char
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
    if (!isSplit && !isOp && !isAt) {
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
    const {exps} = state;
    const checkd = exps.map(exp => checkExp(exp.value))
    const error = checkd.find(c => !c.isPass)
    if (error) {
      return alert(error.message)
    }
    const newType = {}
    // const variables: string[] = [...newVariable]
    const newExps: any[] = []
    for (let i = 0; i < checkd.length; i++) {
      const {num, type} = checkd[i] as any
      const name = exps[i].label
      if (!name) return message.error(EN.Nameisempty)
      if (expression.hasOwnProperty(name)) return message.error(`${EN.Newvariable} ${name} ${EN.Isexist}`)
      if (name.includes("_")) return message.error(EN.Namecannotcontain)
      const nameArray: string[] = []
      if (num === 1) {
        nameArray.push("r2_" + name)
      } else {
        for (let n = 0; n < num; n++) {
          nameArray.push(`r2_${name}_${n + 1}`)
        }
      }
      nameArray.map(_v => newType[_v] = type)
      newExps.push({
        name: name,
        nameArray,
        exps: exps[i].value
      })
    }
    addNewVariable(newExps, newType)
    onClose()
  }

  const Elevation: number = 1;

  //------------------------------------------check-----------------------------------------------------------
  // import { Coordinate, Type } from './model/Coordinate';
  // import EN from 'constant/en';
  interface Bracket {
    index: number
  }

  // 转化括号
  const formatBracket = (_expression: Coordinate[]) => {
    let expression: (Coordinate | Bracket)[] = _expression
    const bracketExps: any = {}
    let num = 1

    while (true) {
      // 查询第一个)
      // for(let i = 0; i< expression.length; i++) {
      //   if(expression[i].type)
      // }
      const end = expression.findIndex(i => (i as any).type == Type.Rparen) + 1
      if (end === 0) break;
      // if (num > 9) return { isPass: false, message: EN.Toomanyfunctions }
      // 查询截取表达式最后一个(
      let start = -1
      for (let i = end - 1; i > -1; i--) {
        if ((expression[i] as any).type === Type.Lparen) {
          start = i
          break
        }
      }
      if (start === -1) return {isPass: false, message: EN.Unexpectedtoken}
      const exp: (Coordinate | Bracket)[] = expression.slice(start + 1, end - 1)
      bracketExps[num] = exp
      //转化(...)为$?
      expression = [...expression.slice(0, start), {index: num}, ...expression.slice(end)]
      num++
    }

    return {
      expression,
      bracketExps,
      isPass: true,
      message: 'ok'
    }
  }

  // 校验基本表达式
  const checkSimpleExp = (expression: (Coordinate | Bracket)[], bracketExps: any, inFunction: boolean) => {
    if (!expression.length) return {isPass: false, message: EN.Emptyexpression}
    // const baseOptReg = new RegExp(/[+\-*/]/)
    const length = expression.length
    let start = 0
    let array: (Coordinate | Bracket)[][] = []
    // 根据+-*/切割表达式
    for (let i = 0; i < length; i++) {
      if (i <= start) continue
      if ((expression[i] as any).type === Type.Op) {
        array.push(expression.slice(start, i))
        start = i + 1
      }
    }
    if (start < length) array.push(expression.slice(start, length))

    // const array = expression.split(baseOptReg)
    let num = 1
    let isVariable = false
    let expType = ''
    const typeArray: string[] = []
    for (let item of array) {
      if (!item.length) return {isPass: false, message: EN.Errorexpression}
      //Categorical
      let type = 'Numerical'
      // item = item.trim()
      // 判断是否含有转化的()表达式
      const isArray = (item[0] as any).type === Type.Lc && (item[item.length - 1] as any).type === Type.RC
      const fnIndex = item.findIndex(it => !!(it as any).index)
      const idIndex = item.findIndex(it => (it as any).type === Type.ID)
      const paramFnIndex = item.findIndex(it => (it as any).type === Type.Func)
      if (isArray) {
        if (!inFunction) return {
          isPass: false,
          message: `${EN.Unexpectedidentifier} ${expToString(item as Coordinate[])}`
        }
        //暂时只判断是否为空数组
        item = item.slice(1, -1)
        if (!item.length) return {isPass: false, message: `${EN.Unknownvariable} []`}
        // const arrayResult = checkParams(item, null, 0, false)
        // if (!arrayResult.isPass) return arrayResult
        type = 'Array'
      } else if (fnIndex > -1) {
        // 截取函数名称
        const functionName = item.slice(0, fnIndex) as Coordinate[]
        let bracketNum = item[fnIndex] as Bracket
        // if (!bracketNum || isNaN(bracketNum)) return { isPass: false, message: EN.Errorexpression }
        // try {
        //   bracketNum = parseInt(bracketNum, 10)
        // } catch (e) {
        //   return { isPass: false, message: EN.Errorexpression }
        // }
        const other = item.slice(fnIndex + 1) as Coordinate[]
        if (other.length) return {
          isPass: false,
          message: `${EN.Unexpectedidentifier} ${expToString(other as Coordinate[])}`
        }
        // 校验参数
        const fnResult = checkParams(functionName, bracketExps, bracketNum.index)
        if (!fnResult.isPass) return fnResult
        num += fnResult.num - 1
        isVariable = fnResult.isVariable
        type = fnResult.type
      } else if (idIndex > -1) {
        // 判断是否为选择的参数
        if (item.length > 1) return {
          isPass: false,
          message: `${EN.Unknownvariable} ${expToString(item as Coordinate[])}`
        }
        // item = item.slice(1)
        // if (!item || !dataHeader.includes(item.value))
        const cur: Coordinate = item[0] as Coordinate
        isVariable = true
        type = colType[cur.value || ''] === 'Numerical' ? 'Numerical' : 'Categorical'
      } else if (paramFnIndex > -1) {
        if (item.length > 1) return {
          isPass: false,
          message: `${EN.Unexpectedidentifier} ${expToString(item as Coordinate[])}`
        }
      } else {
        const numItem = expToString(item as Coordinate[])
        const isNum = !isNaN(parseFloat(numItem))
        //判断是否是数字
        if (!isNum) return {isPass: false, message: `${EN.Unexpectedidentifier} ${numItem}`}
      }
      typeArray.push(type)
    }
    if (typeArray.length > 1) {
      const index = typeArray.indexOf('Categorical')
      if (index !== -1) return {
        isPass: false,
        message: `${EN.Errorexpression}: ${expToString(array[index] as Coordinate[])}`
      }
      expType = 'Numerical'
    } else {
      expType = typeArray[0]
    }
    return {isPass: true, message: EN.OK, num, isVariable, type: expType}
  }

  // 校验表达式参数
  const checkParams = (functionName: (Coordinate | Bracket)[], bracketExps: any, bracketNum: number) => {
    //默认校验函数 暂时 校验数组functionName为总表达式
    const exps = bracketExps[bracketNum]
    if (!exps.length) return {isPass: false, message: EN.Emptyparameter}
    const length = exps.length
    let start = 0
    let skipNum = 0
    let expArray: (Coordinate | Bracket)[][] = []
    // 根据, 分割参数
    for (let i = 0; i < length; i++) {
      if (i < start) continue
      if ((exps[i] as any).type === Type.Lc) {
        skipNum++
        continue
      }
      if ((exps[i] as any).type === Type.RC) {
        if (skipNum > 0) skipNum--
        continue
      }
      if (skipNum === 0 && (exps[i] as any).type === Type.Split) {
        expArray.push(exps.slice(start, i))
        start = i + 1
      }
    }
    if (start < length) expArray.push(exps.slice(start, length))

    let numOfParam = 0
    let isVariable1 = false
    let num = 1
    let fnType = ''
    const params: any[] = []
    let stillVariable = true
    for (const exp of expArray) {
      // 校验表达式
      const expChecked = checkSimpleExp(exp, bracketExps, !!functionName.length)
      if (!expChecked.isPass) return expChecked
      const {isVariable, num, type} = expChecked
      if (stillVariable) {
        if (isVariable) numOfParam++
        if (!isVariable) stillVariable = false
      }
      // 报存参数类型
      params.push({
        isVariable,
        num,
        exp,
        type
      })
    }

    let skipParams = false
    fnType = 'Numerical'
    // 不是函数, 则参数只能为1个
    if (!functionName.length && expArray.length > 1) return {
      isPass: false,
      message: `${EN.Unexpectedidentifier} ${exps.map(v => (v as Coordinate).value).join('')}`
    }
    if (functionName.length > 1) return {
      isPass: false,
      message: `${EN.Unexpectedidentifier} ${functionName.map(v => (v as Coordinate).value).join('')}`
    }
    const BaseFn = !functionName.length ? false : FUNCTIONS.base.find(fn => fn.value === (functionName[0] as Coordinate).value)
    const SeniorFn = !functionName.length ? false : FUNCTIONS.senior.find(fn => fn.value === (functionName[0] as Coordinate).value)
    // 判断函数参数个数限制
    if (BaseFn && BaseFn.params && BaseFn.params !== expArray.length) return {
      isPass: false,
      message: `${EN.Function} ${(functionName[0] as Coordinate).value} must have ${BaseFn.params} params`
    }

    if (SeniorFn) {
      // 校验高级函数参数
      const seniorResult: any = checkSeniorParams(SeniorFn, params, numOfParam, bracketExps)
      if (!seniorResult.isPass) return seniorResult
      isVariable1 = true
      num += seniorResult.num - 1
      fnType = seniorResult.type
      skipParams = true
    }
    if (BaseFn) {
      // 校验一般函数参数
      if (BaseFn.value === 'Eq') {
        fnType = 'Categorical'
        skipParams = true
      }
    }

    for (let param of params) {
      num += param.num - 1
      isVariable1 = isVariable1 || param.isVariable
    }
    if (!skipParams) {
      // 校验参数
      for (let param of params) {
        if (param.type === 'Categorical') return {isPass: false, message: EN.ParametersmustbeNumerical}
      }
    }

    return {isPass: true, message: `ok`, num, isVariable: isVariable1, type: fnType}
  }

  // 校验高级表达式参数
  const checkSeniorParams = (senior, params: any[], numOfParam: number, bracketExps: any) => {
    let num = 0
    let type = ''

    // 截取列名参数
    const paramList = params.slice(0, numOfParam)
    const skipFn = ['Concat', 'Groupby']
    const paramType = ['Substring', 'Number_extraction'].includes(senior.value) ? 'Categorical' : 'Numerical'
    if (!skipFn.includes(senior.value)) {
      for (let param of paramList) {
        if (param.type !== paramType) return {
          isPass: false,
          message: `${EN.Function} ${senior.value} ${EN[`Parametersmustbe${paramType}`]}`
        }
      }
    }
    // 截取非列名参数
    const numList = params.slice(numOfParam)
    switch (senior.value) {
      case "Concat":
        type = 'Categorical'
        if (numOfParam < 1) return {
          isPass: false,
          message: `${EN.Function}: ${senior.value} ${EN.Parameterserror} `
        }
        const concatResults = numList.map(num => {
          let _n: string = expToString(num.exp)
          if (isNaN(parseFloat(_n)) || _n.includes(".")) return {isPass: false, message: `${_n} ${EN.Mustbeinteger} `}
          let n: number
          try {
            n = parseInt(_n, 10)
          } catch (e) {
            return {isPass: false, message: `${_n} ${EN.Mustbeinteger} `}
          }
          if (n < 2) return {isPass: false, message: `${n} ${EN.Mustgreaterthan} `}
          if (n > numOfParam) return {isPass: false, message: `${n} ${EN.Mustlessthan} ${numOfParam + 1} `}
          return {
            isPass: true,
            message: EN.OK,
            num: factorial(numOfParam) / factorial(n) / factorial(numOfParam - n)
          }
        })
        for (let numResult of concatResults) {
          if (!numResult.isPass) return numResult
          num += numResult.num || 0
        }
        break;
      case "Diff":
        type = 'Numerical'
        const diffResults = numList.map(num => {
          let n = expToString(num.exp)
          if (isNaN(parseFloat(n)) || n.includes(".")) return {isPass: false, message: `${n} ${EN.Mustbeinteger} `}
          try {
            parseInt(n, 10)
          } catch (e) {
            return {isPass: false, message: `${n} ${EN.Mustbeinteger} `}
          }
          return {isPass: true, message: EN.OK, num: numOfParam}
        })
        for (let numResult of diffResults) {
          if (!numResult.isPass) return numResult
          num += numResult.num || 0
        }
        break;
      case "Accumulate":
        type = 'Numerical'
        num = numOfParam
        break;
      case "Quantile_bin":
        type = 'Categorical'
        const quantileBinArray = ["0", "1"]
        if (numList.length < 2) return {
          isPass: false,
          message: `${EN.Function}: ${senior.value} ${EN.Parameterserror} `
        }
        const [b, type1, type2] = numList
        if (isNaN(parseFloat(expToString(b.exp))) || expToString(b.exp).includes(".")) return {
          isPass: false,
          message: `${expToString(b.exp)} ${EN.Mustbeinteger} `
        }
        if (!quantileBinArray.includes(expToString(type1.exp).trim())) return {
          isPass: false,
          message: `${expToString(type1.exp)} ${EN.Isnotsupported} `
        }
        if (type2 && !quantileBinArray.includes(expToString(type2.exp).trim())) return {
          isPass: false,
          message: `${expToString(type2.exp)} ${EN.Isnotsupported} `
        }
        num = numOfParam * (type2 ? 2 : 1)
        break;
      case "Custom_Quantile_bin":
        type = 'Categorical'
        const numResults = numList.map(num => {
          let n = expToString(num.exp)
          if (num.type !== 'Array') return {isPass: false, message: `${EN.Unexpectedidentifier} ${n} `}
          // const str = n.trim()
          // const first = num.exp.slice(0, 1)
          // const last = num.exp.slice(-1)
          // if (first.type !== "[" || last.value !== "]") return { isPass: false, message: `${ EN.Unexpectedidentifier } ${ n } ` }
          const cuschecked = checkArrayParams(num.exp.slice(1, -1), bracketExps, ({item, type, isVariable}) => {
            if (!item) return {isPass: false, message: `${subItem.exp} contain ${EN.Emptyexpression} `}
            if (isVariable) return {isPass: false, message: `cannot use variable`}
            if (type !== 'Numerical') return {isPass: false, message: `${item} ${EN.Mustbenumbe} `}
            return {isPass: true, message: 'ok'}
          })
          if (!cuschecked.isPass) return cuschecked
          // const array = str.slice(1, -1).split(",")
          // for (let item of array) {
          //   if (!item || isNaN(parseFloat(item.trim()))) return { isPass: false, message: `${ item } ${ EN.Mustbenumbe } ` }
          // }
          return {isPass: true, message: EN.OK, num: 1}
        })
        for (let numResult of numResults) {
          if (!numResult.isPass) return numResult
          num += numResult.num || 0
        }
        break;
      case "Groupby":
        type = 'Categorical'
        console.log(numOfParam, numList.length, 'Groupby')
        let nList
        if (numOfParam === 1) {
          if (numList.length !== 2) return {
            isPass: false,
            message: `${EN.errorparams}${numList.map(n => expToString(n.exp)).join(',')} `
          }
          const vList = numList[0]
          nList = numList[1]
          const vExp = expToString(vList.exp)
          if (vList.type !== 'Array') return {isPass: false, message: `${EN.Unexpectedidentifier} ${vExp} `}
          const vListchecked = checkArrayParams(vList.exp.slice(1, -1), bracketExps, ({item, isVariable}) => {
            if (!item) return {isPass: false, message: `${subItem.exp} contain ${EN.Emptyexpression} `}
            if (!isVariable) return {isPass: false, message: `must use variable`}
            return {isPass: true, message: 'ok'}
          })
          if (!vListchecked.isPass) return vListchecked
          if (vListchecked.params > 2) return {isPass: false, message: `cannot > 2`}
        } else if (numOfParam === 2) {
          if (numList.length !== 1) return {
            isPass: false,
            message: `${EN.errorparams}${numList.map(n => expToString(n.exp)).join(',')} `
          }
          nList = numList[0]
        } else {
          return {
            isPass: false,
            message: `${EN.errorparams}${paramList.slice(1).map(n => expToString(n.exp)).join(',')} `
          }
        }

        const nExp = expToString(nList.exp)
        const nListValues = paramList[0].type === 'Numerical' ? ['sum', 'mean', 'min', 'max', 'std', 'median'] : ['mode']
        console.log(nExp, nList, 'nExp')
        if (nList.type === 'Array') {
          const nListchecked = checkArrayParams(nList.exp.slice(1, -1), bracketExps, ({item, isVariable}) => {
            console.log(item, isVariable, 'checkArrayParams')
            if (!item) return {isPass: false, message: `${subItem.exp} contain ${EN.Emptyexpression} `}
            if (isVariable) return {isPass: false, message: `cannot use variable`}
            if (!nListValues.includes(item.toLowerCase())) return {
              isPass: false,
              message: `${EN.Unexpectedidentifier} ${item} `
            }
            return {isPass: true, message: 'ok'}
          })
          if (!nListchecked.isPass) return nListchecked
          num = nListchecked.params
        } else {
          if (nList.exp.length > 1) return {isPass: false, message: `${EN.Unexpectedidentifier} ${nExp} `}
          const nParamExp = expToString(nList.exp[0])
          if (!nListValues.includes(nParamExp.toLowerCase())) return {
            isPass: false,
            message: `${EN.Unexpectedidentifier} ${nParamExp} `
          }
          // if (nList.exp[0].type !== Type.Func) return { isPass: false, message: `${ EN.Unexpectedidentifier } ${ nExp } ` }
          num = 1
        }

        // // const [vList, nList] = numList
        // const vExp = expToString(vList.exp)
        // console.log(vExp, 'vExp')
        // if (vList.type === 'Array') {
        //   const vListchecked = checkArrayParams(vList.exp.slice(1, -1), bracketExps, ({ item, isVariable }) => {
        //     if (!item) return { isPass: false, message: `${ subItem.exp } contain ${ EN.Emptyexpression } ` }
        //     if (!isVariable) return { isPass: false, message: `must use variable` }
        //     return { isPass: true, message: 'ok' }
        //   })
        //   if (!vListchecked.isPass) return vListchecked
        //   if (vListchecked.params > 2) return { isPass: false, message: `cannot > 2` }
        // } else {
        //   if (!vList.isVariable) return { isPass: false, message: `${ EN.Unexpectedidentifier } ${ vExp } ` }
        // }

        // const nExp = expToString(nList.exp)
        // console.log(nExp, 'nExp')
        // if (nList.type === 'Array') {
        //   const nListValues = paramList[0].type === 'Numerical' ? ['sum', 'mean', 'min', 'max', 'std', 'median'] : ['mode']
        //   const nListchecked = checkArrayParams(nList.exp.slice(1, -1), bracketExps, ({ item, isVariable }) => {
        //     console.log(item, isVariable, 'checkArrayParams')
        //     if (!item) return { isPass: false, message: `${ subItem.exp } contain ${ EN.Emptyexpression } ` }
        //     if (isVariable) return { isPass: false, message: `cannot use variable` }
        //     if (!nListValues.includes(item.toLowerCase())) return { isPass: false, message: `${ EN.Unexpectedidentifier } ${ item } ` }
        //     return { isPass: true, message: 'ok' }
        //   })
        //   if (!nListchecked.isPass) return nListchecked
        //   num = nListchecked.params
        // } else {
        //   if (nList.length > 1) return { isPass: false, message: `${ EN.Unexpectedidentifier } ${ nExp } ` }
        //   if (nList[0].type !== Type.ID) return { isPass: false, message: `${ EN.Unexpectedidentifier } ${ nExp } ` }
        //   num = 1
        // }
        break;
      case "Interactive":
        type = 'Numerical'
        if (numList.length > 0) return {
          isPass: false,
          message: `${EN.errorparams}${numList.map(n => expToString(n.exp)).join(',')} `
        }
        num = (numOfParam * (numOfParam - 1)) >> 1
        break;
      case "Box_cox":
        type = 'Numerical'
        if (numList.length > 1) return {
          isPass: false,
          message: `${EN.errorparams} ${numList.slice(1).map(n => expToString(n.exp)).join(',')} `
        }
        if (numOfParam > 1) return {
          isPass: false,
          message: `${EN.errorparams}${paramList.slice(1).map(n => expToString(n.exp)).join(',')} `
        }
        if (numList[0] && expToString(numList[0].exp) && isNaN(parseFloat(expToString(numList[0].exp)))) return {
          isPass: false,
          message: `${expToString(numList[0].exp)} ${EN.Mustbenumbe} `
        }
        num = 1
        break;
      case "Number_extraction":
        type = 'Numerical'
        if (numList.length > 0) return {
          isPass: false,
          message: `${EN.errorparams}${numList.map(n => expToString(n.exp)).join(',')} `
        }
        if (numOfParam > 1) return {
          isPass: false,
          message: `${EN.errorparams}${paramList.slice(1).map(n => expToString(n.exp)).join(',')} `
        }
        num = 1
        break;
      case "Substring":
        type = 'Categorical'
        if (numList.length > 1) return {
          isPass: false,
          message: `${EN.errorparams}${numList.slice(1).map(n => expToString(n.exp)).join(',')} `
        }
        if (numOfParam > 1) return {
          isPass: false,
          message: `${EN.errorparams}${paramList.slice(1).map(n => expToString(n.exp)).join(',')} `
        }
        const subItem = numList[0]
        if (subItem.type !== 'Array') return {
          isPass: false,
          message: `${EN.Unexpectedidentifier} ${expToString(subItem.exp)} `
        }
        // const subExp = expToString(subItem.exp)
        // const first = subExp.slice(0, 1)
        // const last = subExp.slice(-1)
        // if (first !== "[" || last !== "]") return { isPass: false, message: `${ EN.Unexpectedidentifier } ${ subExp } ` }
        // const subArray = subItem.exp.slice(1, -1)

        const subchecked = checkArrayParams(subItem.exp.slice(1, -1), bracketExps, ({item, type, isVariable}) => {
          if (!item) return {isPass: false, message: `${subItem.exp} contain ${EN.Emptyexpression} `}
          if (isVariable) return {isPass: false, message: `cannot use variable`}
          if (type !== 'Numerical') return {isPass: false, message: `${item} ${EN.Mustbenumbe} `}
          if (isNaN(parseFloat(item)) || item.includes('.')) return {
            isPass: false,
            message: `${item} ${EN.Mustbeinteger} `
          }
          return {isPass: true, message: 'ok'}
        })
        if (!subchecked.isPass) return subchecked
        if (subchecked.params !== 2) return {isPass: false, message: `${EN.errorparams}${expToString(subItem.exp)} `}
        // if (subArray.length !== 2) return { isPass: false, message: `${EN.errorparams}${ subExp } ` }
        // for (let item of subArray) {
        //   if (!item) return { isPass: false, message: `${ subItem.exp } contain ${ EN.Emptyexpression } ` }
        //   if (isNaN(parseFloat(item)) || item.includes('.')) return { isPass: false, message: `${ item } ${ EN.Mustbeinteger } ` }
        // }
        num = 1
        break;
      default:
        break;
    }
    if (num < 1) return {isPass: false, message: `${EN.Function}: ${senior.value} ${EN.Parameterserror} `}
    return {isPass: true, message: EN.OK, num, type}
  }

  const checkArrayParams = (exps: any[], bracketExps: any, callback: ({}: any) => { isPass: boolean, message: string }) => {
    if (!exps.length) return {isPass: false, message: EN.Emptyparameter}
    const length = exps.length
    let start = 0
    let skipNum = 0
    let expArray: (Coordinate | Bracket)[][] = []
    // 根据, 分割参数
    for (let i = 0; i < length; i++) {
      if (i < start) continue
      if ((exps[i] as any).type === Type.Lc) {
        skipNum++
        continue
      }
      if ((exps[i] as any).type === Type.RC) {
        if (skipNum > 0) skipNum--
        continue
      }
      if (skipNum === 0 && (exps[i] as any).type === Type.Split) {
        expArray.push(exps.slice(start, i))
        start = i + 1
      }
    }
    if (start < length) expArray.push(exps.slice(start, length))

    for (const exp of expArray) {
      // 校验表达式
      const expChecked = checkSimpleExp(exp, bracketExps, true)
      if (!expChecked.isPass) return expChecked
      const {isVariable, type} = expChecked
      const checked = callback({item: expToString(exp as Coordinate[]), type, isVariable})
      if (!checked.isPass) return checked
    }
    return {isPass: true, message: 'ok', params: expArray.length}
  }


  // 计算阶乘
  const factorial = (n: number) => {
    if (n < 2) return 1
    return n * factorial(n - 1)
  }

  const expToString = (exps: Coordinate[]) => exps.map(_e => ((_e as any).value || '')).join('')

  // 校验总表达式
  const checkExp = (_expression: Coordinate[]) => {
    if (!_expression.length) return {isPass: true, message: EN.Emptyparameter, num: 0}
    // if (_expression.includes("$")) return { isPass: false, message: EN.Unexpectedtoken$ }

    const {bracketExps, expression, isPass: _isPass, message: _message} = formatBracket(_expression)
    if (!_isPass) return {isPass: _isPass, message: _message}
    // console.log(bracketExps, expression, 666)
    const {isPass, message, num, type} = checkSimpleExp(expression as (Coordinate | Bracket)[], bracketExps, false)
    return {isPass, message, num, type}
  }
  //------------------------------------------check end-----------------------------------------------------------------

  let variables: Coordinate[] = map(colType, function (value, name) {
    return {
      name,
      type: Type.ID,
      value: name,
      varType: value
    };
  });
  //参数类型： concat eq 任意类型  其他的方法都需要 Numerical类型的变量
  const {exps, index} = state;
  const currExp = exps[index];
  const {range, value} = currExp;
  const inputIndex = range[1]
  const pre = slice(value, 0, inputIndex);
  const next = slice(value, inputIndex);
  const lParenIndex = findLastIndex(pre, v => {
    if (v.value === '(') {
      return findIndex(next, ({value, id}) => (value === ')' && v.id === id)) > -1
    }
    return false
  })
  const vari = pre.pop() || {};
  const func = vari.type === Type.Func ? undefined : value[lParenIndex - 1];
  if (func) {
    const {name} = func;
    variables = filter(variables, ({varType}) => varType !== 'Raw')
    if (!includes(['Number_extraction', 'Substring', 'Groupby', 'Substring', 'Concat', 'Eq', '(', ')', ','], name)) {
      variables = filter(variables, ({varType}) => varType === 'Numerical')
    }
    if (includes(['Number_extraction', 'Substring'], name)) {
      variables = filter(variables, ({varType}) => varType === 'Categorical')
    }
  }
  return (
    <Card>
      {/*<CardHeader*/}
      {/*  subheader="September 14, 2016"*/}
      {/*/>*/}
      <CardContent>
        <Grid container spacing={16}>
          <Grid item xs={12} className={classes.top}>
            <Typography align='left' variant='h6' noWrap gutterBottom>{EN.VariableFormula}</Typography>
            <Paper elevation={Elevation} className={classes.paper}>
              <Expressions
                exps={exps}
                index={index}
                setIndex={setIndex}
                addLine={addLine}
                deleteIndex={deleteIndex}
                setRange={setRange}
                deleteExp={deleteExp}
                left={left}
                right={right}
                addExp={addExp}
                func={func}
                changeExpLabel={changeExpLabel}
                handleFunction={handleFunction}
                handleVariables={handleVariables}
                functions={[...FUNCTIONS.base, ...FUNCTIONS.senior]}
                variables={variables}
              />
            </Paper>
          </Grid>

          <Grid item xs={3}>
            <Typography align='left' variant='h6' noWrap gutterBottom>{EN.Function}</Typography>
            <Paper elevation={Elevation} className={classes.paper}>
              <Funcions onClick={handleFunction} onMouseOver={onMouseOver} functions={FUNCTIONS}/>
            </Paper>
          </Grid>
          <Grid item xs={3}>
            <Typography align='left' variant='h6' noWrap gutterBottom>{EN.FormField}</Typography>
            <Paper elevation={Elevation} className={classes.paper}>
              <Variables handleClick={handleVariables} variables={variables}/>
            </Paper>
          </Grid>
          <Grid item xs={6}>
            <Typography align='left' variant='h6' noWrap gutterBottom>{EN.ProjectDescription}</Typography>
            <Paper elevation={Elevation} className={classes.paper}>
              <Summary detailKey={state.detailKey}/>
            </Paper>
          </Grid>
        </Grid>
      </CardContent>
      <CardActions disableActionSpacing className={classes.actions}>
        <Button variant="contained" onClick={processAndSave} className={classes.save}>
          {EN.Yes}
        </Button>
        <Button
          variant="contained"
          className={classes.cancel}
          onClick={onClose}
        >
          {EN.CANCEL}
        </Button>
      </CardActions>
    </Card>
  );
}

export default useStyles(Computed);
