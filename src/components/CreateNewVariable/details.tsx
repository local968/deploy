import EN from "../../constant/en";
export default [
  {
    "name": "Exp",
    "value": `${EN.Syntax}exp(@var)`,
  },
  {
    "name": "Log2",
    "value": `
      Log2<br/>
      ${EN.Logconversionofthe2}<br/>
      ${EN.Syntax}<br/>
      Log2(@var)<br/>
      ${EN.Input}<br/>
     ${EN.VarContinuousvariablestartingwiththesymbol}<br/>
     ${EN.Output}<br/>
      ${EN.Numerical}<br/>
      ${EN.Description}<br/>
      ${EN.Negativenumbersinvariableswill0}
    `
  },
  {
    "name": "Log10",
    "value": `
      Log10<br/>
      ${EN.Logconversionofthe10}<br/>
      ${EN.Syntax}<br/>
      Log10(@var)<br/>
      ${EN.Input}<br/>
      ${EN.VarContinuousvariablestartingwiththesymbol}<br/>
      ${EN.Output}<br/>
     ${EN.Numerical}<br/>
      ${EN.Description}<br/>
      ${EN.Negativenumbersinvariableswill0}
    `
  },
  {
    "name": "Ln",
    "value": `
      Ln <br/>
      ${EN.Logconversionofthee}<br/>
    ${EN.Syntax}<br/>
      Ln(@var)<br/>
        ${EN.Input}<br/>
      ${EN.VarContinuousvariablestartingwiththesymbol}<br/>
      ${EN.Output}<br/>
     ${EN.Numerical}<br/>
      ${EN.Description}<br/>
      ${EN.Negativenumbersinvariableswill0}
    `
  },
  {
    "name": "Pow",
    "value": `
      Pow<br/>
      ${EN.Calculatethenthpoweroftheselectedvariable}<br/>
      ${EN.Syntax}<br/>
      Pow(@var, n)<br/>
      ${EN.Input}<br/>
     ${EN.VarContinuousvariablestartingwiththesymbol}<br/>
     ${EN.Npositiveornegativeintegerordecimal}<br/>
       ${EN.Output}<br/>
     ${EN.Numerical}<br/>
       ${EN.Description}<br/>
      ${EN.Whenthereturnvalueexceedsthememory}
     `
  },
  {
    "name": "Log",
    "value": `${EN.Syntax}log(@var, base)`,
  },
  {
    "name": "Eq",
    "value": `
      Eq<br/>
     ${EN.Comparestwovariablesforequality}<br/>
      ${EN.Syntax}<br/>
      Eq(@var1, @var2)<br/>
     ${EN.Input}<br/>
     ${EN.Var1Adiscretevariable}<br/>
      ${EN.Var2Adiscretevariable}。<br/>
        ${EN.Output}<br/>
     ${EN.Return01result}
    `
  },
  {
    "name": "Sum",
    "value": `
      Sum<br/>
      ${EN.Whenasinglevariableisentered}<br/>
      ${EN.Syntax}<br/>
      Sum(@var)<br/>
      Sum(@var1, @var2, @var3, …)<br/>
    ${EN.Input}<br/>
     ${EN.Var1var2var3continuousvariables}<br/>
      ${EN.Output}<br/>
        ${EN.Numerical}
    `
  },
  {
    "name": "Min",
    "value": `
      Min<br/>
     ${EN.Whenasinglevariableisenteredtheminimumvalue}<br/>
        ${EN.Syntax}<br/>
      Min(@var)<br/>
      Min(@var1, @var2, @var3, …)<br/>
       ${EN.Input}<br/>
       ${EN.Var1var2var3continuousvariables}<br/>
        ${EN.Output}<br/>
        ${EN.Numerical}
    `
  },
  {
    "name": "Max",
    "value": `
      Max<br/>
     ${EN.Whenasinglevariableisenteredtheminimumvaluemax}<br/>
       ${EN.Syntax}<br/>
      Max(@var)<br/>
      Max(@var1, @var2, @var3, …)<br/>
      ${EN.Input}<br/>
       ${EN.Var1var2var3continuousvariables}<br/>
        ${EN.Output}<br/>
        ${EN.Numerical}
    `
  },
  {
    "name": "Mean",
    "value": `
        Mean<br/>
        ${EN.Whenasinglevariableisenteredtheminimumvaluemaxmean}<br/>
        ${EN.Syntax}<br/>
        Mean(@var)<br/>
        Mean(@var1, @var2, @var3, …)<br/>
        ${EN.Input}<br/>
       ${EN.Var1var2var3continuousvariables}<br/>
        ${EN.Output}<br/>
        ${EN.Numerical}
    `
  }
]
