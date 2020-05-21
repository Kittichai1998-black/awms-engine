import CloseIcon from "@material-ui/icons/Close";
import Dialog from "@material-ui/core/Dialog";
import IconButton from "@material-ui/core/IconButton";
import Divider from '@material-ui/core/Divider';
// import InputAdornment from '@material-ui/core/InputAdornment';
import MuiDialogActions from "@material-ui/core/DialogActions";
import MuiDialogContent from "@material-ui/core/DialogContent";
import MuiDialogTitle from "@material-ui/core/DialogTitle";
import PropTypes from "prop-types";
import React, { useState, useEffect, useRef } from "react";
// import SearchIcon from '@material-ui/icons/Search';
import styled from "styled-components";
import Typography from "@material-ui/core/Typography";
// import { useTranslation } from 'react-i18next'
import { withStyles } from "@material-ui/core/styles";
import Table from "./table/AmTable";
import AmDropdown from './AmDropdown';
import AmRadioGroup from "./AmRadioGroup";
import AmDialogs from './AmDialogs'
import AmDate from "./AmDate";
import AmAux from "./AmAux";
import AmButton from "./AmButton";
import AmInput from "./AmInput";
import { apicall, createQueryString, Clone } from "./function/CoreFunction";
import Pagination from "./table/AmPagination";
import { useTranslation } from 'react-i18next'
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
  width: 100px;
`;

const InputDiv = styled.div`
    margin: 5px;
    @media (max-width: 800px) {
        margin: 0;
    }
`;
const DialogTitle = withStyles(theme => ({
    root: {
        borderBottom: `1px solid ${theme.palette.divider}`,
        margin: 0,
        padding: theme.spacing(1)
    },
    closeButton: {
        position: "absolute",
        right: theme.spacing(1),
        top: theme.spacing(1),
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
const BtnAddPallet = (props) => {
    const {
        classes,
        dataDocument,
        dataDocItems,
        apiCreate,
        columnsDocItems,
        inputHead,
        ddlWarehouse,
        ddlArea,
        dataCheck,
        onSuccessMapping

    } = props;
    const { t } = useTranslation()

    const [open, setOpen] = useState(false); 
    const [listDocItems, setListDocItems] = useState([]);
    const [dataSelect, setDataSelect] = useState([]);
    const [valueQtyDocItems, setValueQtyDocItems] = useState({});
    const [valueInput, setValueInput] = useState({});

    const [inputHeader, setInputHeader] = useState([]);

    //dropdown Warehouse, Area 
    const [WarehouseDDL, setWarehouseDDL] = useState(null);
    const [AreaDDL, setAreaDDL] = useState(null);
    const [selWarehouse, setSelWarehouse] = useState(ddlWarehouse && ddlWarehouse.defaultValue ? ddlWarehouse.defaultValue : null);

    //AlertDialog
    const [showDialog, setShowDialog] = useState(null);
    const [stateDialog, setStateDialog] = useState(false);
    const [msgDialog, setMsgDialog] = useState("");
    const [typeDialog, setTypeDialog] = useState("");


    useEffect(() => {
        if(dataDocItems){
            let newItems = _.filter(dataDocItems, function(o) { return o._balanceQty > 0; });
            setListDocItems(newItems)
        }
    }, [dataDocItems]);

    const columns = [
        ...columnsDocItems,
        {
            width: 160, Header: "จำนวนที่ต้องการรับเข้า", Cell: e =>
                genInputQty(e.original)
        },

    ];


    const genInputQty = (datarow) => {
        let field = "item-" + datarow.ID;
        let docItemID = datarow.ID;
        return <AmInput id={field} style={{ width: "100px" }} type="input"
            onChange={(value, obj, element, event) => onHandleChangeInputQTY(value, element, event, docItemID)}
        />
    }
    const onHandleChangeInputQTY = (value, element, event, docItemID) => {

        setValueQtyDocItems({
            ...valueQtyDocItems, [element.id]: {
                recQty: value,
                docItemID: docItemID
            }
        });

    };
    const onSubmit = (data) => {
        // console.log(valueQtyDocItems)
        // console.log(valueInput)

        if (valueInput.areaID === undefined ||
            valueInput.warehouseID === undefined ||
            valueInput.baseCode === undefined) {
            alertDialogRenderer("กรุณากรอกข้อมูลให้ครบถ้วน", "warning", true);
        } else {

            let docItems = []
            for (let [key, value] of Object.entries(valueQtyDocItems)) {
                docItems.push({ ID: value.docItemID, Quantity: parseFloat(value.recQty) })
            }
            if (docItems.length === 0) {
                alertDialogRenderer("กรุณาเลือกรายการสินค้า และระบุจำนวนที่ต้องการรับเข้า", "warning", true);

            } else {
                const tempDataReq = {
                    docID: dataDocument.document.ID,
                    baseCode: valueInput.baseCode,
                    docItems: docItems,
                    warehouseID: valueInput.warehouseID,
                    areaID: valueInput.areaID
                }
                console.log(tempDataReq)
                Axios.post(window.apipath + apiCreate, tempDataReq).then((res) => {
                    if (res.data != null) {
                        if (res.data._result.status === 1) {
                            alertDialogRenderer("สร้างพาเลทสินค้าสำเร็จ", "success", true);
                            onHandleClear();

                            setOpen(false);
                            onSuccessMapping(dataSelect)
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
        if (WarehouseDDL === null && ddlWarehouse && ddlWarehouse.visible) {
            GetWarehouseDDL();
        }
    }, [WarehouseDDL])
    useEffect(() => {
        if (AreaDDL !== null && ddlArea && ddlArea.visible && selWarehouse) {
            GetAreaDDL(selWarehouse)
        }
    }, [selWarehouse])
    useEffect(() => {
        if (AreaDDL == null && ddlArea && ddlArea.visible && selWarehouse) {
            GetAreaDDL(selWarehouse)
        }
    }, [AreaDDL])

    async function GetWarehouseDDL() {
        let newWarehouseQueryStr = Clone(WarehouseQuery);
        if (ddlWarehouse.customQ !== undefined) {
            newWarehouseQueryStr.q = "[{ 'f': 'Status', c:'=', 'v': 1}," + ddlWarehouse.customQ + "]";
        }
        await Axios.get(createQueryString(newWarehouseQueryStr)).then(res => {
            if (res.data.datas) {
                setWarehouseDDL(inputDDLComponent(ddlWarehouse, res.data.datas))
            }
        });
    }
    async function GetAreaDDL(selWarehouseID) {
        let newAreaQueryStr = Clone(AreaMasterQuery);
        if (selWarehouseID) {
            if (ddlArea.customQ !== undefined) {
                newAreaQueryStr.q = "[{ 'f': 'Status', c:'=', 'v': 1},{ 'f': 'Warehouse_ID', c:'=', 'v': " + selWarehouseID + "}," + ddlArea.customQ + "]";
            } else {
                newAreaQueryStr.q = "[{ 'f': 'Status', c:'=', 'v': 1},{ 'f': 'Warehouse_ID', c:'=', 'v': " + selWarehouseID + "}]";
            }
        }
        await Axios.get(createQueryString(newAreaQueryStr)).then(res => {
            if (res.data.datas) {
                setAreaDDL(inputDDLComponent(ddlArea, res.data.datas))
            }
        });
    }

    const inputDDLComponent = (showComponent, Query) => {
        if (showComponent.visible) {
            return <FormInline><LabelH>{t(showComponent.name)} : </LabelH>
                <AmDropdown
                    id={showComponent.field}
                    required={true}
                    placeholder={showComponent.placeholder}
                    fieldDataKey={showComponent.fieldDataKey}
                    fieldLabel={showComponent.fieldLabel}
                    labelPattern=" : "
                    width={330}
                    ddlMinWidth={330}
                    zIndex={9999}
                    returnDefaultValue={true}
                    defaultValue={valueInput && valueInput[showComponent.field] ? valueInput[showComponent.field] : showComponent.defaultValue ? showComponent.defaultValue : ""}
                    data={Query}
                    onChange={(value, dataObject, inputID, fieldDataKey) => onHandleChangeInput(value, dataObject, showComponent.field, fieldDataKey, null)}
                    ddlType={showComponent.typeDropdown}
                />
            </FormInline>
        } else {
            return null;
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
                                x.dataDropDown, x.typeDropdown, x.labelTitle, x.fieldDataKey,
                                x.defaultValue, x.visible == null || undefined ? true : x.visible,
                                x.disabled, x.isFocus, x.maxLength, x.required, x.clearInput, x.validate)}
                        </div>
                    }
                }
            })
    };

    const FuncCreateForm = (key, field, type, name,
        fieldLabel, placeholder,
        dataDropDown, typeDropdown, labelTitle, fieldDataKey, defaultValue, visible, disabled, isFocus, maxLength, required, clearInput, validate) => {
        if (type === "input") {
            return (
                <FormInline><LabelH>{t(name)} : </LabelH>
                    <div style={{ display: 'inline-flex', width: "330px", alignItems: 'center' }} >
                        <AmInput
                            id={field}
                            required={required}
                            regExp={validate}
                            validate={true}
                            disabled={disabled}
                            autoFocus={isFocus}
                            placeholder={placeholder}
                            type="input"
                            style={{ width: "100%" }}
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

        }
    }
    const onHandleChangeInput = (value, dataObject, field, fieldDataKey, event) => {
        valueInput[field] = value;
        if (field === "warehouseID") {
            setSelWarehouse(value);
        }
        console.log(valueInput)
    };
    const onHandleChangeInputBlur = (value, dataObject, field, fieldDataKey, event) => {
        valueInput[field] = value;
    };
    const onHandleChangeRadio = (value, field) => {
        valueInput[field] = parseInt(value, 10);
    }
    const onHandleClear = () => {
        setValueInput({});
        setValueQtyDocItems({});
        setWarehouseDDL(null);
        setAreaDDL(null);
        setInputHeader(null);
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
    return (

        <AmAux>
            {stateDialog ? showDialog ? showDialog : null : null}

            <AmButton className="float-right" styleType="confirm" onClick={() => setOpen(true)} >{"Add Pallet"}</AmButton>
            <Dialog
                aria-labelledby="addpallet-dialog-title"
                onClose={() => setOpen(false)}
                open={open}
                maxWidth="xl"
            >
                <DialogTitle
                    id="addpallet-dialog-title"
                    onClose={() => setOpen(false)}>
                    {"Add Pallet and Mapping Storage Object"}
                </DialogTitle>
                <DialogContent>
                    {ddlWarehouse && ddlWarehouse.visible ? WarehouseDDL : null}
                    {ddlArea && ddlArea.visible ? AreaDDL : null}
                    {inputHeader && inputHeader.length > 0 ? inputHeader.map((row, idx) => {
                        return row.component(row, idx)
                    }) : null}
                    <Divider style={{ marginTop: '5px', marginBottom: '5px' }} />
                    <Table
                        columns={columns}
                        pageSize={100}
                        data={listDocItems}
                        sortable={false}
                        selectionType="checkbox"
                        selection={true}
                        primaryKey="ID"
                        getSelection={data => setDataSelect(data)}
                    />
                </DialogContent>
                <DialogActions>
                    <AmButton
                        styleType="add"
                        onClick={() => {
                            onSubmit(dataSelect);
                        }}
                    >Add</AmButton>
                </DialogActions>
            </Dialog>
        </AmAux>
    );
}
BtnAddPallet.propTypes = {
    // onSubmit: PropTypes.func.isRequired,
    apiCreate: PropTypes.string,
    columnsDocItems: PropTypes.array,
};
BtnAddPallet.defaultProps = {
    apiCreate: "/v2/ScanMapStoFromDocAPI",
    columnsDocItems: [{ width: 200, accessor: "SKUMaster_Name", Header: "Item Code" },
    { width: 130, accessor: "Lot", Header: "Lot" },
    // { width: 100, accessor: "Quantity", Header: "Qty" },
    { width: 150, accessor: "_balanceQty", Header: "จำนวนที่รับเข้าได้" },
    { width: 70, accessor: "UnitType_Name", Header: "Unit" }]
}
export default BtnAddPallet;