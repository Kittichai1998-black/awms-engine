import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import SvgIcon from '@material-ui/core/SvgIcon';
import IconButton from '@material-ui/core/IconButton';
import Dialog from '@material-ui/core/Dialog';
import MuiDialogActions from '@material-ui/core/DialogActions';
import MuiDialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import MuiDialogTitle from '@material-ui/core/DialogTitle';
import AmDialogConfirm from './AmDialogConfirm';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import { useTheme } from '@material-ui/core/styles';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import CloseIcon from '@material-ui/icons/Close';
import AmDialogs from './AmDialogs'
import AmButton from "./AmButton";
import AmToolTip from "./AmToolTip";
import { apicall, createQueryString, Clone } from "./function/CoreFunction";
import AmTable from "./AmTable/AmTable";
import { useTranslation } from 'react-i18next'
import classNames from 'classnames';
import _ from "lodash";
import PropTypes from "prop-types";
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
// input {
//     margin: 5px 0 0 0;
//   }
const LabelH = styled.label`
font-weight: bold;
  width: 100px;
`;
const styles = (theme) => ({

});
function QRIcon(props) {
    return (
        <SvgIcon>
            <path
                d="M20.55 5.22l-1.39-1.68C18.88 3.21 18.47 3 18 3H6c-.47 0-.88.21-1.15.55L3.46 5.22C3.17 5.57 3 6.01 3 6.5V19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6.5c0-.49-.17-.93-.45-1.28zM12 9.5l5.5 5.5H14v2h-4v-2H6.5L12 9.5zM5.12 5l.82-1h12l.93 1H5.12z"
            />
        </SvgIcon>
    );
}

const BtnPick = withStyles(theme => ({

}))(props => {
    const { classes, onHandleClick, ...other } = props;
    return (
        <>
            <AmButton className="float-right" styleType="confirm"
                startIcon={<QRIcon />}
                onClick={onHandleClick}>
                {'Picking'}
            </AmButton>
        </>
    );
});
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

const useColumns = (cols) => {
    const [columns, setColumns] = useState(cols);

    useEffect(() => {
        const iniCols = [...cols];
        var new_iniCols = iniCols.filter(x => x.accessor != "status");

        new_iniCols.push({
            width: 150,
            Header: "Area Location",
            Cell: e => <label>{e.original.areaCode}{e.original.areaLocationCode ? " : " + e.original.areaLocationCode : ""}</label>
        })
        setColumns(new_iniCols)
    }, [])
    return { columns };
}

const BtnPickingOnFloor = (props) => {
    const {
        classes,
        dataDocument,
        dataItemsSource,
        columnsItemsSource,
        onSuccess,
        apiCreate
    } = props
    const { t } = useTranslation()
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
    const [open, setOpen] = useState(false);
    const [listDocItems, setListDocItems] = useState([]);
    const [dataSelect, setDataSelect] = useState([]);
    const [defaultSelect, setDefaultSelect] = useState();

    //AlertDialog
    const [showDialog, setShowDialog] = useState(null);
    const [stateDialog, setStateDialog] = useState(false);
    const [msgDialog, setMsgDialog] = useState("");
    const [typeDialog, setTypeDialog] = useState("");
    const { columns } = useColumns(columnsItemsSource);

    useEffect(() => {
        if (dataItemsSource && open) {
            let newItems = _.filter(dataItemsSource, function (o) { return o.status === 0; });

            setListDocItems(newItems)
            setDefaultSelect([...newItems]);
        }
    }, [dataItemsSource, open]);

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        onHandleClear();
        setOpen(false);
    };
    const handleConfirm = () => {
        console.log(dataSelect)

        if (dataSelect && dataSelect.length > 0) {
            let listStos = []
            for (let [key, value] of Object.entries(dataSelect)) {
                listStos.push(value.id)
            }
            let tempDataReq = {
                docID: dataDocument.document.ID,
                packIDs: listStos
            }
            console.log(tempDataReq)
            Axios.post(window.apipath + apiCreate, tempDataReq).then((res) => {
                if (res.data != null) {
                    if (res.data._result.status === 1) {
                        alertDialogRenderer("เบิกพาเลทสินค้าสำเร็จ", "success", true);
                        onHandleClear();

                        setOpen(false);
                        onSuccess()
                    } else {
                        alertDialogRenderer(res.data._result.message, "error", true);
                    }
                } else {
                    alertDialogRenderer(res.data._result.message, "error", true);
                }
            });
        } else {
            alertDialogRenderer("กรุณาเลือกรายการสินค้าที่ต้องการเบิกบนคลังพื้น", "warning", true);
        }




    }
    const onHandleClear = () => {
        setDataSelect([]);
        setDefaultSelect(null);
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
            <BtnPick onHandleClick={handleClickOpen} />
            <Dialog
                fullScreen={fullScreen}
                open={open}
                onClose={handleClose}
                maxWidth="xl"
                fullWidth={true}
                aria-labelledby="responsive-dialog-title"
            >
                <DialogTitle id="responsive-dialog-title" onClose={handleClose}>{"Picking on floor"}</DialogTitle>
                <DialogContent>
                    <AmTable
                        columns={columns}
                        dataKey={"id"}
                        dataSource={listDocItems}
                        selectionDefault={defaultSelect}
                        selection="checkbox"
                        selectionData={data => setDataSelect(data)}
                        selectionDisible={data => { return data.areaTypeID != 30 }}
                        rowNumber={true}
                        pageSize={listDocItems.length}
                    // height={400}
                    />
                </DialogContent>
                <DialogActions>
                    <AmButton styleType="add" onClick={handleConfirm}>
                        Confirm
                    </AmButton>
                    <AmButton onClick={handleClose} styleType='delete'>
                        Cancel
                    </AmButton>
                </DialogActions>
            </Dialog>
        </div>
    );
};
BtnPickingOnFloor.propTypes = {
    onSuccess: PropTypes.func.isRequired,
    apiCreate: PropTypes.string,
    columnsItemsSource: PropTypes.array.isRequired,
    dataItemsSource: PropTypes.array,
    dataDocument: PropTypes.array,
};
BtnPickingOnFloor.defaultProps = {
    apiCreate: "/v2/done_wq_onfloor",
}
export default withStyles(styles)(BtnPickingOnFloor);
