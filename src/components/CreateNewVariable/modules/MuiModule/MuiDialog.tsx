import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Typography,
  withStyles,
} from '@material-ui/core';

import CloseIcon from '@material-ui/icons/Close';

import { DialogProps } from '@material-ui/core/Dialog';

interface InterfaceMuiDialogProps extends DialogProps {
  title?: string;
}

// Custom DialogTitle
const MuiDialogTitle = withStyles(theme => ({
  root: {
    position: 'relative',
    padding: '0.75rem',
    backgroundColor: '#445167',
    textAlign: 'center',
    borderBottom: `1px solid ${theme.palette.divider}`,
  },
  colorWhite: {
    fontSize: '1.125rem',
    color: '#FFF',
    lineHeight: 1.0,
  },
  closeButton: {
    position: 'absolute',
    top: '50%',
    right: theme.spacing(1),
    color: '#FFF',
    padding: theme.spacing(1),
    marginTop: '-1rem',
  },
}))((props: any) => {
  const { children, classes, onClose } = props;
  return (
    <DialogTitle disableTypography className={classes.root}>
      <Typography variant="h6" className={classes.colorWhite}>
        {children}
      </Typography>
      {onClose ? (
        <IconButton
          aria-label="Close"
          className={classes.closeButton}
          onClick={onClose}
          href={''}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      ) : null}
    </DialogTitle>
  );
});

// Custom Dialog base on Mui.
export default class MuiDialog extends React.Component<
  InterfaceMuiDialogProps
> {
  public render() {
    const {
      children,
      open,
      title,
      scroll = 'body',
      onClose,
      disableBackdropClick = false,
      maxWidth = 'sm',
      fullWidth = false,
    } = this.props;

    return (
      <Dialog
        aria-labelledby={'customized-dialog-title'}
        scroll={scroll}
        disableBackdropClick={disableBackdropClick}
        open={open}
        fullWidth={fullWidth}
        maxWidth={maxWidth}
        onClose={onClose}
      >
        {title ? (
          <MuiDialogTitle id={'customized-dialog-title'} onClose={onClose}>
            {title}
          </MuiDialogTitle>
        ) : null}

        <DialogContent>{children}</DialogContent>

        <DialogActions />
      </Dialog>
    );
  }
}
