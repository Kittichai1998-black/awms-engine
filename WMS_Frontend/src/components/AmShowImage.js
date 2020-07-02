import React, { useState, useEffect } from 'react';
import Backdrop from '@material-ui/core/Backdrop';
import CircularProgress from '@material-ui/core/CircularProgress';
import Button from '@material-ui/core/Button';
import { makeStyles } from '@material-ui/core/styles';
import IconButton from '@material-ui/core/IconButton';
import PhotoIcon from '@material-ui/icons/Photo';
import AmDialogs from './AmDialogs'
import classNames from 'classnames';

const useStyles = makeStyles((theme) => ({
    backdrop: {
        zIndex: theme.zIndex.drawer + 1,
        color: '#fff'
    },
    divCenter: {
        flex: '0 1 auto',
        display: 'flex',
        position: 'relative',
        textAlign: 'center',
        height: '100%',
        verticalAlign: 'center !important',
        alignItems: 'center',
        justifyContent: 'center'
    }
}));

export default function SimpleBackdrop(props) {
    const classes = useStyles();
    const [open, setOpen] = useState(false);
    const [imgFile, setImgFile] = useState(null);
    const [circleLoad, setCircleLoad] = useState(null);
    //AlertDialog
    const [showDialog, setShowDialog] = useState(null);
    const [stateDialog, setStateDialog] = useState(false);
    const [msgDialog, setMsgDialog] = useState("");
    const [typeDialog, setTypeDialog] = useState("");
    useEffect(() => {
        if (open) {
            setCircleLoad(<CircularProgress color='secondary' />)
            setImgFile(<img id="imgShow" src={props.src} onLoad={loadImage} onError={onError} 
            style={{ display: 'none', width: '100vw'}} />)
        }

    }, [open])

    const loadImage = () => {
        var tagImg = document.getElementById("imgShow");
        if (tagImg.complete) {
            setCircleLoad(null)
            tagImg.style.display = "";
        }

    }
    const onError = () => {
        handleClose();
        alertDialogRenderer("ไม่พบไฟล์รูปภาพ", "error", true);
    }
    const handleClose = () => {
        setOpen(false);
        // props.onClose(!props.open)
        setImgFile(null);
        setCircleLoad(null);
    };
    const handleToggle = () => {
        setOpen(!open);
    };
    //AlertDialog
    const alertDialogRenderer = (message, type, state) => {
        setMsgDialog(message);
        setTypeDialog(type);
        setStateDialog(state);
    }
    useEffect(() => {
        if (msgDialog && stateDialog && typeDialog) {
            setShowDialog(<AmDialogs typePopup={typeDialog} content={msgDialog} onAccept={(e) => { setStateDialog(e) }} open={stateDialog}></AmDialogs >);
        } else {
            setShowDialog(null);
        }
    }, [stateDialog, msgDialog, typeDialog]);

    return (
        <div>
            {stateDialog ? showDialog ? showDialog : null : null}

            <IconButton
                size="small"
                aria-label="info"
                onClick={handleToggle}
                style={{ marginLeft: "3px" }}
            >
                <PhotoIcon fontSize="small" color="primary" />
            </IconButton>
            <Backdrop
                className={classNames(classes.backdrop, classes.root)}
                open={open} onClick={handleClose}
            // transitionDuration={1000}
            >
                <div
                // className={classNames(classes.divCenter)}
                >
                    {circleLoad ? circleLoad : null}
                    {imgFile ? imgFile : null}
                </div>
            </Backdrop>
        </div>
    );
}