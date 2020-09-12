import React, { useState, useEffect, useRef, useMemo } from "react";
import {
    apicall,
    createQueryString,
    Clone,
    IsEmptyObject
} from "../../../../components/function/CoreFunction";
import { useTranslation } from "react-i18next";
import AmDialogs from "../../../../components/AmDialogs";
import AmButton from "../../../../components/AmButton";
import AmInput from "../../../../components/AmInput";
import { fade, makeStyles, withStyles } from "@material-ui/core";
import moment from "moment";
import Paper from "@material-ui/core/Paper";
import Stepper from "@material-ui/core/Stepper";
import Step from "@material-ui/core/Step";
import StepLabel from "@material-ui/core/StepLabel";
import StepContent from "@material-ui/core/StepContent";
import Typography from "@material-ui/core/Typography";
import _ from "lodash";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import styled from "styled-components";
import PropTypes from "prop-types";
import SvgIcon from '@material-ui/core/SvgIcon';
import queryString from "query-string";
import Grid from "@material-ui/core/Grid";
import {
    indigo,
    deepPurple,
    lightBlue,
    red,
    grey,
    green
} from "@material-ui/core/colors";
import TreeView from "@material-ui/lab/TreeView";
import TreeItem from '@material-ui/lab/TreeItem';
import Collapse from '@material-ui/core/Collapse';
import { useSpring, animated } from 'react-spring/web.cjs';
import { PlusSquare, MinusSquare } from "../../../../constant/IconTreeview";
import EditIcon from '@material-ui/icons/Edit';
import ShoppingCartIcon from '@material-ui/icons/ShoppingCart';
import AmTreeView from '../../../pageComponent/AmTreeView'
import AmDialogConfirm from '../../../../components/AmDialogConfirm'
import AmAuditStatus from '../../../../components/AmAuditStatus'
import { AuditStatus } from '../../../../components/Models/StorageObjectEvenstatus';
import AmScanQRbyCamera from '../../../../components/AmScanQRbyCamera';
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
        textAlign: "center"
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
    labelHead: {
        fontWeight: "inherit",
        fontWeight: 'bold',
    },
    labelHead2: {
        fontWeight: "inherit",
    },
    labelText: {
        fontWeight: "inherit",
        flexGrow: 1
    },
    statusLabel: {
        fontSize: 18,
        height: '1.75em',
        width: 'auto',
    }
});
const InputDiv = styled.div`
  
  `;

const FormInline = styled.div`
    display: flex;
    flex-flow: row wrap;
    align-items: center;
    label {
      margin: 5px 0 5px 0;
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
    width: 40px;
    paddingleft: 20px;
  `;
const LabelH2 = styled.label`
    font-weight: bold;
    width: 70px;
    paddingleft: 20px;
  `;
const LabelH1 = styled.label`
    font-weight: bold;
    width: 100px;
    paddingleft: 20px;
  `;
const LabelHText = styled.label`
    width: 60px;
  `;
const DivHidden = styled.div`
    overflow: hidden;
    height: 0;
  `;
const LabelHDD = styled.label`
    font-weight: bold;
    width: 120px;
    paddingleft: 20px;
  `;

const GetPickedDetail = (props) => {

    const { t } = useTranslation();
    const { classes } = props;
    const [valueInput, setValueInput] = useState({});
    const [activeStep, setActiveStep] = useState(0);

    const [dataStoPick, setDataStoPick] = useState(null);


    const [openAlert, setOpenAlert] = useState(false);
    const [settingAlert, setSettingAlert] = useState(null);
    const [openConfirm, setOpenConfirm] = useState(false);
    const [settingConfirm, setSettingConfirm] = useState(null);

    //steps
    const steps = getSteps();

    const handleNext = (index) => {
        if (index === 0) {
            if (valueInput.qr) {
                GetStoPicked(valueInput.qr);
            } else {
                alertDialogRenderer("warning", "กรุณากรอกหมายเลขพาเลท")
            }
        }
    };

    const handleBack = (index) => {
        if (index === 1) {
            setValueInput({ ...valueInput, ['qr']: null })
        }
        setActiveStep((prevActiveStep) => prevActiveStep - 1);
    };

    const handleReset = () => {
        setValueInput({});
        setActiveStep(0);
        ClearInput('qr')
    };
    const ClearInput = (field) => {
        let ele2 = document.getElementById(field);
        if (ele2)
            ele2.value = "";
        valueInput[field] = null;
        ele2.focus();
    }
    function getSteps() {

        var qr = "";
        if (valueInput) {
            if (valueInput.qr) { qr = valueInput.qr; }
        }
        return [
            { label: "Scan QR Code", value: qr },
            { label: 'Detail of Pack', value: null },
        ];
    };
    function getStepContent(step) {
        switch (step) {
            case 0:
                return <div style={{ flexGrow: 1 }}>
                    <div style={{ display: "flex" }}>
                        <AmInput
                            id={"qr"}
                            type="input"
                            placeholder="Scan QR Code"
                            autoFocus={true}
                            style={{ width: "100%" }}
                            onChange={(value, obj, element, event) => onHandleChangeInput(value, "qr")}
                            onKeyPress={(value, obj, element, event) => {
                                if (event.key === "Enter") {
                                    onHandleChangeInput(value, "qr");
                                    handleNext(0);
                                }
                            }
                            }
                        />
                        {/* <AmScanQRbyCamera returnResult={(data) => showRes(data)} /> */}
                    </div>
                </div>;
            case 1:
                return <RenderTreeViewData data={dataStoPick} />
            default:
                return 'Unknown step';
        }
    }
    const showRes = (data) => {
        if (data) {
            // console.log(data)
            let ele = document.getElementById("qr");
            if (ele) {
                ele.value = data;
                ele.focus();
            }
        }
    }
    const onHandleChangeInput = (value, field) => {
        valueInput[field] = value;
    };

    const RenderTreeViewData = React.memo(({ data }) => {
        if (data != null && data.pstos != null && data.pstos.length > 0) {
            let dataTreeItems = [];
            {
                data.pstos.map((sto, idx) => {
                    let pstoCode = sto.pstoCode != null ? sto.pstoCode : "";
                    let pstoName = sto.pstoName != null ? sto.pstoName : "";
                    let lot = sto.lot != null && sto.lot.length > 0 ?
                        <Typography variant="body1" className={classes.labelText} noWrap>{"Lot: " + sto.lot}</Typography>
                        : sto.ref1 != null && sto.ref1.length > 0 ?
                            <Typography variant="body1" className={classes.labelText} noWrap>{"Lot Vendor: " + sto.ref1}</Typography>
                            : null;
                    let batch = sto.batch != null && sto.batch.length > 0 ?
                        <Typography variant="body1" className={classes.labelText} noWrap>{"Batch: " + sto.batch}</Typography>
                        : null;
                    let orderNo = sto.orderNo != null && sto.orderNo.length > 0 ?
                        <Typography variant="body1" className={classes.labelText} noWrap>{"Order No. " + sto.orderNo}</Typography>
                        : null;

                    let cartonNo = sto.cartonNo != null && sto.cartonNo.length > 0 ?
                        <Typography variant="body1" className={classes.labelText} noWrap>{"Carton No. " + sto.cartonNo}</Typography>
                        : null;
                    let forCustomerName = sto.forCustomerName != null && sto.forCustomerName.length > 0 ?
                        <Typography variant="body1" className={classes.labelText} noWrap>{"For Customer: " + sto.forCustomerName}</Typography>
                        : null;

                    let productDate = sto.productDate != null ?
                        <Typography variant="body1" className={classes.labelText} noWrap>{"Mfg. Date " + moment(sto.productDate).format("DD-MM-YYYY")}</Typography>
                        : null;
                    let expiryDate = sto.expiryDate != null ?
                        <Typography variant="body1" className={classes.labelText} noWrap>{"Exp. Date " + moment(sto.expiryDate).format("DD-MM-YYYY")}</Typography>
                        : null;
                    let pickQty = sto.qty != null ? sto.qty + " " + sto.unitCode : "";
                    let destination = sto.destination != null && sto.destination.length > 0 ?
                        <Typography variant="body1" className={classes.labelText} noWrap>{"Destination: " + sto.destination}</Typography>
                        : null;
                    let remark = sto.remark != null && sto.remark.length > 0 ?
                        <Typography variant="body1" className={classes.labelText} noWrap>{"Remark: " + sto.remark}</Typography>
                        : null;
                    let auditstatus = null;
                    if (sto.auditStatus != null) {
                        let audit = "Audit Status: ";
                        auditstatus = <Typography variant="body1" className={classes.labelText} noWrap>{audit}<AmAuditStatus className={classes.statusLabel} statusCode={sto.auditStatus} /></Typography>

                    }
                    let treeItem = {
                        nodeId: "sub-" + sto.pstoID.toString(),
                        labelText: <div style={{ flexGrow: 1 }}>
                            {lot}{batch}{orderNo}{cartonNo}
                            {forCustomerName}
                            {productDate}{expiryDate}
                            {destination}{remark}
                            {auditstatus}
                        </div>,
                        labelInfo: pickQty,
                        bgColor: "#e8f0fe",
                        color: "#1a73e8",
                        dataItem: sto,
                        // onIconClick: (dataItem) => onClick(dataItem),
                        // onLabelClick: (dataItem) => onClick(dataItem)
                    };
                    let rootItem = {
                        nodeId: sto.pstoID.toString(),
                        labelText: <div style={{ flexGrow: 1 }}>
                            <div style={{ display: "flex" }}>
                                <Typography variant="body1" className={classes.labelHead} noWrap>{pstoCode}</Typography>
                                <Typography variant="body1" className={classes.labelHead2} noWrap>&nbsp;{"- " + pstoName}</Typography>
                            </div></div>,
                        treeItems: [treeItem]
                    }
                    dataTreeItems.push(rootItem);
                })
            }
            return (<div><AmTreeView dataTreeItems={dataTreeItems} defaultExpanded={[dataTreeItems[0].nodeId]} /></div>);
        } else {
            return <div><h4>ไม่พบข้อมูลสินค้า</h4></div>;
        }
    });
    const GetStoPicked = (qr) => {
        Axios.get(window.apipath + '/v2/get_picked_detail?' +
            '&qr=' + (qr === undefined || qr === null ? ''
                : encodeURIComponent(qr.trim()))).then(res => {
                    if (res.data._result.status === 1) {
                        if (res.data.pstos != null && res.data.pstos.length > 0) {
                            setActiveStep((prevActiveStep) => prevActiveStep + 1);
                            setDataStoPick(res.data)
                        } else {
                            setDataStoPick(null)
                            handleReset();
                            alertDialogRenderer("error", "ไม่พบข้อมูลสินค้า")
                        }
                    } else {
                        handleReset();
                        alertDialogRenderer("error", res.data._result.message)
                    }
                });
    }
    // Alert Dialog
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
        <div>
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
                                    <div>
                                        {activeStep === 1 ?
                                            <AmButton styleType="dark_clear"
                                                disabled={activeStep === 0}
                                                onClick={() => handleBack(index)}
                                                className={classes.button}
                                            >
                                                {t("Back")}
                                            </AmButton> : null
                                        }
                                        {activeStep === 0 ?
                                            <AmButton
                                                styleType="confirm"
                                                onClick={() => handleNext(index)}
                                                className={classes.button}
                                            >
                                                {t('Next')}
                                            </AmButton> : null
                                        }

                                    </div>
                                </div>
                            </StepContent>
                        </Step>
                    ))}
                </Stepper>
            </Paper>
        </div>
    );
}
GetPickedDetail.propTypes = {

}
export default withStyles(styles)(GetPickedDetail);