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
import { AuditStatus } from '../../../../components/Models/StorageObjectEvenstatus';
import AmAuditStatus from '../../../../components/AmAuditStatus'
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
        // fontWeight: "inherit",
        // fontSize: 12,
        flexGrow: 1
    },
    statusLabel: {
        fontSize: 16,
        // height: '1.75em',
        padding: 3,
        width: 'auto',
    },
    textNowrap: { flexGrow: 1, overflow: 'hidden', textOverflow: 'ellipsis', display: 'block', whiteSpace: 'nowrap' },
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
function Pallet(props) {
    return (
        <SvgIcon {...props} id="bold" enableBackground="new 0 0 24 24" height="512" viewBox="0 0 24 24" width="512" xmlns="http://www.w3.org/2000/svg">
            {/* tslint:disable-next-line: max-line-length */}
            <path d="m23.25 24h-4c-.414 0-.75-.336-.75-.75v-1.25h-3v1.25c0 .414-.336.75-.75.75h-5.5c-.414 0-.75-.336-.75-.75v-1.25h-3v1.25c0 .414-.336.75-.75.75h-4c-.414 0-.75-.336-.75-.75v-3.25h24v3.25c0 .414-.336.75-.75.75z" /><path d="m16 0h-3v2c0 .552-.448 1-1 1s-1-.448-1-1v-2h-3c-.552 0-1 .448-1 1v6c0 .552.448 1 1 1h8c.552 0 1-.448 1-1v-6c0-.552-.448-1-1-1z" /><path d="m10 10h-3v2c0 .552-.448 1-1 1s-1-.448-1-1v-2h-3c-.552 0-1 .448-1 1v6c0 .552.448 1 1 1h8c.552 0 1-.448 1-1v-6c0-.552-.448-1-1-1z" /><path d="m22 10h-3v2c0 .552-.448 1-1 1s-1-.448-1-1v-2h-3c-.552 0-1 .448-1 1v6c0 .552.448 1 1 1h8c.552 0 1-.448 1-1v-6c0-.552-.448-1-1-1z" />
        </SvgIcon>
    );
}

const PickingChecker = (props) => {
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
            if (valueInput.bstoCode) {
                GetStoPicking(valueInput.bstoCode);
            } else {
                alertDialogRenderer("warning", "กรุณากรอกหมายเลขพาเลท")
            }
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
        ClearInput('bstoCode')
    };
    const ClearInput = (field) => {
        let ele2 = document.getElementById(field);
        if (ele2)
            ele2.value = "";
        valueInput[field] = null;
        ele2.focus();
    }

    function getSteps() {

        var bstoCode = "";
        if (valueInput) {
            if (valueInput.bstoCode) { bstoCode = valueInput.bstoCode; }
        }
        return [
            { label: "Scan Pallet Code", value: bstoCode },
            { label: 'Select Picking', value: null },
        ];
    };
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
                return <RenderTreeViewData data={dataStoPick} onClick={(sel) => ConfirmPickDialogRenderer(sel)} />
            default:
                return 'Unknown step';
        }
    }
    const onHandleChangeInput = (value, field) => {
        valueInput[field] = value;
    };

    const RenderTreeViewData = React.memo(({ data, onClick }) => {
        if (data != null && data.stoItems != null && data.stoItems.length > 0) {
            let treeItems = [];
            {
                data.stoItems.map((sto, idx) => {
                    let pstoCode = sto.pstoCode != null ? sto.pstoCode : "";
                    let pstoName = sto.pstoName != null ? sto.pstoName : "";
                    let lot = sto.lot != null && sto.lot.length > 0 ?
                        <Typography variant="body2" className={classes.labelText} noWrap>{"Lot:" + sto.lot}</Typography>
                        : sto.ref1 != null && sto.ref1.length > 0 ?
                            <Typography variant="body2" className={classes.labelText} noWrap>{"Lot Vendor:" + sto.ref1}</Typography>
                            : null;
                    let batch = sto.batch != null && sto.batch.length > 0 ?
                        <Typography variant="body2" className={classes.labelText} noWrap>{"Batch:" + sto.batch}</Typography>
                        : null;
                    let orderNo = sto.orderNo != null && sto.orderNo.length > 0 ?
                        <Typography variant="body2" className={classes.labelText} noWrap>{"Order No." + sto.orderNo}</Typography>
                        : null;
                    let cartonNo = sto.cartonNo != null && sto.cartonNo.length > 0 ?
                        <Typography variant="body2" className={classes.labelText} noWrap>{"Carton No." + sto.cartonNo}</Typography>
                        : null;

                    let pk_docCode = sto.pk_docCode != null ?
                        <Typography variant="body2" className={classes.labelText} noWrap>{"Document Code: " + sto.pk_docCode}</Typography>
                        : null;
                    let processTypeName = sto.processTypeName != null ?
                        <Typography variant="body2" className={classes.labelText} noWrap>{"Process No." + sto.processTypeName}</Typography>
                        : null;
                    let pickQty = sto.pickQty != null ?
                        <Typography variant="body2" className={classes.labelText} noWrap>{"Quantity: " + sto.pickQty + " " + sto.unitCode}</Typography>
                        : null;
                    let destination = sto.destination != null ?
                        <Typography variant="body2" className={classes.labelText} noWrap>{"Des:" + sto.destination}</Typography>
                        : null;
                    let remark = sto.remark != null ?
                        <Typography variant="body2" className={classes.labelText} noWrap>{"Remark:" + sto.remark}</Typography>
                        : null;
                    // if (sto.auditStatus) {
                    //     let audit = " | AD:" + AuditStatus.find(x => x.value === sto.auditStatus).label;
                    //     auditstatus = <Typography variant="body2" className={classes.labelText} noWrap>{audit}</Typography>

                    // }
                    let auditstatus = null;
                    if (sto.auditStatus != null) {
                        let audit = "Audit Status: ";
                        auditstatus = <Typography variant="body2" className={classes.labelText} noWrap>{audit}
                            <AmAuditStatus className={classes.statusLabel} statusCode={sto.auditStatus} />
                        </Typography>

                    }
                    let treeItem = {
                        nodeId: sto.distoID.toString(),
                        labelText:
                            <div className={classes.textNowrap}>
                                <Typography variant="body2" className={classes.labelText} noWrap>
                                    <span className={classes.labelHead}>{pstoCode}</span>
                                    &nbsp;{"- " + pstoName}
                                </Typography>
                                {pickQty}
                                {lot}{batch}{orderNo}{cartonNo}{pk_docCode}{processTypeName}{destination}{remark}{auditstatus}
                            </div>,
                        labelIcon: ShoppingCartIcon,
                        // labelInfo: pickQty,
                        bgColor: "#e8f0fe",
                        color: "#1a73e8",
                        dataItem: sto,
                        onIconClick: (dataItem) => onClick(dataItem),
                        onLabelClick: (dataItem) => onClick(dataItem)
                    };

                    treeItems.push(treeItem);
                })
            }
            let dataTreeItems = [{
                nodeId: 'root',
                labelText: data.bstoCode,
                // labelIcon: Pallet,
                treeItems: treeItems
            }];
            return (<div><AmTreeView dataTreeItems={dataTreeItems} defaultExpanded={["root"]} /></div>);
        } else {
            return <div><h4>ไม่พบข้อมูลสินค้าที่ต้องการเบิก</h4></div>;
        }
    });
    const GetStoPicking = (bstoCode) => {
        Axios.get(window.apipath + '/v2/get_sto_picking?' +
            '&bstoCode=' + (bstoCode === undefined || bstoCode === null ? ''
                : encodeURIComponent(bstoCode.trim()))).then(res => {
                    if (res.data._result.status === 1) {
                        if (res.data.stoItems != null && res.data.stoItems.length > 0) {
                            setActiveStep((prevActiveStep) => prevActiveStep + 1);
                            setDataStoPick(res.data)
                        } else {
                            setDataStoPick(null)
                            handleReset();
                            alertDialogRenderer("error", "ไม่พบรายการสินค้าที่เบิกได้")
                        }
                    } else {
                        handleReset();
                        alertDialogRenderer("error", res.data._result.message)
                    }
                });
    }

    const onClickPick = (sel) => {
        var req = { ...sel };
        Axios.post(window.apipath + '/v2/picking_checker', req).then(res => {
            if (res.data._result.status === 1) {
                if (res.data.stoItems != null && res.data.stoItems.length > 0) {
                    setDataStoPick(res.data)
                    alertDialogRenderer("success", "เบิกสินค้าเรียบร้อย")
                } else {
                    if (res.data.docIDs != null && res.data.docIDs.length > 0) {
                        alertDialogRenderer("success", "เบิกสินค้าเรียบร้อย")
                        handleBack(1);
                    }
                }
            } else {
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
    const onClose = (data) => {
        setOpenConfirm(data)
        if (data === false) {
            setSettingConfirm(null)
        }
    }
    function ConfirmPickDialog(open, data, onConfirm, onClose) {
        if (open && data) {
            let pickQty = data.pickQty != null ? data.pickQty + " " + data.unitCode : "";

            let eleInfo = <div style={{ flexGrow: 1 }}>
                <div style={{ display: "flex" }}>
                    <Typography variant="body2" className={classes.labelHead} noWrap>{data.pstoCode}</Typography>
                    <Typography variant="body2" className={classes.labelHead2} noWrap>&nbsp;{"- " + data.pstoName}</Typography>
                </div>
                <Typography variant="body2" className={classes.labelHead2} noWrap>{"Quantity: " + pickQty}</Typography>
            </div>
            return <AmDialogConfirm
                titleDialog={"Are you confirm to pick?"}
                open={open}
                close={a => onClose(a)}
                bodyDialog={eleInfo}
                customAcceptBtn={<AmButton styleType="confirm_clear" onClick={() => onConfirm(data)}>{t("Confirm")}</AmButton>}
                customCancelBtn={<AmButton styleType="delete_clear" onClick={() => onClose(false)}>{t("Cancel")}</AmButton>}
            />
        } else {
            return null;
        }
    }
    const ConfirmPickDialogRenderer = (dataSel) => {
        setSettingConfirm(dataSel);
        setOpenConfirm(true)
    }
    const onConfirmPick = (data) => {
        if (data) {
            setOpenConfirm(false)
            setSettingConfirm(null)
            onClickPick(data)
        }
    }
    const DialogAlert = useMemo(() => AlertDialog(openAlert, settingAlert, onAccept), [openAlert, settingAlert])
    const DialogConfirm = useMemo(() => ConfirmPickDialog(openConfirm, settingConfirm, onConfirmPick, onClose), [openConfirm, settingConfirm])

    return (
        <div>
            {DialogConfirm}
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
    )
}
PickingChecker.propTypes = {

}
export default withStyles(styles)(PickingChecker);