import React, { useState, useEffect, useRef } from "react";
import {
    apicall,
    createQueryString,
    Clone,
    IsEmptyObject
} from "../../../components/function/CoreFunction";
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

const AmMappingReceive = (props) => {
    const { t } = useTranslation();
    const { classes } = props;
    const [valueInput, setValueInput] = useState({});
    const [activeStep, setActiveStep] = useState(0);


    const [openAlert, setOpenAlert] = useState(false);
    const [settingAlert, setSettingAlert] = useState(null);
    const [openConfirm, setOpenConfirm] = useState(false);
    const [settingConfirm, setSettingConfirm] = useState(null);
    //steps
    const steps = getSteps();
    function getSteps() {

        // var bstoCode = "";
        // if (valueInput) {
        //     if (valueInput.bstoCode) { bstoCode = valueInput.bstoCode; }
        // }
        return [
            { label: "Select Gate", value: null },
            { label: 'Scan Mapping Product', value: null },
        ];
    };
    const handleNext = (index) => {
        if (index === 0) {
            if (valueInput.gateCode) {
                //GetStoPicking(valueInput.gateCode);
            } else {
                alertDialogRenderer("warning", "กรุณาเลือก Gate รับเข้า")
            }
        }
    };

    const handleBack = (index) => {
        if (index === 1) {
            //setValueInput({ ...valueInput, ['bstoCode']: null })
            // ClearInput('bstoCode');
        }
        setActiveStep((prevActiveStep) => prevActiveStep - 1);
    };

    const onConfirm = (data) => {
        if (data) {
            setOpenConfirm(false)
            setSettingConfirm(null)
            // onClickPick(data)
        }
    }
    const DialogAlert = useMemo(() => AlertDialog(openAlert, settingAlert, onAccept), [openAlert, settingAlert])
    const DialogConfirm = useMemo(() => ConfirmDialog(openConfirm, settingConfirm, onConfirm, onClose), [openConfirm, settingConfirm])

    return (
        <>
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
                                            <AmButton styleType="add"
                                                disabled={activeStep === 0}
                                                //onClick={() => handleBack(index)}
                                                className={classes.button}
                                            >
                                                {t("Receive")}
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

        </>

    )
}

AmMappingReceive.propTypes = {

}
export default withStyles(styles)(AmMappingReceive);