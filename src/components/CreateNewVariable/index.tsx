import * as React from 'react';
import { toJS } from 'mobx';
import { observer } from 'mobx-react';

// modules
import { MuiDialog } from './modules/MuiModule';
import NewVariableView from './NewVariableView';

import store from './NewVariableStore';

// types
import { DialogProps } from '@material-ui/core/Dialog';

interface InterfaceCreateNewVariableProps extends DialogProps {
  title: string;
  variables: string[];
  mapHeader;
  expression;
  addNewVariable;
}

@observer
// Create NewVariable Module
export default class CreateNewVariableModule extends React.Component<
  InterfaceCreateNewVariableProps
> {
  render() {
    const {
      open,
      title,
      onClose,
      variables,
      mapHeader,
      expression,
      addNewVariable,
    } = this.props;

    return (
      <MuiDialog
        {...{
          open,
          title,
          onClose,
          maxWidth: 'lg',
          fullWidth: true,
        }}
        disableBackdropClick
      >
        <NewVariableView
          {...{
            onClose,
            variables,
            mapHeader,
            expression,
            addNewVariable,
          }}
          store={store}
        />
      </MuiDialog>
    );
  }
}
