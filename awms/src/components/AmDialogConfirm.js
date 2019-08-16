import React, { useState, useEffect } from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Slide from '@material-ui/core/Slide';
import Axios from 'axios';
import AmButton from './AmButton';
import { withStyles } from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next'

const styles = theme => ({
  button: {
    margin: theme.spacing(1)
    // width: 'auto',
  }
});

function Transition(props) {
  return <Slide direction='up' {...props} />;
}
// const DialogContent = withStyles(theme => ({
//     root: {
//         margin: 0,
//         padding: '0 5px 0 5px',
//         overflowY: 'auto'
//     },
// }))(MuiDialogContent);

const DialogConfirm = props => {
  const { t } = useTranslation()
  const { classes } = props;

  const [open, setOpen] = useState(false);
  const [values, setValues] = useState(props.dataDialog);

  const handleAgree = () => {
    console.log(values);
    if (values == {}) {
      //props.onchange(setValues({}))
    }
    props.onChange(values);
    props.close(!props.open);
  };

  const handleClose = () => {
    props.close(!props.open);
  };

  const setcolor = () => {
    setcolor('primary');
  };

  return (
    <div>
      <Dialog
        open={props.open}
        TransitionComponent={Transition}
        keepMounted
        onClose={handleClose}
        aria-labelledby='alert-dialog-slide-title'
        aria-describedby='alert-dialog-slide-description'
        maxWidth={props.maxWidth ? props.maxWidth : 'md'}
      >
        <DialogTitle id='alert-dialog-slide-title'>
          {t(props.titleDialog)}
        </DialogTitle>
        <DialogContent style={props.styleDialog} dividers>
          <DialogContentText id='alert-dialog-slide-title'>
            {props.Texts}
          </DialogContentText>
          {props.bodyDialog}
        </DialogContent>
        <DialogActions>
          {props.customAcceptBtn ? (
            props.customAcceptBtn
          ) : (
              <AmButton onClick={handleAgree} styleType='confirm_clear'>
                {props.textConfirm}
              </AmButton>
            )}
          {props.customCancelBtn ? (
            props.customCancelBtn
          ) : (
              <AmButton onClick={handleClose} styleType='delete_clear'>
                {props.textCancel}
              </AmButton>
            )}
        </DialogActions>
      </Dialog>
    </div>
  );
};
DialogConfirm.propTypes = {
  classes: PropTypes.object.isRequired
};
export default withStyles(styles)(DialogConfirm);
