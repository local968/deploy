import * as React from 'react';
import * as _ from 'lodash';

import { styled } from '@material-ui/styles';

import { Container, Grid, Typography } from '@material-ui/core';

// modules
import Variables from './modules/Variables';
import Functions from './modules/Functions';

import EN from '../../constant/en';
import { Coordinate, Type } from './types/Coordinate';

interface InterfaceNewVariableProps {
  classes?;
  onClose;
  variables: string[];
  mapHeader;
  expression;
  addNewVariable: (newVariables: any[], type) => Promise<boolean>;
}

const Subtitle = props => (
  <Typography
    variant={'subtitle2'}
    display={'block'}
    color={'textSecondary'}
    style={{ margin: '10px 0' }}
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
  minWidth: 360,
});

// New Variable Module
export class NewVariableView extends React.Component<InterfaceNewVariableProps> {
  public handleVariables = () => {};
  public handleFunctions = () => {};
  public onMouseOver = () => {};

  // return variable's list, types: Coordinate[]
  get variables(): Coordinate[] {
    const { variables, mapHeader } = this.props;
    return _.map(variables, (value: string, key: string) => {
      return {
        name: mapHeader[key],
        type: Type.ID,
        value: key,
        varType: value,
      };
    });
  }

  public render() {
    console.log(this.variables);

    return (
      <>
        <Container component={MyContainer}>
          <Subtitle>{EN.VariableFormula}</Subtitle>
        </Container>

        <Grid container spacing={3} component={'div'}>
          <Grid item xs={6} md={4} component={MyGrid}>
            <Subtitle>{EN.FormField}</Subtitle>
            <Variables
              handleClick={this.handleVariables}
              variables={this.variables}
            />
          </Grid>
          <Grid item xs={6} md={4} component={MyGrid}>
            <Subtitle>{EN.Function}</Subtitle>
            <Functions
              onClick={this.handleFunctions}
              onMouseOver={this.onMouseOver}
              functions={this.props.FUNCTIONS}
            />
          </Grid>
          <Grid item xs={6} md={4} component={MyGrid}>
            <Subtitle>{EN.ProjectDescription}</Subtitle>
            {/*<Summary detailKey={state.detailKey} />*/}
          </Grid>
        </Grid>
      </>
    );
  }
}

export default NewVariableView;
