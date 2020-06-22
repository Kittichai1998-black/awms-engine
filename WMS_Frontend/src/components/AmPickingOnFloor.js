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
        <SvgIcon {...props} id="bold" enableBackground="new 0 0 24 24" height="512" viewBox="0 0 24 24" width="512" xmlns="http://www.w3.org/2000/svg">
            <g><path d="M40.121,105.553c-11.42-34.613,7.447-72.068,42.064-83.49s72.07,7.451,83.49,42.064l129.897,393.695
		c-12.105-3.196-24.979-3.781-37.831-1.431L131.984,75.244c-5.292-16.04-22.643-24.781-38.682-19.489
		c-16.04,5.292-24.781,22.643-19.489,38.682c3.069,9.303-1.984,19.335-11.288,22.404C53.222,119.91,43.191,114.856,40.121,105.553z
		 M551.913,414.393l-212.828,70.222c7.553,8.575,13.54,18.769,17.342,30.288c0.135,0.411,0.211,0.826,0.34,1.238l206.263-68.056
		c9.303-3.069,14.357-13.101,11.288-22.403C571.248,416.377,561.215,411.323,551.913,414.393z M339.582,520.465
		c12.059,36.547-7.794,75.949-44.34,88.008c-36.547,12.059-75.949-7.793-88.008-44.34c-12.059-36.548,7.794-75.949,44.34-88.008
		C288.121,464.065,327.524,483.918,339.582,520.465z M306.495,531.381c-6.029-18.273-25.729-28.198-44.004-22.169
		c-18.273,6.028-28.199,25.73-22.17,44.003c6.029,18.273,25.73,28.199,44.004,22.171
		C302.598,569.356,312.524,549.654,306.495,531.381z M498.127,147.345l72.256,218.997c1.535,4.651-0.992,9.667-5.644,11.202
		l-227.42,75.035c-4.651,1.535-9.667-0.992-11.201-5.644l-72.256-218.997c-1.535-4.652,0.992-9.667,5.644-11.202l227.419-75.036
		C491.577,140.167,496.592,142.693,498.127,147.345z M468.044,274.559l-77.438-42.605l-36.864,80.319l24.407,11.233l15.939-34.747
		l28.781,87.232l27.545-9.088l-28.777-87.219l33.477,18.427L468.044,274.559z M400.472,143.908L354.276,3.896
		c-0.981-2.974-4.188-4.59-7.162-3.608l-39.611,13.069l-0.194,0.356l-0.332-0.182l-20.899,6.896l17.21,52.159l-23.573,7.778
		l-17.209-52.159l-20.906,6.898l-0.158,0.344l-0.37-0.17l-39.354,12.985c-2.975,0.981-4.589,4.188-3.608,7.162l46.197,140.013
		c0.981,2.974,4.188,4.59,7.162,3.608l145.398-47.974C399.838,150.089,401.454,146.882,400.472,143.908z"/></g></SvgIcon>
    );
}

const BtnPick = withStyles(theme => ({
    button: {
        margin: theme.spacing(),
        width: '130px',
        lineHeight: 1.5
    },
    leftIcon: {
        marginRight: theme.spacing(),
    },
}))(props => {
    const { classes, onHandleClick, ...other } = props;
    return (
        <>
            {/* <AmToolTip title={"Pick"} placement={"top"}>
            <IconButton
                size="small"
                style={{ marginLeft: "3px" }}
                className={classes.iconButton}
                onClick={onHandleClick}
                {...other}>
                <QRIcon color="primary" fontSize="small" />
            </IconButton></AmToolTip> */}

            <AmButton styleType="confirm" className={classNames(classes.button)}
                    startIcon={<QRIcon className={classNames(classes.leftIcon)} />}
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
const BtnPickingOnFloor = (props) => {
    const {
        classes,
        dataDocument,
        dataItemsSource,
        columnsItemsSource,
        onSuccess
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

    const columns = [
        ...columnsItemsSource,
        {
            width: 160, Header: "Area Location", Cell: e =>
                genArea(e.original)
        },

    ];
    useEffect(() => {
        if (dataItemsSource && open) {
            let newItems = _.filter(dataItemsSource, function (o) { return o.status === 1; });
            setListDocItems(newItems)
            setDefaultSelect([...newItems]);
        }
    }, [dataItemsSource, open]);
    const genArea = (datarow) => {
        return <label>Area</label>
    }
    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        onHandleClear();
        setOpen(false);
    };
    const handleConfirm = () => {
        setOpen(false);

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
            <AmButton className="float-right" styleType="confirm" onClick={() => setOpen(true)} >{"Picking"}</AmButton>

            {/* <BtnPick  onHandleClick={handleClickOpen} /> */}
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
                        dataKey={"ID"}
                        dataSource={listDocItems}
                        selectionDefault={defaultSelect}
                        selection="checkbox"
                        selectionData={data => setDataSelect(data)}
                        rowNumber={true}
                        pageSize={100}
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
export default withStyles(styles)(BtnPickingOnFloor);
