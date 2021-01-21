import PropTypes from 'prop-types';
import React, { useState, useEffect, useReducer } from "react";
import * as SC from '../../../constant/StringConst'
// import classnames from 'classnames';
import { apicall, createQueryString } from '../../../components/function/CoreFunction';
// import ToListTree from '../../../components/function/ToListTree';
import AmInput from "../../../components/AmInput";
import AmButton from "../../../components/AmButton";
// import styled from 'styled-components'
import { withStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
// import Card from '@material-ui/core/Card';
// import CardHeader from '@material-ui/core/CardHeader';
// import CardContent from '@material-ui/core/CardContent';
// import CardActions from '@material-ui/core/CardActions';
// import Collapse from '@material-ui/core/Collapse';
// import AllInboxIcon from '@material-ui/icons/AllInbox';
// import StorageIcon from '@material-ui/icons/Storage';
// import IconButton from '@material-ui/core/IconButton';
import AmDialogs from '../../../components/AmDialogs'
import { indigo, deepPurple, lightBlue, red, grey, green } from '@material-ui/core/colors';
// import Chip from '@material-ui/core/Chip';
// import Avatar from '@material-ui/core/Avatar';
// import AmToolTip from "../../../components/AmToolTip";
// import Divider from '@material-ui/core/Divider';
// import AddIcon from '@material-ui/icons/AddCircle';
// import SearchIcon from '@material-ui/icons/Search';
// import RemoveCircleIcon from '@material-ui/icons/RemoveCircle';
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import StepContent from '@material-ui/core/StepContent';
import Typography from '@material-ui/core/Typography';
// import List from '@material-ui/core/List';
// import ListItem from '@material-ui/core/ListItem';
// import ListItemText from '@material-ui/core/ListItemText';
// import ListItemAvatar from '@material-ui/core/ListItemAvatar';
// import AmStorageObjectStatus from "../../../components/AmStorageObjectStatus";
import queryString from 'query-string'
import AmListSTORenderer from '../../pageComponent/AmListSTORenderer';
import { useTranslation } from 'react-i18next'
const Axios = new apicall()

const styles = theme => ({
    root: {
        fontFamily: [
            '-apple-system',
            'BlinkMacSystemFont',
            '"Segoe UI"',
            'Roboto',
            '"Helvetica Neue"',
            'Arial',
            'sans-serif',
            '"Apple Color Emoji"',
            '"Segoe UI Emoji"',
            '"Segoe UI Symbol"',
        ].join(','),
    },
    paperContainer: {
        maxWidth: '450px',
        width: '100%',
        minWidth: '300px',
        padding: theme.spacing(2, 1),
    },
    stepperContainer: {
        padding: '10px',
    },
    buttonAuto: {
        margin: theme.spacing(),
        width: 'auto',
        lineHeight: 1
    },
    button: {
        marginTop: theme.spacing(),
        marginRight: theme.spacing(),
    },
    actionsContainer: {
        marginBottom: theme.spacing(2),
        textAlign: 'end'
    },
    resetContainer: {
        textAlign: 'center'
    },
    stepLabel: {
        fontWeight: 'bold',
        fontSize: 'medium'
    },
    avatarHead: {
        // color: '#fff',
        width: '35px',
        height: '35px',
        // marginRight: '0px',
        backgroundColor: '#fff',
    },
    avatarHeadStatus: {
        width: '30px',
        height: '30px',
        fontSize: '1.125em'
    },
    cardHeader: {
        padding: "5px 0px 5px 5px",
    },
    cardTitle: {
        fontWeight: 'bolder',
        fontSize: '1em'
    },
    cardAvatar: {
        marginRight: '10px',
    },
    avatar2: {
        width: '30px',
        height: '30px',
        // color: '#fff',
        backgroundColor: '#fff',
    },
    avatarStatus: {
        width: '25px',
        height: '25px',
    },
    textNowrap: { overflow: 'hidden', textOverflow: 'ellipsis', display: 'block', whiteSpace: 'nowrap' },
    labelHead: {
        fontWeight: 'bold',
        display: 'inline-block',
    },
    divLevel1: { display: "block" },
    divLevel2: { marginLeft: 22, display: "block" },
    chip: {
        margin: '2px 2px',
        height: '24px',
        // padding: '1px',
        borderRadius: '15px',
        backgroundColor: 'rgba(255, 255, 255, 0.2)'
    },
    avatar: {
        width: 24,
        height: 24,
        color: '#fff',
        fontSize: '95%',
        backgroundColor: grey[500]
    },
    listRoot: {
        width: '100%',
        padding: '5px 5px'
    },
    listItemAvatarRoot: {
        minWidth: '30px',
        maxWidth: '30px',
    },
    inline: {
        display: 'inline',
    },
    gutters: {
        padding: '0px 5px 0px 35px',
    },
    guttersHead: {
        padding: '0px 5px 0px 5px',
    },
    gutters2: { paddingRight: '40px' },
    bgFocus: {
        // backgroundColor: red[50],
        borderRadius: '5px',
        backgroundColor: 'rgba(255, 224, 0, 0.3)'
    }
});


const BaseMaster = {
    queryString: window.apipath + "/v2/SelectDataMstAPI/",
    t: "BaseMaster",
    q: '[{ "f": "Status", "c":"=", "v": 1}]',
    f: "ID,Code",
    g: "",
    s: "[{'f':'ID','od':'asc'}]",
    sk: 0,
    all: "",
}

const AreaLocationMaster = {
    queryString: window.apipath + "/v2/SelectDataMstAPI/",
    t: "AreaLocationMaster",
    q: '[{ "f": "Status", "c":"=", "v": 1}]',
    f: "ID,Code,Name",
    g: "",
    s: "[{'f':'ID','od':'asc'}]",
    sk: 0,
    all: "",
}

const ScanPalletMoveLocation = (props) => {
    const { t } = useTranslation()
    const { classes } = props;

    const [valueInput, setValueInput] = useState({});

    const [showDialog, setShowDialog] = useState(null);
    const [stateDialog, setStateDialog] = useState(false);
    const [msgDialog, setMsgDialog] = useState("");
    const [typeDialog, setTypeDialog] = useState("");

    const [activeStep, setActiveStep] = useState(0);
    const [dataShow, setDataShow] = useState(null);
    const [locationID, setLocationID] = useState(null);
    const [baseID, setBaseID] = useState(null);

    const steps = getSteps();

    const handleNext = (index) => {
        if (index === 0) {
            CheckAreaLocation(valueInput.LocationCode);
        }
        if (index === 1) {
            CheckPallet(valueInput.PalletCode);
        }
        if (index === 2) {
            ConfirmUpdateSto();
        }
    }
    const handleBack = (index) => {
        if (index === 1) {
            setLocationID(null);
            setValueInput({ ...valueInput, ['LocationCode']: null, ['PalletCode']: null })
            // setValueInput({ ...valueInput, ['PalletCode']: null })
        }
        if (index === 2) {
            setValueInput({ ...valueInput, ['PalletCode']: null })
            setBaseID(null);
            setDataShow(null);
        }
        setActiveStep(prevActiveStep => prevActiveStep - 1);
    }

    function handleReset() {
        setActiveStep(0);
        setValueInput({});
        setDataShow(null);
        setLocationID(null);
    }
    useEffect(() => {
        console.log(valueInput);
    }, [valueInput])
    useEffect(() => {
        console.log(locationID);
    }, [locationID])
    const onHandleChangeInput = (value, dataObject, field, fieldDataKey, event) => {
        valueInput[field] = value;

    };
    const onHandleChangeInputLocationCode = (value, dataObject, field, fieldDataKey, event) => {
        if (event && event.key == 'Enter') {
            valueInput[field] = value;
            CheckAreaLocation(value);
        }
    }
    const onHandleChangeInputPalletCode = (value, dataObject, field, fieldDataKey, event) => {
        if (event && event.key == 'Enter') {
            valueInput[field] = value;
            CheckPallet(value);
        }
    }

    const CheckAreaLocation = (reqLocationCode) => {
        let JSONDoc = []
        JSONDoc.push({ "f": "Code", "c": "=", "v": reqLocationCode.trim() })
        AreaLocationMaster.q = JSON.stringify(JSONDoc)
        Axios.get(createQueryString(AreaLocationMaster)).then((response) => {
            if (response.data._result.status === 1) {
                if (response.data.datas.length !== 0) {
                    response.data.datas.forEach(x => {
                        setLocationID(x.ID);
                        if (x.ID) {
                            setActiveStep(prevActiveStep => prevActiveStep + 1);
                        }
                    })

                } else {
                    alertDialogRenderer("Don't have Location : " + reqLocationCode + " in system", "error", true);
                    ClearInput('LocationCode');
                }
            } else {
                alertDialogRenderer(response.data._result.message, "error", true);
            }
        });
    }

    const CheckPallet = (reqPalletCode) => {
        let JSONDoc = []
        JSONDoc.push({ "f": "Code", "c": "=", "v": reqPalletCode.trim() })
        BaseMaster.q = JSON.stringify(JSONDoc)
        Axios.get(createQueryString(BaseMaster)).then((response) => {
            if (response.data._result.status === 1) {
                if (response.data.datas.length !== 0) {
                    if (locationID) {
                        GetDataFromPallet(reqPalletCode);
                    } else {
                        alertDialogRenderer("Don't have Location : " + valueInput.LocationCode.trim() + " in system", "error", true);
                    }
                } else {
                    alertDialogRenderer("Don't have Pallet : " + reqPalletCode + " in system", "error", true);
                    ClearInput('PalletCode');
                }
            } else {
                alertDialogRenderer(response.data._result.message, "error", true);
            }
        });
    }
    const GetDataFromPallet = (reqPalletCode) => {
        Axios.get(window.apipath + '/v2/GetMapStoAPI?'
            + "&code=" + (reqPalletCode === undefined || reqPalletCode === undefined || reqPalletCode === null ? '' : encodeURIComponent(reqPalletCode.trim()))
            + "&type=1&isToRoot=false&isToChild=true").then((rowselect) => {

                if (rowselect.data._result.status === 1) {
                    if (rowselect.data.mapsto != null) {
                        setBaseID(rowselect.data.mapsto.id);
                        //<AmListSTORenderer/> หากต้องการเเสดงค่าoption => showOptions={true} 
                        // ฟังก์ชั่นนสำหรับบจัดการข้อมูลเอง => customOptions={customOptions} 
                        setDataShow(<AmListSTORenderer dataSrc={rowselect.data.mapsto} />);
                        if (rowselect.data.mapsto) {
                            setActiveStep(prevActiveStep => prevActiveStep + 1);
                        }
                    } else {
                        alertDialogRenderer("Data of pallet Not Found", "error", true);
                        ClearInput('PalletCode');
                    }
                } else {
                    alertDialogRenderer(rowselect.data._result.message, "error", true);
                }

            });
    }
    const ClearInput = (field) => {
        let ele2 = document.getElementById(field);
        if (ele2)
            ele2.value = "";
        valueInput[field] = null;
        ele2.focus();
    }

    const ConfirmUpdateSto = () => {
        let postdata = {
            PalletCode: valueInput.PalletCode.trim()
            , LocationID: locationID
            , bstosID: baseID
        }
        Axios.post(window.apipath + "/V2/MoveLocationAPI", postdata).then((res) => {
            if (res.data._result.status === 1) {
                // setActiveStep(prevActiveStep => prevActiveStep + 1);
                handleReset();
                alertDialogRenderer("Move Location Success", "success", true);

            } else {
                alertDialogRenderer(res.data._result.message, "error", true);
                // setActiveStep(prevActiveStep => prevActiveStep + 1);
            }
        })
    }

    //แก้ไขตามเเต่ละโปรเจค
    const customOptions = (value) => {
        var qryStr = queryString.parse(value)
        var res = [{
            text: 'CN',
            value: qryStr[SC.OPT_CARTON_NO],
            textToolTip: 'Carton No.'
        }]
        return res;
    }

    const onClear = () => {
        setValueInput({});
        let ele1 = document.getElementById('LocationCode');
        if (ele1) {
            ele1.value = "";
            ele1.focus();
        }
        let ele2 = document.getElementById('PalletCode');
        if (ele2)
            ele2.value = "";

    }
    function getSteps() {
        var locaCode = "";
        var baseCode = "";

        if (valueInput) {
            if (valueInput.LocationCode) { locaCode = valueInput.LocationCode; }

            if (valueInput.PalletCode) { baseCode = valueInput.PalletCode; }
        }
        return [{ label: 'Destination location', value: locaCode },
        { label: 'Barcode pallet or box', value: baseCode },
        { label: 'Confirm move location', value: null },
        ];
    }

    function getStepContent(step) {
        switch (step) {
            case 0:
                return <div>
                    <AmInput
                        id={"LocationCode"}
                        type="input"
                        placeholder="Scan location code"
                        autoFocus={true}
                        // value={valueInput.LocationCode ? valueInput.LocationCode : ''}
                        style={{ width: "100%" }}
                        onChange={(value, obj, element, event) => onHandleChangeInput(value, null, "LocationCode", null, event)}
                        onKeyPress={(value, obj, element, event) => onHandleChangeInputLocationCode(value, null, "LocationCode", null, event)}
                    />
                </div>;
            case 1:
                return <div>
                    <AmInput
                        id={"PalletCode"}
                        placeholder="Scan pallet or box code"
                        // value={valueInput && valueInput.PalletCode ? valueInput.PalletCode : ''}
                        type="input"
                        style={{ width: "100%" }}
                        onChange={(value, obj, element, event) => onHandleChangeInput(value, null, "PalletCode", null, event)}
                        onKeyPress={(value, obj, element, event) => onHandleChangeInputPalletCode(value, null, "PalletCode", null, event)}
                    />
                </div>;
            case 2:
                return dataShow;
            default:
                return 'Unknown step';
        }
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
        <div className={classes.root}>
            {stateDialog ? showDialog ? showDialog : null : null}
            <Paper className={classes.paperContainer}>
                <Stepper activeStep={activeStep} orientation="vertical" className={classes.stepperContainer}>
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
                                        {activeStep !== 2 ? null :
                                            <AmButton styleType="delete_clear"
                                                onClick={handleReset}
                                                className={classes.button}
                                            >
                                                {t("Clear")}
                                            </AmButton>}
                                        <AmButton styleType="dark_clear"
                                            disabled={activeStep === 0}
                                            onClick={() => handleBack(index)}
                                            className={classes.button}
                                        >
                                            {t("Back")}
                                        </AmButton>
                                        <AmButton
                                            styleType="confirm"
                                            onClick={() => handleNext(index)}
                                            className={classes.button}
                                        >
                                            {t(activeStep === steps.length - 1 ? 'Confirm' : 'Next')}
                                        </AmButton>
                                    </div>
                                </div>
                            </StepContent>
                        </Step>
                    ))}
                </Stepper>
                {/* {activeStep === steps.length && (
                    <Paper square elevation={0} className={classes.resetContainer}>
                        <Typography style={{ fontWeight: 'bolder' }}>All steps completed - you&apos;re finished</Typography>
                        <AmButton styleType="delete_outline"
                            onClick={handleReset}
                            className={classes.button}
                        >Clear</AmButton>
                    </Paper>
                )} */}
            </Paper>
        </div>
    )
}

ScanPalletMoveLocation.propTypes = {

    classes: PropTypes.object.isRequired
};

export default withStyles(styles)(ScanPalletMoveLocation);
