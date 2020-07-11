import React, { useState, useEffect, useMemo } from "react";
import PropTypes from "prop-types";
import IconButton from '@material-ui/core/IconButton';
import styled from "styled-components";
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
import Moment from "moment";
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
import Tooltip from '@material-ui/core/Tooltip';
import RemoveCircle from "@material-ui/icons/RemoveCircle";
import queryString from "query-string";
import CheckCircle from "@material-ui/icons/CheckCircle";
import ListAlt from "@material-ui/icons/ListAlt";
import FormatListBulletedIcon from '@material-ui/icons/FormatListBulleted';
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
  width: 110px;
`;

const InputDiv = styled.div`
    margin: 5px;
    @media (max-width: 800px) {
        margin: 0;
    }
`;
function PalletIcon(props) {
    return (
        <SvgIcon {...props} id="bold" enableBackground="new 0 0 24 24" height="512" viewBox="0 0 24 24" width="512" xmlns="http://www.w3.org/2000/svg">
            <path d="m23.25 24h-3.5c-.414 0-.75-.336-.75-.75v-1.25h-3.5v1.25c0 .414-.336.75-.75.75h-5.5c-.414 0-.75-.336-.75-.75v-1.25h-3.5v1.25c0 .414-.336.75-.75.75h-3.5c-.414 0-.75-.336-.75-.75v-4.5c0-.414.336-.75.75-.75h22.5c.414 0 .75.336.75.75v4.5c0 .414-.336.75-.75.75z" /><path d="m12 12.75c-.553 0-1-.448-1-1v-7.75c0-.552.447-1 1-1s1 .448 1 1v7.75c0 .552-.447 1-1 1z" /><path d="m12 13c-.245 0-.49-.09-.683-.269l-3.75-3.5c-.403-.377-.425-1.01-.049-1.413.378-.404 1.009-.426 1.414-.049l3.068 2.863 3.067-2.863c.405-.378 1.037-.355 1.414.049.376.403.354 1.036-.049 1.413l-3.75 3.5c-.192.179-.437.269-.682.269z" />
        </SvgIcon>

    );
}
const IconBtn = withStyles(theme => ({
    iconButton: {
        padding: 2,
    },
    fontSizeSmall: {
        fontSize: 30
    }

}))(props => {
    const { classes, onHandleClick, ...other } = props;
    return (
        <div><AmToolTip title={"List Pallet"} placement={"top"}>
            <IconButton
                className={classes.iconButton}
                onClick={onHandleClick}
                {...other}>
                <ListAlt color="primary" className={classes.fontSizeSmall} />
            </IconButton>
        </AmToolTip>
        </div>
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

const STOQuery = {
    queryString: window.apipath + "/v2/SelectDataViwAPI/",
    t: "r_StorageObjectV2",
    q: '',
    f: "*",
    g: "",
    s: "[{'f':'Pallet','od':'asc'}]",
    sk: 0,
    l: "",
    all: ""
};
const RenderTable = React.memo(({ open, dataSource, columns, onSelectData }) => {
    if (open && dataSource.length > 0) {
        return <AmTable
            columns={columns}
            dataKey={"ID"}
            dataSource={dataSource}
            selection="radio"
            selectionData={data => onSelectData(data)}
            rowNumber={true}
            pageSize={dataSource.length}
        />
    } else {
        return null;
    }


});

function AlertDialog(open, setting, onAccept) {
    if (open && setting) {
        return <AmDialogs typePopup={setting.type} content={setting.message}
            onAccept={(e) => onAccept(e)} open={open}></AmDialogs>
    } else {
        return null;
    }
}

const AmCheckPalletForReceive = (props) => {
    const {
        classes,
        open,
        close,
        dataDocument,
        onError,
        returnResult
    } = props;
    const { t } = useTranslation()

    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
    const [dataSelect, setDataSelect] = useState([]);
    const [dataSrc, setDataSrc] = useState([]);
    const [openAlert, setOpenAlert] = useState(false);
    const [settingAlert, setSettingAlert] = useState(null);

    const getStatus1 = Status => {
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
    const getPallet = (data) => {
        let link = window.apipath + "/v2/download/download_image?fileName=" + data.Pallet + "&token=" + localStorage.getItem("Token");
        let columnsPack = [
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
            { Header: "Project", accessor: "Project", width: 100 },
            { Header: "Customer", accessor: "ForCustomer", width: 100 },
            { Header: "Lot", accessor: "Lot", width: 80 },
            {
                Header: "Qty",
                accessor: "Qty",
                width: 70,
                type: "number"
            },
            { Header: "Base Unit", accessor: "Base_Unit", width: 100 },

        ]
        let dataPack = [];
        let countPack = data.SKU_Code.toString().split("\\n").length;
        let arraySKUCode = data.SKU_Code != null ? data.SKU_Code.toString().split("\\n") : null;
        let arraySKUName = data.SKU_Name != null ? data.SKU_Name.toString().split("\\n") : null;
        let arrayProject = data.Project != null ? data.Project.toString().split("\\n") : null;
        let arrayCustomer = data.For_Customer != null ? data.For_Customer.toString().split("\\n") : null;
        let arrayLot = data.Lot != null ? data.Lot.toString().split("\\n") : null;
        let arrayQty = data.Qty != null ? data.Qty.toString().split("\\n") : null;
        let arrayBase_Unit = data.Base_Unit != null ? data.Base_Unit.toString().split("\\n") : null;

        for (let i = 0; i < countPack; i++) {
            dataPack.push(
                {
                    ID: i,
                    SKU_Code: arraySKUCode != null && arraySKUCode[i] ? arraySKUCode[i] : "",
                    SKU_Name: arraySKUName != null && arraySKUName[i] ? arraySKUName[i] : "",
                    Project: arrayProject != null && arrayProject[i] ? arrayProject[i] : "",
                    ForCustomer: arrayCustomer != null && arrayCustomer[i] ? arrayCustomer[i] : "",
                    Lot: arrayLot != null && arrayLot[i] ? arrayLot[i] : "",
                    Qty: arrayQty != null && arrayQty[i] ? arrayQty[i] : "",
                    Base_Unit: arrayBase_Unit != null && arrayBase_Unit[i] ? arrayBase_Unit[i] : "",
                }
            )
        }
        let datashow = null;
        if (dataPack != null && dataPack.length > 0) {
            datashow = <AmTable
                columns={columnsPack}
                dataKey={"ID"}
                dataSource={dataPack}
                rowNumber={true}
                pageSize={dataPack.length}
            />
        }


        return <div style={{ display: "flex", maxWidth: '250px' }}>
            <label>{data.Pallet}</label>
            <AmShowImage src={link} />
            <AmRediRectInfo type={"customdialog"}
                customIcon={<FormatListBulletedIcon fontSize='small' color={"primary"} />}
                titleDialog="Detail of pallet"
                bodyDialog={datashow}
            />
        </div>
    }
    const getIsHold = value => {
        return value === false ? <div style={{ textAlign: "center" }}>
            <Tooltip title="NONE" >
                <RemoveCircle
                    fontSize="small"
                    style={{ color: "#9E9E9E" }}
                />
            </Tooltip>
        </div> : <div style={{ textAlign: "center" }}>
                <Tooltip title="HOLD" >
                    <CheckCircle
                        fontSize="small"
                        style={{ color: "black" }}
                    />
                </Tooltip>
            </div>
    }
    const getOptions = value => {
        var qryStr = queryString.parse(value);
        return qryStr["remark"]
    }
    const columnsStorageObject = [
        {
            Header: "Status",
            width: 100,
            Cell: e => {
                let _status = e.original.Status.split("\\n");
                return <div style={{ textAlign: "center" }}>{getStatus1(_status[0])}</div>
            }
        },
        {
            Header: "IsHold",
            accessor: "IsHold",
            width: 50,
            Cell: e => getIsHold(e.original.IsHold)
        },
        {
            Header: "Pallet",
            width: 150,
            Cell: e => getPallet(e.original)
        },
        { Header: "Area", accessor: "Area", width: 100 },
        { Header: "Location", accessor: "Location", width: 100 },
        {
            Header: "Received Date",
            accessor: "Receive_Time",
            width: 150,
            type: "datetime",
            dateFormat: "DD/MM/YYYY HH:mm"
        }
    ]
    useEffect(() => {
        if (open && dataDocument) {
            loadData()
        }
    }, [open])
    async function loadData() {

        let ForCustomer = dataDocument.ForCustomer;
        let Project = dataDocument.Ref2;
        let newSTOQuery = Clone(STOQuery);
        newSTOQuery.q = "[{'f':'For_Customer', 'c':'like','v': '%" + ForCustomer + "%'},{'f':'Project', 'c':'like','v': '%" + Project + "%'}]";
        await Axios.get(createQueryString(newSTOQuery)).then(res => {
            if (res.data._result.status === 1) {
                if (res.data.counts === 0) {
                    onHandleClear();
                    onError("warning", "ไม่พบข้อมูลพาเลท")
                } else {
                    setDataSrc(res.data.datas);
                }
            } else {
                onHandleClear();
                onError("error", res.data._result.message)
            }
        });
    };

    const handleClose = () => {
        onHandleClear();
        close(false);
    };


    const handleConfirm = () => {
        if (dataSelect) {
            if (dataSelect[0].AreaTypeID != 30) {
                alertDialogRenderer("warning", "ขณะนี้พาเลทอยู่ใน ASRS จึงไม่สามารถนำมาใช้งานได้")
            } else {
                returnResult(dataSelect[0]);
                // close(false);
                onHandleClear();
            }
        }
    }
    const onHandleClear = () => {
        setDataSrc([])
        setDataSelect([])
    }
    const alertDialogRenderer = (type, message) => {
        setSettingAlert({ type: type, message: message });
        setOpenAlert(true)
    }
    const onAccept = (data) => {
        setOpenAlert(data)
        if (data === false) {
            setSettingAlert(null)
        }
    }
    const DialogAlert = useMemo(() => AlertDialog(openAlert, settingAlert, onAccept), [openAlert, settingAlert])

    return (
        <div>
            {/* {stateDialog ? showDialog ? showDialog : null : null} */}
            {/* <IconBtn onHandleClick={handleClickOpen} /> */}
            {DialogAlert}
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
                    {/* <RenderTable
                            dataSource={dataSrc}
                            open={open}
                            columns={columnsStorageObject}
                            onSelectData={sel => setDataSelect(sel)}
                        /> */}
                    <AmTable
                        columns={columnsStorageObject}
                        dataKey={"ID"}
                        dataSource={dataSrc}
                        selection="radio"
                        selectionData={data => setDataSelect(data)}
                        rowNumber={true}
                        pageSize={dataSrc.length}
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
    )
}
AmCheckPalletForReceive.propTypes = {
    dataDocument: PropTypes.object.isRequired
};

export default AmCheckPalletForReceive;
