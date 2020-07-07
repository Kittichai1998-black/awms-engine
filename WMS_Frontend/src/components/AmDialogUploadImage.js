import React, { useState, useEffect } from "react";
import classNames from 'classnames';
import IconButton from "@material-ui/core/IconButton";
import AmDialogConfirm from "../components/AmDialogConfirm";
import AddPhotoAlternateIcon from '@material-ui/icons/AddAPhoto';
import { apicall, createQueryString, Clone } from "./function/CoreFunction";
import { useTranslation } from 'react-i18next'
import PropTypes from "prop-types";
import styled from "styled-components";
import PublishIcon from '@material-ui/icons/Publish';
import AmButton from "./AmButton";
import AmDialogs from './AmDialogs'
import Dialog from '@material-ui/core/Dialog';
import MuiDialogTitle from '@material-ui/core/DialogTitle';
import MuiDialogActions from '@material-ui/core/DialogActions';
import MuiDialogContent from '@material-ui/core/DialogContent';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import { useTheme } from '@material-ui/core/styles';
import { withStyles } from '@material-ui/core/styles';
import CloseIcon from '@material-ui/icons/Close';
import Typography from '@material-ui/core/Typography';

const Axios = new apicall();

const FormInline = styled.div`

display: flex;
flex-flow: row wrap;
align-items: center;
label {
    margin: 5px 5px 5px 0;
}
input {
    vertical-align: middle;
}
@media (max-width: 800px) {
    flex-direction: column;
    align-items: stretch;
    
  }
`;
const LabelH = styled.label`
font-weight: bold;
  width: 110px;
`;
const GlobalBtnBaseCss = withStyles({
    '@global': {
        '.MuiButtonBase-root': {
            position: 'unset !important',
        },
    },
})(() => null);
const DialogTitle = withStyles(theme => ({
    root: {
        borderBottom: `1px solid ${theme.palette.divider}`,
        margin: 0,
        padding: theme.spacing(0.5)
    },
    closeButton: {
        position: 'absolute',
        right: theme.spacing(0.5),
        top: theme.spacing(0.7),
        color: theme.palette.grey[500],
        padding: "3px"
    }
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

const AmDialogUploadImage = (props) => {
    const { classes, titleDialog, fileName } = props;
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
    const { t } = useTranslation()

    const [open, setOpen] = useState(false);
    const [imgFile, setImgFile] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    //AlertDialog
    const [showDialog, setShowDialog] = useState(null);
    const [stateDialog, setStateDialog] = useState(false);
    const [msgDialog, setMsgDialog] = useState("");
    const [typeDialog, setTypeDialog] = useState("");

    const handleClickOpen = () => {
        setOpen(true);
    };
    const handleClose = () => {
        onHandleClear();
        setOpen(false);
    };
    const onHandleClear = () => {
        setImgFile(null);
        setImageFile(null);
    }
    async function onUploadFile() {
        let fileBase64 = await toBase64(imageFile)
        if (fileName) {
            let filejson = {
                fileName: fileName,
                imageBase64: fileBase64
            }
            await Axios.post(window.apipath + "/v2/upload_image/", filejson).then(res => {
                if (res.data._result.status === 1) {
                    onHandleClear();
                    setOpen(false);
                    alertDialogRenderer("อัพโหลดไฟล์รูปภาพ " + res.data.fileName + " สำเร็จ", "success", true);

                } else {
                    alertDialogRenderer(res.data._result.message, "error", true);
                }
            });
        } else {
            alertDialogRenderer("กรุณาระบุชื่อไฟล์รูปภาพ", "warning", true);
        }
    }
    const toBase64 = file => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
    const handleFileChange = (event) => {
        if (event.target.files[0]) {
            setImgFile(URL.createObjectURL(event.target.files[0]))
            setImageFile(event.target.files[0])
        } else {
            setImgFile(null)
            setImageFile(null)
        }
    }
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
            <GlobalBtnBaseCss />
            <IconButton
                size="small"
                aria-label="info"
                onClick={handleClickOpen}
                style={{ marginLeft: "3px" }}
            >
                <AddPhotoAlternateIcon color="primary" fontSize="small" />
            </IconButton>
            <Dialog
                fullScreen={fullScreen}
                aria-labelledby="addpallet-dialog-title"
                onClose={handleClose}
                open={open}
                maxWidth="xl"
            >
                <DialogTitle
                    id="addpallet-dialog-title"
                    onClose={handleClose}>
                    {titleDialog ? titleDialog : "Upload Image"}
                </DialogTitle>
                <DialogContent>
                    <div><FormInline><LabelH><label htmlFor="img">{t('Select Image')} : </label></LabelH>
                        <div style={{ display: 'inline-flex', alignItems: 'center' }} >
                            <input type="file" id="img" name="formFile"
                                accept="image/*" style={{ maxWidth: "230px" }}
                                onChange={(e) => handleFileChange(e)}
                            />
                        </div>
                    </FormInline>
                        {imgFile ?
                            <div style={{ margin: "5px 0px", textAlign: "center" }}><img src={imgFile} style={{ maxHeight: 350 }} /></div>
                            : null}
                    </div>
                </DialogContent>
                <DialogActions>
                    <AmButton styleType="add"
                        startIcon={<PublishIcon size="small" style={{ marginRight: '' }} />}
                        onClick={onUploadFile} >Upload</AmButton>
                    <AmButton onClick={handleClose} styleType='delete'>
                        Cancel
                    </AmButton>
                </DialogActions>
            </Dialog>
        </div>
    );
}
export default AmDialogUploadImage;

