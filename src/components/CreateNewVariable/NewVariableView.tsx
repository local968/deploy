import * as React from 'react';
import * as _ from 'lodash';

import { styled } from '@material-ui/styles';

import { Container, Grid, Typography } from '@material-ui/core';

// modules
import Variables from './modules/Variables';
import Functions from './modules/Functions';
import Summary from './modules/Summary';
import Expressions from './modules/Expressions';

import EN from '../../constant/en';
import { Coordinate, Type } from './types/Coordinate';

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
  minWidth: 360,
});

// Custom Grid
const MyGrid = styled(Grid)({
  // minWidth: 360,
});

interface InterfaceNewVariableProps {
  classes?;
  onClose;
  variables: string[];
  mapHeader;
  expression;
  addNewVariable: (newVariables: any[], type) => Promise<boolean>;
  functions?;
}

interface InterfaceNewVariableState {
  detailKey: string;
  exps;
  index;
  func;
}

// New Variable Module
export class NewVariableView extends React.Component<
  InterfaceNewVariableProps,
  InterfaceNewVariableState
> {
  constructor(props) {
    super(props);
    this.state = {
      detailKey: '',
      exps: [{ value: [], label: '', range: [0, 0] }],
      index: 0,
      func: ''
    };
  }

  public handleVariables = () => {};
  public handleFunctions = () => {};
  public handleFunction = () => {};
  public changeExpLabel = () => {};
  public setRange = () => {};
  public addExp = () => {};
  public deleteExp = () => {};
  public left = () => {};
  public right = () => {};
  public setIndex = () => {};
  public addLine = () => {};
  public deleteIndex = () => {};

  public onMouseOver = v => {
    console.log(v);
    this.setState({
      detailKey: v,
    });
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
    console.log(`NewVariableView`);
    const { detailKey, exps, index, func } = this.state;
    const { functions } = this.props;

    return (
      <>
        <Container component={MyContainer}>
          <Subtitle>{EN.VariableFormula}</Subtitle>
          <Expressions
            exps={exps}
            index={index}
            setIndex={this.setIndex}
            addLine={this.addLine}
            deleteIndex={this.deleteIndex}
            setRange={this.setRange}
            deleteExp={this.deleteExp}
            left={this.left}
            right={this.right}
            addExp={this.addExp}
            func={func}
            changeExpLabel={this.changeExpLabel}
            handleFunction={this.handleFunction}
            handleVariables={this.handleVariables}
            functions={functions && [...functions.base, ...functions.senior]}
            variables={this.variables}
          />
        </Container>

        <Grid container spacing={3} component={'div'}>
          <Grid item xs={6} md={3} component={MyGrid} zeroMinWidth>
            <Subtitle>{EN.FormField}</Subtitle>
            <Variables
              handleClick={this.handleVariables}
              variables={this.variables}
            />
          </Grid>
          <Grid item xs={6} md={3} component={MyGrid} zeroMinWidth>
            <Subtitle>{EN.Function}</Subtitle>
            <Functions
              onClick={this.handleFunctions}
              onMouseOver={this.onMouseOver}
              functions={functions}
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
