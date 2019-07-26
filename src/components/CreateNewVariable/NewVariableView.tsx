import * as React from 'react';
import * as _ from 'lodash';
import { observer } from 'mobx-react';

import { styled } from '@material-ui/styles';

import { Container, Grid, Typography } from '@material-ui/core';

// modules
import Variables from './modules/Variables';
import Functions from './modules/Functions';
import Summary from './modules/Summary';
import Expressions from './modules/Expressions';

// types
import EN from '../../constant/en';
import { Coordinate, Type } from './types/Coordinate';
import { NewVariableStore } from './NewVariableStore';

// Custom Title
const Subtitle = props => (
  <Typography
    variant={'subtitle2'}
    display={'block'}
    color={'textSecondary'}
    style={{ margin: '0.625rem 0' }}
  >
    {props.children}
  </Typography>
);

// Custom Container
const MyContainer = styled(Container)({
  minWidth: 600,
  margin: '1.2rem 0',
  paddingRight: 0,
  paddingLeft: 0,
});

// Custom Grid
const MyGrid = styled(Grid)({
  // minWidth: 360,
});

interface InterfaceNewVariableProps {
  store?: NewVariableStore;
  onClose?;
  variables?: string[];
  mapHeader?;
  expression?;
  addNewVariable: (newVariables: any[], type) => Promise<boolean>;
  functions?;
  detailKey?: string;
  exps?;
  index?;
  func?;
}

interface InterfaceNewVariableState {}

@observer
// New Variable Module
export class NewVariableView extends React.Component<
  InterfaceNewVariableProps,
  InterfaceNewVariableState
> {
  constructor(props) {
    super(props);
    console.log(props);
  }

  public _handleVariablesClick = (
    v: Coordinate,
    startIndex: number | undefined,
  ) => {
    console.log(v, startIndex);
  };
  public handleClick = () => {};

  public _changeExpLabel = (v: string) => {
    // this.props.changeExpLabel(v);
  };
  public setRange = () => {};
  public addExp = () => {};

  public deleteExp = () => {};

  public left = () => {};
  public right = () => {};

  public setIndex = (k: number) => {};

  public addLine = () => {};
  public deleteIndex = (k: number) => {};

  public _handleFunctionsDoubleClick = v => {
    console.log(`handleFunctionsDoubleClick: ${v}`);
  };

  public _handleFunctionsClick = v => {
    this.props.store.setDetailKey(v)
  };

  // return variable's list, types: Coordinate[]
  get variables(): Coordinate[] {
    const { variables, mapHeader } = this.props;
    return _.map(variables, (value: string, key: string) => {
      return {
        name: mapHeader[key],
        type: Type.ID,
        value: key,
        varType: value && value.toLocaleLowerCase(),
      };
    });
  }

  public render() {
    // console.log(`NewVariableView`);
    const { detailKey, exps, index, func, functions } = this.props.store;

    return (
      <>
        <Container component={MyContainer}>
          <Subtitle>{EN.VariableFormula}</Subtitle>
          <Expressions
            exps={exps as any}
            index={index}
            setIndex={this.setIndex}
            addLine={this.addLine}
            deleteIndex={this.deleteIndex}
            setRange={this.setRange}
            deleteExp={this.deleteExp}
            left={this.left}
            right={this.right}
            addExp={this.addExp}
            func={func as any}
            changeExpLabel={this._changeExpLabel}
            handleFunction={this._handleFunctionsDoubleClick}
            handleVariables={this._handleVariablesClick}
            functions={functions && [...functions.base, ...functions.senior]}
            variables={this.variables}
          />
        </Container>

        <Grid container spacing={3} component={'div'}>
          <Grid item xs={6} md={3} component={MyGrid} zeroMinWidth>
            <Subtitle>{EN.Function}</Subtitle>
            <Functions
              handleDoubleClick={this._handleFunctionsDoubleClick}
              handleClick={this._handleFunctionsClick}
              functions={functions as any}
            />
          </Grid>

          <Grid item xs={6} md={3} component={MyGrid} zeroMinWidth>
            <Subtitle>{EN.FormField}</Subtitle>
            <Variables
              handleClick={this._handleVariablesClick}
              variables={this.variables}
            />
          </Grid>

          <Grid item xs={6} md={6} component={MyGrid} zeroMinWidth>
            <Subtitle>{EN.ProjectDescription}</Subtitle>
            <Summary detailKey={detailKey} />
          </Grid>
        </Grid>
      </>
    );
  }
}

export default NewVariableView;
