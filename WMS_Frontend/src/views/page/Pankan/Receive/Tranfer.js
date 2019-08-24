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
    const [activeStep, setActiveStep] = useState(0);
    const [newStorageObj, setNewStorageObj] = useState(null);
    const [stateDialogErr, setStateDialogErr] = useState(false);
    const [msgDialogErr, setMsgDialogErr] = useState("");
    const [expanded, setExpanded] = useState(false);
    const [barCodeDes, setbarCodeDes] = useState();
    const [objectSizeMaps, setobjectSizeMaps] = useState();

    const handleExpandClick = () => {
        setExpanded(!expanded);
    }

    const onHandleConfirmReceive = () => {


    }

    const onHandleClear = () => {

    }
    const onHandleChangeInputDes = (value, dataObject, field, fieldDataKey, event) => {
        console.log(value)

    }
    const onHandleChangeInputSou = () => {

    }

    const getDesScan = () => {
        let datas = {
            "warehouseID": 1,
            "scanCode": barCodeDes,
            "mode": 1,
            "amount": 0,
            "action": 0,

        }
        console.log(datas)
        Axios.post(window.apipath + '/v2/ScanMapStoAPI', datas).then((res) => {
            console.log(res)
            if (res.data._result.status === 1) {
                let datas = res.data
                console.log(datas)
                //setobjectSizeMaps(datas.objectSizeMaps)
                setNewStorageObj(<AmListSTORenderer
                    dataSrc={datas}
                    //showOptions={}
                    //customOptions={null}
                />);
            } else {
                setStateDialogErr(true)
                setMsgDialogErr(res.data._result.message)

            }
        })

    }
    console.log(newStorageObj)
    return (
        <div className={classes.root}>
            {stateDialog ? showDialog ? showDialog : null : null}
            <Paper square className={classes.paper1}>
                <AmDialogs typePopup={"error"} content={msgDialogErr} onAccept={(e) => { setStateDialogErr(e) }} open={stateDialogErr}></AmDialogs >

                <Tabs
                    classes={{ indicator: classnames(classes.bigIndicator, classes['indicator_']) }}
                >
                </Tabs>
            </Paper>
            <Paper square className={classnames(classes.paper2, classes['paperBG_'])}>
                <Card className={classes.card}>
                    <CardContent className={classes.cardContent}>
                        <div>
                            <FormInline><LabelH>Dase base : </LabelH>
                                <AmInput
                                    id={"desbase"}
                                    autoFocus={true}
                                    placeholder={"Scan"}
                                    type="input"
                                    style={{ width: "330px" }}
                                    defaultValue={""}
                                    onKeyPress={(value, a, b, event) => {
                                        if (event.key === "Enter") {
                                            console.log(value)
                                            setbarCodeDes(value)
                                            document.getElementById("desbase").value = "";
                                            getDesScan();
                                        }
                                    }}
                                >
                                </AmInput>
                            </FormInline>
                            <FormInline><LabelH>Sou Scan : </LabelH>
                                <AmInput
                                    id={"desbase"}
                                    autoFocus={true}
                                    placeholder={"Scan"}
                                    type="input"
                                    style={{ width: "330px" }}
                                    defaultValue={""}
                                  
                                ></AmInput>
                            </FormInline>

                        </div>
                    </CardContent>
                    {newStorageObj ?
                        <CardActions >
                            {/* disableActionSpacing */}
                            <label className={classes.titleDetail}>{t("Mapping Pallet Details")}:</label>
                            <IconButton
                                className={classnames(classes.iconButton, classes.expand, {
                                    [classes.expandOpen]: expanded,
                                })}
                                onClick={handleExpandClick}
                                aria-expanded={expanded}
                                aria-label="Show more"
                                size="small"
                            >
                                <ExpandMoreIcon fontSize="small" />
                            </IconButton>
                        </CardActions>
                        : null}
                    <Collapse in={expanded} timeout="auto" unmountOnExit>
                        <CardContent className={classes.cardContent}>
                            {newStorageObj ? newStorageObj : null}
                        </CardContent>
                        <CardActions style={{ justifyContent: 'center' }}>
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
                        </CardActions>
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