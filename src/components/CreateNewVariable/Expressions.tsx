import React, {ChangeEvent, MouseEvent} from 'react';
import {withStyles} from '@material-ui/core/styles';  //Coordinate
import {
  List,
  ListItem,
  ListItemText,
  Input,
  ClickAwayListener,
  Popper,
  MenuItem,
  MenuList,
  Paper,
  ListSubheader,
  IconButton
} from '@material-ui/core'
import DeleteIcon from '@material-ui/icons/Delete';
import AddIcon from '@material-ui/icons/Add';
import {Exp, Coordinate, Type} from './model/Coordinate';
import Expression from './Expression'
import _ from 'lodash'
import EN from '../../constant/en'
// import functions from './functions'
// import variables from './variable'

const useStyles = withStyles({
  form: {
    display: 'flex',
    flexWrap: 'nowrap',
    flex: 'auto',
    alignItems: 'center',
    maxWidth: '100%'
  },
  label: {
    width: 200,
    flex: 'none',
    padding: '4px 0'
  },
  text: {
    display: 'flex',
    flex: 'none',
  },
  tools: {
    flex: '1 1',
  },
  popper: {
    marginLeft: '5px',
    zIndex: 1111
  },
  list: {
    maxHeight: '300px',
    overflowY: 'auto',
    backgroundColor: '#fff'
  },
  suggPape: {
    maxHeight: '300px',
    overflowY: 'auto',
  },
  grammar: {
    padding: '8px 12px',
    maxWidth: '300px',
    wordWrap: 'break-word',
    backgroundColor: '#f0f4f8',
  }
})

interface ExpressionsProps {
  classes: any,
  exps: Array<Exp>,
  index: number,
  setIndex: (k: number) => void,
  addLine: () => void
  deleteIndex: (k: number) => void,
  setRange: (s: number, e: number) => void,
  deleteExp: () => void,
  left: () => void,
  right: () => void,
  func: Coordinate | undefined,
  addExp: (s: string) => void,
  changeExpLabel: (s: string) => void,
  handleFunction: (v: Coordinate, i: number) => void,
  handleVariables: (v: Coordinate, i: number) => void,
  functions: Coordinate[],
  variables: Coordinate[]
}

interface ExpressionsState {
  suggestions: Array<Coordinate>,
  isOpen: boolean,
  isTipOpen: boolean,
  el: string
}

interface recommendObj {
  value: string,
  start: number
}

function Expressions(props: ExpressionsProps) {
  const {
    classes, exps, index, setIndex, addLine, deleteIndex, setRange,
    deleteExp, left, right, addExp, handleFunction, handleVariables, changeExpLabel,
    variables, functions, func
  } = props

  const [state, setState] = React.useState({
    suggestions: [],
    isOpen: false,
    isTipOpen: false,
    el: '',
  } as ExpressionsState)

  const selectOne = (k: number) => (e: MouseEvent<HTMLElement>) => {
    const input = e.currentTarget.getElementsByTagName('input')[0];
    setIndex(k)
    setState({
      ...state,
      el: input ? input.id : ''
    })
    input.focus();
  }
  const changeInput = (k: number) => (e: ChangeEvent<HTMLInputElement>) => {
    changeExpLabel(e.target.value);
  }
  const deleteOne = (k: number) => (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation()
    deleteIndex(k)
  }

  const getRecommendValue = () => {
    const currentExp: Exp = exps[index];
    const {value, range: [start, end]} = currentExp
    let obj: recommendObj = {
      value: '',
      start: end
    }
    for (let i: number = end - 1; i >= (start === end ? 0 : start); i--) {
      const v: Coordinate = value[i]
      if (Type.Char !== v.type) break
      if (!isNaN(+(v.value || ''))) break
      obj.value = v.value + obj.value
      obj.start = i
    }
    return obj
  }
  const recommend: recommendObj = getRecommendValue()

  const handleClickAway = () => {
    setState({
      ...state,
      isOpen: false
    })
  }

  const hideGrammarTip = () => {
    setState({
      ...state,
      isTipOpen: false
    })
  }

  const onFocus = (k: number) => (e: MouseEvent<HTMLInputElement>) => {
    const input: HTMLInputElement = e.currentTarget.getElementsByTagName('input')[0]
    setState({
      ...state,
      isOpen: true,
      el: input ? input.id : ''
    })
    const len = exps[k]['value'].length;
    setRange(len, len)
    setIndex(k)
    input.focus()
    e.stopPropagation()
  }

  const getSuggestions = () => {
    let suggestions: Array<Coordinate> = []
    if (recommend.value) {
      let _v: string = recommend.value
      let list: Array<Coordinate> = [...functions, ...variables]
      if (recommend.value.indexOf("@") === 0) {
        _v = recommend.value.slice(1)
        list = [...variables]
      }
      suggestions = list.filter((i: Coordinate) => (i.value || '').indexOf(_v) > -1)
    }
    return suggestions
  }

  const estimateAdd = (exp, k, expSize) => {
    const {label, value} = exp;
    return !label || !_.size(value) || k + 1 != expSize;
  }

  const selectItem = (v: Coordinate) => () => {
    switch (v.type) {
      case Type.Func:
        handleFunction(v, recommend.start)
        return
      case Type.ID:
        handleVariables(v, recommend.start)
        return
      default:
        return
    }
  }

  const input: HTMLElement | null = state.el ? document.getElementById(state.el) : null
  const expSize = _.size(exps)
  return <List
    className={classes.list}
    subheader={<ListSubheader>
      <form className={classes.form}>
        <ListItemText className={classes.label} primary={EN.Variablename} primaryTypographyProps={{align: 'left'}}/>
        <ListItemText className={classes.text} primary=' '/>
        <ListItemText primary={EN.formula} primaryTypographyProps={{align: 'left'}}/>
      </form>
    </ListSubheader>}>
    {exps.map((exp: Exp, k: number) => <ListItem key={k} selected={k === index} onClick={(e) => selectOne(k)(e)}>
      <form className={classes.form}>
        <Input className={classes.label} value={exp.label} onChange={changeInput(k)}
               inputProps={{style: {backgroundColor: '#fff'}}}/>
        <ListItemText primary='=' className={classes.text}/>
        <Expression exp={exp} setRange={setRange} deleteExp={deleteExp} left={left} right={right}
                    addExp={addExp} onFocus={onFocus(k)} sign={k} setIndex={() => setIndex(k)}
                    toogleTooltip={() => setState({...state, isTipOpen: true})}/>
        <div className={classes.tools}>
          <IconButton onClick={deleteOne(k)} disabled={expSize === 1}>
            <DeleteIcon/>
          </IconButton>
          <IconButton onClick={addLine} disabled={!!estimateAdd(exp, k, expSize)}>
            <AddIcon/>
          </IconButton>
        </div>
      </form>
    </ListItem>)}
    {/* <ListItem>
      <Button fullWidth size='large' color='primary' variant="contained" onClick={addLine}>+</Button>
    </ListItem> */}
    <Popper open={state.isOpen && !!recommend.value} anchorEl={input} placement='bottom-start'
            className={classes.popper}>
      <Paper className={classes.suggPape}>
        <ClickAwayListener onClickAway={handleClickAway}>
          <MenuList>
            {getSuggestions()
              .map((item: Coordinate, k: number) => {
                return <MenuItem
                  key={k}
                  onClick={selectItem(item)}
                >
                  {item.name}
                </MenuItem>
              })}
          </MenuList>
        </ClickAwayListener>
      </Paper>
    </Popper>
    <Popper open={!!func && state.isTipOpen} anchorEl={input} placement='bottom-end'
            className={classes.popper}>
      <Paper>
        <ClickAwayListener onClickAway={hideGrammarTip}>
          <div className={classes.grammar}>{func ? func.grammar : null}</div>
        </ClickAwayListener>
      </Paper>
    </Popper>
  </List>
}

export default useStyles(Expressions);
