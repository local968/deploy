export interface Coordinate {
  id?: string;
  name?: string;
  type?: Type;
  value?: string;
  varType?: string
  grammar?: string
  params?: number
}

export enum Type {
  Assign = "ASSIGN",
  End = "END",
  Func = "FUNC",
  ID = "ID",
  Lc = "LC",
  Lparen = "LPAREN",
  Mismatch = "MISMATCH",
  Number = "NUMBER",
  Op = "OP",
  RC = "RC",
  Rparen = "RPAREN",
  Skip = "SKIP",
  Split = "SPLIT",
  Char = 'CHAR'
}

export enum Specification {
  NUMBER = '\d+\.\d *?',
  ASSIGN = '=',
  END = '$|;|#',
  ID = '@[A-Za-z0-9_\u4E00-\u9FA5]+',
  FUNC = '[A-Za-z]+[0-9]*_?[A-Za-z0-9_]*',
  OP = '[+-*/]',
  SKIP = '[\t]+',
  SPLIT = '[\,]',
  LPAREN = '\(',
  RPAREN = '\)',
  LC = '\[',
  RC = '\]',
  MISMATCH = '.',
}

export interface Detail {
  name: string;
  value: string;
}

export interface Exp {
  label: string;
  range: [number, number]
  value: Array<Coordinate>;
}
