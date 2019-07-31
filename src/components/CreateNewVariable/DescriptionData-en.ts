const Interactive = {
  name: 'Interactive',
  describe: 'Interactive function allows you to construct new variables by mutiplying two of them.',
  grammar: 'Interactive( var1, var2, var3, … )',
  input: ['var1, var2, var3, ….- numerical variable; maximum of 20 variables is supported.'],
  output: 'numerical variable',
  example: [
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
  describe: 'Box_cox function allows you to construct a new variable by Box-Cox transformation with parameter lambda.',
  grammar: 'Box_cox( var, lambda )',
  input: ['var- numerical variable', 'lambda- real number; when no lambda is input, the optimal lambda value is defined by maximizing likelihood function as default.'],
  output: 'numerical variable ',
  output_desc: [
    '1. When there are values of the variable less than 0, all values of this variable will be translated into a range greater than or equal to 1.',
    '2. Unreasonable lambda can cause errors. The recommended range of it is -5.00~5.00, which supports two decimal places max.',
  ],
  example: [
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
  describe: 'Number_extraction function allows you to extract the digital information.',
  grammar: 'Number_extraction( var )',
  input: ['var- categorical variable'],
  output: 'numerical variable ',
  output_desc: ['When the variable contains multiple interval numbers, the extracted numbers will be concatenated.'],
  example: [
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
  describe: 'Substing function allows you to extract the information of the variable by specifying the position.',
  grammar: 'Substring( var, [position1, position2] )',
  input: ['var- categorical variable',
    'position1, position2- positive integer, greater than or equal to 0; position1 is the starting position of the extracted variable, and position2 is the ending position; the starting position starts at 0; position2 must be greater than position1.'],
  output: 'categorical variable',
  output_desc: ['if position2 exceeds the variable length, it will be automatically replaced with the end of the variable.'],
  example: [
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
  describe: 'Groupby function allows you perform statistical calculation of selected variable by specifying primary key variables ( key ).',
  grammar: 'Groupby( var, [key1, key2], [fun1,fun2,…] )',
  input: [
    'var- numerical or categorical variable',
    'key1, key2- categorical variable, primary key variable for grouping the selected variable; maximum of 2 key variables is supported; when only one primary key variable is selected, [] can be omitted.',
    'fun1, fun2,…- statistical function; when only one function is selected, [] can be omitted;',
    'when var is a numerical variable, functions [sum, mean, min, max, std, median] are supported;',
    'when var is a categorical variable, function [mode] is supported by default.',
  ],
  output: '[]',
  output_desc: ['When the variable contains multiple interval numbers, the extracted numbers will be merged.'],
  example: [
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
    }, {
      length: 5,
      created: 2,
      input: 'Groupby(duration, [job, education], [mean, min])',
      output: [
        ['duration', 'job', 'education', 'duration_mean', 'duration_min'],
        ['79', '8', '2', '392.08', '25'],
        ['199', '0', '1', '261.25', '4'],
        ['266', '1', '0', '301.20', '5'],
        ['141', '0', '1', '261.25', '4'],
      ],
    }, {
      length: 4,
      input: 'Groupby(job, [education])',
      output: [
        ['job', 'education', 'job_mode'],
        ['8', '2', '1'],
        ['0', '1', '0'],
        ['1', '0', '1'],
        ['0', '1', '0'],
      ],
    },
  ],
};


const Log2 = {
  name: 'Log2',
  describe: 'Logarithmic tranformation with 2 as the base. ',
  grammar: 'Log2( var )',
  input: ['var- numerical variable'],
  output: 'numerical variable',
  output_desc: ['All negative values will be replaced with 0. '],
};

const Log10 = {
  name: 'Log10',
  describe: 'Logarithmic tranformation with 10 as the base. ',
  grammar: 'Log10( var )',
  input: ['var- numerical variable'],
  output: 'numerical variable',
  output_desc: ['All negative values will be replaced with 0.'],
};

const Ln = {
  name: "Ln",
  describe: "Logarithmic tranformation with e as the base. ",
  grammar: "Ln( var )",
  input: ["var- numerical variable"],
  output: "numerical variable",
  output_desc: ["All negative values will be replaced with 0."]
}

const Pow = {
  name: 'Pow',
  describe: 'Exponential funcion with var as the base and n as the exponent.',
  grammar: 'Pow( var, n )',
  input: ['var- numerical variable', 'n- real number.'],
  output: 'numerical variable',
  output_desc: ['Values out of the memory will be replaced with the mininum or maximum based on the system .'],
};

const Eq = {
  name: 'Eq',
  describe: 'Comparison between two variables, returns 1 when they are equal, 0 when they are unequal.',
  grammar: 'Eq( var1, var2 )',
  input: ['var1- numerical or categorical variable', 'var2- numerical or categorical variable'],
  output_desc: ['返回0/1结果'],
};

const Sum = {
  name: 'Sum',
  describe: 'When input one variable, output the sum of this variable; when input multiple variables, output the sum of these variables according to the rows.',
  grammar: 'Sum( var1, var2, var3, … )',
  input: ['var1, var2, var3, ….- numerical variable'],
  output: 'numerical variable',
};

const Min = {
  name: 'Min',
  describe: 'When input one variable, output the minimum of this variable; when input multiple variables, output the minimum of these variables according to the rows.',
  grammar: 'Min( var1, var2, var3, … )',
  input: ['var1, var2, var3, ….- 连续变量'],
  output: 'numerical variable',
};

const Max = {
  name: 'Max',
  describe: 'When input one variable, output the max of this variable; when input multiple variables, output the max of these variables according to the rows.',
  grammar: 'Max( var1, var2, var3, … )',
  input: ['var1, var2, var3, ….- numerical variable'],
  output: 'numerical variable',
};

const Median  = {
  name: "Median",
  describe: "When input one variable, output the median of this variable; when input multiple variables, output the median of these variables according to the rows.",
  grammar: "Median( var1, var2, var3, … )",
  input: ["var1, var2, var3, ….- numerical variable"],
  output: "numerical variable"
}

const Mean = {
  name: 'Mean',
  describe: 'When input one variable, output the mean of this variable; when input multiple variables, output the mean of these variables according to the rows.',
  grammar: 'Mean( var1, var2, var3, … )',
  input: ['var1, var2, var3, ….- numerical variable'],
  output: 'numerical variable',
};

const Std = {
  name: 'Std',
  describe: 'When input one variable, output the median of this variable; when input multiple variables, output the median of these variables according to the rows.',
  grammar: 'Std( var1, var2, var3, … )',
  input: ['var1, var2, var3, ….- numerical variable'],
  output: 'numerical variable',
};

const Exp = {
  name: 'Exp',
  describe: 'Exponential function with e as the natural base, and the selected variable as the exponent.',
  grammar: 'Exp( var )',
  input: ['var- numerical variable'],
  output: 'numerical variable',
  output_desc: 'Values out of the memory will be replaced with the mininum or maximum based on the system.',
};

const Diff = {
  name: 'Diff',
  describe: 'Diff function allows you to construct a new variable by calculating the difference between two rows of selected variable.',
  grammar: 'Diff( var，row )',
  input: ['var- numerical variable', 'row- intervals between the rows，row must be equal to or larger than 1 but cannot be larger than the length of the variable.'],
  output: 'numerical variable',
  output_desc: 'larger the row, more missing values ',
  example: [
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
  describe: 'Accumulate function allows you to construct a new variable by accumulating values from all previous rows. ',
  grammar: 'Accumulate( var )',
  input: ['var- numerical variable'],
  output: 'numerical variable',
  output_desc: 'The larger the row, the more values will be lost.',
  example: [
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
  describe: 'Quantile_bin function allows you to construct a new variable by dividing selected variable into certain groups depending on its percentile or value.',
  grammar: 'Quantile_bin( var, b, type )',
  input: [
    'var- numerical variable',
    'b- number of groups to be divided; its number must be greater than 1 but cannot be larger than the length of the variable.',
    'type- ways to dividing the variables, 0 and 1 are supported:',
    '   0- variable is divided by its percentile, each group is with the same size;',
    '   1- variable is divided by its value, each group is in the same value range.',
  ],
  output: 'categorical variable',
  output_desc: 'To many groups is meaningless for large b. ',
  example: [
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
  describe: 'Custom_Quantile_bin function allows you to construct a new variable by dividing selected variable into certain groups depending on customized range.',
  grammar: 'Custom_Quantile_bin( var, [range_list] )',
  input: [
    'var- numerical variable',
    '[range_list]- customized range to dividing the variable; its first number should be larger than the minimum value of the variable and the last number should be smaller than the maximum value of the variable; the length of the range_list decides the number of groups.',
  ],
  output: 'categorical variable',
  example: [
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
  describe: 'Concat function allows you to construct new variables by combine certain interdependent variables ( e.g. variables that describe the same object ).',
  grammar: 'Concat( var1, var2, var3,...p1, p2,... )',
  input: [
    'var1, var2, var3, ….- numerical or categorical variable',
    'p1，p2 ...- Number of variables in each combination; its number must be larger than 1 but cannot be larger than the number of all input variables;',
    ' combinations of p1 variables are created, then combinations of p2 variables are created, and so on.',
  ],
  output: 'categorical variable',
  output_desc: 'If too many new variables are created, system will possibly be out of memory. The total number of the created new variables is suggested to be less than 10 times of the number of the original variables. ',
  example: [
    {
      length: 3,
      created: 0,
      input: 'Concat ( color, theme, size, 2 )',
      inputData: [
        ['color', 'theme', 'size'],
        ['red', 'nature', 'small'],
        ['blue', 'sports', 'medium'],
      ],
      output: [
        ['color_theme', 'color_size', 'theme_size'],
        ['red_nature', 'red_small', 'nature_small'],
        ['blue_sports', 'blue_medium', 'sports_medium'],
      ],
    }, {
      length: 4,
      created: 0,
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
  Ln,
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
