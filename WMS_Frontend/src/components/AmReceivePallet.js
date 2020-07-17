import React, { useState, useEffect, useRef, useMemo } from "react";
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
import ListAlt from '@material-ui/icons/ListAlt';
import DeleteForever from '@material-ui/icons/DeleteForever';
import _ from "lodash";
import PhotoCamera from '@material-ui/icons/PhotoCamera';
const Axios = new apicall();

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
    input: {
        display: 'none',
    },
    label_head: {
        fontWeight: 'bold',
        width: '110px'
    },
    fontSizeSmall: {
        fontSize: 30
    }
});
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
const LabelH = styled.label`
    font-weight: bold;
    width: 110px;
`;
const IconBtn = withStyles(theme => ({
    iconButton: {
        padding: 2,
    },
    fontSizeSmall: {
        fontSize: 30
    }

}))(props => {
    const { classes, title, onHandleClick, children, ...other } = props;
    return (
        <div><AmToolTip title={title} placement={"top"}>
            <IconButton
                className={classes.iconButton}
                onClick={onHandleClick}
                {...other}>
                {children}
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

const AreaMasterQuery = {
    queryString: window.apipath + "/v2/SelectDataMstAPI/",
    t: "AreaMaster",
    q: '[{ "f": "Status", "c":"=", "v": 1},{ "f": "AreaMasterType_ID", "c":"in", "v": "30"}]',
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

function TitleContent(open, settingField, dataDoc) {
    if (open && settingField && settingField.length > 0) {
        return settingField.map((x, i) => {
            let returnVal = "";
            if (x.customShow) {
                returnVal = x.customShow(dataDoc);
            }
            return <FormInline key={i}>
                <LabelH>{x.name} : </LabelH>
                <label style={{ width: "330px" }}>{returnVal}</label>
            </FormInline>
        });
    }

}
function PalletContent(open, settingPallet, valueInput, onHandleChangeInput) {
    if (open && settingPallet && settingPallet.visible) {
        return <FormInline>
            <LabelH>{settingPallet.name} : </LabelH>

            <AmInput
                id={settingPallet.field}
                required={true}
                regExp={/^.+$/}
                validate={true}
                placeholder={settingPallet.placeholder}
                type={"input"}
                style={{ width: "330px" }}
                inputProps={settingPallet.maxLength ? {
                    maxLength: settingPallet.maxLength,
                } : {}}
                defaultValue={valueInput && valueInput[settingPallet.field] ?
                    valueInput[settingPallet.field] : settingPallet.defaultValue ? settingPallet.defaultValue : ""}
                onBlur={(value, obj, element, event) => onHandleChangeInput(value, null, settingPallet.field, null, event)}
            />

        </FormInline>
    }
}

function ListPalletDialog(open, close, dataDocument, onSelectPallet, handleError) {
    if (open && dataDocument) {
        return <AmCheckPalletForReceive
            open={open}
            close={(val) => close(val)}
            dataDocument={dataDocument.document}
            onError={(show, type, msg) => handleError(show, type, msg)}
            returnResult={(sel) => onSelectPallet(sel)}
        />
    }
}

function AreaDDLContent(open, settingAreaDDL, dataSrc, areaSel, onHandleChangeInput) {
    if (open && settingAreaDDL && settingAreaDDL.visible && dataSrc.length > 0) {
        return RenderDDLComponent(settingAreaDDL, dataSrc, areaSel, onHandleChangeInput)
    }
}
function AreaLocationDDLContent(open, settingLocDDL, dataSrc, locSel, onHandleChangeInput) {
    if (open && settingLocDDL && settingLocDDL.visible && dataSrc.length > 0) {
        return RenderDDLComponent(settingLocDDL, dataSrc, locSel, onHandleChangeInput)
    }
}
function RenderDDLComponent(setting, data, selectVal, onHandleChangeInput) {
    if (setting.visible) {
        return <FormInline><LabelH>{setting.name} : </LabelH>
            <AmDropdown
                id={setting.field}
                required={setting.required}
                placeholder={setting.placeholder}
                fieldDataKey={setting.fieldDataKey}
                fieldLabel={setting.fieldLabel}
                labelPattern=" : "
                width={330}
                ddlMinWidth={330}
                zIndex={9999}
                returnDefaultValue={true}
                autoDefaultValue={selectVal == undefined ? true : false}
                defaultValue={selectVal == undefined ? setting.defaultValue ? setting.defaultValue : selectVal : null}
                data={data}
                onChange={(value, dataObject, inputID, fieldDataKey) => onHandleChangeInput(value, dataObject, setting.field, fieldDataKey, null)}
                ddlType={setting.typeDropdown}
            />
        </FormInline>
    } else {
        return null;
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
const AmReceivePallet = (props) => {
    const {
        classes,
        setting,
        onConfirm,
        dataDocument,
        dataDocItems,
        open,
        close
    } = props;
    const { t } = useTranslation()
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
    const apiCreate = "/v2/ScanMapStoFromDocAPI";
    const [valueQtyDocItems, setValueQtyDocItems] = useState({});
    const [valueInput, setValueInput] = useState({});
    const [dataSelect, setDataSelect] = useState([]);
    const [dataTable, setDataTable] = useState(null);

    const [dataSrcArea, setDataSrcArea] = useState([]);
    const [dataSrcLocation, setDataSrcLocation] = useState([]);

    const [areaSel, setAreaSel] = useState(null);
    const [locationSel, setLocationSel] = useState(null);
    const [openDialogPallet, setOpenDialogPallet] = useState(false);

    const [openAlert, setOpenAlert] = useState(false);
    const [settingAlert, setSettingAlert] = useState(null);

    const [imgFile, setImgFile] = useState(null)
    const [btnUpload, setBtnUpload] = useState(true)

    let columns = [
        { accessor: "SKUMaster_Name", Header: "Item Code" },
        { width: 130, accessor: "Lot", Header: "Lot" },
        { width: 150, accessor: "_balanceQty", Header: "จำนวนที่รับเข้าได้" },
        {
            width: 160, Header: "จำนวนที่ต้องการรับเข้า",
            Cell: e => genInputQty(e.original)
        },
        { width: 70, accessor: "UnitType_Code", Header: "Unit" }
    ];
    useEffect(() => {
        if (open && dataDocument && dataDocItems) {
            console.log("show")
            let newItems = _.filter(dataDocItems, function (o) { return o._balanceQty > 0; });
            newItems = newItems.map(x => { return { ...x, SubID: x.ID + x.UnitType_Code } });
            let _dataTable = {
                listDocItems: [...newItems],
                defaultSelect: [...newItems]
            };
            console.log(_dataTable)
            setDataTable(_dataTable)
            QueryArea();
            saveDefaultInputQTY(newItems)
        }

    }, [open, dataDocument, dataDocItems]);

    useEffect(() => {
        console.log(areaSel)
        QueryAreaLocation(areaSel);

    }, [areaSel]);
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

    const genInputQty = (datarow) => {
        let field = "item-" + datarow.ID;
        let docItemID = datarow.ID;
        return <AmInput id={field} style={{ width: "100px" }} type="input"
            defaultValue={datarow._balanceQty}
            onChange={(value, obj, element, event) => onHandleChangeInputQTY(value, element, event, docItemID)}
        />
    }
    const onHandleChangeInputQTY = (value, element, event, docItemID) => {
        setValueQtyDocItems({
            ...valueQtyDocItems, [element.id]: {
                recQty: parseFloat(value),
                docItemID: docItemID
            }
        });

    };

    const alertDialogRenderer = (type, message) => {
        setSettingAlert({ type: type, message: message });
        setOpenAlert(true)
    }
    const onSubmit = () => {
        if (valueInput.areaID == undefined ||
            valueInput.baseCode == undefined) {
            alertDialogRenderer("warning", "กรุณากรอกข้อมูลให้ครบถ้วน")
        } else {

            let docItems = []
            for (let [key, value] of Object.entries(valueQtyDocItems)) {
                let checkselect = _.filter(dataSelect, _.matches({ 'ID': value.docItemID }))
                if (checkselect && checkselect.length > 0) {
                    docItems.push({ ID: value.docItemID, Quantity: parseFloat(value.recQty) })
                }
            }
            if (docItems.length === 0) {
                alertDialogRenderer("warning", "กรุณาเลือกรายการสินค้า และระบุจำนวนที่ต้องการรับเข้า")
            } else {
                let tempDataReq = {
                    ...valueInput,
                    docID: dataDocument.document.ID,
                    docItems: docItems,
                    warehouseID: dataDocument.document.Des_Warehouse_ID
                }
                Axios.post(window.apipath + apiCreate, tempDataReq).then((res) => {
                    if (res.data != null) {
                        if (res.data._result.status === 1) {
                            alertDialogRenderer("success", "สร้างพาเลทสินค้าสำเร็จ")
                            onHandleClear();
                            onConfirm(false)
                        } else {
                            alertDialogRenderer("error", res.data._result.message)
                        }
                    } else {
                        alertDialogRenderer("error", res.data._result.message)
                    }
                });
            }

        }
    }
    const handleClose = () => {
        close(false)
        onHandleClear();

    };

    const onHandleClear = () => {
        setDataTable(null);
        setValueInput({});
        setValueQtyDocItems({});
        setDataSelect([])
        setImgFile(null)
    }
    const toBase64 = file => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
    const handleFileChange = async (event) => {
        console.log(event)
        if (event.target.files[0]) {
            setImgFile(URL.createObjectURL(event.target.files[0]))
            let fileBase64 = await toBase64(event.target.files[0])
            if (valueInput.baseCode) {
                let filejson = {
                    fileName: valueInput.baseCode,
                    imageBase64: fileBase64
                }
                await Axios.post(window.apipath + "/v2/upload_image/", filejson).then(res => {
                    if (res.data._result.status === 1) {
                        alertDialogRenderer("success", "อัพโหลดไฟล์รูปภาพ " + res.data.fileName + " สำเร็จ")
                    } else {
                        alertDialogRenderer("error", res.data._result.message)
                    }
                });
            } else {
                alertDialogRenderer("warning", "กรุณากรอกหมายเลขพาเลท")
            }
        } else {
            setImgFile(null)
        }
    }

    const onHandleChangeInput = (value, dataObject, field, fieldDataKey, event) => {
        valueInput[field] = value;
        if (field === "baseCode") {
            if (value) {
                document.getElementById("contained-button-file").disabled = false;
                setBtnUpload(false)
            } else {
                document.getElementById("contained-button-file").disabled = true;
                setBtnUpload(true)
            }
        }
        if (field === "areaID") {
            setAreaSel(value)
        }
    }
    const onAccept = (data) => {
        setOpenAlert(data)
        if (data === false) {
            setSettingAlert(null)
        }
    }
    const handleClickOpen = () => {
        setOpenDialogPallet(true);
    };
    const handleOnClose = (val) => {
        setOpenDialogPallet(val);
    }
    const handleError = (show, type, message) => {
        setOpenDialogPallet(show);
        alertDialogRenderer(type, message)
    }
    const onSelectPallet = (data) => {
        if (data) {
            setOpenDialogPallet(false)
            // renderNewDropdown(data.AreaID, data.LocationID);
            if (data.AreaID) {
                valueInput['areaID'] = data.AreaID;
                setAreaSel(data.AreaID)
            }
            if (data.LocationID) {
                valueInput['locationID'] = data.LocationID;
                setLocationSel(data.LocationID)
            }
            let PalletCode = data.Pallet;

            let ele = document.getElementById(setting.inputBase.field);
            if (ele) {
                ele.value = PalletCode;
                ele.focus();
            }
        }
    }
    const title = useMemo(() => TitleContent(open, setting.inputTitle, dataDocument), [open, setting.inputTitle, dataDocument])
    const pallet = useMemo(() => PalletContent(open, setting.inputBase, valueInput, onHandleChangeInput), [open, setting.inputBase, valueInput.baseCode])
    const listCheckPallet = useMemo(() => ListPalletDialog(openDialogPallet, handleOnClose, dataDocument, onSelectPallet, handleError), [openDialogPallet, dataDocument]);
    const areaDDL = useMemo(() => AreaDDLContent(open, setting.ddlArea, dataSrcArea, valueInput.areaID, onHandleChangeInput), [open, setting.ddlArea, dataSrcArea, valueInput.areaID])
    const areaLocationDDL = useMemo(() => AreaLocationDDLContent(open, setting.ddlLocation, dataSrcLocation, valueInput.locationID, onHandleChangeInput), [open, setting.ddlLocation, dataSrcLocation, valueInput.locationID])
    const DialogAlert = useMemo(() => AlertDialog(openAlert, settingAlert, onAccept), [openAlert, settingAlert])
    async function QueryArea() {
        await Axios.get(createQueryString(AreaMasterQuery)).then(res => {
            if (res.data.datas) {
                setDataSrcArea(res.data.datas)
            }
        });
    }

    async function QueryAreaLocation(selAreaID) {
        let newLocationQueryStr = Clone(LocationMasterQuery)
        if (selAreaID) {
            newLocationQueryStr.q = "[{ 'f': 'Status', c:'=', 'v': 1},{ 'f': 'AreaMaster_ID', c:'=', 'v': " + selAreaID + "}]";
            await Axios.get(createQueryString(newLocationQueryStr)).then(res => {
                if (res.data.datas) {
                    setDataSrcLocation(res.data.datas)
                }
            });
        } else {
            setDataSrcLocation([])
        }

    }
    const showRes = (data) => {
        if (data) {
            console.log(data)
            let ele = document.getElementById(setting.inputBase.field);
            if (ele) {
                ele.value = data;
                ele.focus();
            }
        }
    }
    const handleClickRemove = async () => {
        if (valueInput.baseCode) {
            let filejson = {
                fileName: valueInput.baseCode
            }
            await Axios.post(window.apipath + "/v2/remove_image/", filejson).then(res => {
                if (res.data._result.status === 1) {
                    alertDialogRenderer("success", "ลบไฟล์รูปภาพสำเร็จ");
                    setImgFile(null)
                } else {
                    alertDialogRenderer("error", res.data._result.message)
                }
            });
        }
    }
    return (
        <>
            {DialogAlert}
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
                    {title}
                    <div style={{ display: 'inline-flex', alignItems: 'center' }} >
                        {pallet}
                        <IconBtn title="List Pallet" onHandleClick={handleClickOpen}><ListAlt color="primary" className={classes.fontSizeSmall} /></IconBtn>
                        {listCheckPallet}
                        <AmScanQRbyCamera returnResult={(data) => showRes(data)} />
                    </div>

                    {areaDDL}
                    {areaLocationDDL}
                    <FormInline>
                        <label className={classes.label_head}>{t('Upload Image')} : </label>
                        <input
                            accept="image/*"
                            className={classes.input}
                            id="contained-button-file"
                            type="file"
                            disabled={btnUpload}
                            onChange={(e) => handleFileChange(e)}
                        />
                        <label htmlFor="contained-button-file">
                            <AmButton
                                id="button-file"
                                variant="contained" component="span"
                                styleType="confirm_outline"
                                disabled={btnUpload}
                                startIcon={<PhotoCamera size="small" className={classNames(classes.leftIcon)} />}
                            >Upload</AmButton>
                        </label>
                        {imgFile ? <IconBtn title="Remove Image" onHandleClick={handleClickRemove}><DeleteForever color="secondary" className={classes.fontSizeSmall} /></IconBtn> : null}
                    </FormInline>
                    {imgFile ? <div style={{ margin: "5px 0px" }}><img src={imgFile} height='150' /></div> : null}
                    <Divider style={{ marginTop: '5px', marginBottom: '5px' }} />
                    {dataTable ? console.log(dataTable.defaultSelect) : null}
                    {open && dataTable ?
                        <AmTable
                            columns={columns}
                            dataKey={"SubID"}
                            dataSource={dataTable.listDocItems}
                            selectionDefault={dataTable.defaultSelect}
                            selection="checkbox"
                            selectionData={data => setDataSelect(data)}
                            rowNumber={true}
                            pageSize={dataTable.listDocItems.length}
                        />
                        : null}
                </DialogContent>
                <DialogActions>
                    <AmButton styleType="add" onClick={onSubmit}>Add</AmButton>
                    <AmButton styleType='delete' onClick={handleClose}>Cancel</AmButton>
                </DialogActions>
            </Dialog>
        </>
    )
}


AmReceivePallet.propTypes = {
    onConfirm: PropTypes.func.isRequired,
    setting: PropTypes.object,
};


export default withStyles(styles)(AmReceivePallet);