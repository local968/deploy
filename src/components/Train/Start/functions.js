export default {
  base: [
    { label: "exp()", value: "exp()", syntax: "syntax: exp(@var)", params: 1 },
    { label: "log2()", value: "log2()", syntax: "syntax: log2(@var)", params: 1 },
    { label: "log10()", value: "log10()", syntax: "syntax: log10(@var)", params: 1 },
    { label: "ln()", value: "ln()", syntax: "syntax: ln(@var)", params: 1 },
    { label: "pow()", value: "pow()", syntax: "syntax: pow(@var, base)", params: 2 },
    { label: "log()", value: "log()", syntax: "syntax: log(@var, base)", params: 2 },
    { label: "eq()", value: "eq()", syntax: "syntax: eq(@var, base)", params: 2 },
    { label: "sum()", value: "sum()", syntax: "syntax: sum(@var1, @var2, @var3, ...)" },
    { label: "min()", value: "min()", syntax: "syntax: min(@var1, @var2, @var3, ...)" },
    { label: "max()", value: "max()", syntax: "syntax: max(@var1, @var2, @var3, ...)" },
    { label: "mean()", value: "mean()", syntax: "syntax: mean(@var1, @var2, @var3, ...)" }
  ],
  senior: [
    {
      label: "Concat()",
      value: "Concat()",
      syntax: "syntax: Concat(@var1, @var2, @var3,...p1, p2...)"
    },
    {
      label: "Diff()",
      value: "Diff()",
      syntax: "syntax: Diff(@var1, @var2, @var3,...row1,row2,...)"
    },
    {
      label: "Accumulate()",
      value: "Accumulate()",
      syntax: "syntax: Accumulate(@var1, @var2, @var3,...)"
    },
    // { label: "Combine()", value: "Combine()", syntax: "syntax: Combine(@var1, @var2, @var3,...fun1, fun2...)" },
    {
      label: "Quantile_bin()",
      value: "Quantile_bin()",
      syntax: "syntax: Quantile_bin(@var1, @var2, @var3,b, type1, type2)"
    },
    {
      label: "Custom_Quantile_bin()",
      value: "Custom_Quantile_bin()",
      syntax: "syntax: Custom_Quantile_bin(@var, [range_list1], [range_list2]...)"
    }
  ]
}
