module.exports = [
  { label: "Log()", value: "Log()", syntax: "syntax: Log(@var1, @var2,@var3 ..., base)" },
  { label: "Exp()", value: "Exp()", syntax: "syntax: Exp(@var1, @var2,@var3 ..., base)" },
  { label: "Combine()", value: "Combine()", syntax: "syntax: Combine(@var1, @var2, @var3,...p1, p2...)" },
  { label: "Diff()", value: "Diff()" , syntax: "syntax: DIff(@var1, @var2, @var3,...row1,row2,...)"},
  { label: "Accumulate()", value: "Accumulate()", syntax: "syntax: Accumulate(@var1, @var2, @var3,...)" },
  { label: "Compare()", value: "Compare()", syntax: "syntax: Compare(@var1, @var2, @var3,...fun1, fun2...)" },
  { label: "Quantile_bin()", value: "Quantile_bin()", syntax: "syntax: Quantile_bin(@var1, @var2, @var3,b, type1, type2)" },
  { label: "Custom_Quantile_bin()", value: "Custom_Quantile_bin()", syntax: "syntax: Custom_Quantile_bin(@var, [range_list1], [range_list2]...)" }

  // "log()",
  // "exp()",
  // "combine()",
  // "diff()",
  // "accumulate()",
  // "compare()",
  // "quantile_bin()",
  // "custom_quantile_bin()"
]
