import { observable } from 'mobx';

import { Type } from './types/Coordinate';
import EN from '../../constant/en';

class NewVariableStore {
  @observable variables = {
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
}

export default new NewVariableStore();
