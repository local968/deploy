import * as React from 'react';
import * as _ from 'lodash';
import { observer } from 'mobx-react';

import { styled } from '@material-ui/styles';

import { Container, Grid, Typography, Button } from '@material-ui/core';

// modules
import Variables from './modules/Variables';
import Functions from './modules/Functions';
import Summary from './modules/Summary';
import Expressions from './modules/Expressions';
import { message, Icon } from 'antd';

// types
import EN from '../../constant/en';
import { Coordinate, Type, Exp } from './types/Coordinate';
import { NewVariable } from 'stores/Project';

// Custom Title
const Subtitle = props => (
  <Typography
    variant={'subtitle2'}
    display={'block'}
    color={'textSecondary'}
    style={{ margin: '0.625rem 0' }}
  >
    {props.children}
  </Typography>
);

// Custom Container
const MyContainer = styled(Container)({
  minWidth: 600,
  margin: '1.2rem 0',
  paddingRight: 0,
  paddingLeft: 0,
});

// Custom Grid
const MyGrid = styled(Grid)({
  // minWidth: 360,
});

const MySave = styled(Button)({
  backgroundImage: 'linear-gradient(to bottom, #5b657b, #243448)',
  color: '#fff',
  border: '1px solid transparent',
  minWidth: '120px',
});
const MyCancel = styled(Button)({
  backgroundColor: '#fff',
  color: '#27374B',
  border: '1px solid #27374B',
  minWidth: '120px',
  marginLeft: '15px',
});

interface InterfaceNewVariableProps {
  onClose?;
  variables?: string[];
  mapHeader?;
  expression?;
  addNewVariable: (newVariables: any[], type) => Promise<boolean>;
  functions?;
  detailKey?: string;
  exps?;
  index?;
  func?;
}

interface InterfaceNewVariableState {
  exps: Exp[];
  detailKey: string;
  index: number;
  loading: boolean;
  setLoading: boolean;
}

interface Bracket {
  index: number;
}

interface BracketExps {
  [key: string]: (Coordinate | Bracket)[];
}

interface CheckReturns {
  isPass: boolean;
  message: string;
  num?: number;
  isVariable?: boolean;
  type?: string;
}

interface Params {
  isVariable: boolean;
  num: number;
  exp: (Coordinate | Bracket)[];
  type: string;
}

const OPARRAY = ['+', '-', '*', '/'];

@observer
// New Variable Module
export class NewVariableView extends React.Component<
  InterfaceNewVariableProps,
  InterfaceNewVariableState
> {
  constructor(props) {
    super(props);
    this.state = {
      exps: [this.initExp()],
      detailKey: '',
      index: 0,
      loading: false,
      setLoading: false,
    };
  }

  private initExp(): Exp {
    return { value: [], label: '', range: [0, 0] };
  }

  public handleFunctionsDoubleClick = (
    func: Coordinate,
    startIndex: number | null,
  ) => {
    const { exps, index } = this.state;
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
    const newExp: Exp = exps[index];
    const {
      range: [start, end],
      value,
    } = newExp;
    const curStart: number =
      typeof startIndex === 'number' ? startIndex : start;
    const parenId = (func.value || '') + new Date().getTime();
    newExp.value = [
      ...value.slice(0, curStart),
      func,
      { ...LPAREN, id: parenId },
      { ...RPAREN, id: parenId },
      ...value.slice(end),
    ];
    newExp.range = [curStart + 2, curStart + 2];
    exps[index] = newExp;
    this.setState({
      exps,
    });
  };

  public handleVariablesClick = (
    v: Coordinate,
    startIndex: number | undefined,
  ) => {
    const { exps, index } = this.state;
    const newExp: Exp = exps[index];
    const {
      range: [start, end],
      value,
    } = newExp;
    const curStart: number =
      typeof startIndex === 'number' ? startIndex : start;

    const splitValue: Coordinate = {
      name: ',',
      value: ',',
      type: Type.Split,
    };
    const preList = [...value.slice(0, curStart)];
    const pre: Coordinate | undefined = preList.pop();
    const next: Coordinate | undefined = [...value.slice(end)].shift();
    let before: Coordinate | undefined, after: Coordinate | undefined;
    // const aaa = pre
    if (
      !!pre &&
      (pre.type === Type.ID ||
        pre.type === Type.Number ||
        pre.type === Type.Char)
    )
      before = splitValue;
    if (
      !!next &&
      (next.type === Type.ID ||
        next.type === Type.Number ||
        next.type === Type.Char)
    )
      after = splitValue;
    // const furtherPre: Coordinate | undefined = (preList || []).pop();
    // console.log(furtherPre, 'furtherPre')
    // if (!!pre && pre.value === '@' && (!furtherPre || furtherPre.type === Type.Lparen || furtherPre.type === Type.Op)) before = undefined;
    // console.log(before, 'before')
    const arr: Array<Coordinate> = [];
    if (before) arr.push(before);
    arr.push(v);
    if (after) arr.push(after);
    const n: number = 1 + (!!before ? 1 : 0);

    newExp.value = [...value.slice(0, curStart), ...arr, ...value.slice(end)];
    newExp.range = [curStart + n, curStart + n];
    exps[index] = newExp;
    this.setState({
      exps,
    });
    // setState((state: ComputedState) => {
    //   state.exps[index] = newExp;
    //   // state.range = [start + 1, start + 1];
    //   return state;
    // });
  };

  public handleFunctionsClick = (v?: string) => {
    this.setState({
      detailKey: v || '',
    });
  };

  public setIndex = (k: number) => {
    this.setState({
      index: k,
    });
  };

  public addLine = () => {
    const { exps } = this.state;
    exps.push(this.initExp());
    this.setState({
      exps,
    });
  };

  public deleteIndex = (k: number) => {
    const { exps, index } = this.state;
    exps.splice(k, 1);
    this.setState({
      exps,
      index: Math.min(index, exps.length - 1),
    });
  };

  public deleteExp = () => {
    const { exps, index } = this.state;
    const exp: Exp = exps[index];
    const {
      range: [start, end],
    } = exp;
    if (end <= 0) return;
    const newExp: Coordinate[] = [...exp.value];
    const isEq: boolean = start === end;
    const _index: number = start + (isEq ? -1 : 0);
    //没有拖选
    if (isEq) {
      newExp.splice(start - 1, 1);
    } else {
      newExp.splice(start, end - start);
    }
    exps[index].value = newExp;
    exps[index].range = [_index, _index];
    this.setState({
      exps,
    });
  };

  public changeExpLabel = (v: string) => {
    const { exps, index } = this.state;
    exps[index].label = v;
    this.setState({
      exps,
    });
  };

  public addExp = (v: string) => {
    const { exps, index } = this.state;
    const exp = exps[index];
    let {
      range: [start, end],
    } = exp;
    const isNumber: boolean = !isNaN(+v);
    const isOp: boolean = OPARRAY.includes(v);
    const isLParen: boolean = v === '(';
    const isRParen: boolean = v === ')';
    const isSplit: boolean = v === ',';
    const isLc: boolean = v === '[';
    const isRc: boolean = v === ']';
    const isAt: boolean = v === '@';
    const type: Type = isNumber
      ? Type.Number
      : isOp
      ? Type.Op
      : isLParen
      ? Type.Lparen
      : isRParen
      ? Type.Rparen
      : isSplit
      ? Type.Split
      : isLc
      ? Type.Lc
      : isRc
      ? Type.RC
      : Type.Char;
    let value: Coordinate = {
      name: v,
      value: v,
      type,
    };
    const splitValue: Coordinate = {
      name: ',',
      value: ',',
      type: Type.Split,
    };

    const pre: Coordinate | undefined = [...exp.value.slice(0, start)].pop();
    const next: Coordinate | undefined = [...exp.value.slice(end)].shift();
    let before: Coordinate | undefined, after: Coordinate | undefined;
    if (!isSplit && !isOp && !isAt) {
      if (!!pre) {
        if (pre.type === Type.ID) {
          before = splitValue;
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
            before = splitValue;
            // }
          }
        }
      }
      if (!!next) {
        if (next.type === Type.ID) {
          after = splitValue;
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
            after = splitValue;
            // }
          }
        }
      }
    }
    const arr: Array<Coordinate> = [];
    if (before) arr.push(before);
    arr.push(value);
    if (after) arr.push(after);
    const n: number = 1 + (!!before ? 1 : 0);

    const newExp: Array<Coordinate> = [
      ...exp.value.slice(0, start),
      ...arr,
      ...exp.value.slice(end),
    ];
    exps[index].value = newExp;
    exps[index].range = [start + n, start + n];
    this.setState({
      exps,
    });
  };

  public left = () => {
    const { exps, index } = this.state;
    const exp: Exp = exps[index];
    const {
      range: [start],
    } = exp;
    if (start <= 0) {
      return;
    }
    exps[index].range = [start - 1, start - 1];
    this.setState({
      exps,
    });
  };

  public right = () => {
    const { exps, index } = this.state;
    const exp: Exp = exps[index];
    const end: number = exp.range[1];
    if (end >= exp.value.length) {
      return;
    }
    exps[index].range = [end + 1, end + 1];
    this.setState({
      exps,
    });
  };

  public setRange = (start: number, end: number) => {
    const { exps, index } = this.state;
    const exp: Exp = exps[index];
    const l: number = exp.value.length;
    if (end > l || start < 0) {
      return;
    }
    exps[index].range = [start, end];
    this.setState({
      exps,
    });
  };

  public processAndSave = () => {
    if (this.state.loading) return;
    const { exps } = this.state;
    const checkd = exps.map(exp => this.checkExp(exp.value));
    const error = checkd.find(c => !c.isPass);
    if (error) {
      return alert(error.message);
    }
    const newType: StringObject = {};
    // const variables: string[] = [...newVariable]
    const newExps: NewVariable[] = [];
    for (let i = 0; i < checkd.length; i++) {
      const { num, type } = checkd[i] as any;
      const name = exps[i].label;
      if (!name) return message.error(EN.Nameisempty);
      if (this.props.expression.hasOwnProperty(name))
        return message.error(`${EN.Newvariable} ${name} ${EN.Isexist}`);
      if (name.includes('_')) return message.error(EN.Namecannotcontain);
      const nameArray: string[] = [];
      if (num === 1) {
        nameArray.push('r2_' + name);
      } else {
        for (let n = 0; n < num; n++) {
          nameArray.push(`r2_${name}_${n + 1}`);
        }
      }
      nameArray.map(_v => (newType[_v] = type));
      newExps.push({
        name: name,
        nameArray,
        exps: exps[i].value,
      });
    }
    this.setState({
      loading: true,
    });

    this.props.addNewVariable(newExps, newType).then(isok => {
      this.setState({
        loading: false,
      });
      if (isok) this.props.onClose();
    });
  };

  private Elevation: number = 1;

  //------------------------------------------check-----------------------------------------------------------
  // import { Coordinate, Type } from './model/Coordinate';
  // import EN from 'constant/en';

  // 转化括号
  public formatBracket = (_expression: Coordinate[]) => {
    let expression: (Coordinate | Bracket)[] = _expression;
    const bracketExps: BracketExps = {};
    let num = 1;

    while (true) {
      // 查询第一个)
      // for(let i = 0; i< expression.length; i++) {
      //   if(expression[i].type)
      // }
      const end = expression.findIndex(i => (i as any).type == Type.Rparen) + 1;
      if (end === 0) break;
      // if (num > 9) return { isPass: false, message: EN.Toomanyfunctions }
      // 查询截取表达式最后一个(
      let start = -1;
      for (let i = end - 1; i > -1; i--) {
        if ((expression[i] as any).type === Type.Lparen) {
          start = i;
          break;
        }
      }
      if (start === -1) return { isPass: false, message: EN.Unexpectedtoken };
      const exp: (Coordinate | Bracket)[] = expression.slice(
        start + 1,
        end - 1,
      );
      bracketExps[num] = exp;
      //转化(...)为$?
      expression = [
        ...expression.slice(0, start),
        { index: num },
        ...expression.slice(end),
      ];
      num++;
    }

    return {
      expression,
      bracketExps,
      isPass: true,
      message: 'ok',
    };
  };

  // 校验基本表达式
  public checkSimpleExp = (
    expression: (Coordinate | Bracket)[],
    bracketExps: BracketExps,
    inFunction: boolean,
  ): CheckReturns => {
    if (!expression.length)
      return { isPass: false, message: EN.Emptyexpression };
    // const baseOptReg = new RegExp(/[+\-*/]/)
    const length = expression.length;
    let start = 0;
    let skipNum = 0;
    let array: (Coordinate | Bracket)[][] = [];
    // 根据+-*/切割表达式 忽略[]
    for (let i = 0; i < length; i++) {
      if (i < start) continue;
      if ((expression[i] as any).type === Type.Lc) {
        skipNum++;
        continue;
      }
      if ((expression[i] as any).type === Type.RC) {
        if (skipNum > 0) skipNum--;
        continue;
      }
      if (skipNum === 0 && (expression[i] as any).type === Type.Op) {
        array.push(expression.slice(start, i));
        start = i + 1;
      }
    }
    if (start < length) array.push(expression.slice(start, length));
    // const array = expression.split(baseOptReg)
    let num = 1;
    let isVariable = false;
    let expType = '';
    let warning = false;
    const typeArray: string[] = [];
    for (let item of array) {
      if (!item.length) {
        if (warning) return { isPass: false, message: EN.Errorexpression };
        warning = true;
        continue;
      } else {
        warning = false;
      }
      //Categorical
      let type = 'Numerical';
      // item = item.trim()
      // 判断是否含有转化的()表达式
      const isArray =
        (item[0] as any).type === Type.Lc &&
        (item[item.length - 1] as any).type === Type.RC;
      const fnIndex = item.findIndex(it => !!(it as any).index);
      const idIndex = item.findIndex(it => (it as any).type === Type.ID);
      const paramFnIndex = item.findIndex(it => (it as any).type === Type.Func);
      if (isArray) {
        if (!inFunction)
          return {
            isPass: false,
            message: `${EN.Unexpectedidentifier} ${this.expToString(
              item as Coordinate[],
            )}`,
          };
        //暂时只判断是否为空数组
        item = item.slice(1, -1);
        if (!item.length)
          return { isPass: false, message: `${EN.Unknownvariable} []` };
        // const arrayResult = checkParams(item, null, 0, false)
        // if (!arrayResult.isPass) return arrayResult
        type = 'Array';
      } else if (fnIndex > -1) {
        // 截取函数名称
        const functionName = item.slice(0, fnIndex) as Coordinate[];
        let bracketNum = item[fnIndex] as Bracket;
        // if (!bracketNum || isNaN(bracketNum)) return { isPass: false, message: EN.Errorexpression }
        // try {
        //   bracketNum = parseInt(bracketNum, 10)
        // } catch (e) {
        //   return { isPass: false, message: EN.Errorexpression }
        // }
        const other = item.slice(fnIndex + 1) as Coordinate[];
        if (other.length)
          return {
            isPass: false,
            message: `${EN.Unexpectedidentifier} ${this.expToString(
              other as Coordinate[],
            )}`,
          };
        // 校验参数
        const fnResult = this.checkParams(
          functionName,
          bracketExps,
          bracketNum.index,
        );
        if (!fnResult.isPass) return fnResult;
        num += fnResult.num - 1;
        isVariable = fnResult.isVariable;
        type = fnResult.type;
      } else if (idIndex > -1) {
        // 判断是否为选择的参数
        if (item.length > 1)
          return {
            isPass: false,
            message: `${EN.Unknownvariable} ${this.expToString(
              item as Coordinate[],
            )}`,
          };
        // item = item.slice(1)
        // if (!item || !dataHeader.includes(item.value))
        const cur: Coordinate = item[0] as Coordinate;
        isVariable = true;
        type =
          this.props.variables[cur.value || ''] === 'Numerical'
            ? 'Numerical'
            : 'Categorical';
      } else if (paramFnIndex > -1) {
        if (item.length > 1)
          return {
            isPass: false,
            message: `${EN.Unexpectedidentifier} ${this.expToString(
              item as Coordinate[],
            )}`,
          };
      } else {
        const numItem = this.expToString(item as Coordinate[]);
        const isNum = !isNaN(+numItem);
        //判断是否是数字
        if (!isNum)
          return {
            isPass: false,
            message: `${EN.Unexpectedidentifier} ${numItem}`,
          };
      }
      typeArray.push(type);
    }
    if (typeArray.length > 1) {
      const index = typeArray.indexOf('Categorical');
      if (index !== -1)
        return {
          isPass: false,
          message: `${EN.Errorexpression}: ${this.expToString(array[
            index
          ] as Coordinate[])}`,
        };
      expType = 'Numerical';
    } else {
      expType = typeArray[0];
    }
    return { isPass: true, message: EN.OK, num, isVariable, type: expType };
  };

  // 校验表达式参数
  public checkParams = (
    functionName: (Coordinate | Bracket)[],
    bracketExps: BracketExps,
    bracketNum: number,
  ): CheckReturns => {
    //默认校验函数 暂时 校验数组functionName为总表达式
    const exps = bracketExps[bracketNum];
    if (!exps.length) return { isPass: false, message: EN.Emptyparameter };
    const length = exps.length;
    let start = 0;
    let skipNum = 0;
    let expArray: (Coordinate | Bracket)[][] = [];
    // 根据, 分割参数
    for (let i = 0; i < length; i++) {
      if (i < start) continue;
      if ((exps[i] as Coordinate).type === Type.Lc) {
        skipNum++;
        continue;
      }
      if ((exps[i] as Coordinate).type === Type.RC) {
        if (skipNum > 0) skipNum--;
        continue;
      }
      if (skipNum === 0 && (exps[i] as Coordinate).type === Type.Split) {
        expArray.push(exps.slice(start, i));
        start = i + 1;
      }
    }
    if (start < length) expArray.push(exps.slice(start, length));
    let numOfParam = 0;
    let isVariable1 = false;
    let num = 1;
    let fnType = '';
    const params: Params[] = [];
    let stillVariable = true;
    for (const exp of expArray) {
      // 校验表达式
      const expChecked = this.checkSimpleExp(
        exp,
        bracketExps,
        !!functionName.length,
      );
      if (!expChecked.isPass) return expChecked;
      const { isVariable, num, type } = expChecked;
      if (stillVariable) {
        if (isVariable) numOfParam++;
        if (!isVariable) stillVariable = false;
      }
      // 报存参数类型
      params.push({
        isVariable,
        num,
        exp,
        type,
      });
    }

    let skipParams = false;
    fnType = 'Numerical';
    // 不是函数, 则参数只能为1个
    if (!functionName.length && expArray.length > 1)
      return {
        isPass: false,
        message: `${EN.Unexpectedidentifier} ${exps
          .map(v => (v as Coordinate).value)
          .join('')}`,
      };
    if (functionName.length > 1)
      return {
        isPass: false,
        message: `${EN.Unexpectedidentifier} ${functionName
          .map(v => (v as Coordinate).value)
          .join('')}`,
      };
    const BaseFn = !functionName.length
      ? false
      : this.props.functions.base.find(
          fn => fn.value === (functionName[0] as Coordinate).value,
        );
    const SeniorFn = !functionName.length
      ? false
      : this.props.functions.senior.find(
          fn => fn.value === (functionName[0] as Coordinate).value,
        );
    // 判断函数参数个数限制
    if (BaseFn && BaseFn.params && BaseFn.params !== expArray.length)
      return {
        isPass: false,
        message: `${EN.Function} ${
          (functionName[0] as Coordinate).value
        } must have ${BaseFn.params} params`,
      };

    if (SeniorFn) {
      // 校验高级函数参数
      const seniorResult: CheckReturns = this.checkSeniorParams(
        SeniorFn,
        params,
        numOfParam,
        bracketExps,
      );
      if (!seniorResult.isPass) return seniorResult;
      isVariable1 = true;
      num += seniorResult.num - 1;
      fnType = seniorResult.type;
      skipParams = true;
    }
    if (BaseFn) {
      // 校验一般函数参数
      if (BaseFn.value === 'Eq') {
        fnType = 'Categorical';
        skipParams = true;
      }
    }

    for (let param of params) {
      num += param.num - 1;
      isVariable1 = isVariable1 || param.isVariable;
    }
    if (!skipParams) {
      // 校验参数
      for (let param of params) {
        if (param.type === 'Categorical')
          return { isPass: false, message: EN.ParametersmustbeNumerical };
      }
    }

    return {
      isPass: true,
      message: `ok`,
      num,
      isVariable: isVariable1,
      type: fnType,
    };
  };

  // 校验高级表达式参数
  public checkSeniorParams = (
    senior: Coordinate,
    params: Params[],
    numOfParam: number,
    bracketExps: BracketExps,
  ): CheckReturns => {
    let num = 0;
    let type = '';

    // 截取列名参数
    const paramList = params.slice(0, numOfParam);
    const skipFn = ['Concat', 'Groupby'];
    const paramType = ['Substring', 'Number_extraction'].includes(senior.value)
      ? 'Categorical'
      : 'Numerical';
    if (!skipFn.includes(senior.value)) {
      for (let param of paramList) {
        if (param.type !== paramType)
          return {
            isPass: false,
            message: `${EN.Function} ${senior.value} ${Reflect.get(
              EN,
              `Parametersmustbe${paramType}`,
            )}`,
          };
      }
    }
    // 截取非列名参数
    const numList = params.slice(numOfParam);
    switch (senior.value) {
      case 'Concat':
        type = 'Categorical';
        if (numOfParam < 1)
          return {
            isPass: false,
            message: `${EN.Function}: ${senior.value} ${EN.Parameterserror} `,
          };
        const concatResults = numList.map(num => {
          let _n: string = this.expToString(num.exp);
          if (isNaN(+_n) || _n.includes('.'))
            return { isPass: false, message: `${_n} ${EN.Mustbeinteger} ` };
          let n: number;
          try {
            n = parseInt(_n, 10);
          } catch (e) {
            return { isPass: false, message: `${_n} ${EN.Mustbeinteger} ` };
          }
          if (n < 2)
            return { isPass: false, message: `${n} ${EN.Mustgreaterthan} 1` };
          if (n > numOfParam)
            return {
              isPass: false,
              message: `${n} ${EN.Mustlessthan} ${numOfParam + 1} `,
            };
          return {
            isPass: true,
            message: EN.OK,
            num:
              this.factorial(numOfParam) /
              this.factorial(n) /
              this.factorial(numOfParam - n),
          };
        });
        for (let numResult of concatResults) {
          if (!numResult.isPass) return numResult;
          num += numResult.num || 0;
        }
        break;
      case 'Diff':
        type = 'Numerical';
        const diffResults = numList.map(num => {
          let n = this.expToString(num.exp);
          if (isNaN(+n) || n.includes('.'))
            return { isPass: false, message: `${n} ${EN.Mustbeinteger} ` };
          try {
            parseInt(n, 10);
          } catch (e) {
            return { isPass: false, message: `${n} ${EN.Mustbeinteger} ` };
          }
          return { isPass: true, message: EN.OK, num: numOfParam };
        });
        for (let numResult of diffResults) {
          if (!numResult.isPass) return numResult;
          num += numResult.num || 0;
        }
        break;
      case 'Accumulate':
        type = 'Numerical';
        num = numOfParam;
        break;
      case 'Quantile_bin':
        type = 'Categorical';
        const quantileBinArray = ['0', '1'];
        if (numList.length < 2)
          return {
            isPass: false,
            message: `${EN.Function}: ${senior.value} ${EN.Parameterserror} `,
          };
        const [b, type1, type2] = numList;
        if (
          isNaN(+this.expToString(b.exp)) ||
          this.expToString(b.exp).includes('.')
        )
          return {
            isPass: false,
            message: `${this.expToString(b.exp)} ${EN.Mustbeinteger} `,
          };
        if (!quantileBinArray.includes(this.expToString(type1.exp).trim()))
          return {
            isPass: false,
            message: `${this.expToString(type1.exp)} ${EN.Isnotsupported} `,
          };
        if (
          type2 &&
          !quantileBinArray.includes(this.expToString(type2.exp).trim())
        )
          return {
            isPass: false,
            message: `${this.expToString(type2.exp)} ${EN.Isnotsupported} `,
          };
        num = numOfParam * (type2 ? 2 : 1);
        break;
      case 'Custom_Quantile_bin':
        type = 'Categorical';
        const numResults = numList.map(num => {
          let n = this.expToString(num.exp);
          if (num.type !== 'Array')
            return {
              isPass: false,
              message: `${EN.Unexpectedidentifier} ${n} `,
            };
          // const str = n.trim()
          // const first = num.exp.slice(0, 1)
          // const last = num.exp.slice(-1)
          // if (first.type !== "[" || last.value !== "]") return { isPass: false, message: `${ EN.Unexpectedidentifier } ${ n } ` }
          const cuschecked = this.checkArrayParams(
            num.exp.slice(1, -1),
            bracketExps,
            ({ item, type, isVariable }) => {
              if (!item)
                return {
                  isPass: false,
                  message: `${subItem.exp} contain ${EN.Emptyexpression} `,
                };
              if (isVariable)
                return { isPass: false, message: `cannot use variable` };
              if (type !== 'Numerical')
                return {
                  isPass: false,
                  message: `${item} ${EN.Mustbenumber} `,
                };
              return { isPass: true, message: 'ok' };
            },
          );
          if (!cuschecked.isPass) return cuschecked;
          // const array = str.slice(1, -1).split(",")
          // for (let item of array) {
          //   if (!item || isNaN(parseFloat(item.trim()))) return { isPass: false, message: `${ item } ${ EN.Mustbenumbe } ` }
          // }
          return { isPass: true, message: EN.OK, num: 1 };
        });
        for (let numResult of numResults) {
          if (!numResult.isPass) return numResult;
          num += (numResult as any).num || 0;
        }
        break;
      case 'Groupby':
        type = 'Categorical';
        let nList;
        if (numOfParam === 1) {
          if (numList.length !== 2)
            return {
              isPass: false,
              message: `${EN.errorparams}${numList
                .map(n => this.expToString(n.exp))
                .join(',')} `,
            };
          const vList = numList[0];
          nList = numList[1];
          const vExp = this.expToString(vList.exp);
          if (vList.type !== 'Array')
            return {
              isPass: false,
              message: `${EN.Unexpectedidentifier} ${vExp} `,
            };
          const vListchecked = this.checkArrayParams(
            vList.exp.slice(1, -1),
            bracketExps,
            ({ item, isVariable }) => {
              console.log(item, isVariable, 'vListchecked');
              if (!item)
                return {
                  isPass: false,
                  message: `${subItem.exp} contain ${EN.Emptyexpression} `,
                };
              if (!isVariable)
                return { isPass: false, message: `must use variable` };
              return { isPass: true, message: 'ok' };
            },
          );
          if (!vListchecked.isPass) return vListchecked;
          if ((vListchecked.params || 0) > 2)
            return { isPass: false, message: `cannot > 2` };
        } else if (numOfParam === 2) {
          if (numList.length !== 1)
            return {
              isPass: false,
              message: `${EN.errorparams}${numList
                .map(n => this.expToString(n.exp))
                .join(',')} `,
            };
          nList = numList[0];
        } else {
          return {
            isPass: false,
            message: `${EN.errorparams}${paramList
              .slice(1)
              .map(n => this.expToString(n.exp))
              .join(',')} `,
          };
        }

        const nExp = this.expToString(nList.exp);
        const nListValues =
          paramList[0].type === 'Numerical'
            ? ['sum', 'mean', 'min', 'max', 'std', 'median']
            : ['mode'];
        console.log(nExp, nList, 'nExp');
        if (nList.type === 'Array') {
          const nListchecked = this.checkArrayParams(
            nList.exp.slice(1, -1),
            bracketExps,
            ({ item, isVariable }) => {
              console.log(item, isVariable, 'nListchecked');
              if (!item)
                return {
                  isPass: false,
                  message: `${subItem.exp} contain ${EN.Emptyexpression} `,
                };
              if (isVariable)
                return { isPass: false, message: `cannot use variable` };
              if (!nListValues.includes(item.toLowerCase()))
                return {
                  isPass: false,
                  message: `${EN.Unexpectedidentifier} ${item} `,
                };
              return { isPass: true, message: 'ok' };
            },
            true,
          );
          if (!nListchecked.isPass) return nListchecked;
          num = nListchecked.params || 0;
        } else {
          if (nList.exp.length > 1)
            return {
              isPass: false,
              message: `${EN.Unexpectedidentifier} ${nExp} `,
            };
          const nParamExp = this.expToString([nList.exp[0]]);
          if (!nListValues.includes(nParamExp.toLowerCase()))
            return {
              isPass: false,
              message: `${EN.Unexpectedidentifier} ${nParamExp} `,
            };
          // if (nList.exp[0].type !== Type.Func) return { isPass: false, message: `${ EN.Unexpectedidentifier } ${ nExp } ` }
          num = 1;
        }

        // // const [vList, nList] = numList
        // const vExp = this.expToString(vList.exp)
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

        // const nExp = this.expToString(nList.exp)
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
      case 'Interactive':
        type = 'Numerical';
        if (numList.length > 0)
          return {
            isPass: false,
            message: `${EN.errorparams}${numList
              .map(n => this.expToString(n.exp))
              .join(',')} `,
          };
        num = (numOfParam * (numOfParam - 1)) >> 1;
        break;
      case 'Box_cox':
        type = 'Numerical';
        if (numList.length > 1)
          return {
            isPass: false,
            message: `${EN.errorparams} ${numList
              .slice(1)
              .map(n => this.expToString(n.exp))
              .join(',')} `,
          };
        if (numOfParam > 1)
          return {
            isPass: false,
            message: `${EN.errorparams}${paramList
              .slice(1)
              .map(n => this.expToString(n.exp))
              .join(',')} `,
          };
        if (
          numList[0] &&
          this.expToString(numList[0].exp) &&
          isNaN(+this.expToString(numList[0].exp))
        )
          return {
            isPass: false,
            message: `${this.expToString(numList[0].exp)} ${EN.Mustbenumber} `,
          };
        num = 1;
        break;
      case 'Number_extraction':
        type = 'Numerical';
        if (numList.length > 0)
          return {
            isPass: false,
            message: `${EN.errorparams}${numList
              .map(n => this.expToString(n.exp))
              .join(',')} `,
          };
        if (numOfParam > 1)
          return {
            isPass: false,
            message: `${EN.errorparams}${paramList
              .slice(1)
              .map(n => this.expToString(n.exp))
              .join(',')} `,
          };
        num = 1;
        break;
      case 'Substring':
        type = 'Categorical';
        if (numList.length > 1)
          return {
            isPass: false,
            message: `${EN.errorparams}${numList
              .slice(1)
              .map(n => this.expToString(n.exp))
              .join(',')} `,
          };
        if (numOfParam > 1)
          return {
            isPass: false,
            message: `${EN.errorparams}${paramList
              .slice(1)
              .map(n => this.expToString(n.exp))
              .join(',')} `,
          };
        const subItem = numList[0];
        if (!subItem)
          return {
            isPass: false,
            message: `${EN.Function}: ${senior.value} ${EN.Parameterserror}`,
          };
        if (subItem.type !== 'Array')
          return {
            isPass: false,
            message: `${EN.Unexpectedidentifier} ${this.expToString(
              subItem.exp,
            )} `,
          };
        // const subExp = expToString(subItem.exp)
        // const first = subExp.slice(0, 1)
        // const last = subExp.slice(-1)
        // if (first !== "[" || last !== "]") return { isPass: false, message: `${ EN.Unexpectedidentifier } ${ subExp } ` }
        // const subArray = subItem.exp.slice(1, -1)
        let prev: any;
        const subchecked = this.checkArrayParams(
          subItem.exp.slice(1, -1),
          bracketExps,
          ({ item, type, isVariable }) => {
            if (!item)
              return {
                isPass: false,
                message: `${this.expToString(subItem.exp)} contain ${
                  EN.Emptyexpression
                } `,
              };
            if (isVariable)
              return { isPass: false, message: `cannot use variable` };
            if (type !== 'Numerical')
              return { isPass: false, message: `${item} ${EN.Mustbenumber} ` };
            if (isNaN(+item) || item.includes('.'))
              return {
                isPass: false,
                message: `${item} ${EN.Mustbeinteger} `,
              };
            if (item < 0)
              return {
                isPass: false,
                message: `${item} ${EN.Thenumbermustbegreaterthanorequalto} 0`,
              };
            if (isNaN(+prev)) prev = item;
            else {
              if (prev > item)
                return {
                  isPass: false,
                  message: `${item} ${EN.Mustgreaterthan} ${prev} `,
                };
              prev = item;
            }
            return { isPass: true, message: 'ok' };
          },
        );
        if (!subchecked.isPass) return subchecked;
        if (subchecked.params !== 2)
          return {
            isPass: false,
            message: `${EN.errorparams}${this.expToString(subItem.exp)} `,
          };
        // if (subArray.length !== 2) return { isPass: false, message: `${EN.errorparams}${ subExp } ` }
        // for (let item of subArray) {
        //   if (!item) return { isPass: false, message: `${ subItem.exp } contain ${ EN.Emptyexpression } ` }
        //   if (isNaN(parseFloat(item)) || item.includes('.')) return { isPass: false, message: `${ item } ${ EN.Mustbeinteger } ` }
        // }
        num = 1;
        break;
      default:
        break;
    }
    if (num < 1)
      return {
        isPass: false,
        message: `${EN.Function}: ${senior.value} ${EN.Parameterserror} `,
      };
    return { isPass: true, message: EN.OK, num, type };
  };

  public checkArrayParams = (
    exps: any[],
    bracketExps: any,
    callback: ({  }: any) => { isPass: boolean; message: string },
    unCheck?: boolean,
  ): { isPass: boolean; message: string; params?: number } => {
    if (!exps.length) return { isPass: false, message: EN.Emptyparameter };
    const length = exps.length;
    let start = 0;
    let skipNum = 0;
    let expArray: (Coordinate | Bracket)[][] = [];
    // 根据, 分割参数
    for (let i = 0; i < length; i++) {
      if (i < start) continue;
      if ((exps[i] as any).type === Type.Lc) {
        skipNum++;
        continue;
      }
      if ((exps[i] as any).type === Type.RC) {
        if (skipNum > 0) skipNum--;
        continue;
      }
      if (skipNum === 0 && (exps[i] as any).type === Type.Split) {
        expArray.push(exps.slice(start, i));
        start = i + 1;
      }
    }
    if (start < length) expArray.push(exps.slice(start, length));

    for (const exp of expArray) {
      let isVariable = false;
      let type = '';
      if (!unCheck) {
        // 校验表达式
        const expChecked = this.checkSimpleExp(exp, bracketExps, true);
        if (!expChecked.isPass) return expChecked;
        isVariable = expChecked.isVariable;
        type = expChecked.type;
      }
      const checked = callback({
        item: this.expToString(exp as Coordinate[]),
        type,
        isVariable,
      });
      if (!checked.isPass) return checked;
    }
    return { isPass: true, message: 'ok', params: expArray.length };
  };

  // 计算阶乘
  public factorial = (n: number): number => {
    if (n < 2) return 1;
    return n * this.factorial(n - 1);
  };

  public expToString = (exps: (Coordinate | Bracket)[]) =>
    exps
      .map((_e: Coordinate) =>
        !_e.value
          ? ''
          : _e.type === Type.ID
          ? this.props.mapHeader[_e.value]
          : (_e as any).value,
      )
      .join('');

  // 校验总表达式
  public checkExp = (_expression: Coordinate[]) => {
    if (!_expression.length)
      return { isPass: true, message: EN.Emptyparameter, num: 0 };
    // if (_expression.includes("$")) return { isPass: false, message: EN.Unexpectedtoken$ }

    const {
      bracketExps,
      expression,
      isPass: _isPass,
      message: _message,
    } = this.formatBracket(_expression);
    if (!_isPass) return { isPass: _isPass, message: _message };
    // console.log(bracketExps, expression, 666)
    const { isPass, message, num, type } = this.checkSimpleExp(
      expression as (Coordinate | Bracket)[],
      bracketExps,
      false,
    );
    return { isPass, message, num, type };
  };
  //------------------------------------------check end-----------------------------------------------------------------

  // return variable's list, types: Coordinate[]
  get variables(): Coordinate[] {
    const { variables, mapHeader } = this.props;
    return _.map(variables, (value: string, key: string) => {
      return {
        name: mapHeader[key],
        type: Type.ID,
        value: key,
        varType: value && value.toLocaleLowerCase(),
      };
    });
  }

  get newVariables() {
    let variables: any;

    //参数类型： concat eq 任意类型  其他的方法都需要 Numerical类型的变量
    const { exps, index } = this.state;
    const currExp = exps[index];
    const { range, value } = currExp;
    const inputIndex = range[1];
    const pre = _.slice(value, 0, inputIndex);
    const next = _.slice(value, inputIndex);
    const lParenIndex = _.findLastIndex(pre, v => {
      if (v.value === '(') {
        return (
          _.findIndex(next, ({ value, id }) => value === ')' && v.id === id) >
          -1
        );
      }
      return false;
    });
    const vari = pre.pop() || {};
    const func = vari.type === Type.Func ? undefined : value[lParenIndex - 1];
    if (func) {
      const { name } = func;
      variables = _.filter(this.variables, ({ varType }: any) => varType !== 'raw');
      if (
        !_.includes(
          [
            'Number_extraction',
            'Substring',
            'Groupby',
            'Substring',
            'Concat',
            'Eq',
            '(',
            ')',
            ',',
          ],
          name,
        )
      ) {
        variables = _.filter(
          this.variables,
          ({ varType }: any) => varType === 'numerical',
        );
      }
      if (_.includes(['Number_extraction', 'Substring'], name)) {
        variables = _.filter(
          this.variables,
          ({ varType }: any) => varType === 'categorical',
        );
      }
    } else {
      variables = this.variables;
    }

    return {
      func,
      variables,
    };
  }

  public render() {
    // console.log(`NewVariableView`);
    const { exps, index, detailKey, loading } = this.state;
    const { functions } = this.props;
console.log(this.newVariables)
    return (
      <>
        <Container component={MyContainer}>
          <Subtitle>{EN.VariableFormula}</Subtitle>
          <Expressions
            exps={exps}
            index={index}
            setIndex={this.setIndex}
            addLine={this.addLine}
            deleteIndex={this.deleteIndex}
            setRange={this.setRange}
            deleteExp={this.deleteExp}
            left={this.left}
            right={this.right}
            addExp={this.addExp}
            func={this.newVariables.func}
            changeExpLabel={this.changeExpLabel}
            handleFunction={this.handleFunctionsDoubleClick}
            handleVariables={this.handleVariablesClick}
            functions={functions && [...functions.base, ...functions.senior]}
            variables={this.newVariables.variables}
          />
        </Container>

        <Grid container spacing={3} component={'div'}>
          <Grid item xs={6} md={3} component={MyGrid} zeroMinWidth>
            <Subtitle>{EN.Function}</Subtitle>
            <Functions
              handleDoubleClick={this.handleFunctionsDoubleClick}
              handleClick={this.handleFunctionsClick}
              functions={functions as any}
            />
          </Grid>

          <Grid item xs={6} md={3} component={MyGrid} zeroMinWidth>
            <Subtitle>{EN.FormField}</Subtitle>
            <Variables
              handleClick={this.handleVariablesClick}
              variables={this.newVariables.variables}
            />
          </Grid>

          <Grid item xs={6} md={6} component={MyGrid} zeroMinWidth>
            <Subtitle>{EN.ProjectDescription}</Subtitle>
            <Summary detailKey={detailKey} />
          </Grid>
        </Grid>
        <Container
          style={{
            paddingRight: 0,
            paddingLeft: 0,
            marginTop: 20,
          }}
        >
          <MySave variant="contained" onClick={this.processAndSave} href={''}>
            {!loading ? (
              EN.Yes
            ) : (
              <Icon type="loading" style={{ fontSize: '24px' }} />
            )}
          </MySave>
          <MyCancel variant="contained" onClick={this.props.onClose} href={''}>
            {EN.CANCEL}
          </MyCancel>
        </Container>
      </>
    );
  }
}

export default NewVariableView;
