import React, { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import IconButton from '@material-ui/core/IconButton';
import Dialog from '@material-ui/core/Dialog';
import AmDialogs from './AmDialogs'
import MuiDialogActions from '@material-ui/core/DialogActions';
import MuiDialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import MuiDialogTitle from '@material-ui/core/DialogTitle';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import { useTheme } from '@material-ui/core/styles';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import CloseIcon from '@material-ui/icons/Close';
import AmTable from "./AmTable/AmTable";
import AmButton from "./AmButton";
import SvgIcon from '@material-ui/core/SvgIcon';
import AmToolTip from "./AmToolTip";
import { useTranslation } from 'react-i18next'
import { apicall, createQueryString, Clone } from "./function/CoreFunction";
import { StorageObjectEvenstatus } from "./Models/StorageObjectEvenstatus";
import AmStorageObjectStatus from "./AmStorageObjectStatus";
import AmRediRectInfo from './AmRedirectInfo'
import PhotoIcon from '@material-ui/icons/Photo';
import { DataGenerateMulti } from "../views/pageComponent/AmStorageObjectV2/SetMulti";
import AmShowImage from './AmShowImage'
const Axios = new apicall();

function PalletIcon(props) {
    return (
        <SvgIcon {...props} id="bold" enableBackground="new 0 0 24 24" height="512" viewBox="0 0 24 24" width="512" xmlns="http://www.w3.org/2000/svg">
            <path d="m23.25 24h-3.5c-.414 0-.75-.336-.75-.75v-1.25h-3.5v1.25c0 .414-.336.75-.75.75h-5.5c-.414 0-.75-.336-.75-.75v-1.25h-3.5v1.25c0 .414-.336.75-.75.75h-3.5c-.414 0-.75-.336-.75-.75v-4.5c0-.414.336-.75.75-.75h22.5c.414 0 .75.336.75.75v4.5c0 .414-.336.75-.75.75z" /><path d="m12 12.75c-.553 0-1-.448-1-1v-7.75c0-.552.447-1 1-1s1 .448 1 1v7.75c0 .552-.447 1-1 1z" /><path d="m12 13c-.245 0-.49-.09-.683-.269l-3.75-3.5c-.403-.377-.425-1.01-.049-1.413.378-.404 1.009-.426 1.414-.049l3.068 2.863 3.067-2.863c.405-.378 1.037-.355 1.414.049.376.403.354 1.036-.049 1.413l-3.75 3.5c-.192.179-.437.269-.682.269z" />
        </SvgIcon>

    );
}
const IconBtn = withStyles(theme => ({
    iconButton: {
        padding: 4,
    },

}))(props => {
    const { classes, onHandleClick, ...other } = props;
    return (
        <div><AmToolTip title={"List Pallet"} placement={"top"}>
            <IconButton
                className={classes.iconButton}
                onClick={onHandleClick}
                {...other}>
                <PalletIcon color="primary" />
            </IconButton>
        </AmToolTip>
        </div>
    );
});
const getStatus = Status => {
    if (Status === "NEW") {
        return <AmStorageObjectStatus key={Status} statusCode={100} />;
    } else if (Status === "RECEIVING") {
        return <AmStorageObjectStatus key={Status} statusCode={101} />;
    } else if (Status === "RECEIVED") {
        return <AmStorageObjectStatus key={Status} statusCode={102} />;
    } else if (Status === "AUDITING") {
        return <AmStorageObjectStatus key={Status} statusCode={103} />;
    } else if (Status === "AUDITED") {
        return <AmStorageObjectStatus key={Status} statusCode={104} />;
    } else if (Status === "PICKING") {
        return <AmStorageObjectStatus key={Status} statusCode={153} />;
    } else if (Status === "PICKED") {
        return <AmStorageObjectStatus key={Status} statusCode={154} />;
    } else {
        return null;
    }

};
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

const useGetStos = (data) => {
    const [dataSrc, setDataSrc] = useState([]);
    const [count, setCount] = useState(0)

    useEffect(() => {
        let ForCustomer = data.ForCustomer;

        const Query = {
            queryString: window.apipath + "/v2/SelectDataViwAPI/",
            t: "r_StorageObjectV2",
            q: '[{ "f": "For_Customer", "c":"like", "v": "%' + ForCustomer + '%"}]',
            f: "*",
            g: "",
            s: "[{'f':'Pallet','od':'asc'}]",
            sk: 0,
            l: "",
            all: ""
        };
        getData(Query);
    }, []);

    async function getData(qryString) {
        try {
            await Axios.get(createQueryString(qryString)).then(res => {
                if (res.data.datas) {
                    var resData = DataGenerateMulti(res.data.datas)
                    setDataSrc(resData);
                    // console.log(res.data.counts)
                    setCount(res.data.counts)
                }
            });

        } catch (err) {
            setDataSrc([]);
        }
    }

    return { dataSrc, count };
}

const AmCheckPalletForReceive = (props) => {
    const {
        classes,
        dataDocument,
        returnResult
    } = props;
    const { t } = useTranslation()

    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
    const [open, setOpen] = useState(false);
    const [dataSelect, setDataSelect] = useState([]);

    const { dataSrc, count } = useGetStos(dataDocument);

    //AlertDialog
    const [showDialog, setShowDialog] = useState(null);
    const [stateDialog, setStateDialog] = useState(false);
    const [msgDialog, setMsgDialog] = useState("");
    const [typeDialog, setTypeDialog] = useState("");
    // const [showImg, setShowImg] = useState(null);
    const [srcImg, setSrcImg] = useState(null);
    const [openIMG, setOpenIMG] = useState(false);


    const columnsStorageObject = [
        {
            Header: "Status",
            fixed: "left",
            fixWidth: 35,
            Cell: e => getStatus(e.original.Status[0].props.children.props.children)
        },
        {
            Header: "IsHold",
            accessor: "HoldStatus",
            fixed: "left",
            fixWidth: 50,
        },
        {
            Header: "Pallet",
            width: 150,
            Cell: e => getPallet(e.original.Pallet)
        },
        {
            Header: "SKU Code",
            accessor: "SKU_Code",
            width: 100
        },
        {
            Header: "SKU Name",
            accessor: "SKU_Name",
            width: 100
        },
        { Header: "Warehouse", accessor: "Warehouse", width: 80 },
        { Header: "Area", accessor: "Area", width: 100 },
        { Header: "Location", accessor: "Location", width: 100 },
        { Header: "Lot", accessor: "Lot", width: 80 },
        {
            Header: "Qty",
            accessor: "Qty",
            width: 70,
            type: "number"
        },
        { Header: "Base Unit", accessor: "Base_Unit", width: 100 },
        { Header: "Remark", accessor: "Remark", width: 100 },
        {
            Header: "Received Date",
            accessor: "Receive_Time",
            width: 150,
            type: "datetime",
            dateFormat: "DD/MM/YYYY HH:mm"
        }
    ]
    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        onHandleClear();
        setOpen(false);
    };


    const handleConfirm = () => {
        if (dataSelect) {
            returnResult(dataSelect);
            onHandleClear();
            setOpen(false);
        }
    }
    const onHandleClear = () => {
        setDataSelect([])
    }


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

    const getPallet = (data) => {
        // let link = window.apipath + "/v2/download/download_image?fileName=" + data + "&_token=" + localStorage.getItem("Token");
        return <div style={{ display: "flex", maxWidth: '250px' }}>
            <label>{data}</label>
            {/* <AmShowImage src={link} /> */}
            <IconButton
                size="small"
                aria-label="info"
                onClick={() => getFile(data)}
                style={{ marginLeft: "3px" }}
            >
                <PhotoIcon fontSize="small" color="primary" />
            </IconButton>
            {/* <AmRediRectInfo customApi={()=>getFile(data)} type={"custom_icon"} customIcon={<PhotoIcon fontSize="small" color="primary" />} /> */}
        </div>

    }
    function getFile(data) {
        setSrcImg(window.apipath + "/v2/download/download_image?fileName=" + data + "&_token=" + localStorage.getItem("Token"));
        setOpenIMG(true)
        // setShowImg(<AmShowImage src={link} open={openIMG} onClose={(res)=>setOpenIMG(res)} />)
    }
    // const handleClickOpenIMG = (res) => {
    //     setOpenIMG(res);
    // };
    return (
        <div>
            {stateDialog ? showDialog ? showDialog : null : null}
            <IconBtn onHandleClick={handleClickOpen} />
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
                    {"List Pallet"}
                </DialogTitle>
                <DialogContent>
                    <AmTable
                        columns={columnsStorageObject}
                        dataKey={"ID"}
                        dataSource={dataSrc}
                        // selectionDefault={defaultSelect}
                        selection="checkbox"
                        selectionData={data => setDataSelect(data)}
                        rowNumber={true}
                        pageSize={200}
                    />
                    <AmShowImage src={srcImg} open={openIMG} onClose={(res) => setOpenIMG(res)} />

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
    )
}
AmCheckPalletForReceive.propTypes = {
    dataDocument: PropTypes.object.isRequired
};

export default AmCheckPalletForReceive;
