import React, { useState, useEffect, useRef } from "react";
import classNames from 'classnames';
import CloseIcon from "@material-ui/icons/Close";
import Dialog from "@material-ui/core/Dialog";
import IconButton from "@material-ui/core/IconButton";
import Divider from '@material-ui/core/Divider';
import AmScanQRbyCamera from './AmScanQRbyCamera';
import AmCheckPalletForReceive from './AmCheckPalletForReceive';
import MuiDialogActions from "@material-ui/core/DialogActions";
import MuiDialogContent from "@material-ui/core/DialogContent";
import MuiDialogTitle from "@material-ui/core/DialogTitle";
import useMediaQuery from '@material-ui/core/useMediaQuery';
import { useTheme } from '@material-ui/core/styles';
import AmToolTip from "./AmToolTip";
import PropTypes from "prop-types";
// import SearchIcon from '@material-ui/icons/Search';
import styled from "styled-components";
import Typography from "@material-ui/core/Typography";
// import { useTranslation } from 'react-i18next'
import { withStyles } from "@material-ui/core/styles";
// import Table from "./table/AmTable";
import AmTable from "./AmTable/AmTable";
import AmDropdown from './AmDropdown';
import AmRadioGroup from "./AmRadioGroup";
import AmDialogs from './AmDialogs'
import AmDate from "./AmDate";
import AmAux from "./AmAux";
import AmButton from "./AmButton";
import Chip from '@material-ui/core/Chip';
import AmInput from "./AmInput";
import { apicall, createQueryString, Clone } from "./function/CoreFunction";
import Pagination from "./table/AmPagination";
import { useTranslation } from 'react-i18next'
import ToListTree from './function/ToListTree';
import SvgIcon from '@material-ui/core/SvgIcon';
import PublishIcon from '@material-ui/icons/Publish';
import ListAlt from "@material-ui/icons/ListAlt";
import _ from "lodash";
const Axios = new apicall();


const FormInline = styled.div`

display: flex;
flex-flow: row wrap;
align-items: center;
label {
    margin: 5px 5px 5px 0;
}
input {
    vertical-align: middle;
}
@media (max-width: 800px) {
    flex-direction: column;
    align-items: stretch;
    
  }
`;
// input {
//     margin: 5px 0 0 0;
//   }
const LabelH = styled.label`
font-weight: bold;
  width: 110px;
`;

const InputDiv = styled.div`
    margin: 5px;
    @media (max-width: 800px) {
        margin: 0;
    }
`;

function ReceiveIcon(props) {
    return (
        <SvgIcon>
            <path
                d="M20.54 5.23l-1.39-1.68C18.88 3.21 18.47 3 18 3H6c-.47 0-.88.21-1.16.55L3.46 5.23C3.17 5.57 3 6.02 3 6.5V19c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6.5c0-.48-.17-.93-.46-1.27zM12 17.5L6.5 12H10v-2h4v2h3.5L12 17.5zM5.12 5l.81-1h12l.94 1H5.12z"
            />
        </SvgIcon>
    );
}
const BtnReceive = withStyles(theme => ({

}))(props => {
    const { classes, onHandleClick, ...other } = props;
    return (
        <>
            <AmButton className="float-right" styleType="confirm"
                startIcon={<ReceiveIcon />}
                onClick={onHandleClick}>
                {'Receive'}
            </AmButton>
        </>
    );
});
const IconBtn = withStyles(theme => ({
    iconButton: {
        padding: 2,
    },
    fontSizeSmall: {
        fontSize: 30
    }

}))(props => {
    const { classes, onHandleClick, ...other } = props;
    return (
        <div><AmToolTip title={"List Pallet"} placement={"top"}>
            <IconButton
                className={classes.iconButton}
                onClick={onHandleClick}
                {...other}>
                <ListAlt color="primary" className={classes.fontSizeSmall} />
            </IconButton>
        </AmToolTip>
        </div>
    );
});
const DialogTitle = withStyles(theme => ({
    root: {
        borderBottom: `1px solid ${theme.palette.divider}`,
        margin: 0,
        padding: theme.spacing(0.5)
    },
    closeButton: {
        position: 'absolute',
        right: theme.spacing(0.5),
        top: theme.spacing(0.7),
        color: theme.palette.grey[500],
        padding: "3px"
    }
}))(props => {
    const { children, classes, onClose } = props;
    return (
        <MuiDialogTitle disableTypography className={classes.root}>
            <Typography variant="h6">{children}</Typography>
            {onClose ? (
                <IconButton
                    aria-label="Close"
                    size="small"
                    className={classes.closeButton}
                    onClick={onClose}
                >
                    <CloseIcon fontSize="inherit" />
                </IconButton>
            ) : null}
        </MuiDialogTitle>
    );
});
const DialogContent = withStyles(theme => ({
    root: {
        margin: 0,
        padding: "0 5px 0 5px",
    }
}))(MuiDialogContent);
const DialogActions = withStyles(theme => ({
    root: {
        borderTop: `1px solid ${theme.palette.divider}`,
        margin: 0
    }
}))(MuiDialogActions);

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
const LocationMasterQuery = {
    queryString: window.apipath + "/v2/SelectDataMstAPI/",
    t: "AreaLocationMaster",
    q: '[{ "f": "Status", "c":"=", "v": 1}]',
    f: "*",
    g: "",
    s: "[{'f':'ID','od':'asc'}]",
    sk: 0,
    l: 100,
    all: "",
}
const styles = (theme) => ({
    rootChip: {
        display: 'flex',
        justifyContent: 'left',
        flexWrap: 'wrap',
        '& > *': {
            margin: theme.spacing(0.2),
        },
    },
    leftIcon: {
        marginRight: '',
    },
});
const BtnAddPallet = (props) => {
    const {
        classes,
        dataDocument,
        dataDocItems,
        apiCreate,
        columnsDocItems,
        inputTitle,
        inputHead,
        inputBase,
        // ddlWarehouse,
        ddlArea,
        ddlLocation,
        onSuccessMapping

    } = props;
    const { t } = useTranslation()
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

    const [open, setOpen] = useState(false);
    const [listDocItems, setListDocItems] = useState([]);
    const [dataSelect, setDataSelect] = useState([]);
    const [defaultSelect, setDefaultSelect] = useState([]);

    const [valueQtyDocItems, setValueQtyDocItems] = useState({});
    const [valueInput, setValueInput] = useState({});

    const [inputHeader, setInputHeader] = useState([]);
    const [inputTitles, setInputTitles] = useState([]);
    const [inputBaseCode, setInputBaseCode] = useState(null);

    //dropdown Warehouse, Area 
    // const [WarehouseDDL, setWarehouseDDL] = useState(null);
    const [AreaDDL, setAreaDDL] = useState(null);
    const [LocationDDL, setLocationDDL] = useState(null);
    // const [selWarehouse, setSelWarehouse] = useState(ddlWarehouse && ddlWarehouse.defaultValue ? ddlWarehouse.defaultValue : null);
    const [selArea, setSelArea] = useState(ddlArea && ddlArea.defaultValue ? ddlArea.defaultValue : null);
    const [selLocation, setSelLocation] = useState(null);

    const fileImgRef = useRef();
    const [imgFile, setImgFile] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    //AlertDialog
    const [showDialog, setShowDialog] = useState(null);
    const [stateDialog, setStateDialog] = useState(false);
    const [msgDialog, setMsgDialog] = useState("");
    const [typeDialog, setTypeDialog] = useState("");

    //show info base
    // const [showInfoBase, setShowInfoBase] = useState(null);
    const columns = [
        ...columnsDocItems,
        {
            width: 160, Header: "จำนวนที่ต้องการรับเข้า",
            Cell: e =>
                genInputQty(e.original)
        },

    ];

    useEffect(() => {
        if (dataDocItems && open) {
            let newItems = _.filter(dataDocItems, function (o) { return o._balanceQty > 0; });
            setListDocItems(newItems)
            setDefaultSelect([...newItems]);
            saveDefaultInputQTY(newItems)

        }
    }, [dataDocItems, open]);

    useEffect(() => {
        if (inputTitle) {
            setInputTitles(createComponent(inputTitle));
        }
    }, [inputTitle]);
    useEffect(() => {
        if (inputTitles === null) {
            setInputTitles(createComponent(inputTitle));
        }
    }, [inputTitles]);
    useEffect(() => {
        if (inputHead) {
            setInputHeader(createComponent(inputHead));
        }
    }, [inputHead]);
    useEffect(() => {
        if (inputHeader === null) {
            setInputHeader(createComponent(inputHead));
        }
    }, [inputHeader]);
    useEffect(() => {
        if (inputBase) {
            setInputBaseCode(inputBaseComponent(inputBase));
        }
    }, [inputBase])
    useEffect(() => {
        if (inputBaseCode === null) {
            setInputBaseCode(inputBaseComponent(inputBase));
        }
    }, [inputBaseCode])
    // useEffect(() => {
    //     if (WarehouseDDL === null && ddlWarehouse && ddlWarehouse.visible) {
    //         GetWarehouseDDL();
    //     }
    // }, [WarehouseDDL])
    // useEffect(() => {
    //     if (AreaDDL !== null && ddlArea && ddlArea.visible && selWarehouse) {
    //         GetAreaDDL(selWarehouse)
    //     }
    // }, [selWarehouse])
    useEffect(() => {

        if (AreaDDL == null && ddlArea && ddlArea.visible) {
            // console.log(dataDocument.document.Des_Warehouse_ID);
            GetAreaDDL(dataDocument.document.Des_Warehouse_ID);
        }
    }, [AreaDDL])
    useEffect(() => {
        if (LocationDDL !== null && ddlLocation && ddlLocation.visible) {
            GetLocationDDL(selArea)
        } else if (LocationDDL === null && ddlLocation && ddlLocation.visible) {
            GetLocationDDL(selArea)
        }
    }, [selArea])
    useEffect(() => {
        if (LocationDDL == null && ddlLocation && ddlLocation.visible && selArea) {
            GetLocationDDL(selArea)
        }
    }, [LocationDDL])

    const genInputQty = (datarow) => {
        let field = "item-" + datarow.ID;
        let docItemID = datarow.ID;
        return <AmInput id={field} style={{ width: "100px" }} type="input"
            defaultValue={datarow._balanceQty}
            onChange={(value, obj, element, event) => onHandleChangeInputQTY(value, element, event, docItemID)}
        />
    }
    const saveDefaultInputQTY = (docitems) => {
        let valueQTY = {};
        docitems.forEach(datarow => {
            let field = "item-" + datarow.ID;
            valueQTY = {
                ...valueQTY, [field]: {
                    recQty: datarow._balanceQty,
                    docItemID: datarow.ID
                }
            }
        });
        setValueQtyDocItems(valueQTY);
    }
    const onHandleChangeInputQTY = (value, element, event, docItemID) => {
        setValueQtyDocItems({
            ...valueQtyDocItems, [element.id]: {
                recQty: parseFloat(value),
                docItemID: docItemID
            }
        });

    };

    const onSubmit = () => {
        // console.log(valueQtyDocItems)
        // console.log(valueInput)
        // console.log(dataSelect)

        if (valueInput.areaID === undefined ||
            // valueInput.warehouseID === undefined ||
            valueInput.baseCode === undefined) {
            alertDialogRenderer("กรุณากรอกข้อมูลให้ครบถ้วน", "warning", true);
        } else {

            let docItems = []
            for (let [key, value] of Object.entries(valueQtyDocItems)) {
                let checkselect = _.filter(dataSelect, _.matches({ 'ID': value.docItemID }))
                if (checkselect && checkselect.length > 0) {
                    docItems.push({ ID: value.docItemID, Quantity: parseFloat(value.recQty) })
                }
            }
            if (docItems.length === 0) {
                alertDialogRenderer("กรุณาเลือกรายการสินค้า และระบุจำนวนที่ต้องการรับเข้า", "warning", true);

            } else {
                let tempDataReq = {
                    ...valueInput,
                    docID: dataDocument.document.ID,
                    docItems: docItems,
                    warehouseID: dataDocument.document.Des_Warehouse_ID
                }
                console.log(tempDataReq)
                Axios.post(window.apipath + apiCreate, tempDataReq).then((res) => {
                    if (res.data != null) {
                        if (res.data._result.status === 1) {
                            alertDialogRenderer("สร้างพาเลทสินค้าสำเร็จ", "success", true);
                            onHandleClear();

                            setOpen(false);
                            onSuccessMapping()
                        } else {
                            alertDialogRenderer(res.data._result.message, "error", true);
                        }
                    } else {
                        alertDialogRenderer(res.data._result.message, "error", true);
                    }
                });
            }

        }
    }

    // async function GetWarehouseDDL() {
    //     let newWarehouseQueryStr = Clone(WarehouseQuery);
    //     if (ddlWarehouse.customQ !== undefined) {
    //         newWarehouseQueryStr.q = "[{ 'f': 'Status', c:'=', 'v': 1}," + ddlWarehouse.customQ + "]";
    //     }
    //     await Axios.get(createQueryString(newWarehouseQueryStr)).then(res => {
    //         if (res.data.datas) {
    //             setWarehouseDDL(inputDDLComponent(ddlWarehouse, res.data.datas))
    //         }
    //     });
    // }
    async function GetAreaDDL(selWarehouseID, selAreaID) {
        let newAreaQueryStr = Clone(AreaMasterQuery);
        if (selWarehouseID) {
            if (ddlArea.customQ !== undefined) {
                newAreaQueryStr.q = "[{ 'f': 'Status', c:'=', 'v': 1},{ 'f': 'Warehouse_ID', c:'=', 'v': " + selWarehouseID + "}," + ddlArea.customQ + "]";
            } else {
                newAreaQueryStr.q = "[{ 'f': 'Status', c:'=', 'v': 1},{ 'f': 'Warehouse_ID', c:'=', 'v': " + selWarehouseID + "}]";
            }
        } else {
            if (ddlArea.customQ !== undefined) {
                newAreaQueryStr.q = "[{ 'f': 'Status', c:'=', 'v': 1}," + ddlArea.customQ + "]";
            }
        }
        await Axios.get(createQueryString(newAreaQueryStr)).then(res => {
            if (res.data.datas) {
                setAreaDDL(inputDDLComponent(ddlArea, res.data.datas, selAreaID))
                if (res.data.datas.length === 0) {
                    setSelArea(null)
                    valueInput['areaID'] = null;
                }
            }
        });
    }
    async function GetLocationDDL(selAreaID, selLocationID) {
        let newLocationQueryStr = Clone(LocationMasterQuery);
        if (selAreaID) {
            if (ddlLocation.customQ !== undefined) {
                newLocationQueryStr.q = "[{ 'f': 'Status', c:'=', 'v': 1},{ 'f': 'AreaMaster_ID', c:'=', 'v': " + selAreaID + "}," + ddlLocation.customQ + "]";
            } else {
                newLocationQueryStr.q = "[{ 'f': 'Status', c:'=', 'v': 1},{ 'f': 'AreaMaster_ID', c:'=', 'v': " + selAreaID + "}]";
            }
            await Axios.get(createQueryString(newLocationQueryStr)).then(res => {
                if (res.data.datas) {
                    setLocationDDL(inputDDLComponent(ddlLocation, res.data.datas, selLocationID))
                }
            });
        } else {
            // console.log("set location null")
            setLocationDDL(inputDDLComponent(ddlLocation, [], null));
            valueInput['locationID'] = null;
        }
        // else {
        //     if (ddlLocation.customQ !== undefined) {
        //         newLocationQueryStr.q = "[{ 'f': 'Status', c:'=', 'v': 1}," + ddlLocation.customQ + "]";
        //     } else {
        //         newLocationQueryStr.q = "[{ 'f': 'Status', c:'=', 'v': 1}]";
        //     }
        // }
        // await Axios.get(createQueryString(newLocationQueryStr)).then(res => {
        //     if (res.data.datas) {
        //         setLocationDDL(inputDDLComponent(ddlLocation, res.data.datas))
        //     }
        // });
    }

    const inputDDLComponent = (showComponent, Query, valueDef) => {
        console.log(valueDef)
        if (showComponent.visible) {
            return <FormInline><LabelH>{t(showComponent.name)} : </LabelH>
                <AmDropdown
                    id={showComponent.field}
                    required={showComponent.required}
                    placeholder={showComponent.placeholder}
                    fieldDataKey={showComponent.fieldDataKey}
                    fieldLabel={showComponent.fieldLabel}
                    labelPattern=" : "
                    width={330}
                    ddlMinWidth={330}
                    zIndex={9999}
                    returnDefaultValue={true}
                    autoDefaultValue={valueDef != undefined ? false : true}
                    // value={valueDef ? valueDef : null}
                    defaultValue={valueDef != undefined ? valueDef : showComponent.defaultValue ? showComponent.defaultValue : null}
                    data={Query}
                    onChange={(value, dataObject, inputID, fieldDataKey) => onHandleChangeInput(value, dataObject, showComponent.field, fieldDataKey, null)}
                    ddlType={showComponent.typeDropdown}
                />
            </FormInline>
        } else {
            return null;
        }
    }
    const inputBaseComponent = (showComponent) => {
        if (showComponent.visible) {
            return <FormInline><LabelH>{t(showComponent.name)} : </LabelH>
                <div style={{ display: 'inline-flex', alignItems: 'center' }} >
                    <AmInput
                        id={showComponent.field}
                        required={showComponent.required}
                        regExp={showComponent.validate}
                        validate={showComponent.validate != null ? true : false}
                        disabled={showComponent.disabled}
                        autoFocus={showComponent.isFocus}
                        placeholder={showComponent.placeholder}
                        type={showComponent.type}
                        style={{ width: "330px" }}
                        inputProps={showComponent.maxLength ? {
                            maxLength: showComponent.maxLength,
                        } : {}}
                        defaultValue={valueInput && valueInput[showComponent.field] ?
                            showComponent.clearInput ? "" : valueInput[showComponent.field] : showComponent.defaultValue ? showComponent.defaultValue : ""}
                        // onKeyPress={(value, obj, element, event) => onHandleChangeInput(value, null, field, null, event)}
                        onBlur={(value, obj, element, event) => onHandleChangeInputBlur(value, null, showComponent.field, null, event)}
                    //onChangeV2={(value, obj, element, event) => onHandleChangeInput(value, null, field, null, event)}
                    />
                     
                    <AmCheckPalletForReceive dataDocument={dataDocument.document} returnResult={(data) => showPalletSelect(data, showComponent.field)} />
                    <AmScanQRbyCamera returnResult={(data) => showRes(data, showComponent.field)} />
                </div>
            </FormInline>
        } else {
            return null;
        }
    } 
    const showRes = (data, field) => {
        if (data) {
            let ele = document.getElementById(field);
            if (ele) {
                ele.value = data;
                ele.focus();
            }
        }
    }
    const showPalletSelect = (data, field) => {
        if (data) {
            renderNewDropdown(data.AreaID, data.LocationID);
            let PalletCode = data.Pallet;

            let ele = document.getElementById(field);
            if (ele) {
                ele.value = PalletCode;
                ele.focus();
            }
        }


    }
    const renderNewDropdown = (areaID, locationID) => {
        if (areaID) {
            valueInput['areaID'] = areaID;
            GetAreaDDL(null, areaID)
        }
        if (locationID) {
            valueInput['locationID'] = locationID;
            GetLocationDDL(null, locationID)
        }
    }
    const createComponent = (inputList) => {
        if (inputList)
            return inputList.map(x => {
                return {
                    "field": x.field,
                    "component": (cols, key) => {
                        return <div key={key} >
                            {FuncCreateForm(key, x.field, x.type, x.name,
                                x.fieldLabel, x.placeholder,
                                x.dataDropDown, x.typeDropdown, x.labelTitle, x.fieldDataKey,
                                x.defaultValue, x.visible == null || undefined ? true : x.visible,
                                x.disabled, x.isFocus, x.maxLength, x.required, x.clearInput, x.validate, x.customShow)}
                        </div>
                    }
                }
            })
    };

    const FuncCreateForm = (key, field, type, name,
        fieldLabel, placeholder,
        dataDropDown, typeDropdown, labelTitle, fieldDataKey, defaultValue, visible, disabled, isFocus,
        maxLength, required, clearInput, validate, customShow) => {
        if (type === "input") {
            return (
                <FormInline><LabelH>{t(name)} : </LabelH>
                    <div style={{ display: 'inline-flex', alignItems: 'center' }} >
                        <AmInput
                            id={field}
                            required={required}
                            regExp={validate}
                            validate={true}
                            disabled={disabled}
                            autoFocus={isFocus}
                            placeholder={placeholder}
                            type="input"
                            style={{ width: "330px" }}
                            inputProps={maxLength ? {
                                maxLength: maxLength,
                            } : {}}
                            defaultValue={valueInput && valueInput[field] ? clearInput ? "" : valueInput[field] : defaultValue ? defaultValue : ""}
                            // onKeyPress={(value, obj, element, event) => onHandleChangeInput(value, null, field, null, event)}
                            onBlur={(value, obj, element, event) => onHandleChangeInputBlur(value, null, field, null, event)}
                        //onChangeV2={(value, obj, element, event) => onHandleChangeInput(value, null, field, null, event)}

                        />
                    </div>
                </FormInline>
            )
        } else if (type === "number") {
            return (
                <FormInline><LabelH>{t(name)} : </LabelH>
                    <div style={{ display: 'inline-flex', alignItems: 'center' }} >
                        <AmInput
                            id={field}
                            required={required}
                            disabled={disabled}
                            placeholder={placeholder}
                            type="number"
                            style={{ width: "330px" }}
                            defaultValue={valueInput && valueInput[field] ? clearInput ? "" : valueInput[field] : defaultValue ? defaultValue : ""}
                            onChangeV2={(value, obj, element, event) => onHandleChangeInput(value, null, field, null, event)}
                            onBlur={(value, obj, element, event) => onHandleChangeInputBlur(value, null, field, null, event)}
                        /></div>
                </FormInline>
            )
        }
        else if (type === "dropdown") {
            return <FormInline><LabelH>{t(name)} : </LabelH>
                <AmDropdown
                    id={field}
                    disabled={disabled}
                    required={required}
                    placeholder={placeholder}
                    fieldDataKey={fieldDataKey}
                    fieldLabel={fieldLabel}
                    labelPattern={fieldLabel.length > 1 ? " : " : null}
                    width={335}
                    ddlMinWidth={335}
                    zIndex={1000}
                    returnDefaultValue={true}
                    defaultValue={valueInput && valueInput[field] != undefined ? valueInput[field] : defaultValue ? defaultValue : ""}
                    queryApi={dataDropDown}
                    onChange={(value, dataObject, inputID, fieldDataKey) => onHandleChangeInput(value, dataObject, field, fieldDataKey, null)}
                    ddlType={typeDropdown}
                /></FormInline>
        } else if (type === "datepicker") {
            return <FormInline> <LabelH>{t(name)} : </LabelH>
                <AmDate
                    id={field}
                    TypeDate={"date"}
                    style={{ width: "330px" }}
                    defaultValue={true}
                    // value={valueInput[field] ? valueInput[field].value : ""}
                    onChange={(value) => onHandleChangeInput(value['fieldDataKey'], value, field, null, null)}
                    FieldID={"datenow"} >
                </AmDate>
            </FormInline>
        } else if (type === "datetimepicker") {
            return <FormInline> <LabelH>{t(name)} : </LabelH>
                <AmDate
                    id={field}
                    TypeDate={"datetime-local"}
                    style={{ width: "330px" }}
                    defaultValue={true}
                    // value={valueInput[field] ? valueInput[field].value : ""}
                    onChange={(value) => onHandleChangeInput(value['fieldDataKey'], value, field, null, null)}
                    FieldID={"datetimenow"} >
                </AmDate>
            </FormInline>
        } else if (type === "radiogroup") {
            if (visible) {
                let valRad = defaultValue ? Clone(defaultValue) : {};
                if (valueInput && valueInput[field]) {
                    valRad.value = valueInput[field].toString()
                }
                return <FormInline> <LabelH>{t(name)} : </LabelH>
                    <AmRadioGroup
                        row={true}
                        name={field}
                        dataValue={fieldLabel}
                        returnDefaultValue={true}
                        defaultValue={valRad ? valRad : {}}
                        onChange={(value, obj, element, event) =>
                            onHandleChangeRadio(value, field)
                        }
                    />
                </FormInline>
            } else {
                onHandleChangeRadio(defaultValue.value, field)
            }

        } else if (type === "text") {
            if (customShow) {
                var returnVal = customShow(dataDocument);
            }
            return <FormInline> <LabelH>{t(name)} : </LabelH>
                <div >
                    <label style={{ width: "330px" }}>{returnVal}</label>
                </div></FormInline>
        }
    }
    const onHandleChangeInput = (value, dataObject, field, fieldDataKey, event) => {
        valueInput[field] = value;
        // if (field === "warehouseID") {
        //     setSelWarehouse(value);
        // }
        if (field === "areaID") {
            setSelArea(value);
        }
    };
    const onHandleChangeInputBlur = (value, dataObject, field, fieldDataKey, event) => {
        valueInput[field] = value;
        
    }; 
    const findPack = (storageObj) => {
        var mapstosToTree = ToListTree(storageObj, 'mapstos');
        var findpacks = _.filter(mapstosToTree, function (o) { return o.type === 2; });
        return findpacks;
    }
    const onHandleChangeRadio = (value, field) => {
        valueInput[field] = parseInt(value, 10);
    }
    const handleClose = () => {
        onHandleClear();
        setOpen(false);
    };
    const onHandleClear = () => {
        console.log("clear")
        setListDocItems([]);
        setValueInput({});
        setValueQtyDocItems({});
        // setWarehouseDDL(null);
        setAreaDDL(null);
        setLocationDDL(null);
        setInputTitles(null);
        setInputHeader(null);
        setInputBaseCode(null);
        // setShowInfoBase(null);
        setDataSelect([]);
        setDefaultSelect([]);
        setImgFile(null);
        setImageFile(null);
    };
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

    async function onUploadFile() {
        // console.log(imageFile)
        // console.log(fileImgRef.current.value)
        // console.log(imageFile.size);

        let fileBase64 = await toBase64(imageFile)
        if (valueInput.baseCode) {
            let filejson = {
                fileName: valueInput.baseCode,
                imageBase64: fileBase64
            }
            await Axios.post(window.apipath + "/v2/upload_image/", filejson).then(res => {
                if (res.data._result.status === 1) {
                    alertDialogRenderer("อัพโหลดไฟล์รูปภาพ " + res.data.fileName + " สำเร็จ", "success", true);
                } else {
                    alertDialogRenderer(res.data._result.message, "error", true);
                }
            });
        } else {
            alertDialogRenderer("กรุณากรอกหมายเลขพาเลท", "warning", true);
        }
    }
    const toBase64 = file => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
    const handleFileChange = (event) => {
        if (event.target.files[0]) {
            setImgFile(URL.createObjectURL(event.target.files[0]))
            setImageFile(event.target.files[0])
        } else {
            console.log("nofile");
            setImgFile(null)
            setImageFile(null)
        }
    }
    return (

        <AmAux>
            {stateDialog ? showDialog ? showDialog : null : null}

            <BtnReceive onHandleClick={() => setOpen(true)} />
            <Dialog
                fullScreen={fullScreen}
                aria-labelledby="addpallet-dialog-title"
                onClose={handleClose}
                open={open}
                maxWidth="xl"
            >
                <DialogTitle
                    id="addpallet-dialog-title"
                    onClose={handleClose}>
                    {"Receive Pallet"}
                </DialogTitle>
                <DialogContent>
                    {inputTitles && inputTitles.length > 0 ? inputTitles.map((row, idx) => {
                        return row.component(row, idx)
                    }) : null}
                    {/* {ddlWarehouse && ddlWarehouse.visible ? WarehouseDDL : null} */}

                    {inputBase && inputBase.visible ? inputBaseCode : null}
                    {ddlArea && ddlArea.visible ? AreaDDL : null}
                    {ddlLocation && ddlLocation.visible ? LocationDDL : null}
                    {/* {showInfoBase} */}
                    {inputHeader && inputHeader.length > 0 ? inputHeader.map((row, idx) => {
                        return row.component(row, idx)
                    }) : null}
                    <FormInline><LabelH><label htmlFor="img">{t('Select Image')} : </label></LabelH>
                        <div style={{ display: 'inline-flex', alignItems: 'center' }} >
                            <input ref={fileImgRef} type="file" id="img" name="formFile"
                                accept="image/*" style={{ maxWidth: "230px" }}
                                onChange={(e) => handleFileChange(e)}
                            />
                            {/* <input type="submit" onClick={onUploadFile} /> */}
                            <AmButton styleType="confirm_outline"
                                startIcon={<PublishIcon size="small" className={classNames(classes.leftIcon)} />}
                                onClick={onUploadFile} >Upload</AmButton>
                        </div>
                    </FormInline>
                    {imgFile ? <div style={{ margin: "5px 0px" }}><img src={imgFile} height='150' /></div> : null}
                    <Divider style={{ marginTop: '5px', marginBottom: '5px' }} />
                    <AmTable
                        columns={columns}
                        dataKey={"ID"}
                        dataSource={listDocItems}
                        selectionDefault={defaultSelect}
                        selection="checkbox"
                        selectionData={data => setDataSelect(data)}
                        rowNumber={true}
                        //  totalSize={count}
                        pageSize={100}
                    //  height={500}
                    />
                </DialogContent>
                <DialogActions>
                    <AmButton styleType="add" onClick={onSubmit} >Add</AmButton>
                    <AmButton styleType='delete' onClick={handleClose} >Cancel</AmButton>
                </DialogActions>
            </Dialog>
        </AmAux>
    );
}
BtnAddPallet.propTypes = {
    onSuccessMapping: PropTypes.func.isRequired,
    apiCreate: PropTypes.string,
    columnsDocItems: PropTypes.array,
};
BtnAddPallet.defaultProps = {
    apiCreate: "/v2/ScanMapStoFromDocAPI",
    columnsDocItems: [{ accessor: "SKUMaster_Name", Header: "Item Code" },
    { width: 130, accessor: "Lot", Header: "Lot" },
    // { width: 100, accessor: "Quantity", Header: "Qty" },
    { width: 150, accessor: "_balanceQty", Header: "จำนวนที่รับเข้าได้" },
    { width: 70, accessor: "UnitType_Code", Header: "Unit" }]
}
export default withStyles(styles)(BtnAddPallet);