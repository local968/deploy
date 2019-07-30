const Interactive = {
  name: 'Interactive',
  describe: 'Interactive函数对选择的变量进行两两相乘操作，生成新变量。',
  grammar: 'Interactive( var1, var2, var3, … )',
  input: ['var1, var2, var3, ….-连续变量，最多支持选择20个变量。'],
  output: '连续变量',
  examples: [
    {
      length: 3,
      input: 'Interactive( age, income )',
      output: [
        ['age', 'income', 'age_income_inter'],
        ['25', '20000', '500000'],
        ['40', '15000', '600000'],
        ['35', '25000', '875000'],
      ],
    },
  ],
};

const Box_cox = {
  name: 'Box_cox',
  describe: 'Box_cox函数对选择的变量进行以lambda为参数的Box-Cox转换。',
  grammar: 'Box_cox( var, lambda )',
  input: ['var- 连续变量', 'lambda- 实数，不输入lambda时默认根据最大化似然函数选择最优lambda值。'],
  output: '连续变量',
  output_desc: [
    '1. 变量中存在小于0的数时，变量将被平移处理成大于等于1的范围。',
    '2. 不合理的lambda输入可能引起错误，建议范围-5.00~5.00，支持小数点后两位小数。',
  ],
  examples: [
    {
      length: 2,
      input: 'Box_cox( duration )',
      output: [
        ['duration', 'duration_boxcox'],
        ['79', '6.22'],
        ['199', '8.15'],
        ['226', '8.44'],
      ],
    }, {
      length: 2,
      input: 'Box_cox( duration，0.5 )',
      output: [
        ['duration', 'duration_boxcox_lambda'],
        ['79', '15.78'],
        ['199', '26.21'],
        ['226', '28.07'],
      ],
    },
  ],
};

const Number_extraction = {
  name: 'Number_extraction',
  describe: 'Number_extraction函数可以提取选择变量中的数字信息。',
  grammar: 'Number_extraction( var )',
  input: ['var- 离散变量'],
  output: '连续变量',
  output_desc: ['当变量中含有多个间隔数字时，提取后数字将被合并。'],
  examples: [
    {
      length: 2,
      input: 'Number_extraction( percent )',
      output: [
        ['percent', 'percent_ext'],
        ['23.319%', '23.319'],
        ['23.311%', '23.311'],
        ['23.35%', '23.350'],
      ],
    },
  ],
};

const Substring = {
  name: 'Substring',
  describe: 'Substing函数可以通过指定位置提取变量信息。',
  grammar: 'Substring( var, [position1, position2] )',
  input: ['var- 离散变量', 'position1, position2- 大于等于0的正整数，position1为提取变量的起始位置，position2为提取字段的结束位置。变量的起始位置从0开始， position2必须大于position1。'],
  output: '离散变量',
  output_desc: ['position2如果超出变量长度将自动截取至变量结束位置。'],
  examples: [
    {
      length: 2,
      input: 'Substring( month, [3, 5] )',
      output: [
        ['month', 'month_sub'],
        ['no.oct month', 'oct'],
        ['no.jun month', 'jun'],
        ['no.may month', 'may'],
      ],
    },
  ],
};
const Groupby = {
  name: 'Groupby',
  describe: 'Groupby函数通过指定主键变量（key）对选择变量进行统计计算。',
  grammar: 'Groupby( var, [key1, key2], [fun1,fun2,…] )',
  input: [
    'var- 连续变量或离散变量',
    'key1， key2- 离散变量，用以对选择变量进行分组的主键变量。最多支持选择2个主键变量（2级统计），只选择一个主键变量时，“[]”可省略。',
    'fun1, fun2,…- 对变量的统计函数，只选择一个fun时，“[]”可省略；',
    'var为连续变量时，支持 [sum, mean, min, max, std, median]；',
    'var为离散变量时，默认支持 mode（众数）统计。',
  ],
  output: '连续变量或离散变量',
  output_desc: ['当变量中含有多个间隔数字时，提取后数字将被合并。'],
  examples: [
    {
      length: 4,
      input: 'Groupby( duration, [job], [sum, median] )',
      output: [
        ['duration', 'job', 'duration_sum', 'duration_median'],
        ['79', '8', '38562', '210.0'],
        ['199', '0', '252275', '176.0'],
        ['266', '1', '263141', '204.0'],
        ['141', '0', '252275', '176.0'],
      ],
    },
  ],
};

const Log2 = {
  name: 'Log2',
  describe: '以2为底数，对所选变量进行Log转换。',
  grammar: 'Log2( var )',
  input: ['var- 连续变量'],
  output: '连续变量',
  output_desc: ['变量中存在负数将被自动替换成0。'],
};

const Log10 = {
  name: 'Log10',
  describe: '以10为底数，对所选变量进行Log转换。',
  grammar: 'Log10( var )',
  input: ['var- 连续变量'],
  output: '连续变量',
  output_desc: ['变量中存在负数将被自动替换成0。'],
};

const Pow = {
  name: 'Pow',
  describe: '计算所选变量的n次方。',
  grammar: 'Pow( var, n )',
  input: ['var- 连续变量', 'n- 实数。'],
  output: '连续变量',
  output_desc: ['返回数值超出内存后将用系统默认最大最小值替代。'],
};

const Eq = {
  name: 'Eq',
  describe: '比较两个变量是否相等，相等返回1，不相等返回0。',
  grammar: 'Eq( var1, var2 )',
  input: ['var1- 离散变量或连续变量', 'var2- 离散变量或连续变量'],
  output_desc: ['返回0/1结果'],
};

const Sum = {
  name: 'Sum',
  describe: '输入单个变量时，返回该变量的总和；输入多个变量时，返回行的总和。',
  grammar: 'Sum( var1, var2, var3, … )',
  input: ['var1, var2, var3, ….- 连续变量'],
  output: '连续变量',
};

const Min = {
  name: 'Min',
  describe: '输入单个变量时，返回该变量的最小值；输入多个变量时，返回行的最小值。',
  grammar: 'Min( var1, var2, var3, … )',
  input: ['var1, var2, var3, ….- 连续变量'],
  output: '连续变量',
};

const Max = {
  name: 'Max',
  describe: '输入单个变量时，返回该变量的最大值；输入多个变量时，返回行的最大值。',
  grammar: 'Max( var1, var2, var3, … )',
  input: ['var1, var2, var3, ….- 连续变量'],
  output: '连续变量',
};

const Median = {
  name: 'Median',
  describe: '输入单个变量时，返回该变量的最大值；输入多个变量时，返回行的中间值。',
  grammar: 'Max( var1, var2, var3, … )',
  input: ['var1, var2, var3, ….- 连续变量'],
  output: '连续变量',
};

const Mean = {
  name: 'Mean',
  describe: '输入单个变量时，返回该变量的均值；输入多个变量时，返回行的均值。',
  grammar: 'Mean( var1, var2, var3, … )',
  input: ['var1, var2, var3, ….- 连续变量'],
  output: '连续变量',
};

const Std = {
  name: 'Std',
  describe: '输入单个变量时，返回该变量的标准差；输入多个变量时，返回行的标准差。',
  grammar: 'Std( var1, var2, var3, … )',
  input: ['var1, var2, var3, ….- 连续变量'],
  output: '连续变量',
};

const Exp = {
  name: 'Exp',
  describe: '以e为底数，以所选变量为指数的函数。',
  grammar: 'Exp( var )',
  input: ['var- 连续变量'],
  output: '连续变量',
  output_desc: '返回数值超出内存后将用系统默认最大最小值替代。',
};

const Diff = {
  name: 'Diff',
  describe: 'Diff函数通过计算所选变量某两行之间的差值来构造新变量。',
  grammar: 'Diff( var，row )',
  input: ['var- 连续变量', 'row- 间隔行数，row为大于等于1的整数，但不能大于变量的总长度。'],
  output: '连续变量',
  output_desc: 'row越大，丢失的值将越多。',
  examples: [
    {
      length: 2,
      input: 'Diff ( tax, 1 )',
      output: [
        ['tax', 'tax_diff_r1'],
        ['200', 'nan'],
        ['230', '30'],
        ['280', '50'],
        ['250', '-30'],
      ],
    },
  ],
};

const Accumulate = {
  name: 'Accumulate',
  describe: 'Accumulate函数通过累加所有之前行的值来构造新变量。',
  grammar: 'Accumulate( var )',
  input: ['var- 连续变量'],
  output: '连续变量',
  output_desc: 'row越大，丢失的值将越多。',
  examples: [
    {
      length: 2,
      input: 'Accumulate ( daily_sales )',
      output: [
        ['daily_sales', 'daily_sales_accum'],
        ['1000', '1000'],
        ['1500', '2500'],
        ['1800', '4300'],
      ],
    },
  ],
};

const Quantile_bin = {
  name: 'Quantile_bin',
  describe: 'Quantile_bin函数通过根据所选变量的频率或值将其分组来构造新变量。',
  grammar: 'Quantile_bin( var, b, type )',
  input: [
    'var- 连续变量',
    'b- 分组数量；b为大于1的整数，但不能大于变量的总长度。',
    'type- 变量分组方式，支持0和1：',
    '0- 以频率分组，每组内值的个数相同;',
    '1- 以变量值分组，每组内值的分布范围相同。',
  ],
  output: '离散变量',
  output_desc: 'b过大，分组太多没有意义。',
  examples: [
    {
      length: 2,
      input: 'Quantile_bin( age, 3, 1 )',
      output: [
        ['age', 'age_val_b3'],
        ['19', '0-25'],
        ['45', '25-50'],
        ['60', '50-75'],
      ],
    }, {
      length: 2,
      input: 'Quantile_bin ( age, 4, 0 )',
      output: [
        ['age', 'age_fre_b4'],
        ['19', '0-25'],
        ['45', '25-40'],
        ['60', '40-60'],
      ],
    },
  ],
};

const Custom_Quantile_bin = {
  name: 'Custom_Quantile_bin',
  describe: 'Custom_Quantile_bin函数通过根据用户指定的范围对所选变量分组来构造新的变量。',
  grammar: 'Custom_Quantile_bin( var, [range_list] )',
  input: [
    'var- 连续变量',
    '[range_list]- 自定义变量划分范围；第一个数值应大于该变量的最小值，最后一个数值应小于该变量的最大值；range_list的长度决定分组数量。',
  ],
  output: '离散变量',
  examples: [
    {
      length: 2,
      input: 'Custom_Quantile_bin( age, [20,40,60] )',
      output: [
        ['age', 'age_cus_b4'],
        ['15', '( <=20 )'],
        ['40', '( 20-40 )'],
        ['55', '( 40-60 )'],
      ],
    },
  ],
};

const Concat = {
  name: 'Concat',
  describe: 'Concat函数通过合并某些变量来构造新变量（例如，合并描述同一对象的变量）。',
  grammar: 'Concat( var1, var2, var3,...p1, p2,... )',
  input: [
    'var1, var2, var3, ….- 离散变量或连续变量，以@符号开头。',
    'p1，p2 ... - 每个组合中的变量数量;　p1, p2为大于1的整数，但不能大于指定变量的数量;　',
    '首先创建p1个变量的组合，然后创建p2个变量的组合，依此类推。',
  ],
  output: '离散变量',
  examples: [
    {
      length: 3,
      isIndividual: true,
      input: 'Concat ( color, theme, size, 2 )',
      inputData: [
        ['color', 'theme', 'size'],
        ['red', 'nature', 'small'],
        ['blue', 'sports', 'medium'],
      ]
      ,
      output: [
        ['color_theme', 'color_size', 'theme_size'],
        ['red_nature', 'red_small', 'nature_small'],
        ['blue_sports', 'blue_medium', 'sports_medium'],
      ],
    }, {
      length: 4,
      isIndividual: true,
      input: 'Concat( color, theme, size, 2, 3 )',
      output: [
        ['color_theme', 'color_size', 'theme_size', 'color_theme_size'],
        ['red_nature', 'red_small', 'nature_small', 'red_nature_small'],
        ['blue_sports', 'blue_medium', 'sports_medium', 'blue_sports_medium'],
      ],
    },
  ],
};

export default {
  Interactive,
  Box_cox,
  Number_extraction,
  Substring,
  Groupby,
  Log2,
  Log10,
  Pow,
  Eq,
  Sum,
  Min,
  Max,
  Median,
  Mean,
  Std,
  Exp,
  Diff,
  Accumulate,
  Quantile_bin,
  Custom_Quantile_bin,
  Concat,
};
