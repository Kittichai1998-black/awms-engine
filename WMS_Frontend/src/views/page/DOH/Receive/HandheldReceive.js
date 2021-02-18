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
import CommentIcon from '@material-ui/icons/Comment';

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

const CheckboxList = withStyles(theme => ({
    root: {
        width: '100%',
        maxWidth: 360,
        backgroundColor: theme.palette.background.paper,
    },
}))(props => {
    const { classes, dataList, ...other } = props;
    const [checked, setChecked] = useState([0]);
    const handleToggle = (value, idx) => () => {
        const currentIndex = checked.indexOf(idx);
        const newChecked = [...checked];

        if (currentIndex === -1) {
            newChecked.push(idx);
        } else {
            newChecked.splice(currentIndex, 1);
        }

        setChecked(newChecked);
    };
    return (
        <List className={classes.root}>
            {
                dataList.map((value, idx) => {
                    const labelId = `checkbox-list-label-${value.ID}`;
                    return (
                        <ListItem key={idx} role={undefined} dense button onClick={handleToggle(value, idx)}>
                            <ListItemIcon>
                                <Checkbox
                                    edge="start"
                                    checked={checked.indexOf(idx) !== -1}
                                    tabIndex={-1}
                                    disableRipple
                                    inputProps={{ 'aria-labelledby': labelId }}
                                />
                            </ListItemIcon>
                            <ListItemText id={labelId} primary={`Line item ${idx + 1}`} />
                            <ListItemSecondaryAction>
                                <IconButton edge="end" aria-label="comments">
                                    <CommentIcon />
                                </IconButton>
                            </ListItemSecondaryAction>
                        </ListItem>
                    )
                })
            }
        </List>
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
                return <CheckboxList data={datas} onClick={(sel) => onEditQty(sel)} />
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
        // if (index === 1) {
        //     ConfirmRemoveWorkQueue(valueInput.bstoCode);
        // }
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
            queryString: window.apipath + "/v2/SelectDataTrxAPI/",
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
    // const RenderTreeViewData = React.memo(({ data, onClick }) => {

    // });
    const onEditQty = (sel) => {
        var req = { ...sel };
        console.log(req);
    }
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
                {/* {activeStep === steps.length && (
                    <Paper square elevation={0} className={classes.resetContainer}>
                        <Typography variant="h6" style={{ textDecoration: 'underline', fontWeight: 'bold' }}>Detail of Pallet</Typography>
                        <RenderTreeViewData data={dataWQ} />
                        <div style={{ textAlign: "end", marginTop: '2px' }}>
                            <AmButton styleType="dark_clear" onClick={handleReset} >
                                {t("Reset")}
                            </AmButton>
                        </div>
                    </Paper>
                )} */}
            </Paper>
        </>
    )

}

HandheldReceive.propTypes = {

}
export default withStyles(styles)(HandheldReceive);