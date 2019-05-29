export default [
  {
    "name": "Exp",
    "value": "语法: exp(@var)",
  },
  {
    "name": "Log2",
    "value": `
      Log2<br/>
      以2为底数，对所选变量进行Log转换。<br/>
      语法：<br/>
      Log2(@var)<br/>
      输入：<br/>
      var- 连续变量，以@符号开头。<br/>
      输出：<br/>
      连续变量<br/>
      说明：<br/>
      变量中存在负数将被自动替换成0
    `
  },
  {
    "name": "Log10",
    "value": `
      Log10<br/>
      以10为底数，对所选变量进行Log转换。<br/>
      语法：<br/>
      Log10(@var)<br/>
      输入：<br/>
      var- 连续变量，以@符号开头。 <br/>
      输出：<br/>
      连续变量<br/>
      说明：<br/>
      变量中存在负数将被自动替换成0
    `
  },
  {
    "name": "Ln",
    "value": `
      Ln <br/>
      以e为底数，对所选变量进行Ln转换。<br/>
      语法：<br/>
      Ln(@var)<br/>
      输入：<br/>
      var- 连续变量，以@符号开头。  <br/>
      输出：<br/>
      连续变量<br/>
      说明：<br/>
      变量中存在负数将被自动替换成0
    `
  },
  {
    "name": "Pow",
    "value": `
      Pow<br/>
      计算所选变量的n次方。<br/>
      语法：<br/>
      Pow(@var, n)<br/>
      输入：<br/>
      var- 连续变量，以@符号开头。<br/>
      n- 正负整数或小数。<br/>
      输出：<br/>
      连续变量<br/>
      说明：<br/>
      返回数值超出内存后将用系统默认最大最小值替代。
     `
  },
  {
    "name": "Log",
    "value": "语法: log(@var, base)",
  },
  {
    "name": "Eq",
    "value": `
      Eq<br/>
      比较两个变量是否相等，相等返回1，不相等返回0。<br/>
      语法：<br/>
      Eq(@var1, @var2)<br/>
      输入：<br/>
      var1- 离散变量或连续变量，以@符号开头。<br/>
      var2- 离散变量或连续变量，以@符号开头。<br/>
      输出：<br/>
      返回0/1结果
    `
  },
  {
    "name": "Sum",
    "value": `
      Sum<br/>
      输入单个变量时，返回该变量的总和；输入多个变量时，返回行的总和。<br/>
      语法：<br/>
      Sum(@var)<br/>
      Sum(@var1, @var2, @var3, …)<br/>
      输入：<br/>
      var1, var2, var3, ….- 连续变量，以@符号开头。<br/>
      输出：<br/>
      连续变量
    `
  },
  {
    "name": "Min",
    "value": `
      Min<br/>
      输入单个变量时，返回该变量的最小值；输入多个变量时，返回行的最小值。<br/>
      语法：<br/>
      Min(@var)<br/>
      Min(@var1, @var2, @var3, …)<br/>
      输入：<br/>
      var1, var2, var3, ….- 连续变量，以@符号开头。<br/>
      输出：<br/>
      连续变量
    `
  },
  {
    "name": "Max",
    "value": `
      Max<br/>
      输入单个变量时，返回该变量的最大值；输入多个变量时，返回行的最大值。<br/>
      语法：<br/>
      Max(@var)<br/>
      Max(@var1, @var2, @var3, …)<br/>
      输入：<br/>
      var1, var2, var3, ….- 连续变量，以@符号开头。<br/>
      输出：<br/>
      连续变量
    `
  },
  {
    "name": "Mean",
    "value": `
        Mean<br/>
        输入单个变量时，返回该变量的均值；输入多个变量时，返回行的均值。<br/>
        语法：<br/>
        Mean(@var)<br/>
        Mean(@var1, @var2, @var3, …)<br/>
        输入：<br/>
        var1, var2, var3, ….- 连续变量，以@符号开头。<br/>
        输出：<br/>
        连续变量
    `
  }
]
