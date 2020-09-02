import Grid from "@material-ui/core/Grid";
import moment from "moment";
import React, { useState, useEffect, useContext, useMemo } from "react";
import styled from "styled-components";
import {
    withStyles,
    MuiThemeProvider,
    createMuiTheme
} from "@material-ui/core/styles";
import SvgIcon from '@material-ui/core/SvgIcon';
import AmDialogs from '../../components/AmDialogs'
import Table from "../../components/table/AmTable";
import AmTable from "../../components/AmTable/AmTable";
import queryString from "query-string";
import DocumentEventStatus from "../../components/AmStatus";
// import "bootstrap/dist/css/bootstrap.min.css";
import classnames from "classnames";
import {
    TabContent,
    TabPane,
    Nav,
    NavItem,
    NavLink,
    Row,
    Col
} from "reactstrap";
import PropType from "prop-types";
import AmButton from "../../components/AmButton";
import { useTranslation } from "react-i18next";
import LabelT from "../../components/AmLabelMultiLanguage";
import { apicall } from '../../components/function/CoreFunction'
import AmReceivePallet from '../../components/AmReceivePallet';
import AmPickingOnFloor from '../../components/AmPickingOnFloor';
import AmInput from '../../components/AmInput'
import IconButton from "@material-ui/core/IconButton";
import AmToolTip from "../../components/AmToolTip";
import DeleteIcon from "@material-ui/icons/Delete";
import EditIcon from "@material-ui/icons/Edit";
import AmDialogConfirm from '../../components/AmDialogConfirm';
import AmPrintBarCodeV2 from '../pageComponent/AmPrintBarCodeV2/AmPrintBarCodeV2';
import AmPrintBarCode from '../pageComponent/AmPrintBarCode/AmPrintBarCode';
import CropFreeIcon from '@material-ui/icons/CropFree';
import PrintIcon from '@material-ui/icons/Print';
import _ from 'lodash';

const Axios = new apicall();
// import Axios from "axios";

const styles = theme => ({
    button: {
        margin: theme.spacing(),
        width: "130px"
    },
    leftIcon: {
        marginRight: theme.spacing()
    },
    rightIcon: {
        marginLeft: theme.spacing()
    },
    iconSmall: {
        fontSize: 20
    },
    link: {
        marginTop: "10px",
        "&:hover": {
            color: "#000000",
            textDecorationLine: "none"
        },
        color: "red"
    },
    icon: {
        width: "120px",
        margin: theme.spacing()
    },
    input: {
        margin: theme.spacing()
    },
    AppInline: {
        textAlign: "left",
        display: "inline-block",
        justifyContent: "center",
        verticalAlign: "bottom"
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

const LabelH = {
    fontWight: "bold",
    width: "200px"
};

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
function PalletMapSTOMeomo(open, close, status, setting, dataDocument, dataDocItems, onConfirm) {
    if (status === 10 && open) {
        return <AmReceivePallet
            open={open}
            close={(val) => close(val)}
            setting={setting}
            dataDocument={dataDocument}
            dataDocItems={dataDocItems}
            onConfirm={(data) => onConfirm(data)}
        />
    } else {
        return null;
    }
}

const PrintBarcode = React.memo(({ selection, dataHeader, open, onClose }) => {
  return <AmPrintBarCode data={selection}
    SouSupplierCode={dataHeader.SouSupplier}
    SouSupplierName={dataHeader.SouSupplierName}
    Remark={dataHeader.Remark}
    open={open}
    onClose={onClose}
    docID={dataHeader.ID}
  // onSucess={(e) => { console.log(e); if (e === true) getData(); }}
  />
})
const PrintBarcodeV2 = React.memo(({ selection, dataHeader, open, onClose }) => {
  return <AmPrintBarCodeV2 data={selection}
    SouSupplierCode={dataHeader.SouSupplier}
    SouSupplierName={dataHeader.SouSupplierName}
    Remark={dataHeader.Remark}
    open={open}
    onClose={onClose}
    docID={dataHeader.ID}
  // onSucess={(e) => { console.log(e); if (e === true) getData(); }}
  />
})
const DocumentView = props => {
    const { t } = useTranslation();
    const [open, setOpen] = useState(false);
    const [dialogState, setDialogState] = useState({});
    const [openQR, setOpenQR] = useState(false);
    const [statusdoc, setStatusdoc] = useState(0);
    const [docID, setDocID] = useState(props.docID);
    const [typeDoc, setTypeDoc] = useState(props.typeDoc);
    const [header, setHeader] = useState(props.header);
    const [dataHeader, setDataHeader] = useState([]);
    const [columns, setColumns] = useState(props.columns);
    const [columnsDetailSOU, setColumnsDetailSOU] = useState([]);
    const [columnsDetailDES, setColumnsDetailDES] = useState(
        props.columnsDetailDES
    );
    const [optionHeader, setOptionHeader] = useState(props.optionDocItems);
    const [optionSouBstos, setOptionSouBstos] = useState(props.optionSouBstos);
    const [optionDesBstos, setOptionDesBstos] = useState(props.optionDesBstos);

    const [data, setData] = useState([]);
    const [dataDetailSOU, setDataDetailSOU] = useState([]);
    const [dataDetailDES, setDataDetailDES] = useState([]);

    const [activeTab, setActiveTab] = useState("1");
    const dataTable = [];
    const dataTableDetailSOU = [];
    const dataTableDetailDES = [];

    //set dialog Add pallet
    const [dataDoc, setDataDoc] = useState(null);
    const [eventStatus, setEventStatus] = useState(null);
    //set dialog edit
    const [openDialogEditQty, setOpenDialogEditQty] = useState(false);
    const [dialogEditQty, setDialogEditQty] = useState(null);
    const [qtyEdit, setQtyEdit] = useState({});
    //AlertDialog
    const [showDialog, setShowDialog] = useState(null);
    const [stateDialog, setStateDialog] = useState(false);
    const [msgDialog, setMsgDialog] = useState("");
    const [typeDialog, setTypeDialog] = useState("");
    const [openReceive, setOpenReceive] = useState(false);
    const [selection, setSelection] = useState();
    useEffect(() => {
        getData();
        // console.log(props.optionDocItems);
    }, []);

    useEffect(() => {
        setHeader(props.header)
        //getHeader()
    }, [props.header]);

    const getData = () => {
        //========================================================================================================

        Axios.get(
            window.apipath +
            "/v2/GetDocAPI/?docTypeID=" +
            props.typeDocNo +
            "&docID=" +
            docID +
            "&getMapSto=true"
        ).then(res => {
            // console.log(
            //   "docID : " + props.docID,
            //   "docTypeID : " + props.typeDocNo,
            //   res.data
            // );
            setDataDoc(res.data)
            if (res.data._result.status === 1) {
                if (props.OnchageOwnerGroupType !== undefined) {
                    props.OnchageOwnerGroupType(res.data.document.OwnerGroupType)
                }
                setDataHeader(res.data.document);
                setEventStatus(res.data.document.EventStatus);
                //============================================================================

                res.data.document.documentItems.forEach(row => {

                    var sumQty = 0;
                    var sumBaseQty = 0;
                    if (res.data.sou_bstos !== null) {
                        res.data.sou_bstos.filter(y => y.docItemID == row.ID).forEach(y => {
                            sumQty += y.distoQty;
                            sumBaseQty += y.distoBaseQty;
                        });
                    }
                    row._sumQtyDisto = sumQty;
                    row._sumQtyBaseDisto = sumBaseQty;

                    row._balanceQty = row.Quantity - sumQty;

                    // === getOption === DocItem

                    var qryStr = queryString.parse(row.Options);

                    if (optionHeader) {
                        optionHeader.forEach(x => {
                            row[x.optionName] =
                                qryStr[x.optionName] === "undefined"
                                    ? null
                                    : qryStr[x.optionName];
                        });
                    }


                    row.palletcode =
                        qryStr.palletcode === "undefined" ? null : qryStr.palletcode;
                    row.locationcode =
                        qryStr.locationcode === "undefined" ? null : qryStr.locationcode;

                    dataTable.push({
                        ...row, _baseqty:
                            typeDoc === "received"
                                ? row._sumQtyBaseDisto +
                                " / " +
                                (row.BaseQuantity === null ? " - " : row.BaseQuantity) : typeDoc === "issued"
                                    ? row._sumQtyBaseDisto +
                                    " / " +
                                    (row.BaseQuantity === null ? "-" : row.BaseQuantity)
                                    : null
                        ,
                        _qty:
                            typeDoc === "issued"
                                ? row._sumQtyDisto +
                                " / " +
                                (row.Quantity === null ? "-" : row.Quantity)
                                : typeDoc === "shipment"
                                    ? row._sumQtyDisto +
                                    " / " +
                                    (row.Quantity === null ? "-" : row.Quantity)
                                    : typeDoc === "received"
                                        ? row._sumQtyDisto +
                                        " / " +
                                        (row.Quantity === null ? " - " : row.Quantity)
                                        : typeDoc === "loading"
                                            ? row._sumQtyDisto +
                                            " / " +
                                            (row.Quantity === null ? " - " : row.Quantity)
                                            : null,
                        ExpireDate: row.ExpireDate ? moment(row.ExpireDate).format("DD/MM/YYYY") : null,
                        ProductionDate: row.ProductionDate ? moment(row.ProductionDate).format("DD/MM/YYYY") : null,
                    });


                });

                //============================================================================
                if (res.data.sou_bstos) {
                    res.data.sou_bstos.forEach(rowDetail => {
                        rowDetail.eventStatusDoc = res.data.document["eventStatus"];
                        // var options = ""
                        // res.data.document.documentItems.filter(y=>y.id == rowDetail.docItemID).forEach(y=>{options=y.options});
                        // rowDetail.options = options;

                        // === getOption ===
                        //var qryStr = queryString.parse(rowDetail.options)
                        //rowDetail.locationCode = qryStr.locationCode === "undefined" ? null : qryStr.locationCode;
                        var qryStr = queryString.parse(rowDetail.Options);
                        if (optionSouBstos) {
                            optionSouBstos.forEach(x => {
                                rowDetail[x.optionName] =
                                    qryStr[x.optionName] === "undefined"
                                        ? null
                                        : qryStr[x.optionName];
                            });
                        }

                        dataTableDetailSOU.push({
                            ...rowDetail,
                            _packQty:
                                typeDoc === "issued"
                                    ? rowDetail.distoQty + " / " + rowDetail.distoQtyMax
                                    : typeDoc === "shipment"
                                        ? rowDetail.distoQty + " / " + rowDetail.distoQtyMax
                                        : typeDoc === "received"
                                            ? rowDetail.packQty
                                            : typeDoc === "audit"
                                                ? rowDetail.distoQty
                                                : null
                        });
                    });
                }
                if (res.data.des_bstos) {
                    res.data.des_bstos.forEach(rowDetail => {
                        rowDetail.eventStatusDoc = res.data.document["eventStatus"];

                        // var options = ""
                        // res.data.document.documentItems.filter(y=>y.id == rowDetail.docItemID).forEach(y=>{options=y.options});
                        // rowDetail.options = options;

                        // === getOption ===
                        //var qryStr = queryString.parse(rowDetail.options)
                        //rowDetail.locationCode = qryStr.locationCode === "undefined" ? null : qryStr.locationCode;
                        var qryStr = queryString.parse(rowDetail.Options);
                        if (optionDesBstos) {
                            optionDesBstos.forEach(x => {
                                rowDetail[x.optionName] =
                                    qryStr[x.optionName] === "undefined"
                                        ? null
                                        : qryStr[x.optionName];
                            });
                        }
                        if (window.project === "AAI") {
                            rowDetail.tanum =
                                qryStr.tanum === "undefined" ? null : qryStr.tanum;
                            rowDetail.btanr =
                                qryStr.btanr === "undefined" ? null : qryStr.btanr;
                        }
                        dataTableDetailDES.push({
                            ...rowDetail,
                            _packQty:
                                typeDoc === "issued"
                                    ? rowDetail.distoQty + " / " + rowDetail.distoQtyMax
                                    : typeDoc === "shipment"
                                        ? rowDetail.distoQty + " / " + rowDetail.distoQtyMax
                                        : typeDoc === "received"
                                            ? rowDetail.packQty
                                            : typeDoc === "audit"
                                                ? rowDetail.distoQty
                                                : null
                        });
                    });
                }
                //============================================================================
                // console.log(dataTable);
                setData(dataTable);
                setDataDetailSOU(dataTableDetailSOU);
                setDataDetailDES(dataTableDetailDES);
            }
        });
    };
    useEffect(() => {
        if (dataHeader && dataHeader.EventStatus === 10 && props.useAddPalletMapSTO) {
            var newSou = [...props.columnsDetailSOU,
            {
                width: 100, Header: "Edit/Delete",
                colStyle: { textAlign: 'center' },
                Cell: e =>
                    <div style={{ display: "inline-flex" }}>
                        <AmToolTip title={"Edit Qty"} placement={"top"}><IconButton
                            size="small"
                            aria-label="info"
                            style={{ marginLeft: "3px" }}
                            onClick={() => { handleClickOpenDialogEditQty(e.original) }}
                        >
                            <EditIcon
                                fontSize="small"
                                style={{ color: "#f39c12" }}
                            />
                        </IconButton>
                        </AmToolTip>
                        <AmToolTip title={"Delete"} placement={"top"}>
                            <IconButton
                                size="small"
                                aria-label="info"
                                onClick={() => { onHandleDelDiSTO(e.original) }}
                                style={{ marginLeft: "3px" }}>
                                <DeleteIcon
                                    fontSize="small"
                                    style={{ color: "#e74c3c" }} />
                            </IconButton>
                        </AmToolTip>
                    </div >
            }]
            setColumnsDetailSOU(newSou)
        } else {
            setColumnsDetailSOU(props.columnsDetailSOU)
        }
    }, [props.columnsDetailSOU, dataHeader])
    const renderDocumentStatus = () => {
        var _statustxt = _.result(_.find(DocumentEventStatus, function (obj) {
            return obj.code === dataHeader.EventStatus;
        }), 'status');
        return _statustxt;
    };

    const buttonBack = () => {
        if (props.history === "" || props.history === undefined) {
            props.history.push("/");
        } else {
            props.history.push(props.linkBack);
        }
    };

    //======================================================================================================

    const getDataHeader = (type, value) => {
        if (type === "date") {
            if (dataHeader[value] === null || dataHeader[value] === "") {
                return "-";
            } else {
                return moment(dataHeader[value]).format("DD/MM/YYYY");
            }
        } else if (type === "dateTime") {
            if (dataHeader[value] === null || dataHeader[value] === "") {
                return "-";
            } else {
                return moment(dataHeader[value]).format("DD/MM/YYYY HH:mm:ss");
            }
        } else if (type === "function") {
            return eval(value);
        } else if (type === "option") {
            var qryStr = queryString.parse(dataHeader.Options);
            return qryStr[value] === "undefined" ? null : qryStr[value];
        } else {
            return dataHeader[value];
        }
    };

    const getHeader = () => {
        return header.map((x, idx) => {
            return (
                <Grid key={idx} container spacing={24}>
                    {x.map((y, i) => {
                        let syn = y.label ? " :" : "";
                        let showval = getDataHeader(y.type, y.values);
                        return (
                            <Grid
                                key={i}
                                xs={12}
                                sm={6}
                                style={{ paddingLeft: "20px", paddingTop: "10px" }}
                            >
                                <FormInline>
                                    <LabelT style={LabelH}>{y.label + syn}</LabelT>
                                    <label>{showval}</label>
                                </FormInline>
                            </Grid>
                        );
                    })}
                </Grid>
            );
        });
    };

    const toggle = tab => {
        if (activeTab !== tab) {
            setActiveTab(tab);
        }
    };

    const CreateBtnPicking = () => {
        if (eventStatus === 11) {
            return <AmPickingOnFloor
                dataDocument={dataDoc}
                dataItemsSource={[...dataDetailSOU]}
                columnsItemsSource={props.columnsPickingonFloor}
                onSuccess={(data) => ReturnMapping(data)}
            />
        } else {
            return null;
        }
    }
    const ReturnMapping = (res) => {
        setOpenReceive(res);
        getData()
    }

    const onHandleDelDiSTO = (item) => {
        const tempDataReq = {
            distoID: item.distoID,
            rootID: item.rootID
        }
        Axios.post(window.apipath + "/v2/RemoveSTOandDiSTOfromDocAPI", tempDataReq).then((res) => {
            if (res.data != null) {
                if (res.data._result.status === 1) {
                    alertDialogRenderer("ลบข้อมูลสำเร็จ", "success", true);
                    getData();
                } else {
                    alertDialogRenderer(res.data._result.message, "error", true);
                }
            } else {
                alertDialogRenderer(res.data._result.message, "error", true);
            }
        });
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
    const handleClickOpenDialogEditQty = (item) => {
        const tempDataReq = {
            distoID: item.distoID,
            Quantity: null
        }
        setQtyEdit(tempDataReq)
        setOpenDialogEditQty(true)
    }

    const onHandleChangeInputQty = (value, field, event) => {
        const tempDataReq = {
            ...qtyEdit,
            Quantity: value
        }
        setQtyEdit(tempDataReq)

    }


    const onCreatePut = () => {
        props.history.push(props.apiCreate + docID)

    }

    const onConfirmEdit = () => {
        Axios.post(window.apipath + "/v2/UpdateSTOandDiSTOfromDocAPI", qtyEdit).then((res) => {
            if (res.data != null) {
                if (res.data._result.status === 1) {
                    alertDialogRenderer("แก้ไขจำนวนสินค้าสำเร็จ", "success", true);
                    setOpenDialogEditQty(false);
                    setQtyEdit({});
                    getData();
                } else {
                    alertDialogRenderer(res.data._result.message, "error", true);
                }
            } else {
                alertDialogRenderer(res.data._result.message, "error", true);
            }
        });
    }
    useEffect(() => {
        if (!openDialogEditQty) {
            let ele = document.getElementById("Quantity");
            if (ele) {
                ele.value = "";
                ele.focus();
            }
        }
    }, [openDialogEditQty])
    const createDialogEditQty = () => {
        return <div>
            <FormInline>
                <LabelT style={LabelH}>{t("Quantity")}</LabelT>
                <div style={{ display: 'inline-flex', width: "330px", alignItems: 'center' }} >
                    <AmInput
                        id={"Quantity"}
                        autoFocus={true}
                        placeholder={"0"}
                        type="input"
                        style={{ width: "100%" }}
                        onBlur={(value, obj, element, event) => onHandleChangeInputQty(value, "Quantity", event)}
                    />
                </div>
            </FormInline>
        </div>
    }

    const onConfirmMappingSTO = () => {
        const tempDataReq = { docID: parseInt(props.docID) }
        Axios.post(window.apipath + "/v2/ConfirmMappingSTOandDiSTOAPI", tempDataReq).then((res) => {
            if (res.data != null) {
                if (res.data._result.status === 1) {
                    alertDialogRenderer("สร้างเอกสารรับเข้าสำเร็จ", "success", true);

                    getData();
                } else {
                    alertDialogRenderer(res.data._result.message, "error", true);
                }
            } else {
                alertDialogRenderer(res.data._result.message, "error", true);
            }
        });
    }

    const handleClickOpen = () => {
        setOpenReceive(true);
    };
    const handleOnClose = (val) => {
        setOpenReceive(val);
    }
    const renderDialogReceivePallet = useMemo(() =>
        PalletMapSTOMeomo(openReceive, handleOnClose,
            eventStatus, props.addPalletMapSTO,
            dataDoc, data, ReturnMapping),
        [openReceive, eventStatus, props.addPalletMapSTO,
            dataDoc, data])

    const GetHeaderData_PDF = (datas, cols) => {
        let header = [];
        let tabledatas = [];
        let widths = [];
        let hor_align_center = "ALIGN_CENTER";

        for (let [key, value] of Object.entries(cols)) {
            if (value.ShowPDF === true || value.ShowPDF === undefined) {
                let cell = { text: value.Header, hor_align: hor_align_center, font_style: "bold", font_size: 8, border: "BOX", padding: 5 };
                widths.push(value.widthPDF);
                header.push(cell);
            }
        }

        datas.map((item, idx) => {
            let all_cells = [];
            for (let [key, value] of Object.entries(cols)) {
                let valueShow = "";
                if (value.ShowPDF === true || value.ShowPDF === undefined) {
                    if (value.CellPDF) {
                        valueShow = value.CellPDF(item);
                    } else {
                        if (value.accessor) {
                            valueShow = item[value.accessor] != null || item[value.accessor] != undefined ? item[value.accessor].toString() : "";
                        }
                    }
                    all_cells.push({ text: valueShow, font_size: 8, border: "BOX" });
                }
            }
            tabledatas.push({ cells: all_cells })
        });
        let res = {
            header: [{ cells: header }],
            tabledatas: tabledatas,
            widths: widths
        }
        return res;
    }
    const ExportPDF = async () => {
        try {
            let hor_align_center = "ALIGN_CENTER";

            if (dataHeader !== null || dataHeader !== undefined) {
                let textTitle = "";
                let txtListSou = "List of Receive";
                if (props.typeDocNo === 1001) {
                    textTitle = "Putaway Document Report";
                } else if (props.typeDocNo === 1011) {
                    textTitle = "Good Receive Document Report";
                } else if (props.typeDocNo === 1012) {
                    textTitle = "Good Issue Document Report";
                    txtListSou = "List of Pick";
                } else if (props.typeDocNo === 1002) {
                    textTitle = "Picking Document Report";
                    txtListSou = "List of Pick";
                } else if (props.typeDocNo === 2003) {
                    textTitle = "Audit Document Report";
                    txtListSou = "List of Audit";
                }

                //header 
                let table_header = [];
                if (header && dataHeader) {
                    let headers = [];
                    header.forEach(rows => {
                        let cellsHead = [];
                        rows.forEach(cols => {
                            cellsHead.push({
                                text: cols.label,
                                font_style: "bold",
                                padding_bottom: 5
                            })
                            let resVal = cols.type ? getDataHeader(cols.type, cols.values) : dataHeader[cols.values];
                            cellsHead.push({
                                text: resVal,
                                font_style: "normal",
                                padding_bottom: 5
                            })
                        });
                        headers.push({ cells: cellsHead })
                    });

                    let _header = {
                        "widths": [150, 251, 150, 251],
                        "def_cell_border": "BOX",
                        "locked_width": true,
                        "headers": headers
                    }
                    table_header.push(_header);

                }

                //=== data of docitems : table 1
                let table1_content = [];
                let dataDocumentItem = data;

                if (dataDocumentItem && columns) {
                    let resDataTable = GetHeaderData_PDF(dataDocumentItem, columns);
                    table1_content.push({
                        "hor_align": hor_align_center,
                        "widths": resDataTable.widths,
                        "def_cell_border": "BOX",
                        "locked_width": true,
                        "headers": resDataTable.header,
                        "bodys": resDataTable.tabledatas
                    });

                }

                //=== data Detail receive
                let table2_content = [];

                if (dataDetailSOU && columnsDetailSOU) {
                    table2_content.push({
                        "hor_align": "ALIGN_LEFT",
                        "def_cell_border": "BOX",
                        "locked_width": true,
                        "spacing_after": 5,
                        "headers": [{
                            cells: [
                                {
                                    text: txtListSou,
                                    font_style: "bold",
                                    font_size: 10,
                                },
                            ]
                        }]
                    });
                    let resDataTable = GetHeaderData_PDF(dataDetailSOU, columnsDetailSOU);
                    table2_content.push({
                        "hor_align": hor_align_center,
                        "widths": resDataTable.widths,
                        "def_cell_border": "BOX",
                        "locked_width": true,
                        "headers": resDataTable.header,
                        "bodys": resDataTable.tabledatas
                    });

                }

                let reqjson = {
                    // "margins_left": 30,
                    // "margins_right": 40,
                    "header": {
                        "headers": [
                            {
                                cells: [
                                    {
                                        text: "BOSS PHARMACARE",
                                        font_style: "normal",
                                    },
                                    {
                                        text: "{page}",
                                        font_style: "normal",
                                        "hor_align": "ALIGN_RIGHT",
                                    }
                                ]
                            }
                        ]
                    },
                    "contents": [
                        {
                            "hor_align": hor_align_center,
                            "headers": [//title
                                {
                                    cells: [
                                        {
                                            text: textTitle,
                                            font_style: "bold",
                                            font_size: 12,
                                            padding_bottom: 10,
                                            hor_align: hor_align_center
                                        }
                                    ]
                                }
                            ]
                        },
                        ...table_header,
                        ...table1_content,
                        ...table2_content,
                    ]
                    // "footer":
                    // {
                    //   "widths": [442, 30, 180, 150],
                    //   "locked_width": true,
                    //   "headers": [
                    //     {
                    //       cells: [
                    //         {
                    //           text: "",
                    //           font_style: "bold",
                    //           padding_bottom: 5
                    //         },
                    //         {
                    //           text: "By",
                    //           font_style: "bold",
                    //           padding_bottom: 5
                    //         },
                    //         {
                    //           text: "",
                    //           font_style: "bold",
                    //           padding_bottom: 5,
                    //           padding_left: 10,
                    //           padding_right: 10,
                    //           border: "BOTTOM_BORDER"
                    //         },
                    //         {
                    //           text: "Section Warehouse",
                    //           font_style: "bold",
                    //           padding_bottom: 5,
                    //         },
                    //       ]
                    //     }
                    //   ]
                    // }
                };

                // console.log(reqjson)

                await Axios.postload(window.apipath + "/v2/download/print_pdf", reqjson, "document_" + dataHeader.Code + ".pdf").then();

            }
        } catch (err) {
            console.log(err)
        }
    }
    return (
        <div>
            <AmDialogs
                typePopup={dialogState.type}
                onAccept={(e) => { setDialogState({ ...dialogState, state: false }) }}
                open={dialogState.state}
                content={dialogState.content} />
            {stateDialog ? showDialog ? showDialog : null : null}
            <AmDialogConfirm
                titleDialog={t("Edit Quantity")}
                open={openDialogEditQty}
                close={a => setOpenDialogEditQty(a)}
                bodyDialog={createDialogEditQty()}
                customAcceptBtn={<AmButton styleType="confirm_clear" onClick={() => onConfirmEdit()}>{t("OK")}</AmButton>}
                customCancelBtn={<AmButton styleType="delete_clear" onClick={() => { setOpenDialogEditQty(false); setQtyEdit({}); }}>{t("Cancel")}</AmButton>}

            />
            {props.usePrintPDF === true ?
                <AmButton styleType="info" className="float-right" onClick={ExportPDF}
                    startIcon={<PrintIcon />}>
                    {t("Export PDF")}
                </AmButton> : null}
            {getHeader()}
            <br />
            <br />
            <div>
                {
                    props.CreateputAway === true ?
                        <Grid container>
                            <Grid item xs container direction="column">
                            </Grid>
                            <Grid item>
                                <div style={{ marginBottom: "5px" }}>
                                    <AmButton styleType="add"
                                        onClick={() => {
                                            onCreatePut();
                                        }}
                                    >Create PutAway</AmButton>
                                </div>
                            </Grid>
                        </Grid>
                        : null
                }

            </div>
            <FormInline >
                {props.usePrintBarcodePallet ?
                    <>
                        <PrintBarcode selection={selection} dataHeader={dataHeader} open={openQR} onClose={() => setOpenQR(false)} />
                    </>

                    : null}

                {props.usePrintBarcodePallet ?
                    <>
                        <PrintBarcodeV2 selection={selection} dataHeader={dataHeader} open={open} onClose={() => setOpen(false)} />
                    </>

                    : null}
            </FormInline>
            {typeDoc && !props.CreateputAway && typeDoc !== "issued" ? (
                // <Table columns={columns} pageSize={100} data={data} sortable={false} currentPage={0} />
                <AmTable
                    selection={"checkbox"}
                    selectionData={(data) => {
                        setSelection(data);
                    }} dataKey="ID"
                    columns={columns}
                    pageSize={100}
                    dataSource={data}
                    height={200}
                    rowNumber={false}
                    customAction={
                        [{
                            label: <div style={{ fontSize: "12px" }}>
                                {"QRCODE MANUAL"}</div>,
                            action: (data) => {
                                if (selection.length === 0) {
                                    setDialogState({ type: "warning", content: "กรุณาเลือกข้อมูล", state: true })
                                } else {
                                    setOpen(true)
                                }
                            }

                        },
                        {
                            label: <div style={{ fontSize: "12px" }}>
                                {"QRCODE AUTO"}</div>,
                            action: (data) => {
                                if (selection.length === 0) {
                                    setDialogState({ type: "warning", content: "กรุณาเลือกข้อมูล", state: true })
                                } else {
                                    setOpenQR(true)
                                }

                            }
                        }]}
                />
            ) :
                  typeDoc ?
                        <AmTable
                            columns={columns}
                            pageSize={100}
                            dataSource={data}
                            height={200}
                        ></AmTable> :
                        null}
            <br />

            {props.useScanBarcode && eventStatus === 10 ?
                <AmButton className="float-right" styleType="info"
                    style={{ marginRight: '5px' }}
                    startIcon={<CropFreeIcon />}
                    onClick={() => window.open("/receive/mappinghh")}>
                    {'Scan'}
                </AmButton> : null}

            {props.usePickingOnFloor ?
                CreateBtnPicking()
                : null}
            {props.openSOU === true && props.openDES === true ? (
                <div>
                    <Nav tabs>
                        <NavItem>
                            <NavLink
                                className={classnames({ active: activeTab === "1" })}
                                onClick={() => {
                                    toggle("1");
                                }}
                            >
                                SOU
              </NavLink>
                        </NavItem>
                        <NavItem>
                            <NavLink
                                className={classnames({ active: activeTab === "2" })}
                                onClick={() => {
                                    toggle("2");
                                }}
                            >
                                DES
              </NavLink>
                        </NavItem>
                    </Nav>

                    <TabContent activeTab={activeTab}>
                        <TabPane tabId="1">
                            <Row>
                                <Col sm="12">

                                    {props.buttonConfirmMappingSTO === true ?
                                        eventStatus === 10 || eventStatus === 11 ?
                                            //|| eventStatus === 12 || eventStatus === 31 ?
                                            <AmButton styleType="add" className="float-right" onClick={() => onConfirmMappingSTO()} style={{ margin: '5px 0px 5px 0px' }}>
                                                {t("Received All")}
                                            </AmButton> : null
                                        : null}
                                    {props.useAddPalletMapSTO && eventStatus === 10 ?
                                        <>
                                            <AmButton className="float-right" styleType="confirm" style={{ margin: '5px 5px 5px 0px' }}
                                                startIcon={<ReceiveIcon />}
                                                onClick={handleClickOpen}>
                                                {'Mapping Pallet'}
                                            </AmButton>
                                            {renderDialogReceivePallet}
                                        </> : null}
                                    <br />
                                    {typeDoc ? (

                    <AmTable
                      dataKey="id"
                      columns={columnsDetailSOU}
                      pageSize={dataDetailSOU.length}
                      dataSource={dataDetailSOU}
                      height={200}
                      rowNumber={false} />
                  ) : null}
                </Col>
              </Row>
            </TabPane>
            <TabPane tabId="2">
              <Row>
                <Col sm="12">
                  <br />
                  {typeDoc ? (
                    // <Table
                    //   columns={columnsDetailDES}
                    //   pageSize={100}
                    //   data={dataDetailDES}
                    //   sortable={false}
                    //   currentPage={0}
                    // />
                    <AmTable dataKey="id" columns={columnsDetailDES} pageSize={dataDetailDES.length} dataSource={dataDetailDES} height={200} rowNumber={false} />
                  ) : null}
                </Col>
              </Row>
            </TabPane>
          </TabContent>
        </div>
      ) : props.openSOU === true ? (
        typeDoc ? (
          <AmTable dataKey="id"
            columns={columnsDetailSOU}
           pageSize={100}
            dataSource={dataDetailSOU}
            height={200}
            rowNumber={false} />
        ) : null
      ) : props.openDES === true ? (
        typeDoc ? (
          // <Table
          //   columns={columnsDetailDES}
          //   pageSize={100}
          //   data={dataDetailDES}
          //   sortable={false}
          //   currentPage={0}
          // />
          <AmTable dataKey="id"
            columns={columnsDetailDES}
              pageSize={100}
            dataSource={dataDetailDES}
            height={200}
            rowNumber={false} />
        ) : null
      ) : (
              ""
            )}
      <br />
      <div>
        {props.buttonBack === true ? (
          <AmButton styleType="default" className="float-left" onClick={buttonBack}>
            {t("Back")}
          </AmButton>
        ) : null}
      </div>
    </div>
  );
};
DocumentView.propTypes = {
    openSOU: PropType.bool.isRequired,
    openDES: PropType.bool.isRequired,
    usePickingOnFloor: PropType.bool,
    useAddPalletMapSTO: PropType.bool
};
export default withStyles(styles)(DocumentView);