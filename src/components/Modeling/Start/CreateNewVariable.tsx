import { observer } from 'mobx-react';
import React, { Component } from 'react';
import { observable } from 'mobx';
import FUNCTIONS from './functions';
import styles from './styles.module.css';
import { Icon, message as antdMessage } from 'antd';
import EN from '../../../constant/en';
import classnames from 'classnames';
import FunctionTips from './FunctionTips';

interface Interface {
  dataHeader:any
  colType:any
  expression:any
  addNewVariable:any
  onClose:any
}

@observer
export default class CreateNewVariable extends Component<Interface> {
  private readonly fxRef: React.RefObject<any>;
  constructor(props) {
    super(props);
    this.fxRef = React.createRef();
  }

  @observable hintStatus = false;
  @observable hints = [];
  @observable exp = '';
  @observable name = '';
  @observable showFunction:any = {};
  @observable active = 0;
  //光标结束位置
  @observable inputPosition = 0;
  @observable myFunction:any = {};
  @observable loading = false;
  @observable isIn = false;
  @observable showTips = false;

  hideHint = () => {
    this.hintStatus = false;
    this.showTips = false;
    this.showFunction = {};
    this.active = 0;
    this.hints = [];
    document.onmousedown = () => {};
  };

  handleChange = e => {
    this.exp = e.target.value;
  };

  changeHints = () => {
    const startIndex = this.getStartIndex();
    const functionStr = this.exp.slice(0, startIndex);
    const functionList = [...FUNCTIONS.base, ...FUNCTIONS.senior];
    const hasFunction = functionList.find(v =>
      functionStr.includes(v.value.slice(0, -1)),
    );
    const hasConcat = functionList
      .filter(v => functionStr.includes(v.value.slice(0, -1)))
      .find(v => v.value === 'Concat()');
    this.myFunction =
      [...FUNCTIONS.senior]
        .reverse()
        .find(v => functionStr.includes(v.value.slice(0, -1))) || {};
    let exp = this.exp.slice(startIndex, this.inputPosition).trim();
    const { dataHeader, colType } = this.props;
    let valueList = [...dataHeader];
    if (!hasConcat)
      valueList = valueList.filter(v => colType[v] === 'Numerical');
    let filterFunctions = [];
    if (exp.startsWith('@')) {
      exp = exp.slice(1).trim();
      if (!exp)
        return (this.hints = valueList.map(v => {
          return {
            label: v,
            value: '@' + v,
          };
        }));
    } else {
      filterFunctions = [...FUNCTIONS.base];
      if (!hasFunction)
        filterFunctions = FUNCTIONS.senior
          .filter(v => v.value.toLowerCase().includes(exp.toLowerCase()))
          .concat(filterFunctions);
    }
    const filterValues = valueList
      .filter(_v => _v.includes(exp.toLowerCase()))
      .map(item => {
        return {
          label: item,
          value: '@' + item,
        };
      });
    this.hints = [...filterFunctions, ...filterValues];
    this.showFunction = !this.hints.length ? {} : this.hints[0];
    return;
  };

  getStartIndex = () => {
    const exp = this.exp.slice(0, this.inputPosition);
    let start = exp.length;
    const endStr = ['+', '-', '*', '/', '(', ','];
    for (; start > 0; start--) {
      if (endStr.includes(exp[start])) {
        start++;
        break;
      }
    }
    return start;
  };

  handleSelect = (value, isFunciton) => {
    // this.exp = value
    const startIndex = this.getStartIndex();
    this.exp =
      this.exp.slice(0, startIndex) +
      value +
      this.exp.slice(this.inputPosition);
    this.fxRef.current.focus();
    setTimeout(() => {
      this.inputPosition =
        (this.exp.slice(0, startIndex) + value).length + (isFunciton ? -1 : 0);
      this.fxRef.current.setSelectionRange(
        this.inputPosition,
        this.inputPosition,
      );
    }, 0);

    (window as any).ref = this.fxRef.current;
  };

  onKeyDown = e => {
    // enter
    if (e.keyCode === 13) {
      if (!this.hints.length) return;
      const selectValue = this.hints[this.active];
      if (!selectValue) return;
      this.handleSelect(selectValue.value, !!selectValue.syntax);
      return;
    }
    // up
    if (e.keyCode === 38) {
      e.preventDefault();
      if (this.active === 0) return;
      this.active--;
      this.showFunction = this.hints[this.active];
    }
    // down
    if (e.keyCode === 40) {
      e.preventDefault();
      if (this.active === this.hints.length - 1) return;
      this.active++;
      this.showFunction = this.hints[this.active];
    }
  };

  onSelect = () => {
    this.inputPosition = this.fxRef.current.selectionEnd;
    this.changeHints();
    this.hintStatus = true;
    this.isIn = true;
    document.onmousedown = e => {
      let dom:any = e.target;
      let isIn = false;
      while (dom) {
        if (dom.className === styles.newVariableFx) {
          isIn = true;
          break;
        }
        dom = dom.parentNode;
      }
      if (!isIn) this.hideHint();
      this.isIn = isIn;
    };
  };

  showSyntax = n => {
    this.active = n;
    this.showFunction = this.hints[this.active];
    this.showTips = false;
  };

  //点击确认按钮
  handleAdd = () => {
    let {
      name,
      exp,
      props: { expression },
    } = this;
    console.log(name, exp, expression, 6666);
    name = name.trim();
    if (!name) return antdMessage.error(EN.Nameisempty);
    if (expression.hasOwnProperty(name))
      return antdMessage.error(`${EN.Newvariable} ${name} ${EN.Isexist}`);
    if (name.includes('_')) return antdMessage.error(EN.Namecannotcontain);
    const checked = this.checkExp(exp);
    if (!checked.isPass) return antdMessage.error(checked.message);
    if (!checked.num) return antdMessage.error(EN.Expressionisempty);
    const { num, type } = checked;
    const nameArray = [];
    if (num === 1) {
      nameArray.push('r2_' + name);
    } else {
      for (let n = 0; n < num; n++) {
        nameArray.push(`r2_${name}_${n + 1}`);
      }
    }
    this.loading = true;
    this.props.addNewVariable(name, nameArray, exp, type).then(result => {
      this.loading = false;
      if (!result) return;
      this.props.onClose();
      this.name = '';
      this.exp = '';
      this.myFunction = {};
      this.hideHint();
    });
  };

  // 转化括号
  formatBracket = _expression => {
    let expression = _expression;
    const bracketExps = [];
    let num = 0;

    while (true) {
      // 查询第一个)
      const end = expression.indexOf(')') + 1;
      if (end === 0) break;
      if (num > 9) return { isPass: false, message: EN.Toomanyfunctions };
      // 查询截取表达式最后一个(
      const start = expression.lastIndexOf('(', end);
      if (start === -1) return { isPass: false, message: EN.Unexpectedtoken };
      const exp = expression.slice(start + 1, end - 1);
      bracketExps.push(exp);
      //转化(...)为$?
      expression =
        expression.slice(0, start) + '$' + num + expression.slice(end);
      num++;
    }

    return {
      expression,
      bracketExps,
    };
  };

  // 校验基本表达式
  checkSimpleExp = (expression, bracketExps) => {
    if (!expression) return { isPass: false, message: EN.Emptyexpression };
    const baseOptReg = new RegExp(/[+\-*/]/);
    // 根据+-*/切割表达式
    const array = expression.split(baseOptReg);
    console.log(array, 777);
    let num = 1;
    let isVariable = false;
    let expType = '';
    const typeArray = [];
    for (let item of array) {
      //Categorical
      let type = 'Numerical';
      item = item.trim();
      if (!item) return { isPass: false, message: EN.Errorexpression };
      //判断是否是数字
      if (isNaN(item)) {
        // 判断是否含有转化的()表达式
        if (item.includes('$')) {
          const index = item.indexOf('$');
          // 截取函数名称
          const functionName = item.slice(0, index).trim();
          let bracketNum = item.slice(index + 1, index + 2).trim();
          if (!bracketNum || isNaN(bracketNum))
            return { isPass: false, message: EN.Errorexpression };
          try {
            bracketNum = parseInt(bracketNum, 10);
          } catch (e) {
            return { isPass: false, message: EN.Errorexpression };
          }
          const other = item.slice(index + 2).trim();
          if (other)
            return {
              isPass: false,
              message: `${EN.Unexpectedidentifier} ${other}`,
            };
          // 校验参数
          const fnResult = this.checkParams(
            functionName,
            bracketExps,
            bracketNum,
          );
          if (!fnResult.isPass) return fnResult;
          num += fnResult.num - 1;
          isVariable = fnResult.isVariable;
          type = fnResult.type;
        }
        // 判断是否为选择的参数
        if (item.startsWith('@')) {
          item = item.slice(1);
          const { dataHeader, colType } = this.props;
          if (!item || !dataHeader.includes(item))
            return { isPass: false, message: `${EN.Unknownvariable} ${item}` };
          isVariable = true;
          type = colType[item] === 'Numerical' ? 'Numerical' : 'Categorical';
        }
      }
      typeArray.push(type);
    }
    if (typeArray.length > 1) {
      const index = typeArray.indexOf('Categorical');
      if (index !== -1)
        return {
          isPass: false,
          message: `${EN.Errorexpression}: ${array[index]}`,
        };
      expType = 'Numerical';
    } else {
      expType = typeArray[0];
    }
    return { isPass: true, message: EN.OK, num, isVariable, type: expType };
  };

  // 校验表达式参数
  checkParams = (functionName, bracketExps, bracketNum) => {
    const exps = bracketExps[bracketNum];
    if (!exps) return { isPass: false, message: EN.Emptyparameter };
    // 根据, 分割参数
    const expArray = exps.split(',');
    // 不是函数, 则参数只能为1个
    if (!functionName && expArray.length > 1)
      return { isPass: false, message: `${EN.Unexpectedidentifier} ${exps}` };
    const isBaseFn = FUNCTIONS.base.find(
      fn => fn.value === functionName + '()',
    );
    const isSeniorFn = FUNCTIONS.senior.find(
      fn => fn.value === functionName + '()',
    );
    const currentFn = isBaseFn || isSeniorFn;
    // 判断函数参数个数限制
    if (currentFn.params && currentFn.params !== expArray.length)
      return {
        isPass: false,
        message: `${EN.Function} ${functionName} must have ${currentFn.params} params`,
      };
    let numOfParam = 0;
    let isVariable1 = false;
    let num = 1;
    let fnType = '';
    const params = [];

    for (const exp of expArray) {
      // 校验表达式
      const expChecked = this.checkSimpleExp(exp.trim(), bracketExps);
      if (!expChecked.isPass) return expChecked;
      const { isVariable, num, type } = expChecked;
      if (isVariable) numOfParam++;
      // 报存参数类型
      params.push({
        isVariable,
        num,
        exp,
        type,
      });
    }

    if (isSeniorFn) {
      // 校验高级函数参数
      const seniorResult = this.checkSeniorParams(
        currentFn,
        params,
        numOfParam,
      );
      if (!seniorResult.isPass) return seniorResult;
      isVariable1 = true;
      num += seniorResult.num - 1;
      fnType = seniorResult.type;
    } else if (isBaseFn) {
      // 校验一般函数参数
      if (currentFn.value === 'eq()') {
        fnType = 'Categorical';
      } else {
        fnType = 'Numerical';
      }
    } else {
      // 校验非函数参数
      for (let param of params) {
        if (param.type !== 'Numerical')
          return { isPass: false, message: EN.ParametersmustbeNumerical };
      }
      fnType = 'Numerical';
    }
    for (let param of params) {
      num += param.num - 1;
      isVariable1 = isVariable1 || param.isVariable;
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
  checkSeniorParams = (senior, params, numOfParam) => {
    let num = 0;
    let type = '';

    // 截取列名参数
    const paramList = params.slice(0, numOfParam);
    if (senior.value !== 'Concat()') {
      for (let param of paramList) {
        if (param.type !== 'Numerical')
          return {
            isPass: false,
            message: `${EN.Function} ${senior.value.slice(0, -2)} ${
              EN.ParametersmustbeNumerical
            }`,
          };
      }
    }
    // 截取非列名参数
    const numList = params.slice(numOfParam);
    switch (senior.value) {
      case 'Concat()':
        type = 'Categorical';
        if (numOfParam < 1)
          return {
            isPass: false,
            message: `${EN.Function}: ${senior.value.slice(0, -2)} ${
              EN.Parameterserror
            }`,
          };
        const concatResults = numList.map(num => {
          let n = num.exp;
          if (isNaN(n) || n.includes('.'))
            return { isPass: false, message: `${n} ${EN.Mustbeinteger}` };
          try {
            n = parseInt(n, 10);
          } catch (e) {
            return { isPass: false, message: `${n} ${EN.Mustbeinteger}` };
          }
          if (n < 2)
            return { isPass: false, message: `${n} ${EN.Mustgreaterthan} 1` };
          if (n > numOfParam)
            return {
              isPass: false,
              message: `${n} ${EN.Mustlessthan} ${numOfParam + 1}`,
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
          num += numResult.num;
        }
        break;
      case 'Diff()':
        type = 'Numerical';
        const diffResults = numList.map(num => {
          let n = num.exp;
          if (isNaN(n) || n.includes('.'))
            return { isPass: false, message: `${n} ${EN.Mustbeinteger}` };
          try {
            n = parseInt(n, 10);
          } catch (e) {
            return { isPass: false, message: `${n} ${EN.Mustbeinteger}` };
          }
          return { isPass: true, message: EN.OK, num: numOfParam };
        });
        for (let numResult of diffResults) {
          if (!numResult.isPass) return numResult;
          num += numResult.num;
        }
        break;
      case 'Accumulate()':
        type = 'Numerical';
        num = numOfParam;
        break;
      case 'Quantile_bin()':
        type = 'Categorical';
        const quantileBinArray = ['0', '1'];
        const [b, type1, type2] = numList;
        if (isNaN(b.exp) || b.exp.includes('.'))
          return { isPass: false, message: `${b.exp} ${EN.Mustbeinteger}` };
        if (!quantileBinArray.includes(type1.exp.trim()))
          return {
            isPass: false,
            message: `${type1.exp} ${EN.Isnotsupported}`,
          };
        if (type2 && !quantileBinArray.includes(type2.exp.trim()))
          return {
            isPass: false,
            message: `${type2.exp} ${EN.Isnotsupported}`,
          };
        num = numOfParam * (type2 ? 2 : 1);
        break;
      case 'Custom_Quantile_bin()':
        type = 'Categorical';
        const numResults = numList.map(num => {
          let n = num.exp;
          const str = n.trim();
          const first = str.slice(0, 1);
          const last = str.slice(-1);
          if (first !== '[' || last !== ']')
            return {
              isPass: false,
              message: `${EN.Unexpectedidentifier} ${n}`,
            };
          const array = str.slice(1, -1).split('|');
          for (let item of array) {
            if (!item || isNaN(item.trim()))
              return { isPass: false, message: `${item} ${EN.Mustbenumber}` };
          }
          return { isPass: true, message: EN.OK, num: 1 };
        });
        for (let numResult of numResults) {
          if (!numResult.isPass) return numResult;
          num += numResult.num;
        }
        break;
      default:
        break;
    }
    if (num < 1)
      return {
        isPass: false,
        message: `${EN.Function}: ${senior.value.slice(0, -2)} ${
          EN.Parameterserror
        }`,
      };
    return { isPass: true, message: EN.OK, num, type };
  };

  // 校验总表达式
  checkExp = _expression => {
    if (!_expression) return { isPass: true, message: EN.OK, num: 0 };
    if (_expression.includes('$'))
      return { isPass: false, message: EN.Unexpectedtoken$ };

    const { bracketExps, expression } = this.formatBracket(_expression);
    console.log(bracketExps, expression, 666);
    const { isPass, message, num, type } = this.checkSimpleExp(
      expression,
      bracketExps,
    );
    return { isPass, message, num, type };
  };

  // 计算阶乘
  factorial = n => {
    if (n < 2) return 1;
    return n * this.factorial(n - 1);
  };

  handleNameChange = ({target}) => {
    this.name = target.value.trim();
  };

  deleteFx = () => {
    this.exp = '';
    this.fxRef.current.focus();
  };

  showAll = () => {
    const isSenior = FUNCTIONS.senior
      .map(v => v.syntax)
      .includes(this.showFunction.syntax);
    if (isSenior) this.showTips = true;
  };

  render() {
    const { onClose } = this.props;
    const functionList = [...FUNCTIONS.base, ...FUNCTIONS.senior];
    const functionSyntax = functionList.find(
      v => v.syntax === this.myFunction.syntax,
    );
    const hintFunctionSyntax = functionList.find(
      v => v.syntax === this.showFunction.syntax,
    );
    const hintIsSenior = FUNCTIONS.senior.includes(hintFunctionSyntax);

    return (
      <div className={styles.newVariableBlock}>
        <div className={styles.newVariableRow}>
          <div className={styles.newVariableName}>
            <input
              className={styles.newVariableInput}
              placeholder={EN.NAME}
              value={this.name}
              onChange={this.handleNameChange}
            />
          </div>
          <span>=</span>
          <div className={styles.newVariableFx}>
            <input
              className={styles.newVariableInput}
              placeholder={EN.FX}
              ref={this.fxRef}
              value={this.exp}
              onChange={this.handleChange}
              onKeyDown={this.onKeyDown}
              onSelect={this.onSelect}
            />
            {this.isIn && (
              <div className={styles.newVariableEmpty} onClick={this.deleteFx}>
                <span>X</span>
              </div>
            )}
            {this.hintStatus && (
              <div className={styles.newVariableHintList}>
                {this.hints.map((v, k) => {
                  return (
                    <div
                      key={k}
                      className={classnames(styles.newVariableHint, {
                        [styles.activeHint]: this.active === k,
                      })}
                      onClick={this.handleSelect.bind(
                        null,
                        v.value,
                        !!v.syntax,
                      )}
                      onMouseOver={this.showSyntax.bind(null, k)}
                    >
                      <span>{v.label}</span>
                    </div>
                  );
                })}
              </div>
            )}
            {!!hintFunctionSyntax &&
              (this.showTips ? (
                <FunctionTips value={hintFunctionSyntax.value} />
              ) : (
                <div className={styles.newVariableHintSyntax}>
                  <span>{hintFunctionSyntax.syntax}</span>
                  {hintIsSenior && (
                    <button onClick={this.showAll}>
                      <span>{EN.Tips}</span>
                    </button>
                  )}
                </div>
              ))}
            {!!functionSyntax && (
              <div
                className={styles.newVariableSyntax}
                style={
                  this.hintStatus && !!this.hints.length
                    ? { right: '100%' }
                    : null
                }
              >
                <span>{functionSyntax.syntax}</span>
              </div>
            )}
          </div>
        </div>
        <div className={styles.newVariableRow}>
          <button
            className={classnames(
              styles.newVariableButton,
              styles.newVariableAdd,
              {
                [styles.disable]: this.loading,
              },
            )}
            onClick={this.loading ? null : this.handleAdd}
          >
            <span>
              {this.loading ? <Icon type="loading" theme="outlined" /> : EN.ADD}
            </span>
          </button>
          <button
            className={classnames(
              styles.newVariableButton,
              styles.newVariableCancel,
            )}
            onClick={onClose}
          >
            <span>{EN.Cancel}</span>
          </button>
        </div>
      </div>
    );
  }
}
