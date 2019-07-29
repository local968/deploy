import { action, observable } from 'mobx';
import * as _ from 'lodash';

import EN from '../../constant/en';

import { Exp, Type, Coordinate } from './types/Coordinate';

export interface InterfaceFunctions {
  base: any;
  senior: any;
}

export class NewVariableStore {
  @observable functions: InterfaceFunctions = {
    base: [
      {
        name: 'Exp',
        value: 'Exp',
        type: Type.Func,
        grammar: `${EN.Syntax}exp(@var)`,
        params: 1,
      },
      {
        name: 'Log2',
        value: 'Log2',
        type: Type.Func,
        grammar: `${EN.Syntax}log2(@var)`,
        params: 1,
      },
      {
        name: 'Log10',
        value: 'Log10',
        type: Type.Func,
        grammar: `${EN.Syntax}log10(@var)`,
        params: 1,
      },
      {
        name: 'Pow',
        value: 'Pow',
        type: Type.Func,
        grammar: `${EN.Syntax}pow(@var, base)`,
        params: 2,
      },
      {
        name: 'Ln',
        value: 'Ln',
        type: Type.Func,
        grammar: `${EN.Syntax}ln(@var)`,
        params: 1,
      },
      {
        name: 'Eq',
        value: 'Eq',
        type: Type.Func,
        grammar: `${EN.Syntax}eq(@var1, @var2)`,
        params: 2,
      },
      {
        name: 'Sum',
        value: 'Sum',
        type: Type.Func,
        grammar: `${EN.Syntax}sum(@var1, @var2, @var3, ...)`,
      },
      {
        name: 'Min',
        value: 'Min',
        type: Type.Func,
        grammar: `${EN.Syntax}min(@var1, @var2, @var3, ...)`,
      },
      {
        name: 'Max',
        value: 'Max',
        type: Type.Func,
        grammar: `${EN.Syntax}max(@var1, @var2, @var3, ...)`,
      },
      {
        name: 'Mean',
        value: 'Mean',
        type: Type.Func,
        grammar: `${EN.Syntax}mean(@var1, @var2, @var3, ...)`,
      },
    ],
    senior: [
      {
        name: 'Concat',
        value: 'Concat',
        type: Type.Func,
        grammar: `${EN.Syntax}Concat(@var1, @var2, @var3,...p1, p2...)`,
      },
      {
        name: 'Diff',
        value: 'Diff',
        type: Type.Func,
        grammar: `${EN.Syntax}Diff(@var1, @var2, @var3,...row1,row2,...)`,
      },
      {
        name: 'Accumulate',
        value: 'Accumulate',
        type: Type.Func,
        grammar: `${EN.Syntax}Accumulate(@var1, @var2, @var3,...)`,
      },
      {
        name: 'Quantile_bin',
        value: 'Quantile_bin',
        type: Type.Func,
        grammar: `${EN.Syntax}Quantile_bin(@var, b, type)`,
      },
      {
        name: 'Groupby',
        value: 'Groupby',
        type: Type.Func,
        grammar: `${EN.Syntax}Groupby(@var1, [key list]，function_list)`,
      },
      {
        name: 'Interactive',
        value: 'Interactive',
        type: Type.Func,
        grammar: `${EN.Syntax}Interactive(@var1, @var2, @var3，...)`,
      },
      {
        name: 'Box_cox',
        value: 'Box_cox',
        type: Type.Func,
        grammar: `${EN.Syntax}Box_cox(@var, lambda)`,
      },
      {
        name: 'Number_extraction',
        value: 'Number_extraction',
        type: Type.Func,
        grammar: `${EN.Syntax}Number_ectraction(@var)`,
      },
      {
        name: 'Substring',
        value: 'Substring',
        type: Type.Func,
        grammar: `${EN.Syntax}Substring(@var, [position1, position2])`,
      },
    ],
  };

  private initExp = { value: [], label: '', range: [0, 0] };

  @observable detailKey = '';
  @observable exps = [this.initExp];
  @observable index = 0;
  @observable func = '';

  @action public handleVariables = (
    v: Coordinate,
    startIndex: number | null,
  ) => {
    const { exps, index } = this;
    const newExp = exps[index];
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
  };

  @action changeExpLabel(v: string) {
    this.exps[this.index].label = v;
  }

  @action setDetailKey = v => {
    this.detailKey = v;
  };

  @action setIndex = (k) => {
    this.index = k;
  }
}

export default new NewVariableStore();
