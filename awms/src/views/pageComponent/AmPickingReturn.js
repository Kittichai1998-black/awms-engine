import React, { useState, useEffect, useReducer } from "react";
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { apicall, createQueryString, Clone } from '../../components/function/CoreFunction2';
import ToListTree from '../../components/function/ToListTree';
import AmInput from "../../components/AmInput";
import AmButton from "../../components/AmButton";
import styled from 'styled-components'
import AmDropdown from '../../components/AmDropdown';
import AmDate from "../../components/AmDate";
import moment from 'moment';
import { withStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardContent from '@material-ui/core/CardContent';
import CardActions from '@material-ui/core/CardActions';
import Collapse from '@material-ui/core/Collapse';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import IconButton from '@material-ui/core/IconButton';
import AmDialogs from '../../components/AmDialogs'
import { indigo, deepPurple, lightBlue, red, grey, green } from '@material-ui/core/colors';
import AmStorageObjectStatus from "../../components/AmStorageObjectStatus";
import Chip from '@material-ui/core/Chip';
import Avatar from '@material-ui/core/Avatar';
import AmToolTip from "../../components/AmToolTip";
import Divider from '@material-ui/core/Divider';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import AddIcon from '@material-ui/icons/AddCircle';
import SearchIcon from '@material-ui/icons/Search';
import RemoveCircleIcon from '@material-ui/icons/RemoveCircle';
import _ from 'lodash';
import AmListSTORenderer from '../pageComponent/AmListSTORenderer';

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
    inline_block: {
        display: "inline-block"
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
    areadetail: {
        fontSize: '1.225em'
    },
    titleDetail: {
        fontWeight: 'bold',
        color: indigo[500]
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
    chipQty: { backgroundColor: grey[300] },
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
    fontIndi_2: { color: red[700], minHeight: '52px', paddingTop: '5px', fontSize: 'x-small' },
    column: {
        // marginRight: 70
    },
    column1: {
        // display: 'block',
        textAlign: 'right',
        // maxWidth: '140px'
    },
    column3: {
        // display: 'block',
        textAlign: 'left',
        maxWidth: '250px'
    },
    column2: {
        display: 'flex',
        alignItems: 'center',
        width: '100%'
    },
    showQty: {
        // textAlign: 'right',
        borderLeft: `2px solid ${grey[400]}`,
        padding: '0px 5px 0px 5px ',
    },
    details: {
        alignItems: 'center',
    },
    details2: {
        textAlign: 'center',
    },
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
const WarehouseQuery = {
    queryString: window.apipath + "/v2/SelectDataMstAPI/",
    t: "Warehouse",
    q: '[{ "f": "Status", "c":"=", "v": 1}]',
    f: "*",
    g: "",
    s: "[{'f':'ID','od':'asc'}]",
    sk: 0,
    l: 100,
    all: "",
}
const AreaMasterQuery = {
    queryString: window.apipath + "/v2/SelectDataMstAPI/",
    t: "AreaMaster",
    q: '[{ "f": "Status", "c":"=", "v": 1}]',
    f: "*",
    g: "",
    s: "[{'f':'ID','od':'asc'}]",
    sk: 0,
    l: 100,
    all: "",
}
const AmPickingReturn = (props) => {
    const { classes,
        headerCreate,
        itemCreate,
        onBeforePost,
        apiCreate,
        customOptions,
        showOptions,
        showWarehouseDDL,
        showAreaDDL,
        chipRenderer,
        customConfirmMapSTO,
        setVisibleTabMenu,
        useMultiSKU
    } = props;

    const [inputHeader, setInputHeader] = useState([]);
    const [inputItem, setInputItem] = useState([]);

    const [ddlWarehouse, setDDLWarehouse] = useState(null);
    const [ddlArea, setDDLArea] = useState(null);
    const [selWarehouse, setSelWarehouse] = useState(showWarehouseDDL && showWarehouseDDL.defaultValue ? showWarehouseDDL.defaultValue : null);

    const [expanded, setExpanded] = useState(false);

    const [keyEnter, setKeyEnter] = useState(false);

    // const [valueInput, setValueInput] = useReducer(
    //     (state, newState) => ({ ...state, ...newState }), {}
    // );
    const [valueInput, setValueInput] = useState({});
    const [actionValue, setActionValue] = useState(1);

    const [showDialog, setShowDialog] = useState(null);
    const [stateDialog, setStateDialog] = useState(false);
    const [msgDialog, setMsgDialog] = useState("");
    const [typeDialog, setTypeDialog] = useState("");

    const [resData, setResData] = useState(null);
    const [newDataShow, setNewDataShow] = useState(null);
    // const [reqPost, setReqPost] = useState({});

    function handleExpandClick() {
        setExpanded(!expanded);
    }
    useEffect(() => {
        if (headerCreate)
            setInputHeader(createComponent(headerCreate));
    }, [headerCreate]);
    useEffect(() => {
        if (inputHeader === null) {
            setInputHeader(createComponent(headerCreate));
        }
    }, [inputHeader]);
    useEffect(() => {
        if (itemCreate)
            setInputItem(createComponent(itemCreate));
    }, [itemCreate]);
    useEffect(() => {
        if (inputItem === null) {
            setInputItem(createComponent(itemCreate));
        }
    }, [inputItem]);

    useEffect(() => {
        if (keyEnter)
            onHandleBeforePost();
    }, [valueInput, keyEnter]);

    const alertDialogRenderer = (message, type, state) => {
        setMsgDialog(message);
        setTypeDialog(type);
        setStateDialog(state);
    }
    useEffect(() => {
        if (typeDialog && msgDialog && stateDialog) {
            setShowDialog(<AmDialogs typePopup={typeDialog} content={msgDialog} onAccept={(e) => { setStateDialog(e) }} open={stateDialog}></AmDialogs >);
        } else {
            setShowDialog(null);
        }
    }, [stateDialog, msgDialog, typeDialog]);


    useEffect(() => {
        if (ddlWarehouse === null && showWarehouseDDL && showWarehouseDDL.visible) {
            GetWarehouseDDL();
        }
    }, [ddlWarehouse])
    useEffect(() => {
        if (showAreaDDL && showAreaDDL.visible && selWarehouse) {
            GetAreaDDL(selWarehouse)
        }
    }, [selWarehouse])
    useEffect(() => {
        if (ddlArea === null && selWarehouse) {
            if (showAreaDDL && showAreaDDL.visible && selWarehouse) {
                GetAreaDDL(selWarehouse)
            }
        }
    }, [ddlArea])
    async function GetWarehouseDDL() {
        await Axios.get(createQueryString(WarehouseQuery)).then(res => {
            if (res.data.datas) {
                setDDLWarehouse(inputDefaultComponent(showWarehouseDDL, res.data.datas))

            }
        });
    }
    async function GetAreaDDL(selWarehouseID) {
        let newAreaQueryStr = Clone(AreaMasterQuery);
        if (selWarehouseID) {
            newAreaQueryStr.q = "[{ 'f': 'Status', c:'=', 'v': 1},{ 'f': 'Warehouse_ID', c:'=', 'v': " + selWarehouseID + "}]";
        }
        await Axios.get(createQueryString(newAreaQueryStr)).then(res => {
            if (res.data.datas) {
                setDDLArea(inputDefaultComponent(showAreaDDL, res.data.datas))

            }
        });
    }

    const inputDefaultComponent = (showComponent, Query) => {
        if (showComponent.visible) {
            return <FormInline><LabelH>{showComponent.name} : </LabelH>
                <AmDropdown
                    id={showComponent.field}
                    placeholder={showComponent.placeholder}
                    fieldDataKey={showComponent.fieldDataKey}
                    fieldLabel={showComponent.fieldLabel}
                    labelPattern=" : "
                    width={330}
                    ddlMinWidth={330}
                    zIndex={1000}
                    returnDefaultValue={true}
                    defaultValue={showComponent.defaultValue ? showComponent.defaultValue : ""}
                    data={Query}
                    onChange={(value, dataObject, inputID, fieldDataKey) => onHandleChangeInput(value, dataObject, showComponent.field, fieldDataKey, null)}
                    ddlType={showComponent.typeDropdown}
                />
            </FormInline>
        } else {
            return null;
        }
    }
    const getValueInput = () => {
        itemCreate.map((x, i) => {
            let ele = document.getElementById(x.field);
            if (ele) {
                valueInput[x.field] = ele.value;
            }
        })
    }


    const onHandleChangeInput = (value, dataObject, field, fieldDataKey, event) => {
        // setValueInput({
        //     [field]: value
        // });
        valueInput[field] = value;
        console.log(valueInput)
        if (field === "warehouseID") {
            setSelWarehouse(value);
        }
        if (event && event.key == 'Enter') {
            setKeyEnter(true);
        }
    };

    async function onHandleBeforePost() {
        setKeyEnter(false);
        getValueInput();

        var resValuePost = null;
        var dataScan = {};
        if (useMultiSKU) {

        } else {
            if (valueInput) {
                if (valueInput['scanCode']) {
                    let rootFocusID = null;
                    if (resData) {
                        var docItemrow = resData.docs && resData.docs[0] ? resData.docs[0].documentItems !== null && resData.docs[0].documentItems.length > 0 ? resData.docs[0].documentItems : null : null;
                        var bstoData = resData.bsto;
                        var dataRootFocus = findRootMapping(bstoData);
                        rootFocusID = dataRootFocus.id;
                        if (onBeforePost) {
                            var resInput = {
                                ...valueInput,
                                rootID: rootFocusID,
                                docItemID: docItemrow ? docItemrow[0].id : null,
                                amount: valueInput['amount'] ? valueInput['amount'] : 1,
                                mode: 0,
                                action: actionValue
                            };
                            dataScan = await onBeforePost(resInput, bstoData);
                            if (dataScan) {
                                resValuePost = { ...dataScan }
                            } else {
                                inputClear();
                            }
                        } else {
                            dataScan = {
                                rootID: rootFocusID,
                                docItemID: docItemrow ? docItemrow[0].id : null,
                                amount: valueInput['amount'] ? valueInput['amount'] : 1,
                                mode: 0,
                                action: actionValue,
                                // scanCode: ,
                                // orderNo:  ,
                                // batch:  ,
                                // lot:  ,
                                // unitCode: ,
                                // productDate
                                //locationCode
                                // options: valueInput['options'] ? valueInput['options'] : null,
                            };
                            resValuePost = { ...valueInput, ...dataScan }
                        }
                    } else {
                        //select / add pallet 
                        dataScan = {
                            amount: valueInput['amount'] ? valueInput['amount'] : 1,
                            mode: 0,
                            action: actionValue,
                        }
                        resValuePost = { ...valueInput, ...dataScan }
                    }
                } else {
                    alertDialogRenderer("ScanCode must be value", "error", true);
                }
            }
            console.log(resValuePost);
            if (resValuePost) {
                if (actionValue !== 0 && actionValue !== 2 && resData ? resData.bsto : null) {
                    var dataLastPack = findPack(resData.bsto);
                    if (dataLastPack && dataLastPack.code !== resValuePost.scanCode) {
                        alertDialogRenderer("The new product doesn't match the previous product on the pallet.", "error", true);
                    } else {
                        scanBarcodeApi(resValuePost);
                    }
                } else {
                    scanBarcodeApi(resValuePost);
                }
            }
        }
    }
    const findRootMapping = (storageObj) => {
        var mapstosToTree = ToListTree(storageObj, 'mapstos');
        mapstosToTree.reverse();
        var idFocus = null;
        for (let no in mapstosToTree) {
            if (mapstosToTree[no].isFocus) {
                idFocus = mapstosToTree[no];
                break;
            } else {
                continue;
            }
        }
        return idFocus;
    }
    const findPack = (storageObj) => {
        var mapstosToTree = ToListTree(storageObj, 'mapstos');
        mapstosToTree.reverse();
        var pack = null;
        for (let no in mapstosToTree) {
            if (mapstosToTree[no].type === 2) {
                pack = mapstosToTree[no];
                break;
            } else {
                continue;
            }
        }
        return pack;
    }
    const scanBarcodeApi = (req) => {
        Axios.post(window.apipath + apiCreate, req).then((res) => {
            if (res.data != null) {
                inputClear();
                if (res.data._result.message === "Success") {
                    if (res.data.bsto) {
                        setResData(res.data);
                        // inputClear();
                        if (res.data.bsto.code === valueInput.scanCode) {
                            if (actionValue === 0) {
                                alertDialogRenderer("Select Pallet Success", "success", true);
                            }
                            if (actionValue === 1) {
                                alertDialogRenderer("Success", "success", true);
                            }

                        } else {
                            if (actionValue === 0) {
                                alertDialogRenderer("Select Success", "success", true);
                            }
                            if (actionValue === 1) {
                                alertDialogRenderer("Success", "success", true);
                            }
                            if (actionValue === 2) {
                                alertDialogRenderer("Remove Pack Success", "success", true);
                            }
                        }
                    } else {
                        alertDialogRenderer("Remove Pallet Success", "success", true);
                        onHandleClear();
                    }
                } else {
                    alertDialogRenderer(res.data._result.message, "error", true);
                }
            } else {
                alertDialogRenderer(res.data._result.message, "error", true);
            }
        });
    }
    useEffect(() => {
        if (resData) {
            if (useMultiSKU) {

            } else {
                setExpanded(true);
                setNewDataShow(HeadDetailRenderer(resData));
            }
        } else {
            setExpanded(false);
        }
    }, [resData])

    const SumQty = (arr, field) => {
        _.forEach(arr, function (value, key) {
            value.quantity = parseInt(value.quantity, 10);
        });
        return _.sumBy(arr, field)
    }
    const HeadDetailRenderer = (data) => {
        var docrow = data.docs ? data.docs[0] : null;
        var bstoData = data.bsto;
        if (docrow === null) {
            if (bstoData)
                return <AmListSTORenderer dataSrc={bstoData} showOptions={showOptions} customOptions={customOptions} />;

        } else {
            return <div className={classes.detail}>
                <label className={classnames(classes.textNowrap, classes.areadetail)}><span className={classes.labelHead}>Doc No. </span> {docrow.code}</label>
                {docrow.documentItems !== null && docrow.documentItems.length > 0 ? docrow.documentItems.map((docItemrow, idx2) => {
                    return <div key={idx2}>
                        <div className={classnames(classes.column2)}>
                            <label className={classnames(classes.textNowrap, classes.areadetail)} style={{ marginRight: 10 }}><span className={classes.labelHead}>SKU:</span> {docItemrow.code}</label>
                            <div className={classnames(classes.showQty)} style={{ textAlign: 'right' }} >
                                <Chip className={classnames(classes.chip, classes.chipQty)}
                                    avatar={<Avatar className={classnames(classes.avatar)}>{"Q"}</Avatar>}
                                    label={docItemrow.quantity ? docItemrow.docItemStos !== null && docItemrow.docItemStos.length > 0 ? SumQty(docItemrow.docItemStos, "quantity") + "/" + parseInt(docItemrow.quantity, 10) : "- /" + parseInt(docItemrow.quantity, 10) : "/ -"} variant="outlined" />
                            </div>
                        </div>
                        <hr />
                        {bstoData ? <AmListSTORenderer dataSrc={bstoData} showOptions={showOptions} customOptions={customOptions} /> : null}
                    </div>
                }) :
                    bstoData ? <AmListSTORenderer dataSrc={bstoData} showOptions={showOptions} customOptions={customOptions} /> : null
                }
            </div>
        }

    }

    const createComponent = (inputList) => {
        if (inputList)
            return inputList.map(x => {
                return {
                    "field": x.field,
                    "component": (cols, key) => {
                        return <div key={key} style={{ display: "inline-block" }}>
                            {FuncCreateForm(key, x.field, x.type, x.name,
                                x.fieldLabel, x.placeholder,
                                x.dataDropDown, x.typeDropdown, x.labelTitle, x.fieldDataKey, x.defaultValue)}
                        </div>
                    }
                }
            })
    };
    const FuncCreateForm = (key, field, type, name,
        fieldLabel, placeholder,
        dataDropDown, typeDropdown, labelTitle, fieldDataKey, defaultValue) => {
        if (type === "input") {
            return (
                <FormInline><LabelH>{name} : </LabelH>
                    <AmInput
                        id={field}
                        autoFocus={field == 'scanCode' ? true : false}
                        placeholder={placeholder}
                        type="input"
                        style={{ width: "330px" }}
                        defaultValue={defaultValue ? defaultValue : ""}
                        onKeyPress={(value, obj, element, event) => onHandleChangeInput(value, null, field, null, event)}
                        onChange={(value, obj, element, event) => onHandleChangeInput(value, null, field, null, event)}
                    />

                </FormInline>
            )
        } else if (type === "number") {
            return (
                <FormInline><LabelH>{name} : </LabelH>
                    <AmInput
                        id={field}
                        placeholder={placeholder}
                        type="number"
                        style={{ width: "330px" }}
                        defaultValue={defaultValue ? defaultValue : ""}
                        onChange={(value, obj, element, event) => onHandleChangeInput(value, null, field, null, event)}
                    />
                </FormInline>
            )
        }
        else if (type === "dropdown") {
            return <FormInline><LabelH>{name} : </LabelH>
                <AmDropdown
                    id={field}
                    placeholder={placeholder}
                    fieldDataKey={fieldDataKey}
                    fieldLabel={fieldLabel}
                    labelPattern=" : "
                    width={330}
                    ddlMinWidth={330}
                    zIndex={1000}
                    returnDefaultValue={true}
                    defaultValue={defaultValue ? defaultValue : ""}
                    queryApi={dataDropDown}
                    onChange={(value, dataObject, inputID, fieldDataKey) => onHandleChangeInput(value, dataObject, field, fieldDataKey, null)}
                    ddlType={typeDropdown}
                /></FormInline>
        } else if (type === "datepicker") {
            return <FormInline> <LabelH>{name} : </LabelH>
                <AmDate
                    id={field}
                    TypeDate={"date"}
                    style={{ width: "330px" }}
                    defaultValue={true}
                    // value={valueInput[field] ? valueInput[field].value : ""}
                    onChange={(value) => onHandleChangeInput(value ? value.fieldDataKey : null, value, field, null, null)}
                    FieldID={"datenow"} >
                </AmDate>
            </FormInline>
        }
    }

    const onHandleClear = () => {
        setValueInput({});
        setResData(null);
        // setReqPost({});
        setNewDataShow(null);
        setInputHeader(null);
        setInputItem(null);
        setDDLWarehouse(null);
        setDDLArea(null);
    }
    const inputClearAll = () => {
        // setReqPost({});
        onClearInput(headerCreate);
        onClearInput(itemCreate);
    }
    const inputClear = () => {
        // setReqPost({});
        onClearInput(itemCreate);
    }
    const onClearInput = (inputCreate) => {
        inputCreate.map((x, i) => {
            // setValueInput({
            // });
            let ele = document.getElementById(x.field);
            if (ele) {
                valueInput[x.field] = x.defaultValue ? x.defaultValue : ""
                ele.value = x.defaultValue ? x.defaultValue : "";
                if (x.field === "scanCode") {
                    ele.focus();
                }
            }
        });
    }
    const TabsRenderer = () => {
        return setVisibleTabMenu.map((x, i) => {
            if (x !== null && x === 'Select') {
                return <Tab key={i} icon={<SearchIcon />} value={0} aria-label="Select" label="Select" className={classes.fontIndi_0} />
            }
            if (x !== null && x === 'Add') {
                return <Tab key={i} icon={<AddIcon />} value={1} aria-label="Add" label="Add" className={classes.fontIndi_1} />
            }
            if (x !== null && x === 'Remove') {
                return <Tab key={i} icon={<RemoveCircleIcon />} value={2} aria-label="Remove" label="Remove" className={classes.fontIndi_2} />
            }
        });
    }
    return (
        <div className={classes.root}>
            {stateDialog ? showDialog ? showDialog : null : null}
            <Paper square className={classes.paper1}>
                <Tabs
                    classes={{ indicator: classnames(classes.bigIndicator, classes['indicator_' + actionValue]) }}
                    value={actionValue}
                    onChange={(event, newValue) => {
                        setActionValue(newValue);
                    }}
                    variant="fullWidth"
                >{TabsRenderer()}</Tabs>
            </Paper>
            <Paper square className={classnames(classes.paper2, classes['paperBG_' + actionValue])}>
                <Card className={classes.card}>
                    <CardContent className={classes.cardContent}>
                        {showWarehouseDDL && showWarehouseDDL.visible ? ddlWarehouse : null}
                        {showAreaDDL && showAreaDDL.visible ? ddlArea : null}
                        {inputHeader ? inputHeader.map((row, idx) => {
                            return row.component(row, idx)
                        }) : null}
                    </CardContent>
                    <Divider style={{ marginTop: 5 }} />
                    <CardContent className={classes.cardContent}>
                        {inputItem ? inputItem.map((row, idx) => {
                            return row.component(row, idx)
                        }) : null}
                    </CardContent>
                    <CardActions>
                        <AmButton styleType="confirm" className={classnames(classes.button)} onClick={onHandleBeforePost}>
                            {'Scan'}
                        </AmButton>
                    </CardActions>
                    {newDataShow ?
                        <CardActions >
                            <label className={classes.titleDetail}>Picking Return Details:</label>
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
                            {newDataShow ? newDataShow : null}
                        </CardContent>
                        <CardActions style={{ justifyContent: 'center' }}>
                            <AmButton styleType="delete_outline" className={classnames(classes.buttonAuto)} onClick={onHandleClear}>
                                {'Clear'}
                            </AmButton>
                        </CardActions>
                    </Collapse>
                </Card>
            </Paper>
        </div>
    );
}
AmPickingReturn.propTypes = {
    classes: PropTypes.object.isRequired,
    headerCreate: PropTypes.array,
    itemCreate: PropTypes.array,
    onBeforePost: PropTypes.func,
    apiCreate: PropTypes.string,
    customOptions: PropTypes.func,
    showOptions: PropTypes.bool,
    chipRenderer: PropTypes.func,
    customConfirmMapSTO: PropTypes.func,
    useMultiSKU: PropTypes.bool,
    setVisibleTabMenu: PropTypes.array,
    showWarehouseDDL: PropTypes.object,
    showAreaDDL: PropTypes.object,
};

AmPickingReturn.defaultProps = {
    apiCreate: "/v2/ScanPickingReturnAPI",
    useMultiSKU: false,
    setVisibleTabMenu: ['Select', 'Add', 'Remove']

}

export default withStyles(styles)(AmPickingReturn);