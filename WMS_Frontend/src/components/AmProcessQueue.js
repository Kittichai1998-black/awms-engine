import React, { Component, useState, useEffect } from "react";
import AmTable from "../components/table/AmTable";
import AmButton from "../components/AmButton";
import AmInput from "../components/AmInput";
import Grid from "@material-ui/core/Grid";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import styled from "styled-components";
import classNames from "classnames";
import AmDropdown from "../components/AmDropdown";
import SaveIcon from "@material-ui/icons/Description";
import classnames from "classnames";
import AmDatepicker from "../components/AmDate";
//import { apicall } from '../components/function/CoreFunction'
import AmEditorTable from "../components/table/AmEditorTable";
import AmDialogs from "../components/AmDialogs";
import AmCheckBox from "../components/AmCheckBox";
import Clone from "../components/function/Clone";
import { withStyles } from "@material-ui/core/styles";
import ExpandLessIcon from "@material-ui/icons/ExpandLess";
import Collapse from "@material-ui/core/Collapse";
import PropTypes from "prop-types";
import Paper from "@material-ui/core/Paper";
import AppBar from "@material-ui/core/AppBar";
import LibraryAdd from "@material-ui/icons/LibraryAdd";
import CheckBox from "@material-ui/icons/CheckBox";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import _ from "lodash";
import AmRediRectInfo from "../components/AmRedirectInfo";
import AmDialogConfirm from "../components/AmDialogConfirm";
import { string } from "prop-types";
import { getPriority } from "os";
import { width } from "@material-ui/system";
import { apicall } from "../components/function/CoreFunction2";
import { useTranslation } from "react-i18next";
import queryString from 'query-string'
import Axios from "axios";
import LabelT from './AmLabelMultiLanguage'

const Axios1 = new apicall();
const styles = theme => ({
    root: {
        width: "100%"
    },
    heading: {
        fontSize: theme.typography.pxToRem(15),
        fontWeight: theme.typography.fontWeightRegular
    },
    expand: {
        transform: "rotate(0deg)",
        transition: "transform 150ms cubic-bezier(0.4, 0, 0.2, 1) 0ms"
    },
    collapse: {
        transform: "rotate(180deg)",
        transition: "transform 150ms cubic-bezier(0.4, 0, 0.2, 1) 0ms"
    },
    container: {
        width: "100%",
        overflow: "hidden",
        height: "auto",
        background: "red"
    },
    paper: {
        padding: "3px"
    },

    fontIndi_0: {
        color: "#1b5e20",
        minHeight: "70px",
        paddingTop: "5px",
        fontSize: "small",
        fontWeight: "bold"
    },
    fontIndi_1: {
        color: "#01579b",
        minHeight: "52px",
        paddingTop: "5px",
        fontSize: "small",
        fontWeight: "bold"
    },
    indicator_0: { backgroundColor: "#1b5e20" },
    indicator_1: { backgroundColor: "#01579b" }
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

const LabelH = {
    "font-weight": "bold"
}


const LabelHDoc = {
    "font-weight": "bold"
}


const LabelHDes = {
    "font-weight": "bold",
    width: "150px"
}

const BorderAdd = styled.div`
  display: inline-block;
  border: 4px solid #eeeeee;
  display: block;
`;

const BorderQueu = styled.div`
  display: inline-block;
  border: 4px solid #eeeeee;
  display: block;
`;


const BorderGrey = styled.div`
  display: inline-block;
  border: 4px solid #9e9e9e;
  display: block;
`;

const InputDiv = styled.div`
  margin: 5px;
  @media (max-width: 800px) {
    margin: 0;
  }
`;

const createQueryString = select => {
    let queryS =
        select.queryString +
        (select.t === "" ? "?" : "?t=" + select.t) +
        (select.q === "" ? "" : "&q=" + select.q) +
        (select.f === "" ? "" : "&f=" + select.f) +
        (select.g === "" ? "" : "&g=" + select.g) +
        (select.s === "" ? "" : "&s=" + select.s) +
        (select.sk === "" ? "" : "&sk=" + select.sk) +
        (select.l === 0 ? "" : "&l=" + select.l) +
        (select.all === "" ? "" : "&all=" + select.all) +
        "&isCounts=true" +
        "&apikey=free01";
    return queryS;
};

const AmProcessQueue = props => {
    const { t } = useTranslation();
    const { classes } = props;
    const [valueDocument, setvalueDocument] = useState({});
    const [apiDoc, setapiDoc] = useState();
    const [dataSource, setDataSource] = useState([]);
    const [dataSorting, setdataSorting] = useState([]);
    const [reload, setReload] = useState();
    const [valueText, setValueText] = useState({});
    const [documentID, setDocumentID] = useState();
    const [DataDocumentItem, setDataDocumentItem] = useState([]);
    const [viewDataDoc, setviewDataDoc] = useState();
    const [addData, setAddData] = useState(false);
    const [addDataSort, setaddDataSort] = useState(false);
    const [dialog, setDialog] = useState(false);
    const [title, setTitle] = useState("");
    const [dialogSort, setDialogSort] = useState(false);
    const [titleSort, setTitleSort] = useState("");
    const [addDataID, setAddDataID] = useState(-1);
    const [editData, setEditData] = useState();
    const [editDataSort, setEditDataSort] = useState();
    const [columnCondition, setcolumnCondition] = useState(props.columnCondition);
    const [columnSort, setcolumnSort] = useState(props.columnSort);
    const [indexBtn, setindexBtn] = useState(0);
    const [qtyDocItem, setqtyDocItem] = useState({});
    const [stateDialogSuc, setStateDialogSuc] = useState(false);
    const [msgDialogSuc, setMsgDialogSuc] = useState("");
    const [stateDialogErr, setStateDialogErr] = useState(false);
    const [msgDialogErr, setMsgDialogErr] = useState("");
    const [qtyInput, setqtyInput] = useState();
    const [datacheckboxCon, setdatacheckboxCon] = useState({});
    const [datacheckboxStatus, setdatacheckboxStatus] = useState({});
    const [toggle, setToggle] = useState({});
    const [toggleQueue, setToggleQueue] = useState({});
    const [value, setValue] = useState(0);
    const [dataDocument, setdataDocument] = useState([]);
    const [datasDoc, setdatasDoc] = useState([]);
    const [dataQueue, setdataQueue] = useState([]);
    const [docHeaderdetail, setdocHeaderdetail] = useState(null);
    const [dataDetialdoc, setdataDetialdoc] = useState(detailDocuments);
    const [detailsdata, setdetailsdata] = useState();
    const [titleDialogCon, settitleDialogCon] = useState("Confirm Queue");
    const [openDialogCon, setopenDialogCon] = useState(false);
    const [bodyDailogCon, setbodyDailogCon] = useState();
    const [processDLLs, setprocessDLLs] = useState(null);
    const [dataConfirmQ, setdataConfirmQ] = useState({});
    const [processResults, setprocessResults] = useState([]);
    const [confirmProcess, setconfirmProcess] = useState({});
    const [processResultsCon, setprocessResultsCon] = useState();
    const [warehouseID, setwarehouseID] = useState();
    const [defaultpriority, setdefaultpriority] = useState(10);
    const [UnitCodes, setUnitCodes] = useState("");
    const [openDialogClear, setopenDialogClear] = useState(false);
    const [bodyDailogClear, setbodyDailogClear] = useState();
    const [pagesQ, setPagesQ] = useState(0);
    const [docCodelink, setdocCodelink] = useState();
    const [movement, setmovement] = useState();
    const [remark, setremark] = useState();
    const [souware, setsouware] = useState();
    const [desware, setdesware] = useState();
    const [descus, setdescus] = useState();
    const [textDes, settextDes] = useState();
    const [desdoc, setdesdoc] = useState();
    const [dataClears, setdataClear] = useState();
    const [btnBack, setbtnBack] = useState(false);
    const [btnAdd, setbtnAdd] = useState(false);
    const [dataConditions, setdataConditions] = useState([]);
    const [docDesWarehouse, setdocDesWarehouse] = useState([]);
    const [docDesCustomer, setdocDesCustomer] = useState([]);
    const [checkboxDocItems, setcheckboxDocItems] = useState([]);
    const [idxSortBtn, setidxSortBtn] = useState();
    const [defaulDDLAreaCus, setdefaulDDLAreaCus] = useState();
    const [defaulDDLAreaWare, setdefaulDDLAreaWare] = useState();
    const [defaulDDLAreaEmp, setdefaulDDLAreaEmp] = useState();
    const [defaulDDLAreaWip, setdefaulDDLAreaWip] = useState();

    const [checkConditions, setcheckConditions] = useState([])
    const [statusItem, setstatusItem] = useState([])

    //======== AAI============
    const [ref1, setref1] = useState();
    const [refID, setrefID] = useState();


    const docQueryAAI = {
        queryString: window.apipath + "/v2/SelectDataViwAPI/",
        t: "Document",
        q:
            "[{ 'f': 'Sou_Warehouse_ID', c:'=', 'v': " +
            warehouseID +
            "},{ 'f': 'Status', c:'=', 'v': 1},{ 'f': 'EventStatus', c:'=', 'v': 10},{ 'f': 'DocumentType_ID', c:'=', 'v': " +
            props.DocType +
            "}," + props.ConditionsQryDoc + "]",
        f: "ID as value, Code as label, ID, Code",
        g: "",
        s: "[{'f':'ID','od':'asc'}]",
        sk: 0,
        l: 100,
        all: ""
    };

    const docQuery = {
        queryString: window.apipath + "/v2/SelectDataViwAPI/",
        t: "Document",
        q: "[{ 'f': 'Sou_Warehouse_ID', c:'=', 'v': " +
            warehouseID +
            "},{ 'f': 'Status', c:'=', 'v': 1},{ 'f': 'EventStatus', c:'=', 'v': 10},{ 'f': 'DocumentType_ID', c:'=', 'v': " +
            props.DocType +
            "}]",
        f: "ID as value, Code as label, ID, Code,Des_Customer_ID,Des_Warehouse_ID",
        g: "",
        s: "[{'f':'ID','od':'asc'}]",
        sk: 0,
        l: 100,
        all: ""
    };

    const AreaMaster = {
        queryString: window.apipath + "/v2/SelectDataMstAPI/",
        t: "AreaMaster",
        q: '[{ "f": "Status", "c":"=", "v": 1}]',
        f: "ID,Code,Name",
        g: "",
        s: "[{'f':'ID','od':'desc'}]",
        sk: 0,
        l: 100,
        all: "",

    }


    const detailDocuments = [
        window.project === "AAI"
            ? [
                { label: "SAP Movement", type: "label", values: movement },
                { label: "SAP Ref.", values: refID, type: "label" },
                { label: "Source Warehouse", values: souware, type: "label" },
                { label: "Mode", values: ref1, type: "label" }
            ]
            : [
                { label: "Movement Type", type: "label", values: movement },
                { label: "Remark", values: remark, type: "label" },
                { label: "Source Warehouse", values: souware, type: "label" },
                { label: textDes, values: desdoc, type: "label" }
            ]
    ];

    useEffect(() => {
        getDetailDocuments();
        if (btnBack === false) {
            setDataDocumentItem();
        }
    }, [documentID]);

    useEffect(() => {
        dataSource.length = 0;
        dataSorting.length = 0;
    }, [btnAdd]);

    useEffect(() => {
        setdataDetialdoc([...detailDocuments]);
    }, [movement, remark, souware, textDes, desdoc, ref1, refID]);

    useEffect(() => {
        setdocHeaderdetail(DetailDoc());
    }, [
        props.detailDocument,
        dataDetialdoc,
        detailsdata,
        props.onChangeDoc,
        localStorage.getItem("Lang")
    ]);

    useEffect(() => {
        setprocessDLLs(ProcessDLL());
    }, [props.ProcessQ]);

    useEffect(() => {
        if (openDialogCon === false) {
            setconfirmProcess({});
            setprocessResults([]);
            setprocessResultsCon();
        }
    }, [openDialogCon]);

    useEffect(() => {
        if (window.project === "AAI") {
            Axios.get(createQueryString(docQueryAAI)).then(res => {
                let docSelection = res.data.datas;
                if (docSelection !== undefined)
                    setapiDoc(docSelection.map(x => ({ Code: x.Code, value: x.ID })));
            });
        } else {
            Axios.get(createQueryString(docQuery)).then(res => {
                let docSelection = res.data.datas;
                if (docSelection !== undefined)
                    setapiDoc(docSelection.map(x => ({
                        Code: x.Code,
                        value: x.ID,
                        deswarehouse: x.Des_Warehouse_ID,
                        descustomer: x.Des_Customer_ID
                    })));
            });
        }
    }, [warehouseID, dataClears]);

    const priolity = () => {
        let arrPrio = [];
        for (var i = 1; i < 101; i++) {
            arrPrio.push({ label: i, value: i });
        }

        return arrPrio;
    };

    const onHandleChangeDDLDocument = (
        value,
        dataObject,
        inputID,
        fieldDataKey,
        field,
        data
    ) => {
        //setDataDocumentItem();
        if (value !== undefined && value !== null && dataObject.Code !== null) {

            setdocDesWarehouse(dataObject.deswarehouse)

            setdocDesCustomer(dataObject.descustomer)
            setdocCodelink(dataObject.Code);
            setDocumentID(value);
            getDoumentItem(value);
            var filterDoc = dataDocument.filter(
                x => x["DocumentCode"] === dataObject.Code
            );
            if (filterDoc.length === 0) {
                setReload({});
                var addDoc = {};
                addDoc["DocumentCode"] = dataObject.Code;
                dataDocument.push(addDoc);
            }
        }
    };

    const onHandleChangeDDLWarehouse = (
        value,
        dataObject,
        inputID,
        fieldDataKey,
        field,
        data
    ) => {
        if (value !== undefined && value !== null) {
            setwarehouseID(value);
            dataConfirmQ["desASRSWarehouseCode"] = dataObject.Code;
            dataConfirmQ["desASRSWarehouseName"] = dataObject.Name;
        } else {
            setMsgDialogErr("Warehouse Invalid");
            setStateDialogErr(true);
        }
    };

    const onHandleChangeDDLProcess = (
        value,
        dataObject,
        inputID,
        fieldDataKey,
        field,
        data
    ) => {
        if (value !== undefined && value !== null) {
            dataConfirmQ[field] = value;
        }
    };

    const onHandleChangeDDLProcessAPI = (
        value,
        dataObject,
        inputID,
        fieldDataKey,
        field,
        data
    ) => {
        if (value !== undefined && value !== null) {
            dataConfirmQ[inputID] = dataObject.Code;
        }
    };

    const getDoumentItem = docID => {
        let DocumentItem = {
            queryString: window.apipath + "/v2/SelectDataViwAPI/",
            t: "DocumentItem",
            q: "[{ 'f': 'Document_ID', c:'=', 'v': " + docID + "}]",
            f: "*",
            g: "",
            s: "[{'f':'ID','od':'asc'}]",
            sk: 0,
            all: ""
        };
        getData(createQueryString(DocumentItem));
    };
    async function getData(qryString) {
        const res = await Axios.get(qryString).then(res => res);
        //console.log(res.data.datas)
        setDataDocumentItem(res.data.datas);
    }

    const Document = {
        queryString: window.apipath + "/v2/SelectDataViwAPI/",
        t: "Document",
        q:
            "[{ 'f': 'Sou_Warehouse_ID', c:'=', 'v': " +
            warehouseID +
            "},{ 'f': 'Status', c:'=', 'v': 1},{{ 'f': 'DocumentType_ID', c:'=', 'v': " +
            props.DocType +
            "}}]",
        f: "ID as value, Code as label, ID, Code",
        g: "",
        s: "[{'f':'ID','od':'asc'}]",
        sk: 0,
        l: 100,
        all: ""
    };

    const SumQty = (arr, field) => {
        _.forEach(arr, function (value, key) {
            value.BaseQuantity = parseInt(value.BaseQuantity, 10);
        });

        return _.sumBy(arr, field);
    };

    const getDataDetail = (type, key, values) => {
        if (type === "label") {
            return (
                <div style={{ marginLeft: "10px" }}>
                    <label>{values}</label>
                </div>
            );
        }
    };
    const onHandleDelete = (v, o, rowdata, ind) => {
        let BaseQty = rowdata.original.BaseQuantity;
        let BaseQtys = parseInt(BaseQty);
        let idx = dataSource[ind].findIndex(x => x.ID === v);
        dataSource[ind].splice(idx, 1);
        dataSource[ind][0].BaseQuantity += BaseQtys;
        setDataSource(dataSource);
        setReload({});
    };
    const onHandleDeleteSort = (v, o, rowdata, ind, idxsort) => {
        let idx = dataSorting[ind].findIndex(x => x.ID === v);
        dataSorting[ind].splice(idx, 1);
        setdataSorting(dataSorting);
        setReload({});
    };
    const onHandleEditConfirm = (status, rowdata) => {
        if (status) {
            var chkData = dataSource[indexBtn].filter(x => {
                return x.ID === rowdata.ID;
            });
            if (chkData.length > 0) {
                for (let row in editData) {
                    chkData[0][row] = editData[row];
                }
            } else {
                let qtyI = qtyDocItem[indexBtn];
                let sumQty =
                    SumQty(dataSource[indexBtn], "BaseQuantity") +
                    parseInt(rowdata.BaseQuantity, 10);
                var datsTB = dataSource[indexBtn];
                let BaseRow = parseInt(rowdata.BaseQuantity, 10);
                let dataBaseTb = dataSource[indexBtn].map(x => {
                    return x.BaseQuantity;
                });
                let MaXBase = datsTB[0].BaseQuantity;
                if (datsTB[0].BaseQuantity <= 0 || BaseRow > MaXBase) {
                    setMsgDialogErr("Quantity > qty in GI ADD");
                    setStateDialogErr(true);
                } else {
                    let BaseRows = parseInt(rowdata.BaseQuantity, 10);
                    let Base = rowdata.BaseQuantity;

                    if (BaseRows <= 0 || Base === undefined || BaseRows === "NaN") {
                        setMsgDialogErr("Quantity  invalid");
                        setStateDialogErr(true);
                    } else {
                        datsTB[0].BaseQuantity -= BaseRow;
                        dataSource[indexBtn].push(rowdata);
                        setAddDataID(addDataID - 1);
                    }
                }
            }
        }

        setReload({});
        setEditData();
        setAddDataID(addDataID - 1);
        setAddData(false);
        setDialog(false);
    };

    const onChangeEditor = (field, rowdata, value, pair, dataPair, UnitCode) => {
        if (addData) {
            if (editData) {
                editData[field] = value;
                if (UnitCode) {
                    editData["UnitType_Name"] = UnitCode;
                }
                if (pair) {
                    editData[pair] = dataPair;
                }
                setEditData(editData);
            } else {
                let addData = {};
                addData["ID"] = addDataID;
                addData[field] = value;
                if (UnitCode) {
                    addData["UnitType_Name"] = UnitCode;
                }
                if (pair) {
                    addData[pair] = dataPair;
                }
                setEditData(addData);
            }
        } else {
            let editRowX = editData.original
                ? { ...editData.original }
                : { ...editData };
            if (editData.original !== undefined && field === "BaseQuantity") {
                let BaseqtyOrigi = editData.original.BaseQuantity;
                let Baseqty = value;
                let qty = Baseqty - BaseqtyOrigi;
                if (qty > dataSource[indexBtn][0].BaseQuantity) {
                    setMsgDialogErr("Qty Edit > Qty Document");
                    setStateDialogErr(true);
                } else {
                    dataSource[indexBtn][0].BaseQuantity -= qty;
                    editRowX[field] = value;
                    setEditData(editRowX);
                }
            } else {
                editRowX[field] = value;
                if (UnitCode) {
                    editRowX["UnitType_Name"] = UnitCode;
                }
                if (pair) {
                    editRowX[pair] = dataPair;
                }
                setEditData(editRowX);
                setUnitCodes(UnitCode);
            }
        }
    };
    const onChangeEditorSortConfirm = (status, rowdata) => {

        if (status) {
            var chkDataSort = dataSorting[indexBtn].filter(x => {
                return x.ID === rowdata.ID;
            });
            if (chkDataSort.length > 0) {
                for (let row in editDataSort) {
                    chkDataSort[0][row] = editDataSort[row];
                }
            } else {

                dataSorting[indexBtn].push(rowdata);

                setAddDataID(addDataID - 1);
            }

        }
        setReload({});
        setEditDataSort();
        setAddDataID(addDataID - 1);
        setAddData(false);
        setDialogSort(false);
    };

    const getdataDDLSort = (
        value,
        dataObject,
        inputID,
        fieldDataKey,
        field,
        data,
        pair
    ) => {
        if (value !== null) {

            onChangeEditorSort(field, data, dataObject.value, pair);
        }
    };

    const Onchangepriolity = (value, dataObject, indx) => {
        if (value !== null) {
            dataSource[indx][0]["PriorityDoc"] = dataObject.value;
            dataSource[indx][0]["PriorityLabel"] = dataObject.label;
        }
    };

    const onChangeEditorSort = (field, rowdata, value, pair, dataPair) => {
        if (addData) {
            console.log(value)
            if (editDataSort) {
                editDataSort[field] = value;
                if (pair) {
                    editDataSort[pair] = dataPair;
                }

                setEditDataSort(editDataSort);
            } else {
                let addData = {};
                addData["ID"] = addDataID;
                addData[field] = value;
                if (pair) {
                    addData[pair] = dataPair;
                }

                setEditDataSort(addData);
            }
        } else {
            let editRowX = editDataSort.original
                ? { ...editDataSort.original }
                : { ...editDataSort };
            editRowX[field] = value;
            if (pair) {
                editRowX[pair] = dataPair;
            }

            setEditDataSort(editRowX);
        }

    };

    //Advance Condition
    const onChangCheckboxCon = (e, indx) => {
        if (e.checked === true) {
            let dataCheckCon = datacheckboxCon;
            datacheckboxCon[e.value] = e.checked;
            setdatacheckboxCon(dataCheckCon);
            dataSource[indx][0][e.value] = e.checked;
        } else {
            let dataCheckCon = datacheckboxCon;
            datacheckboxCon[e.value] = e.defaultChecked;
            setdatacheckboxCon(dataCheckCon);
            dataSource[indx][0][e.value] = e.defaultChecked;
        }
    };

    const onChangCheckboxDocItem = (e, indx) => {
        if (e.defaultChecked === true) {
            DataDocumentItem[indx]["CheckDocument"] = e.defaultChecked
        } else {
            DataDocumentItem[indx]["CheckDocument"] = e.checked
        }
    }

    const onChangCheckboxConsFull = (e, v, indx) => {
        datacheckboxCon["FullPallet"] = true;
        dataSource[indx][0]["FullPallet"] = true;
    };

    const onChangCheckboxConsFulls = (e, v, indx) => {
        datacheckboxCon["FullPallet"] = false;
        dataSource[indx][0]["FullPallet"] = false;
    };

    const onChangCheckboxExpire = (e, v, indx) => {
        datacheckboxCon["ExpireDate"] = true;
        dataSource[indx][0]["ExpireDate"] = true;
    };

    const onChangCheckboxIncubase = (e, v, indx) => {
        datacheckboxCon["IncubateDate"] = true;
        dataSource[indx][0]["IncubateDate"] = true;
    };

    const onChangCheckboxConsSelfLife = (e, v, indx) => {
        datacheckboxCon["ShelfLifeDate"] = true;
        dataSource[indx][0]["ShelfLifeDate"] = true;
    };

    //Status

    const onChangCheckboxConsRecieve = (e, v, indx) => {
        datacheckboxCon["Receive"] = true;
        dataSource[indx][0]["Receive"] = true;
    };

    const onChangCheckboxConsBlock = (e, v, indx) => {
        datacheckboxCon["Block"] = true;
        dataSource[indx][0]["Block"] = true;
    };
    const onChangCheckboxConsQC = (e, v, indx) => {
        datacheckboxCon["QC"] = true;
        dataSource[indx][0]["QC"] = true;
    };
    const onChangCheckboxConsReturn = (e, v, indx) => {
        datacheckboxCon["Return"] = true;
        dataSource[indx][0]["Return"] = true;
    };
    const onChangCheckboxConsPartail = (e, v, indx) => {
        datacheckboxCon["Partial"] = true;
        dataSource[indx][0]["Partial"] = true;
    };
    const onChangCheckboxConsHold = (e, v, indx) => {
        datacheckboxCon["Hold"] = true;
        dataSource[indx][0]["Hold"] = true;
    };
    const onChangCheckboxConsReject = (e, v, indx) => {
        datacheckboxCon["Reject"] = true;
        dataSource[indx][0]["Reject"] = true;
    };
    const onChangCheckboxStatus = (e, indx) => {
        let getStatusList = [...statusItem];
        let checkStatusList = getStatusList.find(x => x.idx === indx);
        if (checkStatusList === null || checkStatusList === undefined) {
            let checkData = { idx: indx }
            if (e.value !== undefined) {
                checkData[e.value] = e.checked === undefined ? e.defaultChecked : e.checked

                let dataCheckStatus = datacheckboxStatus;
                datacheckboxStatus[e.value] = e.checked === undefined ? e.defaultChecked : e.checked;;
                setdatacheckboxStatus(dataCheckStatus);

                dataSource[indx][0][e.value] = e.checked === undefined ? e.defaultChecked : e.checked;
                DataDocumentItem[indx][e.value] = e.checked === undefined ? e.defaultChecked : e.checked;
            }
            getStatusList.push(checkData)
        } else {
            if (checkStatusList[e.value] === undefined) {
                checkStatusList[e.value] = e.checked === undefined ? e.defaultChecked : e.checked

                let dataCheckStatus = datacheckboxStatus;
                datacheckboxStatus[e.value] = e.checked === undefined ? e.defaultChecked : e.checked;;
                setdatacheckboxStatus(dataCheckStatus);

                dataSource[indx][0][e.value] = e.checked === undefined ? e.defaultChecked : e.checked;
                DataDocumentItem[indx][e.value] = e.checked === undefined ? e.defaultChecked : e.checked;
            }
            else {
                if (e.checked !== undefined) {
                    checkStatusList[e.value] = e.checked

                    let dataCheckStatus = datacheckboxStatus;
                    datacheckboxStatus[e.value] = e.checked;
                    setdatacheckboxStatus(dataCheckStatus);

                    dataSource[indx][0][e.value] = e.checked;
                    DataDocumentItem[indx][e.value] = e.checked;
                }
            }
        }
        setDataDocumentItem([...DataDocumentItem])
        setstatusItem(getStatusList)
        //if (e.checked === true) {
        //    let dataCheckStatus = datacheckboxStatus;
        //    datacheckboxStatus[e.value] = e.checked;
        //    dataSource[indx][0][e.value] = e.checked;
        //    setdatacheckboxStatus(dataCheckStatus);
        //} else {
        //    let dataCheckStatus = datacheckboxStatus;
        //    datacheckboxStatus[e.value] = e.defaultChecked;
        //    dataSource[indx][0][e.value] = e.defaultChecked;
        //    setdatacheckboxStatus(dataCheckStatus);

        //}
    };
    const onChangeRandom = (e, indx, random) => {
        if (indx === null) indx = 0;
        dataSource[indx][0]["Random"] = null;
        if (random === null && e > 100) {
            setMsgDialogErr("Randdom > 100%");
            setStateDialogErr(true);
        } else {
            if (random === "0") {
                //dataSource[indx][0]["Random"] = 100
            } else {
                dataSource[indx][0]["Random"] = e;
            }
            if (random !== undefined) {
                dataSource[indx][0]["Random"] = random;
            } else {
                dataSource[indx][0]["Random"] = e;
            }
        }
    };

    const onChangeRandoms = (e, indx) => {
        if (e > 100) {
            setMsgDialogErr("Randdom > 100%");
            setStateDialogErr(true);
        } else {
            dataSource[indx][0]["Randoms"] = e;
        }
    };
    const onclickToggel = idx => {
        toggle[idx] = !toggle[idx];
        setToggle({ ...toggle });
    };

    const onclickToggelDataQueue = idx => {
        toggleQueue[idx] = !toggleQueue[idx];
        setToggleQueue({ ...toggleQueue });
    };

    const editorListcolunmCondition = () => {
        return columnCondition.map(row => {
            return {
                field: row.accessor,
                component: (data = null, cols, key) => {
                    return (
                        <div key={key}>
                            {getTypeEditor(
                                row.type,
                                row.Header,
                                row.accessor,
                                row.validate,
                                row.idddls,
                                row.fieldLabel,
                                row.field,
                                row.queryApi,
                                data,
                                cols,
                                row,
                                row.dataDDL
                            )}
                        </div>
                    );
                }
            };
        });
    };
    const editorListcolunmSort = () => {
        return props.columnSort.map(row => {
            return {
                field: row.accessor,
                component: (data = null, cols, key) => {
                    return (
                        <div key={key}>
                            {getTypeEditorSort(
                                row.type,
                                row.Header,
                                row.accessor,
                                row.validate,
                                row.idddls,
                                row.fieldLabel,
                                row.field,
                                row.queryApi,
                                data,
                                cols,
                                row,
                                row.dataDDL,
                                row.defaultsort
                            )}
                        </div>
                    );
                }
            };
        });
    };
    const getTypeEditor = (
        type,
        Header,
        accessor,
        validate,
        idddls,
        fieldLabel,
        queryApi,
        field,
        data,
        cols,
        row,
        dataDDL
    ) => {
        if (type === "input") {
            return (
                <FormInline>
                    {" "}
                    <LabelT style={LabelH}>{Header} :</LabelT>
                    <InputDiv>
                        <div>
                            <AmInput
                                style={{ width: "300px" }}
                                id={cols.field}
                                validate={true}
                                msgError="Error"
                                regExp={validate ? validate : ""}
                                defaultValue={data ? data[cols.field] : ""}
                                onChange={ele => {
                                    onChangeEditor(cols.field, data, ele, "");
                                }}
                            ></AmInput>
                        </div>
                    </InputDiv>
                </FormInline>
            );
        } else if (type === "inputnum") {
            return (
                <FormInline>
                    {" "}
                    <LabelT style={LabelH}>{Header} :</LabelT>
                    <InputDiv>
                        <div>
                            <AmInput
                                defaultValue={data ? data[accessor] : ""}
                                style={{ width: "300px" }}
                                type="number"
                                onChange={ele => {
                                    onChangeEditor(cols.field, data, ele, row.pair);
                                }}
                            ></AmInput>
                        </div>{" "}
                    </InputDiv>
                </FormInline>
            );
        } else if (type === "dropdown") {
            return (
                <FormInline>
                    {" "}
                    <LabelT style={LabelH}>{Header} :</LabelT>
                    <InputDiv>
                        <div>
                            <AmDropdown
                                id={idddls}
                                placeholder="Select"
                                data={dataDDL}
                                width={300} //??????????????????????????????????????????????? input
                                ddlMinWidth={300} //?????????????????????????????????????????????????? dropdown
                                valueData={valueText} //????????? value ????????????????????
                                onChange={(value, dataObject, inputID, fieldDataKey) =>
                                    onChangeEditor(value, dataObject, inputID, fieldDataKey)
                                }
                                ddlType={"search"}
                            ></AmDropdown>
                        </div>
                    </InputDiv>
                </FormInline>
            );
        } else if (type === "dropdownapi") {
            return (
                <FormInline>
                    {" "}
                    <LabelT style={LabelH}>{Header} :</LabelT>
                    <InputDiv>
                        <div>
                            <AmDropdown
                                id={idddls}
                                placeholder="Select Unit Type"
                                fieldDataKey="ID" //????????????Column ????????????????table ???db
                                fieldLabel={fieldLabel} //???????????????????????????????????????????????????? optionList ????????? ???????? input
                                labelPattern=" : " //?????????????????????????????????????????????????????????????????????
                                width={300} //??????????????????????????????????????????????? input
                                ddlMinWidth={300} //?????????????????????????????????????????????????? dropdown
                                valueData={valueText[idddls]} //????????? value ????????????????????
                                queryApi={queryApi}
                                //defaultValue={data ? data : ""}
                                onChange={(value, dataObject, inputID, fieldDataKey) =>
                                    onChangeEditor(value, dataObject, inputID, fieldDataKey)
                                }
                                ddlType={"search"} //???????? Dropdown
                            />
                        </div>
                    </InputDiv>
                </FormInline>
            );
        } else if (type === "unitType") {
            return (
                <FormInline>
                    {" "}
                    <LabelT style={LabelH}>{Header} :</LabelT>
                    <InputDiv>
                        {
                            <label>
                                {data !== {} && data !== null ? data[accessor] : ""}
                            </label>
                        }
                    </InputDiv>
                </FormInline>
            );
        }
    };

    const getTypeEditorSort = (
        type,
        Header,
        accessor,
        validate,
        idddls,
        fieldLabel,
        queryApi,
        field,
        data,
        cols,
        row,
        dataDDL,
        defaultsort
    ) => {
        if (type === "input") {
            return (
                <FormInline>
                    {" "}
                    <LabelT style={LabelH}>{Header} :</LabelT>
                    <InputDiv>
                        <div>
                            {" "}
                            <AmInput
                                id={cols.field}
                                style={{ width: "300px" }}
                                validate={true}
                                msgError="Error"
                                regExp={validate ? validate : ""}
                                defaultValue={data ? data[cols.field] : ""}
                                onChange={ele => {
                                    onChangeEditorSort(cols.field, data, ele, row.pair);
                                }}
                            ></AmInput>
                        </div>
                    </InputDiv>
                </FormInline>
            );
        } else if (type === "inputnum") {
            return (
                <FormInline>
                    {" "}
                    <LabelT style={LabelH}>{Header} :</LabelT>
                    <InputDiv>
                        <div>
                            {" "}
                            <AmInput
                                style={{ width: "300px" }}
                                defaultValue={data ? data[accessor] : ""}
                                style={{ width: "100px" }}
                                type="number"
                                onChange={ele => {
                                    onChangeEditorSort(cols.field, data, ele, row.pair);
                                }}
                            ></AmInput>
                        </div>{" "}
                    </InputDiv>
                </FormInline>
            );
        } else if (type === "dropdown") {
            return (
                <FormInline>
                    {" "}
                    <LabelT style={LabelH}>{Header} :</LabelT>
                    <InputDiv>
                        <div>
                            <AmDropdown
                                id={idddls}
                                placeholder="Select"
                                data={dataDDL}
                                fieldDataKey="value"
                                fieldLabel={["label"]}
                                width={300} //??????????????????????????????????????????????? input
                                ddlMinWidth={300} //?????????????????????????????????????????????????? dropdown
                                valueData={valueText[idddls]} //????????? value ????????????????????
                                defaultValue={data ? data[cols.field] : ""}
                                returnDefaultValue={true}
                                onChange={(value, dataObject, inputID, fieldDataKey) =>
                                    getdataDDLSort(
                                        value,
                                        dataObject,
                                        inputID,
                                        fieldDataKey,
                                        cols.field,
                                        data,
                                        row.pair
                                    )
                                }
                                ddlType={"search"}
                            ></AmDropdown>
                        </div>
                    </InputDiv>
                </FormInline>
            );
        } else if (type === "dropdownapi") {
            return (
                <FormInline>
                    {" "}
                    <LabelT style={LabelH}>{Header} :</LabelT>
                    <InputDiv>
                        <div>
                            {" "}
                            <AmDropdown
                                id={idddls}
                                placeholder="Select Unit Type"
                                fieldDataKey="ID" //????????????Column ????????????????table ???db
                                fieldLabel={fieldLabel} //???????????????????????????????????????????????????? optionList ????????? ???????? input
                                labelPattern=" : " //?????????????????????????????????????????????????????????????????????
                                width={200} //??????????????????????????????????????????????? input
                                ddlMinWidth={300} //?????????????????????????????????????????????????? dropdown
                                valueData={valueText[idddls]} //????????? value ????????????????????
                                queryApi={queryApi}
                                //defaultValue={data ? data : ""}
                                onChange={(value, dataObject, inputID, fieldDataKey) =>
                                    getdataDDLSort(value, dataObject, inputID, fieldDataKey)
                                }
                                ddlType={"search"} //???????? Dropdown
                            />
                        </div>
                    </InputDiv>
                </FormInline>
            );
        }
    };

    const ProcessDLL = () => {
        return props.ProcessQ.map(row => {
            return (
                <div>
                    {getTypeProcessQ(
                        row.type,
                        row.key,
                        row.idddls,
                        row.fieldLabel,
                        row.queryApi,
                        row.field,
                        row.dataDDL,
                        row.Label,
                        row.defaultValue,
                        row.defaultValues
                    )}
                </div>
            );
        });
    };

    const getTypeProcessQ = (
        type,
        key,
        idddls,
        fieldLabel,
        queryApi,
        field,
        dataDDL,
        Label,
        defaultValue,
        defaultValues,

    ) => {
        if (type === "dropdown") {
            return (
                <FormInline>
                    {" "}
                    <LabelT style={LabelHDes}>{Label} :</LabelT>
                    <InputDiv>
                        <AmDropdown
                            id={idddls}
                            placeholder="Select"
                            data={dataDDL}
                            fieldDataKey="value"
                            fieldLabel={["label"]}
                            width={300}
                            ddlMinWidth={300}
                            valueData={valueText[idddls]}
                            //defaultValue={ docDesCustomer && props.StatusfromDescustomer  ? 11 :  null }
                            onChange={(value, dataObject, inputID, fieldDataKey) =>
                                onHandleChangeDDLProcess(
                                    value,
                                    dataObject,
                                    inputID,
                                    fieldDataKey,
                                    field
                                )
                            }
                            ddlType={"search"}
                        ></AmDropdown>
                    </InputDiv>
                </FormInline>
            );
        } else if (type === "dropdownapi") {

            return (
                <FormInline>
                    {" "}
                    <LabelT style={LabelHDes}>{Label} :</LabelT>
                    <InputDiv>
                        <AmDropdown
                            id={idddls}
                            placeholder="Select"
                            fieldDataKey="ID" //????????????Column ????????????????table ???db
                            fieldLabel={fieldLabel} //???????????????????????????????????????????????????? optionList ????????? ???????? input
                            labelPattern=" : " //?????????????????????????????????????????????????????????????????????
                            width={300} //??????????????????????????????????????????????? input
                            ddlMinWidth={300} //?????????????????????????????????????????????????? dropdown
                            valueData={valueText[idddls]} //????????? value ????????????????????
                            queryApi={queryApi}
                            returnDefaultValue={true}
                            defaultValue={defaultValues ? defaultValues : defaulDDLAreaWare === true || defaulDDLAreaWip === true ? 8
                                : defaulDDLAreaCus === true || defaulDDLAreaEmp === true ? 11
                                    : defaultValues ? defaultValues : defaultValue ? defaultValue : ""}
                            disabled={defaultValue ? true : false}
                            //defaultValue={data ? data : ""}
                            onChange={(value, dataObject, inputID, fieldDataKey) =>
                                onHandleChangeDDLProcessAPI(
                                    value,
                                    dataObject,
                                    inputID,
                                    fieldDataKey,
                                    field
                                )
                            }
                            ddlType={"search"} //???????? Dropdown
                        />
                    </InputDiv>
                </FormInline>
            );
        }
    };


    const DetailDoc = () => {
        if (detailsdata === undefined) {
            return detailDocuments.map(x => {
                return (
                    <Grid container spacing={24}>
                        {x.map(y => {
                            let syn = y.label ? " :" : "";
                            return (
                                <Grid
                                    xs={6}
                                    style={{ paddingLeft: "10px", paddingBottom: "10px" }}
                                >
                                    <FormInline>
                                        <div style={{ paddingLeft: "10px", width: "200px" }}>
                                            <LabelT style={LabelH}>{y.label + syn}</LabelT>
                                        </div>
                                        {getDataDetail(y.type, y.key, y.values)}
                                    </FormInline>
                                </Grid>
                            );
                        })}
                    </Grid>
                );
            });
        } else {
            return detailsdata.map(x => {
                return (
                    <Grid container spacing={24}>
                        {x.map(y => {
                            return (
                                <Grid
                                    xs={6}
                                    style={{ paddingLeft: "10px", paddingBottom: "10px" }}
                                >
                                    <FormInline>
                                        <div style={{ paddingLeft: "10px", width: "200px" }}>
                                            <LabelT style={LabelH}>{y.label}</LabelT>
                                        </div>
                                        {getDataDetail(y.type, y.key, y.values)}
                                    </FormInline>
                                </Grid>
                            );
                        })}
                    </Grid>
                );
            });
        }
    };

    const handleChange = (event, newValue) => {
        setValue(newValue);
        setDocumentID();
        setDataDocumentItem([]);
    };

    const addConPage = () => {
        let datasSort = null;
        let dataPriolity = null;
        [...dataSorting].map((x, idx) => {
            return (datasSort = x);
        });

        dataSource.map((x, idx) => {
            x.map(y => {
                dataPriolity = y.Priority;
            });
        });

        //if (dataPriolity === undefined) {
        //    setMsgDialogErr("Priolity is invalid");
        //    setStateDialogErr(true);

        //} else
        if (dataPriolity === undefined && datasSort.length === 0) {
            setMsgDialogErr("Data is invalid");
            setStateDialogErr(true);
        } else {
            addConditions();
            setValue(1);
            setPagesQ(1);
            setDocumentID();
            setDataDocumentItem();
            setbtnBack(false)
        }
    };

    const addConditions = () => {

        var filterDocCode = dataQueue.filter(
            x =>
                x["DataDocumentCode"] ===
                dataDocument[dataDocument.length - 1].DocumentCode
        );
        if (filterDocCode.length === 0) {
            var datasQ = {};

            var dataSortXX = [...DataDocumentItem].map((di, idx) => {
                if (props.DefaulSorting !== undefined) {
                    let dfaultS = [...dataSorting[idx]];
                    dfaultS["docItemID"] = di.ID;
                    return dfaultS;
                }
            });




            //setdatasDoc([...datasDoc]);
            datasQ["DataDocdetail"] = dataDetialdoc;
            datasQ["DataDocumentItem"] = [...DataDocumentItem];
            datasQ["DataSource"] = [...dataSource];
            datasQ["DataSorting"] = dataSortXX;
            datasQ["DataDocumentCode"] =
                dataDocument[dataDocument.length - 1].DocumentCode;
            datasQ["DataDocumentID"] = documentID;
            dataQueue.push(datasQ);
            setdatasDoc([...dataQueue]);
            setReload({});
            setDataDocumentItem();
            setdocHeaderdetail();
            setDocumentID();
            setdataDocument([]);
            setbtnAdd(true);
            setbtnBack(false);


            if (dataDetialdoc[0][0].label === "Movement Type") {
                console.log(dataDetialdoc[0][0].values)
                if (dataDetialdoc[0][0].values === "EPL_TRANSFER_WM") {
                    setdefaulDDLAreaEmp(true)
                } else if (dataDetialdoc[0][0].values === "FG_TRANSFER_CUS") {
                    setdefaulDDLAreaCus(true)
                } else if (dataDetialdoc[0][0].values === "FG_TRANSFER_WM") {
                    setdefaulDDLAreaWare(true)
                } else if (dataDetialdoc[0][0].values === "WIP_TRANSFER_WM") {
                    setdefaulDDLAreaWip(true)
                }
            } else { }


            if (window.project === "AAI") {
                Axios.get(createQueryString(docQueryAAI)).then(res => {
                    let docSelection = res.data.datas.filter(x => {
                        return (
                            [...dataQueue].filter(y => y.DataDocumentCode == x.Code).length ===
                            0
                        );
                    });
                    setapiDoc(docSelection.map(x => ({ Code: x.Code, value: x.ID })));
                });
            } else {
                Axios.get(createQueryString(docQuery)).then(res => {
                    console.log("Add Data Qury")
                    let docSelection = res.data.datas.filter(x => {
                        return (
                            [...dataQueue].filter(y => y.DataDocumentCode == x.Code).length ===
                            0
                        );
                    });
                    setapiDoc(docSelection.map(x => ({ Code: x.Code, value: x.ID })));
                });
            }

        }

    };

    const OnclickBackAddDocument = (doc, dataSc, dataSt) => {
        if (window.project === "AAI") {
            Axios.get(createQueryString(docQueryAAI)).then(res => {
                let docSelection = res.data.datas.filter(x => {
                    let dataInQueue = [...dataQueue].filter(
                        y => y.DataDocumentCode === x.Code
                    );
                    if (dataInQueue.length > 0) {
                        let editQueue = dataInQueue.filter(z => {
                            return z.DataDocumentCode === doc.DataDocumentCode;
                        });
                        if (editQueue.length > 0) return true;
                        else return false;
                    } else {
                        return true;
                    }
                });
                setapiDoc(docSelection.map(x => ({ Code: x.Code, value: x.ID })));
            });


        } else {

            Axios.get(createQueryString(docQuery)).then(res => {
                console.log("Edit Datas")
                let docSelection = res.data.datas.filter(x => {
                    let dataInQueue = [...dataQueue].filter(
                        y => y.DataDocumentCode === x.Code
                    );
                    if (dataInQueue.length > 0) {
                        let editQueue = dataInQueue.filter(z => {
                            return z.DataDocumentCode === doc.DataDocumentCode;
                        });
                        if (editQueue.length > 0) return true;
                        else return false;
                    } else {
                        return true;
                    }
                });
                setapiDoc(docSelection.map(x => ({
                    Code: x.Code,
                    value: x.ID,
                    deswarehouse: x.Des_Warehouse_ID,
                    descustomer: x.Des_Customer_ID
                })));
            });
        }
        setDocumentID(doc.DataDocumentID);
        setDataDocumentItem(doc.DataDocumentItem);
        setDataSource(doc.DataSource);
        setdataSorting(doc.DataSorting);
        setdataConditions(dataSc);
        setdetailsdata(doc.DataDocdetail);
        setValue(0);
        setbtnBack(true);

    };

    const OnclickRemoveAddDocument = (idx) => {
        datasDoc.splice(idx, 1)
        setdataQueue([...datasDoc]);
        setdatasDoc([...datasDoc]);
        setbtnBack(false);


        if (window.project === "AAI") {
            Axios.get(createQueryString(docQueryAAI)).then(res => {
                let docSelection = res.data.datas.filter(x => {
                    return (
                        [...datasDoc].filter(y => y.DataDocumentCode == x.Code).length ===
                        0
                    );
                });
                setapiDoc(docSelection.map(x => ({ Code: x.Code, value: x.ID })));
            });
        } else {

            Axios.get(createQueryString(docQuery)).then(res => {
                let docSelection = res.data.datas.filter(x => {
                    return (
                        [...datasDoc].filter(y => y.DataDocumentCode == x.Code).length ===
                        0
                    );
                });
                setapiDoc(docSelection.map(x => ({ Code: x.Code, value: x.ID })));
            });
        }

    }

    const OnclickConfirmQueue = () => {
        dataConfirmQ["processQueues"] = [];
        datasDoc.forEach((a, idx) => {
            a.DataDocumentItem.forEach(y => {
                if (y.CheckDocument === true) {
                    var conditions = [];
                    var orderBys = [];
                    var eventStatuses = [];
                    var fildNames = ""
                    if (a.DataSorting[0] !== undefined) {
                        a.DataSorting.filter(x => x.docItemID === y.ID).forEach(
                            (ds, dsIdx) => {
                                if (props.docType !== "audit") {
                                    ds.forEach((d, idx) => {

                                        if (d.value === "Carton No") {
                                            fildNames = "ref2"
                                        } else if (d.value === "Order No") {
                                            fildNames = "orderno"

                                        } else if (d.value === "Create time") {
                                            fildNames = "createtime"

                                        } else {
                                            fildNames = d.value
                                        }


                                        let sort = {
                                            fieldName: "psto." + fildNames,
                                            orderByType: d.Order === "FIFO" ? 0 : 1
                                        };

                                        orderBys.push(sort);
                                    });
                                } else {
                                    orderBys = [];
                                }
                            }
                        );
                    }

                    a.DataSource.forEach((co, ins) => {
                        co.forEach((s, ins) => {
                            if (s.ID === y.ID) {
                                let con = {
                                    batch: s.Batch ? s.Batch : null,
                                    lot: s.Lot ? s.Lot : null,
                                    orderNo: s.OrderNo ? s.OrderNo : null,
                                    options: s.Optionsdoc ? s.Optionsdoc : null,
                                    baseQty: s.BaseQuantity ? s.BaseQuantity : null
                                };
                                conditions.push(con);

                                if (s.ID === y.ID) {
                                    if (y.Receive) {
                                        eventStatuses.push(12);
                                    }
                                    if (y.Block) {
                                        eventStatuses.push(99);
                                    }
                                    if (y.QC) {
                                        eventStatuses.push(98);
                                    }
                                    if (y.Hold) {
                                        eventStatuses.push(99);
                                    }
                                    if (y.Return) {
                                        eventStatuses.push(96);
                                    }
                                    if (y.Partial) {
                                        eventStatuses.push(97);
                                    }
                                    if (y.Reject) {
                                        eventStatuses.push(24);
                                    }
                                }
                            }
                        });
                    });

                    var RandomCt = null;
                    var RamdonCts = null;
                    if (props.random === true) {
                        RandomCt = y.Random;
                        RamdonCts = y.Randoms;
                    } else {
                        RandomCt = null;
                    }
                    let processQueuesz = null

                    if (window.project === "AAI") {
                        let processQueues = {
                            docID: a.DataDocumentID,
                            docItemID: y.ID,
                            locationCode: y.locationcode ? y.locationcode : null,
                            baseCode: y.palletcode ? y.palletcode : null,
                            skuCode: y.palletcode ? null : y.Code ? y.Code : null,
                            priority: y.PriorityDoc ? y.PriorityDoc : 2,
                            useShelfLifeDate: y.ShelfLifeDate ? y.ShelfLifeDate : false,
                            useExpireDate: y.ExpireDate ? y.ExpireDate : false,
                            useIncubateDate: y.IncubateDate ? y.IncubateDate : false,
                            useFullPick: y.FullPallet ? y.FullPallet : false,
                            baseQty: y.BaseqtyMax
                                ? y.BaseqtyMax
                                : y.BaseQuantity
                                    ? y.BaseQuantity
                                    : null,
                            percentRandom: RamdonCts ? RamdonCts : RandomCt,
                            eventStatuses: eventStatuses,
                            conditions: conditions,
                            orderBys: orderBys
                        };
                        processQueuesz = processQueues

                    } else {
                        let processQueues = {
                            docID: a.DataDocumentID,
                            docItemID: y.ID,
                            locationCode: y.locationcode ? y.locationcode : null,
                            baseCode: y.palletcode ? y.palletcode : null,
                            skuCode: y.Code ? y.Code : null,
                            priority: y.PriorityDoc ? y.PriorityDoc : 2,
                            useShelfLifeDate: y.ShelfLifeDate ? true : false,
                            useExpireDate: y.ExpireDate ? true : false,
                            useIncubateDate: y.IncubateDate ? true : false,
                            useFullPick: y.FullPallet ? true : false,
                            baseQty: y.BaseqtyMax
                                ? y.BaseqtyMax
                                : y.BaseQuantity
                                    ? y.BaseQuantity
                                    : null,
                            percentRandom: RamdonCts ? RamdonCts : RandomCt,
                            eventStatuses: eventStatuses,
                            conditions: conditions,
                            orderBys: orderBys

                        };
                        processQueuesz = processQueues
                    }

                    dataConfirmQ["processQueues"].push(processQueuesz);
                }
            });
        });

        //dataConfirmQ["apiKey"] = "WCS_KEY"
        dataConfirmQ["desASRSLocationCode"] = null;
        dataConfirmQ["lockNotExistsRandom"] = props.lockRandom ? true : false;
        dataConfirmQ["isSetQtyAfterDoneWQ"] = props.QtyAfterDoneWQ ? props.QtyAfterDoneWQ : true;
        //isSetQtyAfterDoneWQ: props.QtyAfterDoneWQ ? props.QtyAfterDoneWQ : true  
        if (dataConfirmQ !== undefined) {
            Axios1.post(window.apipath + "/v2/process_wq", dataConfirmQ).then(res => {
                if (res.data._result.status === 1) {
                    bodyDialogConfirm(res.data.processResults);
                    setprocessResultsCon(res.data.processResults);
                    //setopenDialogCon(true)
                } else {
                    setMsgDialogErr(res.data._result.message);
                    setStateDialogErr(true);
                }
            });
        } else {
        }
    };

    const bodyDialogConfirm = process => {
        if (process !== null) {
            return setbodyDailogCon(
                <div>
                    {process.map((x, idx) => {
                        return (
                            <div>
                                <div>
                                    {" "}
                                    <FormInline>
                                        <div
                                            style={{
                                                marginLeft: "5px",
                                                paddingTop: "15px",
                                                paddingBottom: "10px"
                                            }}
                                        >
                                            <LabelT style={LabelH}>Document : {x.docCode}</LabelT>
                                        </div>
                                    </FormInline>
                                </div>
                                {x.processResultItems.map((a, idx) => {
                                    processResults.push(a);
                                    var datasConfirms = [];
                                    var datasConfirmsLock = [];
                                    var dataTBs = [];
                                    let num = 0
                                    if (a.pickStos.length === 0) {
                                        setMsgDialogErr("SKU not in storage");
                                        setStateDialogErr(true);
                                    } else {
                                        setopenDialogCon(true);
                                        return (
                                            <div>
                                                <div>
                                                    <FormInline>
                                                        <div style={{ marginLeft: "5px" }}>
                                                            <label>DocumentItem: {a.docItemCode}</label>
                                                        </div>
                                                    </FormInline>
                                                </div>

                                                {a.pickStos.map(x => {
                                                    //setsumBase();
                                                    //setsumBaseMax();
                                                    var dataTBCon = [];
                                                    var dataSorceTBs = {}
                                                    if (window.project === "STGT") {
                                                        dataSorceTBs = {
                                                            SKU: x.pstoCode + ":" + x.pstoName,
                                                            Pallet: x.rstoCode,
                                                            Batch: x.pstoBatch,
                                                            Lot: x.pstoLot,
                                                            OrderNo: x.pstoOrderNo,
                                                            BaseQuantity: x.pickBaseQty + "/" + x.pstoBaseQty,
                                                            Unit: x.pstoBaseUnitCode,
                                                            StatusData: 1
                                                        };

                                                    } else {
                                                        dataSorceTBs = {
                                                            SKU: x.pstoCode,
                                                            Pallet: x.rstoCode,
                                                            Batch: x.pstoBatch,
                                                            Lot: x.pstoLot,
                                                            OrderNo: x.pstoOrderNo,
                                                            BaseQuantity: x.pickBaseQty + "/" + x.pstoBaseQty,
                                                            Unit: x.pstoBaseUnitCode,
                                                            StatusData: 1
                                                        };
                                                    }

                                                    dataTBCon.push(dataSorceTBs);
                                                    datasConfirms.push(dataSorceTBs);
                                                    dataTBs.push(dataSorceTBs);
                                                    setReload({});
                                                })}
                                                {a.lockStos
                                                    ? a.lockStos.map(x => {
                                                        //setsumBase();
                                                        //setsumBaseMax();

                                                        var dataTBConLock = [];
                                                        var dataSorceTBsLock
                                                        if (window.project === "STGT") {
                                                            dataSorceTBsLock = {
                                                                SKU: x.pstoCode + ":" + x.pstoName,
                                                                Pallet: x.rstoCode,
                                                                Batch: x.pstoBatch,
                                                                Lot: x.pstoLot,
                                                                OrderNo: x.pstoOrderNo,
                                                                BaseQuantity:
                                                                    x.pickBaseQty + "/" + x.pstoBaseQty,
                                                                Unit: x.pstoBaseUnitCode,
                                                                StatusData: 2
                                                            };
                                                        } else {
                                                            dataSorceTBsLock = {
                                                                SKU: x.pstoCode,
                                                                Pallet: x.rstoCode,
                                                                Batch: x.pstoBatch,
                                                                Lot: x.pstoLot,
                                                                OrderNo: x.pstoOrderNo,
                                                                BaseQuantity:
                                                                    x.pickBaseQty + "/" + x.pstoBaseQty,
                                                                Unit: x.pstoBaseUnitCode,
                                                                StatusData: 2
                                                            };

                                                        }

                                                        dataTBConLock.push(dataSorceTBsLock);
                                                        datasConfirmsLock.push(dataSorceTBsLock);
                                                        dataTBs.push(dataSorceTBsLock);
                                                        setReload({});
                                                    })
                                                    : null}

                                                < AmTable
                                                    data={dataTBs === undefined ? [] : dataTBs}
                                                    columns={props.columnConfirm}
                                                    minRows={1}
                                                    sumFooter={SumTables(a.pickStos)}
                                                    reload={reload}
                                                    sortable={false}
                                                    //pageSize={1}
                                                    currentPage={0}
                                                    pageSize={1000}

                                                ></AmTable>


                                                {/*a.lockStos ? < div style={{ paddingTop: "10px" }}>
                                                    < AmTable
                                                        data={datasConfirmsLock === undefined ? [] : datasConfirmsLock}
                                                        columns={props.columnConfirm}
                                                        minRows={1}
                                                        sumFooter={SumTables(a.lockStos)}
                                                        reload={reload}
                                                        sortable={false}
                                                        style={{ color: 'red' }}
                                                    ></AmTable>

                                                </div>:null*/}
                                            </div>
                                        );
                                    }
                                })}
                            </div>
                        );
                    })}
                </div>
            );
        } else {
        }
    };
    const SumTables = datasConfirms => {
        return props.columnConfirm
            .filter(row => row.Footer === true)
            .map(row => {
                return {
                    accessor: row.accessor,
                    sumData:
                        sumFooterTotal(datasConfirms) +
                        "/" +
                        sumFooterTotalMax(datasConfirms)
                };
            });
    };

    const sumFooterTotal = datasConfirms => {
        var sumVal = _.sumBy(datasConfirms, "pickBaseQty");
        if (
            sumVal === 0 ||
            sumVal === null ||
            sumVal === undefined ||
            isNaN(sumVal)
        ) {
            return "-";
        } else {
            return sumVal;
        }
    };

    const sumFooterTotalMax = datasConfirms => {
        var sumVals = _.sumBy(datasConfirms, "pstoBaseQty");
        if (
            sumVals === 0 ||
            sumVals === null ||
            sumVals === undefined ||
            isNaN(sumVals)
        ) {
            return "-";
        } else {
            return sumVals;
        }
    };

    const OnConfirmprocess = () => {
        //confirmProcess = {}
        //confirmProcess["apiKey"] = "WCS_KEY"
        confirmProcess["desASRSWarehouseCode"] = dataConfirmQ["desASRSWarehouseCode"];
        confirmProcess["desASRSLocationCode"] = null;
        confirmProcess["desASRSAreaCode"] = dataConfirmQ["desASRSAreaCode"];
        confirmProcess["processResults"] = processResultsCon;

        Axios1.post(window.apipath + "/v2/confirm_process_wq", confirmProcess).then(
            res => {
                if (res.data._result.status === 1) {
                    setMsgDialogSuc(res.data._result.message);
                    setStateDialogSuc(true);
                    setopenDialogCon(false);
                    setwarehouseID();
                    setValue(0);
                    setdatasDoc();
                    setDataDocumentItem();
                    setdataQueue();
                    setdataSorting();
                    setDataSource();
                    props.history.push(props.apiResConfirm);
                } else {
                    setMsgDialogErr(res.data._result.message);
                    setStateDialogErr(true);
                }
            }
        );
    };

    const OnclickConfirmCleare = () => {
        setdataClear(true);
        setopenDialogClear(true);
        setbodyDailogClear(
            <div style={{ width: "500px", height: "100px" }}>
                <LabelT style={LabelH}>Confirm Clear</LabelT>
                <FormInline>
                    <LabelT>Confirm Clare Data</LabelT>
                </FormInline>
            </div>
        );
    };

    const OnConfirmClear = () => {
        setdatasDoc([]);
        setDataDocumentItem([]);
        setdataQueue([]);
        setdataSorting([]);
        setDataSource([]);
        setPagesQ(0);
        setopenDialogClear(false);
    };
    const getDetailDocuments = () => {
        Axios.get(
            window.apipath +
            "/v2/GetDocAPI/?docTypeID=" +
            props.DocType +
            "&docID=" +
            documentID +
            "&getMapSto=true&_token=" +
            localStorage.getItem("Token")
        ).then(res => {
            if (res.data._result.status === 1) {
                var doc = res.data.document;
                if (doc.DesCustomerName !== null) {
                    setdesdoc(doc.DesCustomerName);
                    settextDes("Destination Customer");
                } else {
                    setdesdoc(doc.DesWarehouseName);
                    settextDes("Destination Warehouse");
                }

                window.project === "AAI"
                    ? setmovement(doc.Ref2)
                    : setmovement(doc.MovementName);

                setref1(doc.Ref1);
                setrefID(doc.RefID);
                setremark(doc.Remark);
                setsouware(doc.SouWarehouseName);
                setdesware(doc.DesWarehouseName);
                setdescus(doc.DesCustomerName);
            } else {
            }
        });
    };
    return (
        <div>
            <div>
                <AmDialogs
                    typePopup={"success"}
                    content={msgDialogSuc}
                    onAccept={e => {
                        setStateDialogSuc(e);
                    }}
                    open={stateDialogSuc}
                ></AmDialogs>
                <AmDialogs
                    typePopup={"error"}
                    content={msgDialogErr}
                    onAccept={e => {
                        setStateDialogErr(e);
                    }}
                    open={stateDialogErr}
                ></AmDialogs>
                <AppBar position="static" color="default">
                    <Tabs
                        classes={{
                            indicator: classnames(
                                classes.bigIndicator,
                                classes["indicator_" + value]
                            )
                        }}
                        value={value}
                        onChange={handleChange}
                        scrollButtons="on"
                    >
                        <Tab
                            label={t("Add")}
                            className={classes.fontIndi_0}
                            icon={<LibraryAdd />}
                        />
                        <Tab
                            label={t("Queue")}
                            className={classes.fontIndi_1}
                            icon={<CheckBox />}
                        />
                    </Tabs>
                </AppBar>
            </div>
            {value === 0 ? (
                <Card style={{ overflow: "initial" }}>
                    {value === 0 ? (
                        <div
                            style={{
                                marginTop: "10px",
                                paddingBottom: "10px",
                                background: "#eeeeee"
                            }}
                        >
                            <Grid container spacing={16}>
                                <Grid item>
                                    <FormInline>
                                        <div
                                            style={{
                                                marginLeft: "10px",
                                                marginTop: "10px",
                                                width: "150px"
                                            }}
                                        >
                                            <LabelT style={LabelH}>Source Warehouse : </LabelT>
                                        </div>
                                        <div style={{ marginTop: "10px", marginLeft: "8px" }}>
                                            {" "}
                                            <AmDropdown
                                                id="desASRSWarehouseCode"
                                                placeholder="Warehouse"
                                                fieldDataKey="ID" //??????????????????Column ???????????????????????????table ??????db
                                                fieldLabel={["Code", "Name"]}
                                                labelPattern=" : " //?????????????????????????????????????????????????????????????????????????????????????????????????????????
                                                width={300} //??????????????????????????????????????????????????????????????? input
                                                ddlMinWidth={300} //?????????????????????????????????????????????????????????????????? dropdown
                                                //valueData={valueDocument} //????????? value ????????????????????????
                                                queryApi={props.apiwarehouse}
                                                returnDefaultValue={true}
                                                defaultValue={
                                                    props.Defaulwarehouse
                                                        ? props.Defaulwarehouse
                                                        : warehouseID
                                                            ? warehouseID
                                                            : ""
                                                }
                                                //disabled={props.Defaulwarehouse ? true : btnBack? true: false}
                                                onChange={onHandleChangeDDLWarehouse}
                                                ddlType={"search"} //?????????????????? Dropdown
                                            />
                                        </div>
                                    </FormInline>
                                    <FormInline>
                                        <div
                                            style={{
                                                marginLeft: "10px",
                                                marginTop: "10px",
                                                width: "150px"
                                            }}
                                        >
                                            <LabelT style={LabelH}>Document : </LabelT>
                                        </div>
                                        <div style={{ marginTop: "10px", marginLeft: "8px" }}>
                                            {" "}
                                            <AmDropdown
                                                id="document"
                                                placeholder="Document"
                                                fieldDataKey="value" //??????????????????Column ???????????????????????????table ??????db
                                                fieldLabel={["Code"]}
                                                data={apiDoc}
                                                labelPattern=" : " //?????????????????????????????????????????????????????????????????????????????????????????????????????????
                                                width={300} //??????????????????????????????????????????????????????????????? input
                                                ddlMinWidth={300} //?????????????????????????????????????????????????????????????????? dropdown
                                                valueData={valueDocument} //????????? value ????????????????????????
                                                //queryApi={apiDoc}
                                                returnDefaultValue={true}
                                                defaultValue={btnBack === true && documentID ? documentID : ""}
                                                disabled={btnBack === true ? true : false}
                                                onChange={(value, dataObject) =>
                                                    onHandleChangeDDLDocument(value, dataObject)
                                                }
                                                ddlType={"search"} //?????????????????? Dropdown
                                            />
                                        </div>
                                        <div style={{ marginLeft: "10px" }}>
                                            {documentID ? (
                                                <AmRediRectInfo
                                                    link={false}
                                                    textLink={docCodelink}
                                                    api={props.apidetail + documentID}
                                                    history={props.history}
                                                ></AmRediRectInfo>
                                            ) : null}
                                        </div>
                                    </FormInline>
                                </Grid>
                            </Grid>
                        </div>
                    ) : null}
                    {DataDocumentItem !== undefined && DataDocumentItem.length > 0 ? (
                        <div>
                            <div style={{ marginTop: "10px", paddingBottom: "10px" }}>
                                <div style={{ paddingTop: "10px" }}>{docHeaderdetail}</div>
                            </div>

                            {value === 0 ? (
                                <div>
                                    {" "}

                                    {[...DataDocumentItem].map((x, idx) => {

                                        if (!dataSource[idx]) {
                                            dataSource[idx] = [x];
                                        }

                                        if (!dataSorting[idx]) {
                                            if (props.DefaulSorting !== undefined)
                                                dataSorting[idx] = [...props.DefaulSorting];
                                            //dataSorting[idx] = dataSorting
                                        }
                                        //return dataSorting[idx].map((yz, idxSort) => {

                                        var columnConditionx = [...columnCondition];
                                        var columnSortx = [...columnSort];

                                        columnConditionx.push(
                                            {
                                                Header: "",
                                                width: 110,
                                                Cell: e =>
                                                    e.original.ID < 0 ? (
                                                        <AmButton
                                                            style={{ width: 100 }}
                                                            styleType="info"
                                                            disable={e.original.ID > 0 ? false : true}
                                                            onClick={() => {
                                                                setEditData(e);
                                                                setDialog(true);
                                                                setTitle("Edit");

                                                            }}
                                                        >Edit</AmButton>
                                                    ) : null
                                            },
                                            {
                                                Header: "",
                                                width: 110,
                                                Cell: e =>
                                                    e.original.ID < 0 ? (
                                                        <AmButton
                                                            style={{ width: 100 }}
                                                            styleType="delete"
                                                            disable={e.original.ID > 0 ? false : true}
                                                            onClick={() => {
                                                                onHandleDelete(
                                                                    e.original.ID,
                                                                    e.original,
                                                                    e,
                                                                    idx
                                                                );
                                                            }}
                                                        >Remove</AmButton>
                                                    ) : null
                                            }
                                        );

                                        columnSortx.push(
                                            {
                                                Header: "",
                                                width: 110,
                                                Cell: e => (
                                                    <AmButton
                                                        style={{ width: 100 }}
                                                        styleType="info"
                                                        onClick={() => {
                                                            setEditDataSort(e);
                                                            setDialogSort(true);
                                                            setTitleSort("Edit Sort");
                                                            //setidxSortBtn(idxSort)
                                                        }}
                                                    >Edit</AmButton>
                                                )
                                            },
                                            {
                                                Header: "",
                                                width: 110,
                                                Cell: e => (
                                                    <AmButton
                                                        style={{ width: 100 }}
                                                        styleType="delete"
                                                        onClick={() => {
                                                            onHandleDeleteSort(
                                                                e.original.ID,
                                                                e.original,
                                                                e,
                                                                idx
                                                                //idxSort
                                                            );
                                                        }}
                                                    >Remove</AmButton>
                                                )
                                            }
                                        );


                                        var STqty = qtyInput;
                                        var Inqty = parseInt(STqty, 10);
                                        var Inqtys = parseInt(x.BaseQuantity, 10);
                                        let qty = _.sum([Inqtys, Inqty]);


                                        if (
                                            x.BaseQuantity !== null &&
                                            !qtyDocItem[idx] &&
                                            x.BaseQuantity !== undefined
                                        ) {
                                            qtyDocItem[idx] = x.BaseQuantity;
                                            setqtyDocItem(qtyDocItem);
                                            DataDocumentItem[idx]["BaseqtyMax"] = qtyDocItem[idx];
                                        }
                                        if (x.Options !== null && x.Options !== undefined && window.project !== "AAI") {
                                            if (x.Options !== undefined || x.Options !== null) {
                                                var qryStr1 = queryString.parse(x.Options)
                                                var palletcode = qryStr1["palletcode"]
                                                if (palletcode !== null || palletcode !== undefined)
                                                    DataDocumentItem[idx]["palletcode"] = palletcode;
                                                var locationcode = qryStr1["locationcode"]
                                                if (locationcode !== null || locationcode !== undefined)
                                                    DataDocumentItem[idx]["locationcode"] = locationcode;
                                                var qtyrandom = qryStr1["qtyrandom"]
                                                onChangeRandom(null, idx, qtyrandom);


                                            }
                                        }

                                        if (props.docType === "audit") {
                                            var qtyrandoms = "100";
                                            var es = null;

                                            // onChangeRandom(es, idx, qtyrandoms)
                                        } else if (btnBack === false) {
                                            var qtyrandoms = null;
                                            var es = null;
                                            onChangeRandom(es, idx, qtyrandoms);
                                        }

                                        if (props.fullPallets === true)
                                            onChangCheckboxConsFull(null, null, idx);

                                        if (props.receives === true || props.defaultExpireDate === true)
                                            onChangCheckboxConsRecieve(null, null, idx);

                                        if (props.disibleShelfLifeDate === true || props.defaultShelfLifeDate === true)
                                            onChangCheckboxConsSelfLife(null, null, idx);

                                        if (props.defaultFullPallete === true)
                                            onChangCheckboxConsFull(null, null, idx);

                                        if (props.defaultFullPallete === false)
                                            onChangCheckboxConsFulls(null, null, idx);

                                        if (props.disibleExpireDate === true || props.defaultExpireDate === true)
                                            onChangCheckboxExpire(null, null, idx);

                                        if (props.disibleIncubateDate === true || props.defaultIncubateDate === true)
                                            onChangCheckboxIncubase(null, null, idx);

                                        if (btnBack === false) {
                                            if ((dataSource[idx][0]["Priority"] = null)) {
                                                let values = 2;
                                                let dataObject = { label: "Normal", value: "2" };
                                                Onchangepriolity(values, dataObject, idx);
                                            }
                                        }

                                        if (docDesCustomer !== null && props.StatusfromDescustomer === true) {
                                            if (props.FullPallet === true)
                                                onChangCheckboxConsFull(null, null, idx);

                                            onChangCheckboxConsRecieve(null, null, idx);

                                        }


                                        if (docDesWarehouse !== null && props.StatusfromDeswarehouse === true) {
                                            if (props.FullPallet === true)
                                                onChangCheckboxConsFull(null, null, idx);

                                            onChangCheckboxConsRecieve(null, null, idx);
                                            onChangCheckboxConsQC(null, null, idx);
                                            onChangCheckboxConsReturn(null, null, idx);
                                            onChangCheckboxConsPartail(null, null, idx);

                                        }

                                        if (props.AllStatus === true) {
                                            onChangCheckboxConsFull(null, null, idx);
                                            onChangCheckboxConsRecieve(null, null, idx);
                                            onChangCheckboxConsQC(null, null, idx);
                                            onChangCheckboxConsReturn(null, null, idx);
                                            onChangCheckboxConsPartail(null, null, idx);
                                        }

                                        var RecieveFromDoc = false
                                        var QcFromDoc = false
                                        var BlockFromDoc = false
                                        var HoldFromDoc = false
                                        var RejectFromDoc = false

                                        if (props.OptionGIdoc === true) {
                                            if (x.Options !== undefined || x.Options !== null) {
                                                var qryStr2 = queryString.parse(x.Options)
                                                var palletcode = qryStr2["basecode"]
                                                DataDocumentItem[idx]["palletcode"] = palletcode;
                                                var RecieveDoc = qryStr2["bestq_ur"]
                                                if (RecieveDoc === "Y") {
                                                    RecieveFromDoc = true
                                                    onChangCheckboxConsRecieve(null, null, idx);
                                                }
                                                var QcDoc = qryStr2["bestq_qi"]
                                                if (QcDoc === "Y") {
                                                    QcFromDoc = true
                                                    onChangCheckboxConsQC(null, null, idx);
                                                }

                                                var BlockDoc = qryStr2["bestq_blk"]
                                                if (BlockDoc === "Y") {
                                                    BlockFromDoc = true
                                                    onChangCheckboxConsBlock(null, null, idx);
                                                }
                                            }


                                        }

                                        return (
                                            <div style={{ marginLeft: "10px", marginRight: "10px" }}>
                                                <BorderAdd>
                                                    <Card>
                                                        <FormInline>
                                                            <AmCheckBox
                                                                value="checkItem"
                                                                //label="Receive"
                                                                //checked={x.Recive ? true : RecieveFromDoc ? RecieveFromDoc : null}
                                                                defaultChecked={true}
                                                                //disabled={RecieveFromDoc === true ? true : false}
                                                                onChange={(e, v) =>
                                                                    onChangCheckboxDocItem(e, idx)
                                                                }
                                                            ></AmCheckBox>
                                                            {window.project === "STA" ?
                                                                <AmButton
                                                                    styleType="add_clear"
                                                                    style={{ marginLeft: "10px" }}
                                                                    onClick={() => onclickToggel(idx)}
                                                                >

                                                                    {x.OrderNo} : {x.Code} :{x.SKUMaster_Name} : {x.SKUMaster_Type}

                                                                    <ExpandLessIcon
                                                                        className={
                                                                            toggle[idx]
                                                                                ? classes.expand
                                                                                : classes.collapse
                                                                        }
                                                                    />
                                                                </AmButton>

                                                                : <AmButton
                                                                    styleType="add_clear"
                                                                    style={{ marginLeft: "10px" }}
                                                                    onClick={() => onclickToggel(idx)}
                                                                    append={<ExpandLessIcon
                                                                        className={
                                                                            toggle[idx]
                                                                                ? classes.expand
                                                                                : classes.collapse
                                                                        }
                                                                    />}
                                                                >

                                                                    {x.Code}: {x.SKUMaster_Name}}

                                                                </AmButton>}
                                                        </FormInline>
                                                        <div style={{ clear: "both" }}></div>
                                                        <Collapse in={toggle[idx]}>
                                                            {toggle[idx] === true ? (
                                                                <Paper elevation={4} className={classes.paper}>
                                                                    <FormInline style={{ marginLeft: "15px" }}>
                                                                        <Grid container spacing={24}>
                                                                            <Grid
                                                                                item
                                                                                xs
                                                                                container
                                                                                direction="column"
                                                                                spacing={14}
                                                                            >

                                                                                {window.project === "STA" ?

                                                                                    <label style={LabelH}>

                                                                                        {x.OrderNo} : {x.Code} :{x.SKUMaster_Name} : {x.SKUMaster_Type}

                                                                                    </label>

                                                                                    : <label style={LabelH}>
                                                                                        {x.Code} : {x.SKUMaster_Name}
                                                                                        {palletcode ? (
                                                                                            <label style={LabelH}> / {palletcode}</label>
                                                                                        ) : null}
                                                                                        {locationcode ? (
                                                                                            <label style={LabelH}> / {locationcode}</label>
                                                                                        ) : null}
                                                                                    </label>}
                                                                            </Grid>
                                                                            <LabelT style={LabelH}>Qty :</LabelT>{" "}
                                                                            <label>


                                                                                {x.Quantity === null ? "-" : x.Quantity} {x.UnitType_Name} (
                                        {qtyDocItem[idx] === null ? "-" : qtyDocItem[idx]} {x.BaseUnitType_Code})
                                      </label>
                                                                        </Grid>
                                                                    </FormInline>
                                                                    <FormInline>
                                                                        <div
                                                                            style={{
                                                                                marginLeft: "15px",
                                                                                paddingTop: "10px"
                                                                            }}
                                                                        >
                                                                            <LabelT style={LabelH}>Priority : </LabelT>
                                                                        </div>
                                                                        <div style={{ marginLeft: "130px" }}>
                                                                            {" "}
                                                                            <AmDropdown
                                                                                id="priority"
                                                                                placeholder="Select"
                                                                                data={
                                                                                    props.priolity
                                                                                        ? props.priolity
                                                                                        : priolity()
                                                                                }
                                                                                fieldDataKey="value"
                                                                                fieldLabel={["label"]}
                                                                                width={200} //??????????????????????????????????????????????? input
                                                                                ddlMinWidth={100} //?????????????????????????????????????????????????? dropdown
                                                                                valueData={valueText} //????????? value ????????????????????
                                                                                defaultValue={
                                                                                    x.PriorityDoc
                                                                                        ? x.PriorityDoc
                                                                                        : props.priolity
                                                                                            ? 2
                                                                                            : defaultpriority
                                                                                }
                                                                                // returnDefaultValue={true}
                                                                                onChange={(value, dataObject) =>
                                                                                    Onchangepriolity(
                                                                                        value,
                                                                                        dataObject,
                                                                                        idx
                                                                                    )
                                                                                }
                                                                                ddlType={"search"}
                                                                            ></AmDropdown>
                                                                        </div>
                                                                    </FormInline>
                                                                    {props.advanceCondition === true ? (
                                                                        <FormInline
                                                                            style={{
                                                                                marginLeft: "15px",
                                                                                paddingTop: "10px"
                                                                            }}
                                                                        >
                                                                            <LabelT style={LabelH}>Advance Condition : </LabelT>
                                                                            <FormInline>
                                                                                <div>
                                                                                    {" "}
                                                                                    {props.fullPallets === true ? (
                                                                                        <AmCheckBox
                                                                                            value="FullPallet"
                                                                                            label="FullPallet"
                                                                                            checked={true}
                                                                                            onChange={(e, v) =>
                                                                                                onChangCheckboxConsFull(
                                                                                                    e,
                                                                                                    v,
                                                                                                    idx
                                                                                                )
                                                                                            }
                                                                                        >
                                                                                            >
                                            </AmCheckBox>
                                                                                    ) :

                                                                                        (
                                                                                            <div>
                                                                                                <FormInline>
                                                                                                    {props.ShelfLifeDate === true ? <AmCheckBox
                                                                                                        value="ShelfLifeDate"
                                                                                                        label="ShelfLifeDate"
                                                                                                        disable={
                                                                                                            x.ShelfLife ? true : props.disibleShelfLifeDate ? props.disibleShelfLifeDate : null
                                                                                                        }
                                                                                                        checked={props.checkedShelfLifeDate ? props.checkedShelfLifeDate : null}
                                                                                                        defaultChecked={props.defaultShelfLifeDate ? props.defaultShelfLifeDate : null}
                                                                                                        defaultValue={props.defaultShelfLifeDate ? props.defaultShelfLifeDate : null}
                                                                                                        onChange={(e, v) =>
                                                                                                            onChangCheckboxCon(e, idx)
                                                                                                        }
                                                                                                    >
                                                                                                        >
                                                                                       </AmCheckBox> : null}
                                                                                                    {props.IncubateDate === true ? <AmCheckBox
                                                                                                        value="IncubateDate"
                                                                                                        label="IncubateDate"
                                                                                                        disable={
                                                                                                            x.Incubate ? true : props.disibleIncubateDate ? props.disibleIncubateDate : null
                                                                                                        }
                                                                                                        checked={props.checkedIncubateDate ? props.checkedIncubateDate : null}
                                                                                                        defaultChecked={props.defaultIncubateDate ? props.defaultIncubateDate : null}
                                                                                                        defaultValue={props.defaultIncubateDate ? props.defaultIncubateDate : null}
                                                                                                        onChange={(e, v) =>
                                                                                                            onChangCheckboxCon(e, idx)
                                                                                                        }
                                                                                                    >
                                                                                                        >
                                                </AmCheckBox> : null}
                                                                                                    {props.ExpireDate === true ? <AmCheckBox
                                                                                                        value="ExpireDate"
                                                                                                        label="ExpireDate"
                                                                                                        checked={props.checkedExpireDate ? props.checkedExpireDate : null}
                                                                                                        disable={
                                                                                                            x.ExpiredDate ? true : props.disibleExpireDate ? props.disibleExpireDate : null
                                                                                                        }
                                                                                                        defaultChecked={props.defaultExpireDate ? props.defaultExpireDate : null}
                                                                                                        onChange={(e, v) =>
                                                                                                            onChangCheckboxCon(e, idx)
                                                                                                        }
                                                                                                    >
                                                                                                        >
                                                </AmCheckBox> : null}
                                                                                                    {props.FullPallet === true ? <AmCheckBox
                                                                                                        value="FullPallet"
                                                                                                        label="FullPallet"
                                                                                                        checked={props.checkedFullPallet ? props.checkedFullPallet : null}
                                                                                                        disabled={
                                                                                                            x.FullPallet ? true : props.disibleFullPallet ? props.disibleFullPallet : null
                                                                                                        }


                                                                                                        defaultChecked={props.defaultFullPallete ? props.defaultFullPallete : null}
                                                                                                        onChange={(e, v) =>
                                                                                                            onChangCheckboxCon(e, idx)
                                                                                                        }
                                                                                                    >
                                                                                                        >
                                                </AmCheckBox> : null}
                                                                                                </FormInline>
                                                                                            </div>
                                                                                        )}
                                                                                </div>
                                                                            </FormInline>
                                                                        </FormInline>
                                                                    ) : null}
                                                                    {props.status === true ? (
                                                                        <FormInline style={{ marginLeft: "15px" }}>
                                                                            <LabelT style={LabelH}>Status : </LabelT>
                                                                            <FormInline>

                                                                                {props.AllStatus === true ?
                                                                                    <div>
                                                                                        <FormInline>
                                                                                            <AmCheckBox
                                                                                                value="Receive"
                                                                                                label="Receive"
                                                                                                defaultChecked={true}
                                                                                                //checked={true}
                                                                                                onChange={(e, v) =>
                                                                                                    onChangCheckboxStatus(e, idx)
                                                                                                }
                                                                                            >
                                                                                                >
                                              </AmCheckBox>
                                                                                            <AmCheckBox
                                                                                                value="QC"
                                                                                                label="QC"
                                                                                                defaultChecked={true}
                                                                                                //checked={true}
                                                                                                onChange={(e, v) =>
                                                                                                    onChangCheckboxStatus(e, idx)
                                                                                                }
                                                                                            >

                                                                                            </AmCheckBox>

                                                                                            {props.StatusReject === true ? <AmCheckBox
                                                                                                value="Reject"
                                                                                                label="Reject"
                                                                                                //checked={true}
                                                                                                defaultChecked={true}
                                                                                                onChange={(e, v) =>
                                                                                                    onChangCheckboxStatus(e, idx)
                                                                                                }
                                                                                            >

                                                                                            </AmCheckBox> : null}

                                                                                            {props.StatusHold === true ? <AmCheckBox
                                                                                                value="Hold"
                                                                                                label="Hold"
                                                                                                defaultChecked={true}
                                                                                                //checked={true}
                                                                                                onChange={(e, v) =>
                                                                                                    onChangCheckboxStatus(e, idx)
                                                                                                }
                                                                                            >

                                                                                            </AmCheckBox> : null}


                                                                                            <AmCheckBox
                                                                                                value="Return"
                                                                                                label="Returns"
                                                                                                defaultChecked={true}
                                                                                                //checked={true}
                                                                                                onChange={(e, v) =>
                                                                                                    onChangCheckboxStatus(e, idx)
                                                                                                }
                                                                                            >

                                                                                            </AmCheckBox>
                                                                                            <AmCheckBox
                                                                                                value="Partial"
                                                                                                label="Partial"
                                                                                                defaultChecked={true}
                                                                                                //checked={true}
                                                                                                onChange={(e, v) =>
                                                                                                    onChangCheckboxStatus(e, idx)
                                                                                                }
                                                                                            >

                                                                                            </AmCheckBox>

                                                                                        </FormInline>
                                                                                    </div>
                                                                                    : x.Des_Customer_ID !== null && props.StatusfromDescustomer === true ?
                                                                                        <div>
                                                                                            <FormInline>
                                                                                                <AmCheckBox
                                                                                                    value="Receive"
                                                                                                    label="Receive"

                                                                                                    defaultChecked={x.Des_Customer_ID ? true : dataSource[idx][0]["Receive"]}
                                                                                                    checked={dataSource[idx] !== undefined ? dataSource[idx][0]["Receive"] : false}
                                                                                                    onChange={(e, v) =>
                                                                                                        onChangCheckboxStatus(e, idx)
                                                                                                    }
                                                                                                >
                                                                                                    >
                                              </AmCheckBox>



                                                                                                <AmCheckBox
                                                                                                    value="Return"
                                                                                                    label="Returns"
                                                                                                    defaultChecked={x.Des_Customer_ID ? false : dataSource[idx][0]["Returns"] ? dataSource[idx][0]["Returns"] : null}
                                                                                                    checked={dataSource[idx] !== undefined ? dataSource[idx][0]["Returns"] : false}
                                                                                                    onChange={(e, v) =>
                                                                                                        onChangCheckboxStatus(e, idx)
                                                                                                    }
                                                                                                >

                                                                                                </AmCheckBox>
                                                                                                <AmCheckBox
                                                                                                    value="Partial"
                                                                                                    label="Partial"
                                                                                                    defaultChecked={x.Des_Customer_ID ? true : dataSource[idx][0]["Partial"] ? dataSource[idx][0]["Partial"] : null}
                                                                                                    checked={dataSource[idx] !== undefined ? dataSource[idx][0]["Partial"] : false}
                                                                                                    onChange={(e, v) =>
                                                                                                        onChangCheckboxStatus(e, idx)
                                                                                                    }
                                                                                                >

                                                                                                </AmCheckBox>

                                                                                            </FormInline>
                                                                                        </div>



                                                                                        : x.Des_Warehouse_ID !== null && props.StatusfromDeswarehouse === true ?
                                                                                            <div>
                                                                                                <FormInline>
                                                                                                    <AmCheckBox
                                                                                                        value="Receive"
                                                                                                        label="Receive"
                                                                                                        defaultChecked={true}
                                                                                                        //checked={true}
                                                                                                        onChange={(e, v) =>
                                                                                                            onChangCheckboxStatus(e, idx)
                                                                                                        }
                                                                                                    >

                                                                                                    </AmCheckBox>


                                                                                                    <AmCheckBox
                                                                                                        value="QC"
                                                                                                        label="QC"
                                                                                                        checked={true}
                                                                                                        defaultChecked={true}
                                                                                                        onChange={(e, v) =>
                                                                                                            onChangCheckboxStatus(e, idx)
                                                                                                        }
                                                                                                    >

                                                                                                    </AmCheckBox>
                                                                                                    <AmCheckBox
                                                                                                        value="Return"
                                                                                                        label="Returns"
                                                                                                        defaultChecked={true}
                                                                                                        //checked={true}
                                                                                                        onChange={(e, v) =>
                                                                                                            onChangCheckboxStatus(e, idx)
                                                                                                        }
                                                                                                    >

                                                                                                    </AmCheckBox>
                                                                                                    <AmCheckBox
                                                                                                        value="Partial"
                                                                                                        label="Partial"
                                                                                                        defaultChecked={true}
                                                                                                        //checked={true}
                                                                                                        onChange={(e, v) =>
                                                                                                            onChangCheckboxStatus(e, idx)
                                                                                                        }
                                                                                                    >

                                                                                                    </AmCheckBox>
                                                                                                </FormInline>
                                                                                            </div>
                                                                                            : props.receives === true ? (
                                                                                                <AmCheckBox
                                                                                                    value="Receive"
                                                                                                    label="Receive"
                                                                                                    checked={true}
                                                                                                    onChange={(e, v) =>
                                                                                                        onChangCheckboxConsRecieve(
                                                                                                            e,
                                                                                                            v,
                                                                                                            idx
                                                                                                        )
                                                                                                    }
                                                                                                >
                                                                                                    >
                                          </AmCheckBox>
                                                                                            ) : (
                                                                                                    <div>
                                                                                                        <FormInline>
                                                                                                            <AmCheckBox
                                                                                                                value="Receive"
                                                                                                                label="Receive"
                                                                                                                checked={x.Recive ? true : RecieveFromDoc ? RecieveFromDoc : null}
                                                                                                                defaultChecked={x.Recive ? true : RecieveFromDoc ? RecieveFromDoc : null}
                                                                                                                disabled={RecieveFromDoc === true ? true : false}
                                                                                                                onChange={(e, v) =>
                                                                                                                    onChangCheckboxStatus(e, idx)
                                                                                                                }
                                                                                                            >
                                                                                                                >
                                              </AmCheckBox>
                                                                                                            <AmCheckBox
                                                                                                                value="Block"
                                                                                                                label="Block"
                                                                                                                checked={x.Block ? true : BlockFromDoc ? BlockFromDoc : null}
                                                                                                                defaultChecked={x.Block ? true : BlockFromDoc ? BlockFromDoc : null}
                                                                                                                disabled={BlockFromDoc === true ? true : false}
                                                                                                                onChange={(e, v) =>
                                                                                                                    onChangCheckboxStatus(e, idx)
                                                                                                                }
                                                                                                            >
                                                                                                                >
                                              </AmCheckBox>
                                                                                                            <AmCheckBox
                                                                                                                value="QC"
                                                                                                                label="QC"
                                                                                                                checked={x.QC ? true : QcFromDoc ? BlockFromDoc : null}
                                                                                                                defaultChecked={x.QC ? true : QcFromDoc ? BlockFromDoc : null}
                                                                                                                disabled={QcFromDoc === true ? true : false}
                                                                                                                onChange={(e, v) =>
                                                                                                                    onChangCheckboxStatus(e, idx)
                                                                                                                }
                                                                                                            >
                                                                                                                >
                                              </AmCheckBox>
                                                                                                        </FormInline>
                                                                                                    </div>
                                                                                                )}
                                                                            </FormInline>
                                                                        </FormInline>
                                                                    ) : null}
                                                                    {props.random === true ? (
                                                                        <FormInline style={{ marginLeft: "15px" }}>
                                                                            <LabelT style={LabelH}>Counting (%):</LabelT>
                                                                            <AmInput
                                                                                defaultValue={
                                                                                    x.Randoms
                                                                                        ? x.Randoms
                                                                                        : qtyrandom
                                                                                            ? qtyrandom
                                                                                            : x.Random
                                                                                                ? x.Random
                                                                                                : "100"
                                                                                }
                                                                                style={{
                                                                                    width: "50px",
                                                                                    marginLeft: "5px"
                                                                                }}
                                                                                type="number"
                                                                                onChange={ele => {
                                                                                    onChangeRandoms(ele, idx);
                                                                                }}
                                                                            ></AmInput>
                                                                            <label>%</label>
                                                                        </FormInline>
                                                                    ) : null}

                                                                    {props.dataSortShow === true ? (
                                                                        <FormInline>
                                                                            <div
                                                                                style={{
                                                                                    marginLeft: "15px",
                                                                                    paddingTop: "10px"
                                                                                }}
                                                                            >
                                                                                {" "}
                                                                                <LabelT style={LabelH}>Sorting</LabelT>
                                                                            </div>
                                                                            <AmButton
                                                                                styleType="add_outline"
                                                                                style={{
                                                                                    marginLeft: "880px",
                                                                                    width: "150px"
                                                                                }}
                                                                                onClick={() => {
                                                                                    setDialogSort(true);
                                                                                    setAddData(true);
                                                                                    setTitleSort("Add Sorting");
                                                                                    setindexBtn(idx);
                                                                                    //setidxSortBtn(idxSort)
                                                                                }}
                                                                            >Add Sorting</AmButton>
                                                                        </FormInline>
                                                                    ) : null}
                                                                    {props.dataSortShow === true ? (
                                                                        <div style={{ marginTop: "5px" }}>

                                                                            <AmTable
                                                                                data={dataSorting[idx]}
                                                                                reload={reload}
                                                                                columns={columnSortx}
                                                                                minRows={1}
                                                                                sortable={false}

                                                                            ></AmTable>
                                                                        </div>
                                                                    ) : null}
                                                                    <FormInline>
                                                                        <div style={{ marginLeft: "15px" }}>
                                                                            <LabelT style={LabelH}>Coditions</LabelT>
                                                                        </div>
                                                                        {props.docType !== "audit" ? (
                                                                            <div>
                                                                                <AmButton
                                                                                    styleType="add_outline"
                                                                                    style={{
                                                                                        marginLeft: "880px",
                                                                                        width: "150px"
                                                                                    }}
                                                                                    onClick={() => {
                                                                                        setDialog(true);
                                                                                        setAddData(true);
                                                                                        setTitle("Add");
                                                                                        setindexBtn(idx);
                                                                                        //setidxSortBtn(idxSort);
                                                                                    }}
                                                                                >Add Conditions</AmButton>
                                                                            </div>
                                                                        ) : null}
                                                                    </FormInline>
                                                                    <div style={{ paddingBottom: "10px" }}>
                                                                        <AmTable
                                                                            data={
                                                                                dataSource[idx] === undefined
                                                                                    ? []
                                                                                    : dataSource[idx]
                                                                            }
                                                                            reload={reload}
                                                                            columns={columnConditionx}
                                                                            minRows={1}
                                                                            sortable={false}
                                                                        ></AmTable>
                                                                    </div>
                                                                </Paper>
                                                            ) : null}
                                                        </Collapse>
                                                    </Card>
                                                </BorderAdd>
                                            </div>
                                        );
                                        //})
                                    })
                                    }
                                </div>
                            ) : null}

                            <div style={{ paddingBottom: "5px", marginTop: "5px" }}>
                                <Grid container spacing={24}>
                                    <Grid
                                        item
                                        xs
                                        container
                                        direction="column"
                                        spacing={16}
                                    ></Grid>
                                    <Grid item>
                                        <div style={{ marginRight: "10px" }}>
                                            <AmButton styleType="add" onClick={addConPage}>Add Queue</AmButton>
                                        </div>
                                    </Grid>
                                </Grid>
                            </div>
                        </div>
                    ) : null}
                </Card>
            ) : null}

            {value === 1 ? (
                <div>
                    {datasDoc !== [] ? (
                        <Card style={{ overflow: "initial" }}>
                            <div style={{ marginTop: "10px" }}>
                                <div>
                                    {datasDoc.map((x, idx) => {
                                        var docs = x;
                                        var dataSOs = x["DataSource"];
                                        var dataSorts = x["DataSorting"];
                                        return (
                                            <div>
                                                <div
                                                    style={{
                                                        marginTop: "10px",
                                                        paddingBottom: "10px",
                                                        background: "#eeeeee"
                                                    }}
                                                >
                                                    <FormInline>
                                                        <div style={{ marginLeft: "5px", width: "100%" }}>
                                                            <FormInline>
                                                                <Grid container spacing={24}>
                                                                    <Grid
                                                                        item
                                                                        xs
                                                                        container
                                                                        direction="column"
                                                                        spacing={16}
                                                                    >
                                                                        <div style={{ marginLeft: "15px" }}>
                                                                            <FormInline>
                                                                                <LabelT style={LabelHDoc}>Document : </LabelT>
                                                                                <label style={LabelHDoc}>{x.DataDocumentCode}</label>
                                                                                <AmRediRectInfo
                                                                                    link={false}
                                                                                    textLink={docCodelink}
                                                                                    api={
                                                                                        props.apidetail + x.DataDocumentID
                                                                                    }
                                                                                    history={props.history}
                                                                                ></AmRediRectInfo>
                                                                            </FormInline>
                                                                        </div>
                                                                    </Grid>
                                                                    <Grid item>

                                                                        <AmButton
                                                                            style={{
                                                                                width: "100px",
                                                                                marginRight: "20px"
                                                                            }}
                                                                            styleType="confirm_outline"
                                                                            onClick={() => {
                                                                                OnclickRemoveAddDocument(

                                                                                    idx

                                                                                );
                                                                            }}
                                                                        >Remove</AmButton>



                                                                        <AmButton
                                                                            style={{
                                                                                width: "100px",
                                                                                marginRight: "20px"
                                                                            }}
                                                                            styleType="confirm_outline"
                                                                            onClick={() => {
                                                                                OnclickBackAddDocument(
                                                                                    { ...docs },
                                                                                    dataSOs,
                                                                                    dataSorts
                                                                                );
                                                                            }}
                                                                        >Edit</AmButton>
                                                                    </Grid>
                                                                </Grid>
                                                            </FormInline>
                                                        </div>
                                                    </FormInline>
                                                </div>
                                                <div
                                                    style={{ paddingBottom: "10px", paddingTop: "10px" }}
                                                >
                                                    {x.DataDocdetail.map(x => {
                                                        return (
                                                            <div style={{ marginTop: "10px" }}>
                                                                <Grid container spacing={24}>
                                                                    {x.map(y => {
                                                                        return (
                                                                            <Grid
                                                                                xs={6}
                                                                                style={{
                                                                                    paddingLeft: "10px",
                                                                                    paddingBottom: "10px"
                                                                                }}
                                                                            >
                                                                                <FormInline>
                                                                                    <div
                                                                                        style={{
                                                                                            paddingLeft: "10px",
                                                                                            width: "200px"
                                                                                        }}
                                                                                    >
                                                                                        <LabelT style={LabelH}>{y.label}</LabelT>
                                                                                    </div>
                                                                                    {getDataDetail(
                                                                                        y.type,
                                                                                        y.key,
                                                                                        y.values
                                                                                    )}
                                                                                </FormInline>
                                                                            </Grid>
                                                                        );
                                                                    })}
                                                                </Grid>
                                                            </div>
                                                        );
                                                    })}
                                                </div>

                                                {x.DataDocumentItem.map((y, idxItem) => {

                                                    if (
                                                        datasDoc[idx]["DataSource"][idxItem] !== undefined
                                                    )
                                                        var dataSO = datasDoc[idx]["DataSource"][idxItem];
                                                    if (
                                                        datasDoc[idx]["DataSorting"][idxItem] !== undefined
                                                    )
                                                        var dataSort =
                                                            datasDoc[idx]["DataSorting"][idxItem];

                                                    return (
                                                        <div
                                                            style={{
                                                                marginLeft: "10px",
                                                                marginRight: "10px"
                                                            }}
                                                        >
                                                            <BorderQueu>
                                                                {" "}
                                                                <Card>

                                                                    {y.CheckDocument === true ?

                                                                        <FormInline>

                                                                            <AmCheckBox

                                                                                checked={true}


                                                                            ></AmCheckBox>



                                                                            {window.project === "STA" ?
                                                                                <AmButton
                                                                                    styleType="info_clear"
                                                                                    style={{ marginLeft: "10px" }}
                                                                                    onClick={() =>
                                                                                        onclickToggelDataQueue(
                                                                                            idx + "T" + idxItem
                                                                                        )
                                                                                    }
                                                                                > {y.OrderNo} : {y.Code} :{y.SKUMaster_Name} : {y.SKUMaster_Type}
                                                                                    <ExpandLessIcon
                                                                                        className={
                                                                                            toggleQueue[idx + "T" + idxItem]
                                                                                                ? classes.expand
                                                                                                : classes.collapse
                                                                                        }
                                                                                    />
                                                                                </AmButton>
                                                                                : <AmButton
                                                                                    styleType="info_clear"
                                                                                    style={{ marginLeft: "10px" }}
                                                                                    onClick={() =>
                                                                                        onclickToggelDataQueue(
                                                                                            idx + "T" + idxItem
                                                                                        )
                                                                                    }
                                                                                >
                                                                                    {y.Code}:{y.SKUMaster_Name}
                                                                                    <ExpandLessIcon
                                                                                        className={
                                                                                            toggleQueue[idx + "T" + idxItem]
                                                                                                ? classes.expand
                                                                                                : classes.collapse
                                                                                        }
                                                                                    />
                                                                                </AmButton>}
                                                                        </FormInline>

                                                                        : <FormInline> <AmCheckBox

                                                                            disabled={true}
                                                                        ></AmCheckBox>

                                                                            <AmButton
                                                                                styleType="default_clear"
                                                                                style={{ marginLeft: "10px" }}
                                                                                onClick={() =>
                                                                                    onclickToggelDataQueue(
                                                                                        idx + "T" + idxItem
                                                                                    )
                                                                                }
                                                                            >
                                                                                {y.Code}:{y.SKUMaster_Name}
                                                                                <ExpandLessIcon
                                                                                    className={
                                                                                        toggleQueue[idx + "T" + idxItem]
                                                                                            ? classes.expand
                                                                                            : classes.collapse
                                                                                    }
                                                                                />
                                                                            </AmButton>

                                                                        </FormInline>

                                                                    }



                                                                    <div style={{ clear: "both" }}></div>
                                                                    <Collapse
                                                                        in={toggleQueue[idx + "T" + idxItem]}
                                                                    >
                                                                        <div>
                                                                            {toggleQueue[idx + "T" + idxItem] ===
                                                                                true ? (
                                                                                    <Paper
                                                                                        elevation={4}
                                                                                        className={classes.paper}
                                                                                    >
                                                                                        <FormInline
                                                                                            style={{
                                                                                                marginTop: "10px",
                                                                                                marginLeft: "15px"
                                                                                            }}
                                                                                        >



                                                                                            {window.project === "STA" ? <div style={{ width: "800px" }}>
                                                                                                <label style={LabelH}>
                                                                                                    {y.OrderNo} : {y.Code} :{y.SKUMaster_Name} : {y.SKUMaster_Type}
                                                                                                </label> </div>
                                                                                                : <div style={{ width: "800px" }}>
                                                                                                    <label style={LabelH} >
                                                                                                        {y.Code} : {y.SKUMaster_Name}
                                                                                                    </label>
                                                                                                    {y.palletcode ?
                                                                                                        <label style={LabelH}>
                                                                                                            {" "}
                                                                                                            / {y.palletcode}
                                                                                                        </label>
                                                                                                        : null}
                                                                                                    {y.locationcode ?
                                                                                                        <label style={LabelH}>
                                                                                                            {" "}
                                                                                                            / {y.locationcode}
                                                                                                        </label>
                                                                                                        : null}

                                                                                                </div>

                                                                                            }


                                                                                            <div>
                                                                                                <LabelT style={LabelH}>Qty :</LabelT>{" "}
                                                                                                <label>
                                                                                                    {y.Quantity === null ? "-" : y.Quantity} {y.UnitType_Name}(
                                                                                                      {y.BaseqtyMax === null ? "-" : y.BaseqtyMax}{" "}
                                                                                                    {y.BaseUnitType_Code} ){" "}
                                                                                                </label>
                                                                                            </div>
                                                                                        </FormInline>

                                                                                        <FormInline
                                                                                            style={{
                                                                                                marginTop: "10px",
                                                                                                marginLeft: "15px"
                                                                                            }}
                                                                                        >
                                                                                            <div style={{ width: "200px" }}>
                                                                                                <LabelT style={LabelH}>Priority :</LabelT>
                                                                                            </div>
                                                                                            <label
                                                                                                style={{ marginLeft: "15px" }}
                                                                                            >
                                                                                                {" "}
                                                                                                {y.PriorityLabel
                                                                                                    ? y.PriorityLabel
                                                                                                    : "Normal"}{" "}
                                                                                            </label>
                                                                                        </FormInline>
                                                                                        {props.advanceCondition === true ? (
                                                                                            <FormInline
                                                                                                style={{
                                                                                                    marginTop: "10px",
                                                                                                    marginLeft: "15px"
                                                                                                }}
                                                                                            >
                                                                                                <div style={{ width: "200px" }}>
                                                                                                    <LabelT style={LabelH}>Advance Condition : </LabelT>
                                                                                                </div>
                                                                                                <label
                                                                                                    style={{ marginLeft: "15px" }}
                                                                                                >
                                                                                                    {y.FullPallet === true
                                                                                                        ? "FullPallet"
                                                                                                        : ""}
                                                                                                </label>
                                                                                                <label
                                                                                                    style={{ marginLeft: "15px" }}
                                                                                                >
                                                                                                    {y.ShelfLifeDate === true
                                                                                                        ? "ShelfLifeDate"
                                                                                                        : ""}
                                                                                                </label>
                                                                                                <label
                                                                                                    style={{ marginLeft: "15px" }}
                                                                                                >
                                                                                                    {y.IncubateDate === true
                                                                                                        ? "IncubateDate"
                                                                                                        : ""}
                                                                                                </label>
                                                                                                <label
                                                                                                    style={{ marginLeft: "15px" }}
                                                                                                >
                                                                                                    {y.ExpireDate === true
                                                                                                        ? "ExpireDate"
                                                                                                        : ""}
                                                                                                </label>

                                                                                            </FormInline>
                                                                                        ) : null}
                                                                                        {props.status === true ? (
                                                                                            <FormInline
                                                                                                style={{
                                                                                                    marginTop: "10px",
                                                                                                    marginLeft: "15px"
                                                                                                }}
                                                                                            >
                                                                                                <div style={{ width: "200px" }}>
                                                                                                    <LabelT style={LabelH}>Status :</LabelT>
                                                                                                </div>

                                                                                                <label
                                                                                                    style={{ marginLeft: "15px" }}
                                                                                                >
                                                                                                    {y.Receive === true
                                                                                                        ? "Recive"
                                                                                                        : ""}
                                                                                                </label>
                                                                                                <label
                                                                                                    style={{ marginLeft: "15px" }}
                                                                                                >
                                                                                                    {y.Block === true
                                                                                                        ? "Block"
                                                                                                        : ""}
                                                                                                </label>
                                                                                                <label
                                                                                                    style={{ marginLeft: "15px" }}
                                                                                                >
                                                                                                    {y.QC === true ? "QC" : ""}
                                                                                                </label>
                                                                                                <label
                                                                                                    style={{ marginLeft: "15px" }}
                                                                                                >
                                                                                                    {y.Reject === true ? "Reject" : ""}
                                                                                                </label>
                                                                                                <label
                                                                                                    style={{ marginLeft: "15px" }}
                                                                                                >
                                                                                                    {y.Hold === true ? "Hold" : ""}
                                                                                                </label>
                                                                                                <label
                                                                                                    style={{ marginLeft: "15px" }}
                                                                                                >
                                                                                                    {y.Return === true ? "Returns" : ""}
                                                                                                </label>
                                                                                                <label
                                                                                                    style={{ marginLeft: "15px" }}
                                                                                                >
                                                                                                    {y.Partial === true ? "Partial" : ""}
                                                                                                </label>
                                                                                            </FormInline>
                                                                                        ) : null}

                                                                                        {props.random === true ? (
                                                                                            <FormInline
                                                                                                style={{
                                                                                                    marginTop: "10px",
                                                                                                    marginLeft: "15px"
                                                                                                }}
                                                                                            >
                                                                                                <div style={{ width: "200px" }}>
                                                                                                    <labelPattern style={LabelH}>Counting (%) : </labelPattern>
                                                                                                </div>
                                                                                                <label
                                                                                                    style={{
                                                                                                        height: "10px",
                                                                                                        marginLeft: "15px"
                                                                                                    }}
                                                                                                >
                                                                                                    {y.Randoms
                                                                                                        ? y.Randoms + "%"
                                                                                                        : y.Random
                                                                                                            ? y.Random + "%"
                                                                                                            : "-"}
                                                                                                </label>
                                                                                            </FormInline>
                                                                                        ) : null}
                                                                                        {props.docType !== "audit" ? (
                                                                                            <div
                                                                                                style={{
                                                                                                    marginLeft: "15px",
                                                                                                    paddingTop: "10px",
                                                                                                    width: "200px"
                                                                                                }}
                                                                                            >
                                                                                                <LabelT style={LabelH}>Sorting</LabelT>
                                                                                            </div>
                                                                                        ) : null}
                                                                                        {props.docType !== "audit" ? (
                                                                                            <div style={{ marginTop: "5px" }}>
                                                                                                <AmTable
                                                                                                    data={
                                                                                                        dataSort === undefined
                                                                                                            ? []
                                                                                                            : dataSort
                                                                                                    }
                                                                                                    reload={reload}
                                                                                                    columns={columnSort}
                                                                                                    minRows={1}
                                                                                                    sortable={false}
                                                                                                ></AmTable>
                                                                                            </div>
                                                                                        ) : null}
                                                                                        <div
                                                                                            style={{
                                                                                                marginLeft: "15px",
                                                                                                paddingTop: "10px",
                                                                                                width: "200px"
                                                                                            }}
                                                                                        >
                                                                                            <LabelT style={LabelH}>Coditions</LabelT>
                                                                                        </div>
                                                                                        <div style={{ marginTop: "5px" }}>
                                                                                            <AmTable
                                                                                                data={
                                                                                                    dataSO === undefined
                                                                                                        ? []
                                                                                                        : dataSO
                                                                                                }
                                                                                                reload={reload}
                                                                                                columns={columnCondition}
                                                                                                minRows={1}
                                                                                                sortable={false}
                                                                                            ></AmTable>
                                                                                        </div>
                                                                                    </Paper>
                                                                                ) : null}
                                                                        </div>
                                                                    </Collapse>
                                                                </Card>
                                                            </BorderQueu>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                            <div>
                                {pagesQ === 1 ? (
                                    <FormInline style={{ marginLeft: "15px" }}>
                                        <Grid container spacing={24}>
                                            <Grid item xs container direction="column" spacing={16}>
                                                <div style={{ paddingTop: "10px" }}>
                                                    <LabelT style={LabelHDes}>Destination Warehouse :</LabelT>{" "}
                                                    <label>
                                                        {" "}
                                                        {dataConfirmQ["desASRSWarehouseCode"]} :
                            {dataConfirmQ["desASRSWarehouseName"]}
                                                    </label>
                                                </div>
                                            </Grid>
                                            <Grid item>
                                                <FormInline style={{ marginRight: "10px" }}>
                                                    {window.project === "STA" && props.docType !== "audit" ?

                                                        <FormInline>
                                                            {" "}
                                                            <LabelT style={LabelHDes}>Destination Area :</LabelT>
                                                            <InputDiv>

                                                                <AmDropdown
                                                                    id="desASRSAreaCode"
                                                                    placeholder="Select"
                                                                    fieldDataKey="ID"
                                                                    fieldLabel={["Code", "Name"]}
                                                                    labelPattern=" : "
                                                                    width={300}
                                                                    ddlMinWidth={300}
                                                                    //valueData={valueText[idddls]} 
                                                                    queryApi={AreaMaster}
                                                                    returnDefaultValue={true}
                                                                    defaultValue={defaulDDLAreaWare === true ? 8 : defaulDDLAreaWip === true ? 8
                                                                        : defaulDDLAreaCus === true ? 11 : defaulDDLAreaEmp === true ? 11 : null}
                                                                    // disabled={defaultValue ? true : false}

                                                                    onChange={(value, dataObject, inputID, fieldDataKey) =>
                                                                        onHandleChangeDDLProcessAPI(
                                                                            value,
                                                                            dataObject,
                                                                            inputID,
                                                                            fieldDataKey

                                                                        )
                                                                    }
                                                                    ddlType={"search"} //???????? Dropdown
                                                                />
                                                            </InputDiv>
                                                        </FormInline>

                                                        : <div>{processDLLs}</div>}
                                                    <AmButton
                                                        style={{ width: "80px", marginLeft: "5px" }}
                                                        styleType="confirm"
                                                        onClick={() => {
                                                            OnclickConfirmQueue();
                                                        }}
                                                    >Process</AmButton>
                                                    <AmButton
                                                        style={{ width: "80px", marginLeft: "5px" }}
                                                        styleType="delete"
                                                        onClick={() => {
                                                            OnclickConfirmCleare();
                                                        }}
                                                    >Clear</AmButton>
                                                </FormInline>
                                            </Grid>
                                        </Grid>{" "}
                                    </FormInline>
                                ) : null}
                            </div>
                        </Card>
                    ) : null}
                </div>
            ) : null}

            <AmEditorTable
                style={{ width: "600px", height: "500px" }}
                titleText={title}
                open={dialog}
                columns={editorListcolunmCondition()}
                data={editData}
                onAccept={(status, rowdata) => onHandleEditConfirm(status, rowdata)}
            ></AmEditorTable>
            <AmEditorTable
                style={{ width: "600px", height: "500px" }}
                titleText={titleSort}
                open={dialogSort}
                columns={editorListcolunmSort()}
                data={editDataSort}
                onAccept={(status, rowdata) =>
                    onChangeEditorSortConfirm(status, rowdata)
                }
            ></AmEditorTable>

            <AmDialogConfirm
                open={openDialogCon}
                close={a => setopenDialogCon(a)}
                bodyDialog={bodyDailogCon}
                //styleDialog={{ width: "1500px", height: "500px" }}
                customAcceptBtn={
                    <AmButton
                        styleType="confirm_clear"
                        onClick={() => {
                            OnConfirmprocess();
                        }}
                    >OK</AmButton>
                }
                customCancelBtn={
                    <AmButton
                        styleType="delete_clear"
                        onClick={() => {
                            setopenDialogCon(false);
                        }}
                    >Cancel</AmButton>
                }
            ></AmDialogConfirm>
            <AmDialogConfirm
                open={openDialogClear}
                close={a => setopenDialogClear(a)}
                bodyDialog={bodyDailogClear}
                //styleDialog={{ width: "1500px", height: "500px" }}
                customAcceptBtn={
                    <AmButton
                        styleType="confirm_clear"
                        onClick={() => {
                            OnConfirmClear();
                        }}
                    >OK</AmButton>
                }
                customCancelBtn={
                    <AmButton
                        styleType="delete_clear"
                        onClick={() => {
                            setopenDialogClear(false);
                        }}
                    >Cancel</AmButton>
                }
            ></AmDialogConfirm>
        </div>
    );
};
AmProcessQueue.propTypes = {
    classes: PropTypes.object.isRequired
};

export default withStyles(styles)(AmProcessQueue);
