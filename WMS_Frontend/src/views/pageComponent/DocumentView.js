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
import AmPrintBarCode from '../pageComponent/AmPrintBarCode/AmPrintBarCode';
import CropFreeIcon from '@material-ui/icons/CropFree';
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
        console.log("xxxxx tr")
        console.log(open)

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
const DocumentView = props => {
    const { t } = useTranslation();
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
                    res.data.sou_bstos
                        .filter(y => y.docItemID == row.ID)
                        .forEach(y => {
                            sumQty += y.distoQty;
                            sumBaseQty += y.distoBaseQty;
                        });
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
        const res = DocumentEventStatus.filter(row => {
            return row.code === dataHeader.EventStatus;
        });
        return res.map(row => row.status);
    };

    const buttonBack = () => {
        if (props.history === "" || props.history === undefined) {
            props.history.push("/");
        } else {
            props.history.push(props.linkBack);
        }
    };

    //======================================================================================================

    const getDataHeater = (type, value) => {
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
                        return (
                            <Grid
                                key={i}
                                xs={12}
                                sm={6}
                                style={{ paddingLeft: "20px", paddingTop: "10px" }}
                            >
                                <FormInline>
                                    <LabelT style={LabelH}>{y.label + syn}</LabelT>
                                    <label>{getDataHeater(y.type, y.values)}</label>
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
        console.log(res)
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
  
    const ExportPDF = async () => {
      try {
        let data_document = dataDoc.document;
        if (data_document !== null || data_document !== undefined) {
          var dataDocumentItem = dataDoc.sou_bstos;
          let DocDate = moment(data_document.DocumentDate).format("DD/MM/YYYY");
          let ActionDate = moment(data_document.Actiontime).format("DD/MM/YYYY HH:mm:ss");
  
  
          let head = [
            {
              cells: [ //list<cells>
                {
                  text: "Document :",
                  font_style: "bold",
                },
                {
                  text: data_document.Code,
                  font_style: "normal",
                },
                {
                  text: "Docment Date :",
                  font_style: "bold",
                },
                {
                  text: ActionDate,
                  font_style: "normal",
                },
              ]
            },
            {
              cells: [ //list<cells>
                {
                  text: "Process No. :",
                  font_style: "bold",
                },
                {
                  text: data_document.DocumentProcessTypeName,
                  font_style: "normal",
                },
                {
                  text: "Action Time :",
                  font_style: "bold",
                },
                {
                  text: DocDate,
                  font_style: "normal",
                },
              ]
            },
            {
              cells: [ //list<cells>
                {
                  text: "Source Warehouse :",
                  font_style: "bold",
                },
                {
                  text: "STGT-HY4/ASRS",
                  font_style: "normal",
                },
                {
                  text: "Destinaton Warehouse :",
                  font_style: "bold",
                },
                {
                  text: "",
                  font_style: "normal",
                },
              ]
            },
            {
              cells: [ //list<cells>
                {
                  text: "Destinaton Customer :",
                  font_style: "bold",
                },
                {
                  text: "สินค้าลูกค้า",
                  font_style: "normal",
                },
                {
                  text: "Remark :",
                  font_style: "bold",
                },
                {
                  text: "xxxxxx",
                  font_style: "normal",
                },
              ]
            }
          ]
  
          let reqjson = {
            "title": "Putaway Document Report",
            "companyName": "BOSS",
            "tables": [
              {
                "hor_align": "ALIGN_CENTER",
                "ver_align": null,
                "total_width": null,
                "def_cell_border": "BOX",
                "headers": [
                  {
                    cells: [ //list<cells>
                      {
                        text: "Document :",
                        font_style: "bold",
                      },
                      {
                        text: data_document.Code,
                        font_style: "normal",
                      },
                      {
                        text: "Docment Date :",
                        font_style: "bold",
                      },
                      {
                        text: ActionDate,
                        font_style: "normal",
                      },
                    ]
                  },
                  {
                    cells: [ //list<cells>
                      {
                        text: "Process No. :",
                        font_style: "bold",
                      },
                      {
                        text: data_document.DocumentProcessTypeName,
                        font_style: "normal",
                      },
                      {
                        text: "Action Time :",
                        font_style: "bold",
                      },
                      {
                        text: DocDate,
                        font_style: "normal",
                      },
                    ]
                  },
                  {
                    cells: [ //list<cells>
                      {
                        text: "Source Warehouse :",
                        font_style: "bold",
                      },
                      {
                        text: "STGT-HY4/ASRS",
                        font_style: "normal",
                      },
                      {
                        text: "Destinaton Warehouse :",
                        font_style: "bold",
                      },
                      {
                        text: "",
                        font_style: "normal",
                      },
                    ]
                  },
                  {
                    cells: [ //list<cells>
                      {
                        text: "Destinaton Customer :",
                        font_style: "bold",
                      },
                      {
                        text: "สินค้าลูกค้า",
                        font_style: "normal",
                      },
                      {
                        text: "Remark :",
                        font_style: "bold",
                      },
                      {
                        text: "xxxxxx",
                        font_style: "normal",
                      },
                    ]
                  }
                ]
              }
            ],
          };
  
          console.log(reqjson)
  
  
          await Axios.postload(window.apipath + "/v2/download/print_pdf", reqjson, "document_" + data_document.Code + ".pdf").then();
  
        }
      } catch (err) {
        console.log(err)
      }
    }
  return (
    <div>
      {stateDialog ? showDialog ? showDialog : null : null}
      <AmDialogConfirm
        titleDialog={t("Edit Quantity")}
        open={openDialogEditQty}
        close={a => setOpenDialogEditQty(a)}
        bodyDialog={createDialogEditQty()}
        customAcceptBtn={<AmButton styleType="confirm_clear" onClick={() => onConfirmEdit()}>{t("OK")}</AmButton>}
        customCancelBtn={<AmButton styleType="delete_clear" onClick={() => { setOpenDialogEditQty(false); setQtyEdit({}); }}>{t("Cancel")}</AmButton>}

            />
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
            {props.usePrintBarcodePallet ?
                <>
                    <AmPrintBarCode data={selection}
                        SouSupplierCode={dataHeader.SouSupplier}
                        SouSupplierName={dataHeader.SouSupplierName}
                    // onSucess={(e) => { console.log(e); if (e === true) getData(); }}
                    />
                </>

                : null}

            {typeDoc && !props.CreateputAway ? (
                // <Table columns={columns} pageSize={100} data={data} sortable={false} currentPage={0} />
                <AmTable
                    selection={"checkbox"}
                    selectionData={(data) => {
                        setSelection(data);
                    }} dataKey="ID"
                    columns={columns}
                    pageSize={data.length}
                    dataSource={data}
                    height={200}
                    rowNumber={false} />
            ) :
                typeDoc && props.CreateputAway ?
                    <AmTable
                        columns={columns}
                        pageSize={data.length}
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

                                        <AmTable dataKey="id"
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
                        pageSize={dataDetailSOU.length}
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
                        pageSize={dataDetailDES.length}
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
// export default DocumentView;
