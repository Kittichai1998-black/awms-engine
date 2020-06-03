import React, { useState, useEffect, useRef } from "react";
import QrReader from 'react-qr-reader'
import SvgIcon from '@material-ui/core/SvgIcon';
import IconButton from '@material-ui/core/IconButton';
import Dialog from '@material-ui/core/Dialog';
import MuiDialogActions from '@material-ui/core/DialogActions';
import MuiDialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import MuiDialogTitle from '@material-ui/core/DialogTitle';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import { useTheme } from '@material-ui/core/styles';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import CloseIcon from '@material-ui/icons/Close';
import AmButton from "./AmButton";

function QRIcon(props) {
    return (
        <SvgIcon {...props} id="bold" enable-background="new 0 0 24 24" height="512" viewBox="0 0 24 24" width="512" xmlns="http://www.w3.org/2000/svg">
            <g><path d="m23 8.696c-.553 0-1-.448-1-1v-4.74c0-.527-.429-.956-.955-.956h-4.74c-.553 0-1-.448-1-1s.447-1 1-1h4.74c1.63 0 2.955 1.326 2.955 2.956v4.74c0 .552-.447 1-1 1z" /></g>
            <g><path d="m1 8.696c-.553 0-1-.448-1-1v-4.74c0-1.63 1.325-2.956 2.955-2.956h4.74c.553 0 1 .448 1 1s-.447 1-1 1h-4.74c-.526 0-.955.429-.955.956v4.74c0 .552-.447 1-1 1z" /></g>
            <g><path d="m21.045 24h-4.74c-.553 0-1-.448-1-1s.447-1 1-1h4.74c.526 0 .955-.429.955-.956v-4.74c0-.552.447-1 1-1s1 .448 1 1v4.74c0 1.63-1.325 2.956-2.955 2.956z" /></g>
            <g><path d="m7.695 24h-4.74c-1.63 0-2.955-1.326-2.955-2.956v-4.74c0-.552.447-1 1-1s1 .448 1 1v4.74c0 .527.429.956.955.956h4.74c.553 0 1 .448 1 1s-.447 1-1 1z" /></g>
            <g><path d="m9.478 11.159h-4.978c-.553 0-1-.448-1-1v-5.659c0-.552.447-1 1-1h4.978c.553 0 1 .448 1 1v5.659c0 .552-.448 1-1 1zm-3.978-2h2.978v-3.659h-2.978z" /></g>
            <g><path d="m19.5 20.5h-4.75c-.553 0-1-.448-1-1v-3.182c0-.552.447-1 1-1s1 .448 1 1v2.182h2.75v-3h-1.182c-.553 0-1-.448-1-1s.447-1 1-1h2.182c.553 0 1 .448 1 1v5c0 .552-.447 1-1 1z" /></g>
            <g><path d="m19.5 9.591h-4.091c-.553 0-1-.448-1-1v-4.091c0-.552.447-1 1-1h4.091c.553 0 1 .448 1 1v4.091c0 .552-.447 1-1 1zm-3.091-2h2.091v-2.091h-2.091z" /></g>
            <g><path d="m12.478 14.136h-7.978c-.553 0-1-.448-1-1s.447-1 1-1h6.978v-6.727c0-.552.447-1 1-1s1 .448 1 1v7.727c0 .552-.448 1-1 1z" /></g>
            <g><path d="m15.25 13.886c-.553 0-1-.448-1-1v-1.363c0-.552.447-1 1-1h4.5c.553 0 1 .448 1 1s-.447 1-1 1h-3.5v.363c0 .552-.447 1-1 1z" /></g>
            <g><path d="m12.022 19.201c-.553 0-1-.448-1-1v-2.272c0-.552.447-1 1-1s1 .448 1 1v2.272c0 .552-.447 1-1 1z" /></g>
            <g><path d="m9.25 20.5h-4.75c-.553 0-1-.448-1-1v-3.636c0-.552.447-1 1-1h4.75c.553 0 1 .448 1 1v3.636c0 .552-.447 1-1 1zm-3.75-2h2.75v-1.636h-2.75z" /></g></SvgIcon>

    );
}

const IconQR = withStyles(theme => ({
    iconButton: {
        padding: 4,
    },

}))(props => {
    const { classes, onHandleClick, ...other } = props;
    return (
        <div ><IconButton
            className={classes.iconButton}
            onClick={onHandleClick}
            {...other}>
            <QRIcon color="secondary" size="small" />
        </IconButton>
        </div>
    );
});
const DialogTitle = withStyles(theme => ({
    root: {
        borderBottom: `1px solid ${theme.palette.divider}`,
        margin: 0,
        padding: theme.spacing(0.5),
    },
    closeButton: {
        position: 'absolute',
        right: theme.spacing(0.5),
        top: theme.spacing(0.7),
        color: theme.palette.grey[500],
        padding: "3px"
    },

}))(props => {
    const { children, classes, onClose } = props;
    return (
        <MuiDialogTitle disableTypography className={classes.root}>
            <Typography variant="h6">{children}</Typography>
            {onClose ? (
                <IconButton
                    aria-label="Close"
                    size="small"
                    className={classes.closeButton}
                    onClick={onClose}
                >
                    <CloseIcon fontSize="inherit" />
                </IconButton>
            ) : null}
        </MuiDialogTitle>
    );
});
const DialogContent = withStyles(theme => ({
    root: {
        margin: 0,
        padding: "0 6px 0 6px",
    }
}))(MuiDialogContent);
const DialogActions = withStyles(theme => ({
    root: {
        borderTop: `1px solid ${theme.palette.divider}`,
        padding: theme.spacing(0.5),
        margin: 0
    }
}))(MuiDialogActions);
export default function ScanQRByCam(props) {
    const {
        cameraStyle,
        returnResult
    } = props
    const theme = useTheme();

    // const [result, setResult] = useState(null);
    const [open, setOpen] = useState(false);
    const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        // setResult(null)
    };

    // const handleAgree = () => {
    //     setOpen(false);
    //     returnResult(result)
    //     setResult(null)
    // };
    const handleError = err => {
        console.error(err)
        alert(err)
    }
    const handleScan = data => {
        if (data) {
            console.log(data)
            // setResult(data)
            setOpen(false);
            returnResult(data)
        }
    }

    return (
        <div>
            <IconQR onHandleClick={handleClickOpen} />
            <Dialog
                fullScreen={fullScreen}
                open={open}
                onClose={handleClose}
                fullWidth={true}
                aria-labelledby="responsive-dialog-title"
            >
                <DialogTitle id="responsive-dialog-title" onClose={handleClose}>{"Scan QR"}</DialogTitle>
                <DialogContent>

                    {/* <p style={{ marginTop: '3px', marginBottom: '3px' }}><b>Result : </b>{result ? result : 'No result'}</p> */}
                    <div style={{ textAlign: 'center' }}>
                        <QrReader
                            delay={200}
                            onError={handleError}
                            onScan={handleScan}
                            style={cameraStyle}
                        />
                    </div>
                </DialogContent>
                {/* <DialogActions>
                    <AmButton
                        styleType="confirm_clear"
                        onClick={handleAgree}
                    >OK</AmButton>
                    <AmButton
                        styleType="delete_clear"
                        onClick={handleClose}
                    >Cancel</AmButton>
                </DialogActions> */}
            </Dialog>
        </div>

    )

}

