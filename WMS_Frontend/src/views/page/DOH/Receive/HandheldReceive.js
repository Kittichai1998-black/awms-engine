import React, { useState, useEffect, useRef, useMemo } from "react";
import {
    apicall,
    createQueryString,
    Clone,
    IsEmptyObject
} from "../../../../components/function/CoreFunction";
import {
    indigo,
    deepPurple,
    lightBlue,
    red,
    grey,
    green
} from "@material-ui/core/colors";
import { useTranslation } from "react-i18next";
import AmDialogs from "../../../../components/AmDialogs";
import AmButton from "../../../../components/AmButton";
import AmInput from "../../../../components/AmInput";
import { withStyles } from "@material-ui/core";
import Paper from "@material-ui/core/Paper";
import Stepper from "@material-ui/core/Stepper";
import Step from "@material-ui/core/Step";
import StepLabel from "@material-ui/core/StepLabel";
import StepContent from "@material-ui/core/StepContent";
import Typography from "@material-ui/core/Typography";
import _ from "lodash";
import AmDialogConfirm from '../../../../components/AmDialogConfirm'
import SvgIcon from '@material-ui/core/SvgIcon';
import queryString from 'query-string'
import * as SC from '../../../../constant/StringConst'
import AmStorageObjectStatus from '../../../../components/AmStorageObjectStatus';
import AmWorkQueueStatus from '../../../../components/AmWorkQueueStatus';
import AmListSTORenderer from '../../../pageComponent/AmListSTORenderer';
import classnames from 'classnames';
import moment from "moment";
import AmAuditStatus from '../../../../components/AmAuditStatus'
import InboxIcon from '@material-ui/icons/Inbox';
import AmTreeView from '../../../pageComponent/AmTreeView'
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import Checkbox from '@material-ui/core/Checkbox';
import IconButton from '@material-ui/core/IconButton';
import EditIcon from '@material-ui/icons/Edit';
import Divider from '@material-ui/core/Divider';
import DialogTitle from '@material-ui/core/DialogTitle';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';

const Axios = new apicall();

const styles = theme => ({
    root: {
        // maxWidth: '100%',
        fontFamily: [
            "-apple-system",
            "BlinkMacSystemFont",
            '"Segoe UI"',
            "Roboto",
            '"Helvetica Neue"',
            "Arial",
            "sans-serif",
            '"Apple Color Emoji"',
            '"Segoe UI Emoji"',
            '"Segoe UI Symbol"'
        ].join(",")
    },
    paperContainer: {
        maxWidth: "450px",
        width: "100%",
        minWidth: "300px",
        padding: theme.spacing(2, 1)
    },
    stepperContainer: {
        padding: "10px"
    },
    buttonAuto: {
        margin: theme.spacing(),
        width: "auto",
        lineHeight: 1
    },
    button: {
        marginTop: theme.spacing(),
        marginRight: theme.spacing()
    },
    actionsContainer: {
        marginBottom: theme.spacing(2),
        textAlign: "end"
    },
    actionsContainerStart: {
        marginBottom: theme.spacing(2),
        textAlign: "start"
    },
    resetContainer: {
        textAlign: "left"
    },
    tb: {
        fontSize: "18px"
    },
    tbhead: {
        fontWeight: "bold",
        verticalAlign: "top"
    },
    tbdetail: {
        width: "265px",
        whiteSpace: "initial"
    },
    print_size: {
        width: "400px",
        height: "600px",
        padding: "5px 12px",
        backgroundColor: "#ffffff"
    },
    print_title: {
        fontSize: "20px",
        paddingBottom: "5px",
        fontWeight: "bold",
        width: "100px"
    },
    print_detail: {
        fontSize: "36px",
        fontWeight: "bold",
        width: "300px",
        whiteSpace: "initial"
    },
    print_detail2: {
        fontSize: "26px",
        fontWeight: "bold",
        whiteSpace: "initial",
        width: "375px"
    },
    print_footer: {
        fontSize: "12px"
    },
    tb_bottom: {
        verticalAlign: "bottom",
        textAlign: "center"
    },
    tr_bottom: { verticalAlign: "bottom" },
    tr_top: { verticalAlign: "top" },
    divLine: {
        // borderBottom: '2px solid #000000',
        marginTop: 45
    },
    // labelHead: {
    //     fontWeight: "inherit",
    //     fontWeight: 'bold',
    // },
    labelHead2: {
        fontWeight: "inherit",
    },
    labelText: {
        // fontWeight: "inherit",
        // fontSize: 12,
        flexGrow: 1
    },
    labelTextRoot: {
        fontWeight: "bold",
        fontSize: 16,
        flexGrow: 1,
        display: 'inline-flex'
    },
    labelText2: {
        // fontWeight: "inherit",
        // fontSize: 12,
        flexGrow: 1,
        display: 'inline-flex'
    },
    statusLabel: {
        fontSize: 12,
        // height: '1.75em',
        padding: 3,
        width: 'auto',
    },
    textNowrap: { flexGrow: 1, overflow: 'hidden', textOverflow: 'ellipsis', display: 'block', whiteSpace: 'nowrap' },
    detail: {
        fontSize: '90%',
    },
    areadetail: {
        fontSize: '1.225em'
    },
    labelHead: {
        fontWeight: 'bold',
        display: 'inline-block',
    },
});

const DialogEditQty = withStyles(theme => ({


}))(props => {
    const { classes, open, onClose, dataSel, onAlert, ...other } = props;

    const [valueQty, setValueQty] = useState(null);

    const handleClose = () => {
        onClose(dataSel);
    };
    const onHandleChangeQty = (value) => {
        setValueQty(value)
    }
    const handleConfirm = () => {
        if (valueQty) {
            if (parseInt(valueQty) > dataSel.Quantity) {
                onAlert("warning", "ไม่สามารถแก้ไขจำนวนสินค้าเกินกว่าที่เอกสารกำหนดได้");
            } else if (parseInt(valueQty) == 0) {
                onAlert("warning", "กรุณากรอกจำนวนสินค้า");
            } else {
                dataSel.NewQuantity = parseInt(valueQty);
                onClose(dataSel);
            }
        } else {
            onAlert("warning", "กรุณากรอกจำนวนสินค้า");
        }
    }
    return (
        <div>
            <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title">
                <DialogTitle id="simple-dialog-title" onClose={handleClose}>Edit Quantity</DialogTitle>
                <DialogContent>
                    <AmInput
                        id={"qty"}
                        type="number"
                        placeholder="Quantity"
                        autoFocus={true}
                        style={{ width: "100%" }}
                        onChange={(value, obj, element, event) => onHandleChangeQty(value)}
                        onKeyPress={(value, obj, element, event) => {
                            if (event.key === "Enter") {
                                onHandleChangeQty(value);
                                handleConfirm()
                            }
                        }
                        }
                    />
                </DialogContent>
                <DialogActions>
                    <AmButton styleType="confirm_clear" onClick={handleConfirm} >
                        Edit
                    </AmButton>
                    <AmButton styleType="delete_clear" onClick={handleClose} >
                        Cancel
                    </AmButton>
                </DialogActions>
            </Dialog>

        </div>
    )
});
const CheckboxList = withStyles(theme => ({
    root: {
        width: '100%',
        maxWidth: 360,
        backgroundColor: theme.palette.background.paper,
    },
    inline: {
        display: 'inline',
    },
    listItemIcon: {
        minWidth: '26px',
    },
    iconButton: {
        padding: 4
    },
}))(props => {
    const { classes, data, onClickUpdate, onAlert, ...other } = props;
    const [checked, setChecked] = useState([]);
    const [newData, setNewData] = useState(data);
    const [open, setOpen] = useState(false);
    const [dataSel, setDataSel] = useState(null);
    const handleToggle = (value, idx) => () => {
        const currentIndex = checked.indexOf(idx);
        const newChecked = [...checked];
        if (currentIndex === -1) {
            newChecked.push(idx);

            const resDatas = newData.map(p =>
                p.ID === value.ID
                    ? { ...p, Checked: 1 }
                    : p
            );

            setNewData(resDatas)
            onClickUpdate(resDatas)
        } else {
            newChecked.splice(currentIndex, 1);
            const resDatas = newData.map(p =>
                p.ID === value.ID
                    ? { ...p, Checked: 0 }
                    : p
            );
            setNewData(resDatas)
            onClickUpdate(resDatas)
        }

        setChecked(newChecked);
    };

    const onHandleClickOpen = (dataselect) => {
        setDataSel(dataselect)
        setOpen(true);
    }
    const handleClose = (value) => {
        setOpen(false);
        onClickUpdate(newData)
    };
    return (
        <>
            <DialogEditQty open={open} open={open} onClose={handleClose} dataSel={dataSel} onAlert={onAlert} />
            <List className={classes.root}>
                {newData.map((value, idx) => {
                    const labelId = `checkbox-list-label-${value.ID}`;
                    return (
                        <>
                            <ListItem key={idx} role={undefined} dense button onClick={handleToggle(value, idx)}>
                                <ListItemIcon className={classes.listItemIcon}>
                                    <Checkbox
                                        edge="start"
                                        className={classes.iconButton}
                                        checked={checked.indexOf(idx) !== -1}
                                        tabIndex={-1}
                                        disableRipple
                                        inputProps={{ 'aria-labelledby': labelId }}
                                    />
                                </ListItemIcon>
                                <ListItemText
                                    id={labelId}
                                    primary={`SKU: ${value.PackItems}`}
                                    secondary={
                                        <React.Fragment>
                                            {value.Ref1 ? <Typography variant="body2" >{`Serial: ${value.Ref1}`}</Typography> : null}
                                            {value.Batch ? <Typography variant="body2">{`Batch: ${value.Batch}`}</Typography> : null}
                                            {value.Lot ? <Typography variant="body2">{`Lot: ${value.Lot}`}</Typography> : null}
                                            {value.NewQuantity ?
                                                <Typography variant="body2">{`Qty: ${value.NewQuantity} ${value.UnitType_Code}`}</Typography> :
                                                value.Quantity ?
                                                    <Typography variant="body2">{`Qty: ${value.Quantity} ${value.UnitType_Code}`}</Typography>
                                                    : null}
                                        </React.Fragment>
                                    }
                                />
                                <ListItemSecondaryAction>
                                    <IconButton edge="end" aria-label="comments" className={classes.iconButton}>
                                        <EditIcon onClick={() => onHandleClickOpen(value)} />
                                    </IconButton>
                                </ListItemSecondaryAction>
                            </ListItem>
                            {idx === (data.length - 1) ? null : <Divider variant="inset" component="li" />}
                        </>
                    )
                })}
            </List>
        </>
    )
});

const HandheldReceive = (props) => {
    const { t } = useTranslation();
    const { classes } = props;
    const [valueInput, setValueInput] = useState({});
    const [activeStep, setActiveStep] = useState(0);
    const [datas, setDatas] = useState(null);
    const [openAlert, setOpenAlert] = useState(false);
    const [settingAlert, setSettingAlert] = useState(null);

    const [datasto, setDatasto] = useState(null);
    const [req, setReq] = useState(null);
    //steps
    const steps = getSteps();

    function getSteps() {
        var bstoCode = "";

        if (valueInput) {
            if (valueInput.bstoCode) { bstoCode = valueInput.bstoCode; }
        }

        return [
            { label: "Scan Pallet Code", value: bstoCode },
            { label: "Scan QR Products", value: null }
        ]
    }

    function getStepContent(step) {
        switch (step) {
            case 0:
                return <div>
                    <AmInput
                        id={"bstoCode"}
                        type="input"
                        placeholder="Scan Pallet Code"
                        autoFocus={true}
                        style={{ width: "100%" }}
                        onChange={(value, obj, element, event) => onHandleChangeInput(value, "bstoCode")}
                        onKeyPress={(value, obj, element, event) => {
                            if (event.key === "Enter") {
                                onHandleChangeInput(value, "bstoCode");
                                handleNext(0);
                            }
                        }
                        }
                    />
                </div>;
            case 1:
                return <CheckboxList data={datas}
                    onClickUpdate={(res) => onReturnData(res)}
                    onAlert={alertDialogRenderer}
                />
            default:
                return 'Unknown step';
        }
    }
    const handleNext = (index) => {
        if (index === 0) {
            if (valueInput.bstoCode) {
                GetDetailPallet(valueInput.bstoCode);
            } else {
                alertDialogRenderer("warning", "กรุณากรอกหมายเลขพาเลท")
            }
        }
        if (index === 1) {
            ConfirmPutaway();
        }
    };
    const handleBack = (index) => {
        if (index === 1) {
            setValueInput({ ...valueInput, ['bstoCode']: null })
            // ClearInput('bstoCode');
        }
        setActiveStep((prevActiveStep) => prevActiveStep - 1);
    };
    const handleReset = () => {
        setValueInput({});
        setActiveStep(0);
        setDatas(null);
        ClearInput('bstoCode')
    };
    const ClearInput = (field) => {
        let ele2 = document.getElementById(field);
        if (ele2)
            ele2.value = "";
        valueInput[field] = null;
    }
    const onHandleChangeInput = (value, field) => {
        valueInput[field] = value;
    };

    const GetDetailPallet = (bstoCode) => {
        // var req = { 'bstoCode': bstoCode.trim() }
        var queryGet = {
            queryString: window.apipath + "/v2/SelectDataViwAPI/",
            t: "DocumentItem",
            q: '[{ "f": "Status", "c":"=", "v": 1},{ "f": "EventStatus", "c":"=", "v": 10},'
                + '{"f": "ParentDocumentItem_ID", "c":"is not null", "v": ""},'
                + '{ "f": "BaseCode", "c":"=", "v":"' + bstoCode.trim() + '"}]',
            f: "*",
            g: "",
            s: "[{'f':'ID','od':'asc'}]",
            sk: 0,
            l: 100,
            all: ""
        }
        Axios.get(createQueryString(queryGet)).then(res => {
            // console.log(res)
            if (res.data.datas) {
                if (res.data.datas.length > 0) {
                    setDatas(res.data.datas)
                    setActiveStep((prevActiveStep) => prevActiveStep + 1);
                } else {
                    handleReset();
                    alertDialogRenderer("error", "ไม่พบรายการเอกสารรับเข้าสำหรับพาเลทนี้")
                }

            } else {
                handleReset();
                alertDialogRenderer("error", res.data._result.message)
            }
        });
    }

    const onReturnData = (resItems) => {
        console.log(resItems)
        // let groupItem =
        //     _.chain(res)
        //         // Group the elements of Array based on `color` property
        //         .groupBy("BaseCode")
        //         // `key` is group's name (color), `value` is the array of objects
        //         .map((value, key) => ({ BaseCode: key, Items: value }))
        //         .value();

        let rootSto ={
            bstoCode: resItems[0].BaseCode,
            processType: resItems[0].DocumentProcessType_ID,
            warehouseID: 1,
            areaID: 12,
            pstos: []
        }
        resItems.forEach((item, index) => {
            console.log(item.NewQuantity)
            let qryStrOpt = queryString.parse(item.Options);
            qryStrOpt[SC.OPT_DOCITEM_ID] = item.ID.toString();
            let qryStr = queryString.stringify(qryStrOpt)
            let uri_opt = decodeURIComponent(qryStr) || null;
            let pstos ={
                pstoCode: item.Code,
                batch: item.Batch,
                lot: item.Lot,
                cartonNo: item.CartonNo,
                itemNo: item.ItemNo,
                orderNo: item.OrderNo,
                forCustomerID: item.Des_Customer_ID ? item.Des_Customer_ID : null,
                ref1: item.Ref1,
                ref2: item.Ref2,
                ref3: item.Ref3,
                ref4: item.Ref4,
                addQty: item.NewQuantity ? item.NewQuantity : item.Quantity,
                unitTypeCode: item.UnitType_Code,
                packUnitTypeCode: item.BaseUnitType_Code,
                auditStatus: item.AuditStatus,
                expiryDate: item.ExpireDate,
                productDate: item.ProductionDate,
                options: uri_opt
            }
            rootSto.pstos.push(pstos)
        });
 
        console.log(rootSto)
        
        
        setReq(rootSto)
    }

    const ConfirmPutaway = () => {
        console.log(req)
        if (req) {
            Axios.post(window.apipath + "/v2/MappingandConfirmPutawayAPI", req).then(res => {
                if (res.data._result.status === 1) {
                    alertDialogRenderer("success", "สร้างข้อมูลพาเลทสินค้าสำเร็จ")
                    setDatasto(res.data)
                    setActiveStep((prevActiveStep) => prevActiveStep + 1);
                } else {
                    alertDialogRenderer("error", res.data._result.message)
                }
            });
        }
    }

    const RenderTreeViewData = React.memo(({ data }) => {
        // console.log(data)
        if (data != null && data.stos != null && data.stos.mapstos != null && data.stos.mapstos.length > 0) {
            //    let bstoCode 
            let treeItems = [];
            {
                data.stos.mapstos.map((sto, idx) => {
                    let pstoCode = sto.code != null ? sto.code : "";
                    let pstoName = sto.name != null ? sto.name : "";
                    let lot = sto.lot != null && sto.lot.length > 0 ?
                        <Typography variant="body2" className={classes.labelText} noWrap>{"Lot: " + sto.lot}</Typography>
                        : null;
                    let batch = sto.batch != null && sto.batch.length > 0 ?
                        <Typography variant="body2" className={classes.labelText} noWrap>{"Batch: " + sto.batch}</Typography>
                        : null;
                    let orderNo = sto.orderNo != null && sto.orderNo.length > 0 ?
                        <Typography variant="body2" className={classes.labelText} noWrap>{"Control No.: " + sto.orderNo}</Typography>
                        : null;
                    let cartonNo = sto.cartonNo != null && sto.cartonNo.length > 0 ?
                        <Typography variant="body2" className={classes.labelText} noWrap>{"Carton No.: " + sto.cartonNo}</Typography>
                        : null;
                    let serial = sto.ref1 != null && sto.ref1.length > 0 ?
                        <Typography variant="body2" className={classes.labelText} noWrap>{"Serial: " + sto.ref1}</Typography>
                        : null;

                    let currentQty = sto.qty != null ?
                        <Typography variant="body2" className={classes.labelText} noWrap>{"Quantity: " + sto.qty + " " + sto.unitCode}</Typography>
                        : null;

                    let remark = sto.remark != null ?
                        <Typography variant="body2" className={classes.labelText} noWrap>{"Remark: " + sto.remark}</Typography>
                        : null;
                    let productDate = sto.productDate != null ?
                        <Typography variant="body2" className={classes.labelText} noWrap>{"MFG.Date: " + moment(sto.productDate).format("DD/MM/YYYY")}</Typography>
                        : null;
                    let expiryDate = sto.expiryDate != null ?
                        <Typography variant="body2" className={classes.labelText} noWrap>{"Expire Date: " + moment(sto.expiryDate).format("DD/MM/YYYY")}</Typography>
                        : null;
                    let auditstatus = null;
                    if (sto.AuditStatus != null) {
                        let audit = "Quality Status: ";
                        auditstatus = <Typography variant="body2" className={classes.labelText} noWrap>{audit}
                            <AmAuditStatus className={classes.statusLabel} statusCode={sto.AuditStatus} />
                        </Typography>

                    }
                    let eventstatus = null;
                    if (sto.eventStatus != null) {
                        let event = "Status: ";
                        eventstatus = <Typography variant="body2" className={classes.labelText} noWrap>{event}
                            <AmStorageObjectStatus className={classes.statusLabel} statusCode={sto.eventStatus} />
                        </Typography>

                    }
                    let treeItem = {
                        nodeId: sto.id.toString(),
                        labelText:
                            <div className={classes.textNowrap}>
                                <Typography variant="body2" className={classes.labelText} noWrap>
                                    <span className={classes.labelHead}>{pstoCode}</span>
                                    &nbsp;{"- " + pstoName}
                                </Typography>
                                {currentQty}
                                {serial}{lot}{batch}{orderNo}{cartonNo}{productDate}{expiryDate}{remark}{auditstatus}{eventstatus}
                            </div>,
                        labelIcon: InboxIcon,
                        // labelInfo: currentQty,
                        bgColor: "#e8f0fe",
                        color: "#1a73e8",
                        dataItem: sto,
                        // onIconClick: (dataItem) => onClick(dataItem),
                        // onLabelClick: (dataItem) => onClick(dataItem)
                    };

                    treeItems.push(treeItem);
                })
            }
             
            // let warehouse = data.warehouseCode != null ?
            // <Typography variant="body2" className={classes.labelText} noWrap>{"Warehouse: " + data.warehouseCode}</Typography>
            // : null;

            // let areaLoc = data.locationCode != null ? " - " + data.locationCode : "";
            // let area = data.areaCode != null ?
            //     <Typography variant="body2" className={classes.labelText} noWrap>{"Area: " + data.areaCode + areaLoc}</Typography>
            //     : null;
                
            let dataTreeItems = [{
                nodeId: 'root',
                // labelText: data.bsto.code,
                labelText: <div className={classes.textNowrap}>
                    <Typography variant="body2" className={classes.labelTextRoot} noWrap>
                    {data.stos.code}
                    </Typography>
                    {/* {warehouse}
                    {area} */}
                </div>,
                treeItems: treeItems
            }];
           
            return <div><AmTreeView dataTreeItems={dataTreeItems} defaultExpanded={["root"]} /></div>;
        } else {
            return <div><h4>ไม่พบข้อมูลสินค้า</h4></div>;
        }
    });
    //Alert Dialog
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
    function AlertDialog(open, setting, onAccept) {
        if (open && setting) {
            return <AmDialogs typePopup={setting.type} content={setting.message}
                onAccept={(e) => onAccept(e)} open={open}></AmDialogs>
        } else {
            return null;
        }
    }

    const DialogAlert = useMemo(() => AlertDialog(openAlert, settingAlert, onAccept), [openAlert, settingAlert])

    return (
        <>
            {DialogAlert}
            <Paper className={classes.paperContainer}>
                <Stepper
                    activeStep={activeStep}
                    orientation="vertical"
                    className={classes.stepperContainer}
                >
                    {steps.map((row, index) => (
                        <Step key={row.label}>
                            <StepLabel>
                                <Typography variant="h6">{t(row.label)}{row.value ? " : " : ""}
                                    <label style={{ fontWeight: 'bolder', textDecorationLine: 'underline', textDecorationColor: indigo[700] }}>{row.value}</label>
                                </Typography>
                            </StepLabel>
                            <StepContent>
                                {getStepContent(index)}
                                <div className={classes.actionsContainer}>
                                    <AmButton
                                        disabled={activeStep === 0}
                                        styleType="dark_clear"
                                        onClick={() => handleBack(index)}
                                        className={classes.button}
                                    >
                                        {t('Back')}
                                    </AmButton>
                                    <AmButton
                                        styleType="confirm"
                                        onClick={() => handleNext(index)}
                                        className={classes.button}
                                    >
                                        {activeStep === 0 ? t('Next') : t("Putaway")}
                                    </AmButton>
                                </div>
                            </StepContent>
                        </Step>
                    ))}
                </Stepper>
                {activeStep === steps.length && (
                    <Paper square elevation={0} className={classes.resetContainer}>
                        <Typography variant="h6" style={{ textDecoration: 'underline', fontWeight: 'bold' }}>Detail of Pallet</Typography>
                        <RenderTreeViewData data={datasto} />
                        <div style={{ textAlign: "end", marginTop: '2px' }}>
                            <AmButton styleType="dark_clear" onClick={handleReset} >
                                {t("Reset")}
                            </AmButton>
                        </div>
                    </Paper>
                )}
            </Paper>
        </>
    )

}

HandheldReceive.propTypes = {

}
export default withStyles(styles)(HandheldReceive);