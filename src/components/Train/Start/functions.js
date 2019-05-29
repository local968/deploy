export default {
  base: [
    { label: "exp()", value: "exp()", syntax: "语法: exp(@var)", params: 1 },
    { label: "log2()", value: "log2()", syntax: "语法: log2(@var)", params: 1 },
    { label: "log10()", value: "log10()", syntax: "语法: log10(@var)", params: 1 },
    { label: "ln()", value: "ln()", syntax: "语法: ln(@var)", params: 1 },
    { label: "pow()", value: "pow()", syntax: "语法﷨: pow(@var, base)", params: 2 },
    { label: "log()", value: "log()", syntax: "语法: log(@var, base)", params: 2 },
    { label: "eq()", value: "eq()", syntax: "语法: eq(@var1, @var2)", params: 2 },
    { label: "sum()", value: "sum()", syntax: "语法: sum(@var1, @var2, @var3, ...)" },
    { label: "min()", value: "min()", syntax: "语法: min(@var1, @var2, @var3, ...)" },
    { label: "max()", value: "max()", syntax: "语法: max(@var1, @var2, @var3, ...)" },
    { label: "mean()", value: "mean()", syntax: "语法: mean(@var1, @var2, @var3, ...)" }
  ],
  senior: [
    {
      label: "Concat()",
      value: "Concat()",
      syntax: "语法: Concat(@var1, @var2, @var3,...p1, p2...)"
    },
    {
      label: "Diff()",
      value: "Diff()",
      syntax: "语法: Diff(@var1, @var2, @var3,...row1,row2,...)"
    },
    {
      label: "Accumulate()",
      value: "Accumulate()",
      syntax: "语法: Accumulate(@var1, @var2, @var3,...)"
    },
    // { label: "Combine()", value: "Combine()", syntax: "syntax: Combine(@var1, @var2, @var3,...fun1, fun2...)" },
    {
      label: "Quantile_bin()",
      value: "Quantile_bin()",
      syntax: "语法: Quantile_bin(@var1, @var2, @var3,b, type1, type2)"
    },
    {
      label: "Custom_Quantile_bin()",
      value: "Custom_Quantile_bin()",
      syntax: "语法: Custom_Quantile_bin(@var, [range_list1], [range_list2]...)"
    }
  ]
}
