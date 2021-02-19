import React, { useState, useEffect, useRef, useMemo } from "react";
import {
    apicall,
    createQueryString,
    Clone,
    IsEmptyObject
} from "../../components/function/CoreFunction";
import { useTranslation } from "react-i18next";
import AmDialogs from "../../components/AmDialogs";
import AmButton from "../../components/AmButton";
import AmInput from "../../components/AmInput";
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
import InboxIcon from '@material-ui/icons/Inbox';
import queryString from "query-string";
import Grid from "@material-ui/core/Grid";
import AmRadioGroup from "../../components/AmRadioGroup";
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
import { PlusSquare, MinusSquare } from "../../constant/IconTreeview";
import EditIcon from '@material-ui/icons/Edit';
import ShoppingCartIcon from '@material-ui/icons/ShoppingCart';
import AmEditorTable from "../../components/table/AmEditorTable";
import { AuditStatus } from '../../components/Models/StorageObjectEvenstatus';
import AmTreeView from './AmTreeView'
import AmAuditStatus from '../../components/AmAuditStatus'
import AmStorageObjectStatus from '../../components/AmStorageObjectStatus'

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
        fontSize: 12,
        // height: '1.75em',
        padding: 3,
        width: 'auto',
    },
    labelTextRoot: {
        fontWeight: "bold",
        fontSize: 16,
        flexGrow: 1
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


function TransitionComponent(props) {
    const style = useSpring({
        from: { opacity: 0, transform: 'translate3d(20px,0,0)' },
        to: { opacity: props.in ? 1 : 0, transform: `translate3d(${props.in ? 0 : 20}px,0,0)` },
    });

    return (
        <animated.div style={style}>
            <Collapse {...props} />
        </animated.div>
    );
}

TransitionComponent.propTypes = {
    /**
     * Show the component; triggers the enter or exit states
     */
    in: PropTypes.bool,
};

const StyledTreeItem = withStyles((theme) => ({
    iconContainer: {
        '& .close': {
            opacity: 0.3,
        },
    },
    group: {
        marginLeft: 7,
        paddingLeft: 18,
        borderLeft: `1px dashed ${fade(theme.palette.text.primary, 0.4)}`,
    },
}))((props) => <TreeItem {...props} TransitionComponent={TransitionComponent} />);

const useStyles = makeStyles({
    root: {
        height: 264,
        flexGrow: 1,
        maxWidth: 400,
    },
});

const AmPalletInformation = (props) => {
    const { t } = useTranslation();
    const { classes } = props;
    const [valueInput, setValueInput] = useState({});
    const [activeStep, setActiveStep] = useState(0);

    const [dataSto, setDataSto] = useState(null);

    const [openAlert, setOpenAlert] = useState(false);
    const [settingAlert, setSettingAlert] = useState(null);

    //steps
    const steps = getSteps();


    const handleNext = (index) => {
        if (index === 0) {
            if (valueInput.bstoCode) {
                GetStoAuditing(valueInput.bstoCode);
            } else {
                alertDialogRenderer("warning", "กรุณากรอกหมายเลขพาเลท")
            }
        }
    };

    const handleBack = (index) => {
        if (index === 1) {
            setValueInput({ ...valueInput, ['bstoCode']: null })
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
            { label: 'Information of Pallet', value: null },
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
                return <RenderTreeViewData data={dataSto} />
            default:
                return 'Unknown step';
        }
    }
    const onHandleChangeInput = (value, field) => {
        valueInput[field] = value;
    };

    const RenderTreeViewData = React.memo(({ data }) => {
        console.log(data)
        if (data != null && data.bsto != null && data.bsto.mapstos != null && data.bsto.mapstos.length > 0) {
            //    let bstoCode 
            let treeItems = [];
            {
                data.bsto.mapstos.map((sto, idx) => {
                    let pstoCode = sto.code != null ? sto.code : "";
                    let pstoName = sto.name != null ? sto.name : "";
                    let lot = sto.lot != null && sto.lot.length > 0 ?
                        <Typography variant="body2" className={classes.labelText} noWrap>{"Lot: " + sto.lot}</Typography>
                        : null;
                    let batch = sto.batch != null && sto.batch.length > 0 ?
                        <Typography variant="body2" className={classes.labelText} noWrap>{"Batch: " + sto.batch}</Typography>
                        : null;
                    let orderNo = sto.orderNo != null && sto.orderNo.length > 0 ?
                        <Typography variant="body2" className={classes.labelText} noWrap>{"Control No. " + sto.orderNo}</Typography>
                        : null;
                    let cartonNo = sto.cartonNo != null && sto.cartonNo.length > 0 ?
                        <Typography variant="body2" className={classes.labelText} noWrap>{"Carton No. " + sto.cartonNo}</Typography>
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
            let areaLoc = data.areaLocCode != null ? " - " + data.areaLocCode : "";
            let area = data.areaName != null ?
                <Typography variant="body2" className={classes.labelText} noWrap>{"Area: " + data.areaName + areaLoc}</Typography>
                : null;
            let dataTreeItems = [{
                nodeId: 'root',
                // labelText: data.bsto.code,
                labelText: <div className={classes.textNowrap}>
                    <Typography variant="body2" className={classes.labelTextRoot} noWrap>
                        {data.bsto.code}
                    </Typography>
                    {area}
                </div>,
                treeItems: treeItems
            }];

            return (<div><AmTreeView dataTreeItems={dataTreeItems} defaultExpanded={["root"]} /></div>);
        } else {
            return <div><h4>ไม่พบข้อมูลสินค้า</h4></div>;
        }
    });
    const GetStoAuditing = (bstoCode) => {
        Axios.get(window.apipath + '/v2/GetInfoBaseSTOAPI?' + //get_sto_audit
            '&bstoCode=' + (bstoCode === undefined || bstoCode === null ? ''
                : encodeURIComponent(bstoCode.trim()))).then(res => {
                    if (res.data._result.status === 1) {
                        if (res.data != null) {
                            setActiveStep((prevActiveStep) => prevActiveStep + 1);
                            setDataSto(res.data)
                        } else {
                            setDataSto(null)
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
    )
}
AmPalletInformation.propTypes = {

}
export default withStyles(styles)(AmPalletInformation);