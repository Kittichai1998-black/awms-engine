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
import AmDropdown from "../../../../components/AmDropdown";
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
import SearchIcon from "@material-ui/icons/Search";
import IconButton from "@material-ui/core/IconButton";
import AddCircleIcon from '@material-ui/icons/AddCircle';
import RemoveCircleIcon from '@material-ui/icons/RemoveCircle';

const Axios = new apicall();


const DialogSelectGate =withStyles(theme => ({


}))(props=>{


    return  (<>
    
    </>);
});

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
    addCircleIcon: {
        color: green[800]
    },
    removeCircleIcon: {
        color: red[700]
    }
});

function GetAllGateinWHQuery() {
    return {
        queryString: window.apipath + "/v2/SelectDataViwAPI/",
        t: "AreaLocationMaster",
        q: '[{ "f": "Status", "c":"=", "v": 1},{ "f": "AreaMasterType_ID", "c":"=", "v": 20}]',
        f: "*",
        g: "",
        s: "[{'f':'ID','od':'asc'}]",
        sk: 0,
        l: 100,
        all: "",
    }
}

const MappingReceive_HH = (props) => {
    const { t } = useTranslation();
    const { classes } = props;
    const [activeStep, setActiveStep] = useState(0);
    const [valueInput, setValueInput] = useState({});

    const [datas, setDatas] = useState(null);

    const [openAlert, setOpenAlert] = useState(false);
    const [settingAlert, setSettingAlert] = useState(null);

    const [openDialog, setOpenDialog] = useState(false);
    const [selectGateDialog, setSelectGateDialog] = useState(null);


    const [inputList, setInputList] = useState([{ barcode: "" }]);


    //steps
    const steps = getSteps();
    function getSteps() {

        var locationCode = "";
        if (valueInput) {
            if (valueInput.locationCode) { locationCode = valueInput.locationCode; }
        }
        return [
            { label: t("Select Gate"), value: locationCode },
            { label: t('Scan Barcode Product'), value: null },
            { label: t('Confirm Receive Pallet'), value: null },
        ];
    };
    // handle input change
    const handleInputChange = (e, index) => {
        const { name, value } = e.target;
        const list = [...inputList];
        list[index][name] = value;
        setInputList(list);
    };

    // handle click event of the Remove button
    const handleRemoveClick = index => {
        const list = [...inputList];
        list.splice(index, 1);

        setInputList(list);

        let ele = document.getElementById("barcode" + index.toString());
        if (ele)
            ele.value = "";

    };

    // handle click event of the Add button
    const handleAddClick = () => {
        setInputList([...inputList, { barcode: "" }]);
    };
    function getStepContent(step) {
        switch (step) {
            case 0:
                return <div style={{ display: "flex" }}>
                    <AmInput
                        id={"locationCode"}
                        type="input"
                        placeholder="Gate Code"
                        autoFocus={true}
                        style={{ width: "100%" }}
                        onChange={(value, obj, element, event) => onHandleChangeInput(value, "locationCode")}
                        onKeyPress={(value, obj, element, event) => {
                            if (event.key === "Enter") {
                                onHandleChangeInput(value, "locationCode");
                                handleNext(0);
                            }
                        }
                        }
                    />
                    <IconButton
                        size="small"
                        aria-label="info"
                        style={{ marginTop: "5px" }}
                    >
                        <SearchIcon
                            fontSize="small"
                        // onClick={() => { FindGate() }}
                        />
                    </IconButton>
                </div>;
            case 1:
                return <RenderAddBarCode data={inputList} />
            case 2:
                return <><p>ffff</p></>;
            default:
                return 'Unknown step';
        }

    }

    const RenderAddBarCode = React.memo(({ data }) => {
        return <div>
            {data.map((x, i) => {
                return (

                    <div style={{ display: "flex" }}>
                        <AmInput
                            id={"barcode" + i.toString()}
                            name={"barcode"}
                            type="input"
                            placeholder="Enter Barcode"
                            defaultValue={x.barcode}
                            style={{ width: "100%" }}
                            onChange={(value, obj, element, event) => handleInputChange(event, i)}
                        />

                        {data.length !== 1 &&
                            <IconButton size="small" >
                                <RemoveCircleIcon
                                    className={classes.removeCircleIcon}
                                    fontSize="small"
                                    onClick={() => { handleRemoveClick(i) }}
                                />
                            </IconButton>
                        }
                        {data.length - 1 === i &&
                            <IconButton size="small" >
                                <AddCircleIcon
                                    fontSize="small"
                                    className={classes.addCircleIcon}
                                    onClick={handleAddClick}
                                />
                            </IconButton>
                        }
                    </div>
                )
            })}
            {/* <div style={{ marginTop: 20 }}>{JSON.stringify(data)}</div> */}
        </div>

    });
    const handleNext = (index) => {
        console.log(valueInput)
        if (index === 0) {
            if (valueInput.locationCode) {
                setActiveStep((prevActiveStep) => prevActiveStep + 1);
            } else {
                alertDialogRenderer("warning", t("Please Select Gate."))
            }
        }
        if (index === 1) {
            if(inputList.length > 0){
                // const listBarcode = inputList.find(obj => { return obj.barcode !== ""}).barcode;
                var listBarcode = []
                inputList.map((x,i)=>{
                    if((x.barcode !== undefined || x.barcode !== null) && x.barcode.length > 0){
                        listBarcode.push(x.barcode);
                    }
                });
                 
                console.log(listBarcode)
                if(listBarcode.length > 0){
                    CheckBarcodeMappingDocument(listBarcode);
                }else{
                alertDialogRenderer("warning", t("Please Scan Barcode Product."))
                }
            }
        }
        if (index === 2) {
            ConfirmReceive();
        }
    }

    const handleBack = (index) => {
        if (index === 1) {
            setValueInput({ ...valueInput, locationCode: null })
            setInputList([{ barcode: "" }]);

        }
        setActiveStep((prevActiveStep) => prevActiveStep - 1);

    }

    const handleReset = () => {
        setValueInput({});
        setActiveStep(0);
        setDatas(null);
        setInputList([{ barcode: "" }]);

        // ClearInput('bstoCode')
    };

    const onHandleChangeInput = (value, field) => {
        valueInput[field] = value;
    };


    const CheckBarcodeMappingDocument = (listBarcode) => {
        console.log(listBarcode)
        setActiveStep((prevActiveStep) => prevActiveStep + 1);

        // return <></>
    }
    const ConfirmReceive = () => {
        setActiveStep((prevActiveStep) => prevActiveStep + 1);

        // return <></>
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
    const onConfirmSelect = (data) => {
        if (data) {
            setOpenDialog(false)
            setSelectGateDialog(null)
            //onClickPick(data)
        }
    }
    const onClose = (data) => {
        setOpenDialog(data)
        if (data === false) {
            setSelectGateDialog(null)
        }
    }
    function FindGateDialog(open, data, onConfirmSelect, onClose) {
        if (open && data) {
        } else {
            return null;
        }
    }
    const DialogAlert = useMemo(() => AlertDialog(openAlert, settingAlert, onAccept), [openAlert, settingAlert])
    const DialogFindGate = useMemo(() => FindGateDialog(openDialog, selectGateDialog, onConfirmSelect, onClose), [openDialog, selectGateDialog])



    return (
        <>
            {/* {DialogFindGate} */}
            {DialogAlert}
            <Paper className={classes.paperContainer}>
                <Stepper
                    activeStep={activeStep}
                    orientation="vertical"
                    className={classes.stepperContainer}>

                    {steps.map((row, index) => (
                        <Step key={row.label}>
                            <StepLabel>
                                <Typography variant="h6">{t(row.label)}
                                    {row.value ? <label style={{ fontWeight: 'bolder', textDecorationLine: 'underline', textDecorationColor: indigo[700] }}>{row.value}</label> : null}
                                </Typography>
                            </StepLabel>
                            <StepContent>
                                {getStepContent(index)}
                                <div className={classes.actionsContainer}>
                                    <div>
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
                                            {activeStep === 0 ? 'Next' : activeStep === 1 ? t('Check') : t('Confirm')}
                                        </AmButton>
                                    </div>
                                </div>
                            </StepContent>
                        </Step>
                    ))}
                </Stepper>
                {activeStep === steps.length && (
                    <Paper square elevation={0} className={classes.resetContainer}>
                        <Typography>All steps completed - you&apos;re finished</Typography>
                        <AmButton styleType="dark_clear" onClick={handleReset} className={classes.button}>
                            {t('Reset')}
                        </AmButton>
                    </Paper>
                )}
            </Paper>
        </>
    );
}



MappingReceive_HH.propTypes = {

}
export default withStyles(styles)(MappingReceive_HH);