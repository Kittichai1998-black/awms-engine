import PropTypes from 'prop-types';
import React, { useState, useEffect, useReducer } from "react";
import { withStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import classnames from 'classnames';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Tab from '@material-ui/core/Tab';
import Tabs from '@material-ui/core/Tabs';
import CardActions from '@material-ui/core/CardActions';
import AmInput from '../../../../components/AmInput'
import AmButton from '../../../../components/AmButton'
import AmDialogs from '../../../../components/AmDialogs'
import Collapse from '@material-ui/core/Collapse';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import IconButton from '@material-ui/core/IconButton';
import { apicall, createQueryString } from '../../../../components/function/CoreFunction2'
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import StepContent from '@material-ui/core/StepContent';
import Typography from '@material-ui/core/Typography';
import queryString from 'query-string'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'
import AmListSTORenderer from '../../../pageComponent/AmListSTORenderer'
import { indigo, deepPurple, lightBlue, red, grey, green } from '@material-ui/core/colors';
import Axios1 from 'axios'
const Axios = new apicall()

const styles = theme => ({
    root: {
        maxWidth: '50%',
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
    block: {
        display: "block"
    },
    cardContent: {
        padding: "5px 10px 5px 10px",
    },
    card: {
        minWidth: 350,
        // maxWidth: 500,
    },
    expand: {
        transform: 'rotate(0deg)',
        marginLeft: 'auto',
        transition: theme.transitions.create('transform', {
            duration: theme.transitions.duration.shortest,
        }),
    },
    expandOpen: {
        transform: 'rotate(180deg)',
    },
    actions: {
        display: 'flex',
    },
    iconButton: {
        padding: 4,
    },
    button: {
        margin: theme.spacing(),
        width: '100%',
        lineHeight: 1.5
    },
    buttonAuto: {
        margin: theme.spacing(),
        width: 'auto',
        lineHeight: 1
    },
    detail: {
        fontSize: '90%',
    },
    titleDetail: {
        fontWeight: 'bold',
        color: indigo[500]
    },
    areadetail: {
        fontSize: '1.225em'
    },
    labelHead: {
        fontWeight: 'bold',
        display: 'inline-block',
    },
    labelFocus: {
        padding: '2px',
        borderRadius: '5px',
        backgroundColor: 'rgba(255, 224, 0, 0.5)'
    },
    divLevel1: { marginBottom: 3, display: "block" },
    divLevel2: { marginLeft: 22, marginBottom: 3, display: "block" },
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
    opsAvatar: { backgroundColor: red[500] },
    qtyAvatar: { backgroundColor: deepPurple[500] },
    optAvatar: { backgroundColor: lightBlue[500] },
    textNowrap: { overflow: 'hidden', textOverflow: 'ellipsis', display: 'block', whiteSpace: 'nowrap' },
    paper1: { flexGrow: 1, minWidth: 360, width: '100%' },
    paper2: { flexGrow: 1, minWidth: 360, width: '100%', marginTop: 5, padding: 5 },
    paperBG_0: { backgroundColor: indigo[100] },
    paperBG_1: { backgroundColor: green[100] },
    paperBG_2: { backgroundColor: red[100] },
    bigIndicator: { height: 4, },
    indicator_0: { backgroundColor: indigo[700] },
    indicator_1: { backgroundColor: green[700] },
    indicator_2: { backgroundColor: red[700] },
    fontIndi_0: { color: indigo[700], minHeight: '52px', paddingTop: '5px', fontSize: 'x-small' },
    fontIndi_1: { color: green[700], minHeight: '52px', paddingTop: '5px', fontSize: 'x-small' },
    fontIndi_2: { color: red[700], minHeight: '52px', paddingTop: '5px', fontSize: 'x-small' }
});

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
    width: 150px;
    paddingLeft: 20px;
`;

const Tranfer = (props) => {
    const { t } = useTranslation()

    const { classes,
        confirmReceiveMapSTO = false,
    } = props;
    const [valueInput, setValueInput] = useState({});
    const [dataShow, setDataShow] = useState(null);
    const [showDialog, setShowDialog] = useState(null);
    const [stateDialog, setStateDialog] = useState(false);
    const [msgDialog, setMsgDialog] = useState("");
    const [typeDialog, setTypeDialog] = useState("");
    const [newStorageObj, setNewStorageObj] = useState(null);
    const [stateDialogErr, setStateDialogErr] = useState(false);
    const [msgDialogErr, setMsgDialogErr] = useState("");
    const [stateDialogSuc, setStateDialogSuc] = useState(false);
    const [msgDialogSuc, setMsgDialogSuc] = useState("");
    const [expanded, setExpanded] = useState(true);
    const [barCodeDes, setbarCodeDes] = useState();
    const [barCodeSou, setbarCodeSou] = useState();
    const [barCodeDesArea, setbarCodeDesAre] = useState();
    const [barCodeSouArea, setbarCodeSouArea] = useState(); 
    const [qtys, setqtys] = useState();
    const [activeStep, setActiveStep] = useState(0);
    const [soupack, setsoupack] = useState();
    const [objectSizeMaps, setobjectSizeMaps] = useState();

    const steps = getSteps();

    function getSteps() {
        var desbase = "";
        var soubase = "";
        var soupack = "";
        var qtys = "";
        var souarea = "";
        var desarea = "";

        //if (valueInput) {
        //    if (valueInput.LocationCode) { locaCode = valueInput.LocationCode; }

        //    if (valueInput.PalletCode) { baseCode = valueInput.PalletCode; }
        //}
        return [{ label: 'Destination Area', value: desarea },
            { label: 'Source Area', value: souarea },
            { label: 'Destination Base', value: desbase },
            { label: 'Source Base', value: soubase },     
        { label: 'Source SKU', value: soupack },
        { label: 'Quantity', value: qtys },
        { label: 'Confirm Tranfer', value: null },
        ];
    }


    const handleExpandClick = () => {
        setExpanded(!expanded);
    }

    const handleReset = () => {
        setActiveStep(0);
        setValueInput({});
        setDataShow(null);
        setNewStorageObj(null);
        setbarCodeDes();
        setbarCodeSou();
        setsoupack();
        setqtys();
    }



    const handleNext = (index) => {
        if (index === 0) {
            CheckDesbase();
        }
        if (index === 1) {
            CheckSoubase();
        }
        if (index === 2) {
            CheckSoupack();
        }
        if (index === 3) {
            CheckQty();
        }
    }


    const CheckDesbase = () => {
        if (valueInput.desbase === undefined || valueInput.desbase === '' || valueInput.desbase === null) {
            setMsgDialogErr("Destination Base invalid")
            setStateDialogErr(true)
        } else {
            setActiveStep(prevActiveStep => prevActiveStep + 1);

        }
    }

    const CheckSoubase = () => {
        if (valueInput.soubase === undefined || valueInput.soubase === '' || valueInput.soubase === null) {
            setMsgDialogErr("Source Base invalid")
            setStateDialogErr(true)
        } else {
            setActiveStep(prevActiveStep => prevActiveStep + 1);

        }
    }

    const CheckSoupack = () => {
        if (valueInput.soupack === undefined || valueInput.soupack === '' || valueInput.soupack === null) {
            setMsgDialogErr("SKU invalid")
            setStateDialogErr(true)
        } else {
            setActiveStep(prevActiveStep => prevActiveStep + 1);

        }
    }


    const CheckQty = () => {
        if (valueInput.qty === undefined || valueInput.qty === '' || valueInput.qty === null) {
            setMsgDialogErr("Quantity  invalid")
            setStateDialogErr(true)
        } else {
            setActiveStep(prevActiveStep => prevActiveStep + 1);

        }
    }



    const getDesScan = () => {
        let datas = {
            "desBase": valueInput.desbase,
            "souBase": valueInput.soubase,
            "souPack": valueInput.soupack,
            "quantity": valueInput.qty,
            "areaID": 1,
            "warehouseID" : 1
        }
        Axios.post(window.apipath + '/v2/TransferPanKanAPI', datas).then((res) => {
            if (res.data._result.status === 1) {
                let datas = res.data
                setNewStorageObj(<AmListSTORenderer
                    dataSrc={datas}

                />);
                setMsgDialogSuc("Sucess")
                setStateDialogSuc(true)
            } else {
                setStateDialogErr(true)
                setMsgDialogErr(res.data._result.message)

            }
        })

    }

    const handleBack = (index) => {
        console.log(index)
        if (index === 1) {
            console.log(valueInput)
            setbarCodeDes(valueInput.desbase);
            setValueInput({ ...valueInput, ['desbase']: null, ['soubase']: null })
            // setValueInput({ ...valueInput, ['PalletCode']: null })
        }
        if (index === 2) {
            setbarCodeSou(valueInput.soubase)
            setValueInput({ ...valueInput, ['soubase']: null, ['soupack']: null  })
            //setBaseID(null);
            //setDataShow(null);
        }
        if (index === 3) {
            setsoupack(valueInput.soupack)
            setValueInput({ ...valueInput, ['soupack']: null, ['qty']: null })
            //setBaseID(null);
            //setDataShow(null);
        }
        if (index === 4) {
            setsoupack(valueInput.qty)
            setValueInput({ ...valueInput, ['qty']: null })
            //setBaseID(null);
            //setDataShow(null);
        }

        setActiveStep(prevActiveStep => prevActiveStep - 1);
    }

    const onHandleChangeInput = (value, dataObject, field, fieldDataKey, event) => {
        valueInput[field] = value;

    };

    const onHandleChangeInputDesbase = (value, dataObject, field, fieldDataKey, event) => {
        if (event && event.key == 'Enter') {
            valueInput[field] = value;
            setbarCodeDes(value)
             //CheckDesbase();
        }
    }

    const onHandleChangeInputSoubase = (value, dataObject, field, fieldDataKey, event) => {
        if (event && event.key == 'Enter') {
            valueInput[field] = value;
            setbarCodeSou(value)
            // CheckDesbase(value);
        }
    }
    const onHandleChangeInputSoupack = (value, dataObject, field, fieldDataKey, event) => {
        if (event && event.key == 'Enter') {
            valueInput[field] = value;
            setsoupack(value)
            // CheckDesbase(value);
        }
    }
    const onHandleChangeInputQty = (value, dataObject, field, fieldDataKey, event) => {
        if (event && event.key == 'Enter') {
            valueInput[field] = value;
            setqtys(value)
        }
    }



    const getStepContent = (step) => {
        switch (step) {

            case 0:
                return <div>
                    <AmInput
                        id={"desarea"}
                        autoFocus={true}
                        placeholder={"Scan"}
                        style={{ width: "100%" }}
                        defaultValue={barCodeDes}
                        onChange={(value, obj, element, event) => onHandleChangeInput(value, null, "desbase", null, event)}
                        onKeyPress={(value, obj, element, event) => onHandleChangeInputDesbase(value, null, "desbase", null, event)}

                    ></AmInput>
                </div>;
            case 1:
                return <div>

                    <AmInput
                        id={"soubase"}
                        autoFocus={true}
                        placeholder={"Scan "}
                        style={{ width: "100%" }}
                        defaultValue={barCodeSou}
                        onChange={(value, obj, element, event) => onHandleChangeInput(value, null, "soubase", null, event)}
                        onKeyPress={(value, obj, element, event) => onHandleChangeInputSoubase(value, null, "soubase", null, event)}
                    ></AmInput>

                </div>;
            case 2:
                return <div>
                    <AmInput
                        id={"desbase"}
                        autoFocus={true}
                        placeholder={"Scan"}  
                        style={{ width: "100%" }} 
                        defaultValue={barCodeDes}
                        onChange={(value, obj, element, event) => onHandleChangeInput(value, null, "desbase", null, event)}
                        onKeyPress={(value, obj, element, event) => onHandleChangeInputDesbase(value, null, "desbase", null, event)}

                    ></AmInput>
                </div>;
            case 3:
                return <div>

                    <AmInput
                        id={"soubase"}
                        autoFocus={true}
                        placeholder={"Scan "}
                        style={{ width: "100%" }}                     
                        defaultValue={barCodeSou}                                
                        onChange={(value, obj, element, event) => onHandleChangeInput(value, null, "soubase", null, event)}
                        onKeyPress={(value, obj, element, event) => onHandleChangeInputSoubase(value, null, "soubase", null, event)}
                    ></AmInput>

                </div>;
            case 4: return <div>
                <AmInput
                    id={"soupack"}
                    autoFocus={true}
                    placeholder={"Scan SKU"}
                    style={{ width: "100%" }}
                    defaultValue={soupack}
                    onChange={(value, obj, element, event) => onHandleChangeInput(value, null, "soupack", null, event)}
                    onKeyPress={(value, obj, element, event) => onHandleChangeInputSoupack(value, null, "soupack", null, event)}
                ></AmInput>
            </div>;
            case 5: return <div>

                <AmInput
                    id={"qty"}
                    autoFocus={true}
                    placeholder={"Scan"}
                    style={{ width: "100%" }}
                    type="number"
                    defaultValue={"1"}
                    //onChange={CheckStaps()}
                    onChange={(value, obj, element, event) => onHandleChangeInput(value, null, "qty", null, event)}
                    onKeyPress={(value, obj, element, event) => onHandleChangeInputQty(value, null, "qty", null, event)}
                ></AmInput>
            </div>;
           case 6: return <div></div>;
            default:
                return 'Unknown step';
        }

    }
    return (
        <div className={classes.root}>
            <AmDialogs typePopup={"success"} content={msgDialogSuc} onAccept={(e) => { setStateDialogSuc(e) }} open={stateDialogSuc}></AmDialogs >
            <AmDialogs typePopup={"error"} content={msgDialogErr} onAccept={(e) => { setStateDialogErr(e) }} open={stateDialogErr}></AmDialogs >
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
                                        {activeStep === 4 ?
                                            <AmButton styleType="delete_clear"
                                                onClick={handleReset}
                                                className={classes.button}
                                            >
                                                {t("Clear")}
                                            </AmButton> : null}
                                        { activeStep !== 0 ?<AmButton styleType="dark_clear"
                                            disabled={activeStep === 0}
                                            onClick={() => handleBack(index)}
                                            className={classes.button}
                                        >
                                            {t("Back")}
                                        </AmButton> : null}
                                        {activeStep !== 4 ?<AmButton
                                            styleType="confirm"
                                            onClick={() => handleNext(index)}
                                            className={classes.button}
                                        >{t("Next")}
                                        </AmButton> : null}

                                        {activeStep == 4 ? <AmButton
                                            styleType="confirm"
                                            onClick={() => getDesScan()}
                                            className={classes.button}
                                        >{t("Confirm")}
                                        </AmButton> : null}
                                    </div>
                                </div>
                            </StepContent>
                        </Step>
                    ))}
                </Stepper>

                <Card className={classes.card}>
                    {newStorageObj ?
                        <CardActions >
                            {/* disableActionSpacing */}
                            <label className={classes.titleDetail}>{t("Details Base")}:</label>
                          
                        </CardActions>
                        : null}
                    <Collapse in={expanded} timeout="auto" unmountOnExit>
                        <CardContent className={classes.cardContent}>
                            {newStorageObj ? newStorageObj : null}
                        </CardContent>
                        { /* <CardActions style={{ justifyContent: 'center' }}>
                            {confirmReceiveMapSTO ?
                                <div>
                                    <AmButton styleType="confirm_outline" className={classnames(classes.buttonAuto)}
                                        onClick={() => onHandleConfirmReceive(true)}>
                                        {t('Confirm')}
                                    </AmButton>
                                    <AmButton styleType="warning_outline" className={classnames(classes.buttonAuto)}
                                        onClick={() => onHandleConfirmReceive(false)}>
                                        {t('Cancel')}
                                    </AmButton>
                                </div>
                                : null}
                            <AmButton styleType="delete_outline" className={classnames(classes.buttonAuto)} onClick={onHandleClear}>
                                {t('Clear')}
                            </AmButton>
                        </CardActions>*/}
                    </Collapse>

                </Card>


            </Paper>
           
        </div>
    )
}

Tranfer.prototype = {
    classes: PropTypes.object.isRequired,
}


export default withStyles(styles)(Tranfer);