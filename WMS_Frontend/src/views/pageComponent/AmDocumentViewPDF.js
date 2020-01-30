import Grid from "@material-ui/core/Grid";
import moment from "moment";
import React, { useState, useEffect, useContext } from "react";
import styled from "styled-components";
import _ from 'lodash';
import Ambutton from "../../components/AmButton"

// import "react-bootstrap-table-next/dist/react-bootstrap-table2.min.css";

import {
    withStyles,
    MuiThemeProvider,
    createMuiTheme
} from "@material-ui/core/styles";
import Axios from "axios";
import Table from "../../components/table/AmTable";
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
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
pdfMake.vfs = pdfFonts.pdfMake.vfs;
pdfMake.fonts = {
    THSarabunNew: {
        normal: 'THSarabunNew.ttf',
        bold: 'THSarabunNew-Bold.ttf',
        italics: 'THSarabunNew-Italic.ttf',
        bolditalics: 'THSarabunNew-BoldItalic.ttf'
    },
    Roboto: {
        normal: 'Roboto-Regular.ttf',
        bold: 'Roboto-Medium.ttf',
        italics: 'Roboto-Italic.ttf',
        bolditalics: 'Roboto-MediumItalic.ttf'
    }
}

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

const LabelH = styled.label`
  font-weight: bold;
  width: 200px;
`;

const AmDocumentViewPDF = props => {
    const { t } = useTranslation();
    const [statusdoc, setStatusdoc] = useState(0);
    const [docID, setDocID] = useState(props.docID);
    const [typeDoc, setTypeDoc] = useState(props.typeDoc);
    const [header, setHeader] = useState(props.header);
    const [dataHeader, setDataHeader] = useState([]);
    const [columns, setColumns] = useState(props.columns);
    const [columnsDetailSOU, setColumnsDetailSOU] = useState(
        props.columnsDetailSOU
    );
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

    const [dataDetailExport, setdataDetailExport] = useState();

    useEffect(() => {
        getData();
        console.log(props.optionDocItems);
    }, []);

    const getData = () => {
        //========================================================================================================
        // console.log(props.typeDocNo);
        Axios.get(
            window.apipath +
            "/v2/GetDocAPI/?docTypeID=" +
            props.typeDocNo +
            "&docID=" +
            docID +
            "&getMapSto=true&_token=" +
            localStorage.getItem("Token")
        ).then(res => {

            if (res.data._result.status === 1) {
                setDataHeader(res.data.document);
                setdataDetailExport(res.data)

                //============================================================================

                res.data.document.documentItems.forEach(row => {
                    var sumQty = 0;
                    var sumQtyConvert = 0;
                    res.data.sou_bstos
                        .filter(y => y.docItemID == row.ID)
                        .forEach(y => {
                            sumQty += y.distoQty;
                            sumQtyConvert += y.distoQtyConvert
                        });
                    row._sumQtyDisto = sumQty;
                    row._sumQtyDistoConvert = sumQtyConvert;

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

                    if (window.project === "AAI") {
                        row.lenum = qryStr.lenum === "undefined" ? null : qryStr.lenum;
                        row.posnr = qryStr.rosnr === "undefined" ? null : qryStr.posnr;
                        row.matnr = qryStr.matnr === "undefined" ? null : qryStr.matnr;
                        row.charg = qryStr.charg === "undefined" ? null : qryStr.charg;
                        row.lgtyp = qryStr.lgtyp === "undefined" ? null : qryStr.lgtyp;
                        row.lgbtr = qryStr.lgbtr === "undefined" ? null : qryStr.lgbtr;
                        row.lgpla = qryStr.lgpla === "undefined" ? null : qryStr.lgpla;
                        row.bestq_ur =
                            qryStr.bestq_ur === "undefined" ? null : qryStr.bestq_ur;
                        row.bastq_qi =
                            qryStr.bastq_qi === "undefined" ? null : qryStr.bastq_qi;
                        row.bastq_blk =
                            qryStr.bastq_blk === "undefined" ? null : qryStr.bastq_blk;
                    }

                    row.palletcode =
                        qryStr.palletcode === "undefined" ? null : qryStr.palletcode;
                    row.locationcode =
                        qryStr.locationcode === "undefined" ? null : qryStr.locationcode;

                    dataTable.push({
                        ...row,
                        _qty:
                            typeDoc === "issued"
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
                      _qtyConvert:
                            typeDoc === "issued"
                                 ? row._sumQtyDisto +" / " + (row.Quantity === null ? "-" : row.Quantity)
                                 : null                 
                    });
                });

                //============================================================================

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

                    if (window.project === "AAI") {
                        rowDetail.tanum =
                            qryStr.tanum === "undefined" ? null : qryStr.tanum;
                        rowDetail.btanr =
                            qryStr.btanr === "undefined" ? null : qryStr.btanr;
                    }

                    dataTableDetailSOU.push({
                        ...rowDetail,
                        _packQty:
                            typeDoc === "issued"
                                ? rowDetail.distoQty + " / " + rowDetail.distoQtyMax
                                : typeDoc === "received"
                                    ? rowDetail.packQty
                                    : typeDoc === "audit"
                                        ? rowDetail.distoQty
                                        : null,
                      _packQtyConvert : typeDoc === "issued"
                      ? rowDetail.distoQtyConvert + " / " + rowDetail.distoQtyMaxConvert :null

                    });
                });

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
                                : typeDoc === "received"
                                    ? rowDetail.packQty
                                    : typeDoc === "audit"
                                        ? rowDetail.distoQty
                                        : null
                    });
                });

                //============================================================================
                // console.log(dataTable);
                setData(dataTable);
                setDataDetailSOU(dataTableDetailSOU);
                setDataDetailDES(dataTableDetailDES);
            }
        });
    };

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
        return header.map(x => {
            return (
                <Grid container spacing={24}>
                    {x.map(y => {
                        let syn = y.label ? " :" : "";
                        return (
                            <Grid
                                xs={12}
                                sm={6}
                                style={{ paddingLeft: "20px", paddingTop: "10px" }}
                            >
                                <FormInline>
                                    <LabelH>{t(y.label) + syn}</LabelH>
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

    const ExportPDF = () => {

        var datas = dataDetailExport.document
        if (datas !== null || datas !== undefined) {
            var dataDocumentItem = dataDetailExport.sou_bstos
            var statusDoc = datas.Status
            var Docstatus = ''
            let dataDocumentItemTB;
            let dataSort = [];
            let datasItem = {}
            let DocDate = moment(datas.DocumentDate).format("DD/MM/YYYY");
            let ActionDates = moment(datas.Actiontime).format("DD/MM/YYYY HH:mm:ss");
            if (statusDoc === 1) {
                Docstatus = 'WORKING'
            } else if (statusDoc === 2) {
                Docstatus = 'WORKED'
            } else if (statusDoc === 3) {
                Docstatus = 'CLOSED'
            } else if (statusDoc === 0) {
                Docstatus = 'NEW'
            } else {
                Docstatus = ''
            }
            var DocCode = null
            var movementType = null
            var SouWarehouse = null
            var DesWare = null
            var DesWarehouse = null
            var Descus = null
            var Remark = null
            var Units = null
           
            if (datas.MovementName === null || datas.MovementName === undefined) {
                movementType = ''
            } else {
                movementType = datas.MovementName
            }

            if (datas.Code === null || datas.Code === undefined) {
                DocCode = ''
            } else {
                DocCode = datas.Code
            }

            if (datas.SouWarehouseName === null || datas.SouWarehouseName === undefined) {
                SouWarehouse = ''
            } else {
                SouWarehouse = datas.SouWarehouseName
            }
            if (datas.DesWarehouseName === null || datas.DesWarehouseName === undefined) {
                DesWare = ''
            } else {
                DesWare = datas.DesWarehouseName
            }
            if (datas.DesCustomerName === null || datas.DesCustomerName === undefined) {
                Descus = ''
            } else {
                Descus = datas.DesCustomerName
            }
            if (datas.Remark === null || datas.Remark === undefined) {
                Remark = ''
            } else {
                Remark = datas.Remark
            }

            if (dataDocumentItem !== undefined || dataDocumentItem !== undefined) {
                dataDocumentItem.map((item, idx) => {
                    console.log(item)
                    console.log(item.skuType)
                    var qryStr1 = queryString.parse(item.sou_options)
                    var catonNo = qryStr1["carton_no"]
                    var Remarks = qryStr1["remark"]

                    datasItem = {
                        "No": idx + 1,
                        "Status": 'Pass',
                        "PalletCode": item.code === undefined || item.code === null ? '' : item.code,
                        "SI": item.orderNo === undefined || item.orderNo === null ? '' : item.orderNo,
                        "Reorder": item.packCode.padStart(15, '0'),
                        "Brand": item.packName === undefined || item.packName === null ? '' : item.packName ,
                        "Size": item.skuType === undefined || item.skuType === null ? '' : item.skuType,
                        "CartonNo": catonNo === undefined || catonNo === null ? '' : catonNo ,
                        "Qty": item.distoQty === undefined || item.distoQty === null ? '' : item.distoQty,
                        "Unit": item.packUnitCode === undefined || item.packUnitCode === null ? '' : item.packUnitCode,
                        "Remark": Remarks === undefined || Remarks === null ? '' :Remarks,

                    }
                    Units = item.packUnitCode
                    dataSort.push(datasItem)
                })

            }

            let DataDocumentGroupbySI = [];
            let dataSortGrouby = _.orderBy(dataSort, ['Reorder', 'Size', 'CartonNo'], ['asc', 'asc', 'asc']);
            let dataSortGroubySI = _.chain(dataSortGrouby).groupBy("SI").value();
            let sumQtys = null
            let dataExport = []
            let dataPDFbySI = null
            let indxSI = null
            dataSortGrouby.forEach((i, index) => {
                var filterSI = dataSortGrouby.filter(
                    x => x['SI'] === dataSortGrouby[index]['SI'])
               // console.log(filterSI.length)

                let NoSI = dataSortGrouby[index]['SI']
                let NoSIs = dataSortGrouby[index +1]['SI']
                let NoSIint = parseInt(NoSI);
                let NoSIints = parseInt(NoSIs);
                console.log(NoSI)
                //if (NoSIint !== NoSIints) {
                //    indxSI = i.SI
                //    dataPDFbySI = dataSortGroubySI[indxSI]
                //    console.log(dataPDFbySI)
                //} 
                
                sumQtys = _.sumBy(dataPDFbySI, 'Qty')
                dataDocumentItemTB = dataSortGroubySI[i.SI].map((x, idx) => {
                return [idx + 1,
                x.Status,
                 x.PalletCode,
                 x.SI,
                x.Reorder.replace(/^0+/, ''),
                x.Brand,
                x.Size,
                x.CartonNo,
                x.Qty,
                x.Unit,
                x.Remark
                ];
                })

                dataExport.push(dataDocumentItemTB)
            })
            //console.log(dataExport)
            //console.log(dataDocumentItemTB)
            //let sumQtys = _.sumBy(dataSort, 'Qty')
            
            let pageLeght = Math.ceil(dataSortGrouby.length / 15)
            let dataArr = [];

            for (var i = 0; i < pageLeght; i++) {
                var data = dataDocumentItemTB.filter(x => { return x[0] <= (15 * (i + 1)) }).filter(x => x[0] >= ((i * 15) + 1));
                dataArr.push(data);
            }
            var docDefinition
            let docDefinitionpage = []
            let contents = []
           
            dataArr.forEach((x, idx) => {
                console.log(dataArr)
                let pages = idx + 1
                docDefinition = [

                    { text: 'Loading Shipment Report', style: 'headers', alignment: 'center' },

                    { text: pages + '/' + pageLeght, style: 'col7', alignment: 'right' },
                    { text: 'SRITANG GLOVES(THAILAND) PUBLIC COMPANY LIMITED', style: 'col7', alignment: 'left' },

                    {
                        columns: [
                            { width: '20%', text: "Document No." , style: 'col8' },
                            { width: '40%', text: DocCode, style: 'col8' },
                            { width: '20%', text: 'Docment Date :', style: 'col8' },
                            { width: '40%', text: DocDate, style: 'col8' }
                        ],
                        columnGap: 10
                    },
                    {
                        columns: [
                            { width: '20%', text: 'MovementType :', style: 'col1' },
                            { width: '40%', text: movementType, style: 'col1' },
                            { width: '20%', text: 'Action Time :', style: 'col1' },
                            { width: '40%', text: ActionDates, style: 'col1' }
                        ],
                        columnGap: 10
                    },
                    {
                        columns: [
                            { width: '20%', text: 'Source Warehouse :', style: 'col1' },
                            { width: '40%', text: SouWarehouse, style: 'col1' },
                            { width: '20%', text: 'Destinaton Warehouse :', style: 'col1' },
                            { width: '40%', text: DesWare, style: 'col1' },
                        ],
                        columnGap: 10
                    },
                    {
                        columns: [
                            { width: '20%', text: 'Document Status :', style: 'col1' },
                            { width: '40%', text: Docstatus, style: 'col1' },
                            { width: '20%', text: 'Destinaton Customer :', style: 'col1' },
                            { width: '40%', text: Descus, style: 'col1' },
                        ],
                        columnGap: 10
                    },
                    {
                        columns: [
                            { width: '20%', text: 'Remark :', style: 'col1s' },
                            { width: '40%', text: Remark, style: 'col1s' },
                        ],
                        columnGap: 10
                    },

                    {
                        style: 'tableFooter',

                        table: {
                            headerRows: 1,
                            widths: [30, 70, '*','*' ,'*', 500, 70, 120, 120, 120, '*',],
                            header: {
                                fontSize: 26,
                                alignment: 'center'

                            },
                            anotherStyle: {
                                italics: true,
                                fontSize: 26,
                                alignment: 'right',
                            },

                            body: [

                                ['No.', 'Status', 'Pallet Code','SI', 'Reorder', 'Brand', 'Size', 'Carton No.', 'Qty', 'Unit', 'Remark'],
                                ...dataArr[idx]

                            ]
                        }
                    },
                    //{
                    //    columns: [
                    //        {
                    //            width: '70%', text: '',
                    //            style: 'col5', alignment: 'left'
                    //        },
                    //        { width: '1%', text: '', style: 'col4' },
                    //        { width: '40%', text: 'By ______________________________________________', style: 'col4' },
                    //        { width: '1%', text: datas.Remark, style: 'col4' },
                    //    ],
                    //    columnGap: 10
                    //},
                    //{
                    //    columns: [
                    //        {
                    //            width: '80%', text: 'Referent Document : SH1.EP.WI.15.001,SH3.EP.WI.15.001,ST1.WH.WI.15.002,SSI.EP.WI.15.001,SS1.EP.WI.15.001,SH4.EP.WI.15.001',
                    //            style: 'col5', alignment: 'left'
                    //        },
                    //        { width: '1%', text: '', style: 'col4' },
                    //        { width: '40%', text: 'Section Warehoouse', style: 'col6' },
                    //        { width: '1%', text: datas.Remark, style: 'col4' },
                    //    ],
                    //    columnGap: 10
                    //},
                    //{
                    //    text: '',
                    //    pageBreak: "after"
                    //},

                ]

                if (docDefinition !== [])
                contents.push(docDefinition)

            })

           
            var conpage = contents.map((x, idx) => {
                console.log(idx)
                if (contents[idx] !== [])
                return conpage = contents[idx]

            })

            if (conpage !== []) {

                docDefinition = {

                    pageSize: { width: 1684, height: 1190 },
                    content: [
                        conpage,
                        {
                            style: 'tableFooters',
                            table: {
                                heights: 20,
                                widths: [120, 120,120],
                                body: [
                                    ['Total', sumQtys, Units],
                           
                                ]
                            }
                        }
                    ],


                 

                    footer: {
                        columns: [
                            {
                                width: '60%',
                                hight: 100,
                                text: 'Reference Document : SH1.EP.WI.15.001,SH3.EP.WI.15.001,ST1.WH.WI.15.002,SSI.EP.WI.15.001,SS1.EP.WI.15.001,SH4.EP.WI.15.001',
                                style: 'footers', alignment: 'left'

                            },
                            {
                                text: 'By _________________________________________  Section Warehouse    ',
                                style: 'footer', hight: 100,
                                pageBreak: "after" 
                            },
                            
                            
                        ]
                    },
                    
               
                
                   // pageBreak: "after",
                   

                    styles: {
                        col1: {
                            fontSize: 25,
                            bold: true,
                            margin: [0, 0, 0, 10]

                        },
                        col1s: {
                            fontSize: 25,
                            bold: true,
                            margin: [0, 10, 0, 40]

                        },
                        col2: {
                            fontSize: 25,
                            margin: [0, 10, 0, 10]
                        },
                        col3: {
                            fontSize: 25,
                            font: 'THSarabunNew',
                            margin: [0, 0, 0, 10]
                        },
                        col4: {
                            fontSize: 25, margin: [0, 40, 0, 10]
                        },
                        col5: {
                            fontSize: 20, margin: [0, 40, 0, 10]
                        },
                        col6: {
                            fontSize: 25, margin: [0, 0, 0, 0]
                        },
                        col7: {
                            fontSize: 20, margin: [0, 0, 0, 0]
                        },
                        col8: {
                            fontSize: 25,
                            bold: true,
                            margin: [0, 40, 0, 10]

                        },
                        headers: {
                            fontSize: 36,
                            bold: true,
                            margin: [10, 10, 10, 10]
                        },
                        tableFooter: {
                            fontSize: 25,
                            margin: [0, 0, 0, 0]
                        },
                        tableFooters: {
                            fontSize: 25,
                            margin: [1088, 0, 0, 40]
                        },
                        footers: {
                            fontSize: 20,
                            margin: [40, 0, 0, 0]
                        },
                        footer: {
                            fontSize: 25,
                            margin: [10, 0, 0, 10]

                        }
                    },
                    defaultStyle: {
                        font: 'THSarabunNew',
                        bold: true,

                    }
                };


            }
            
        }
        
        pdfMake.createPdf(docDefinition).open()
      
       
    }



    return (
        <div>
            {getHeader()}
{console.log(dataHeader)}
            <br />
            <br />
{
    (dataHeader.MovementName ==="FG_TRANSFER_CUS" || dataHeader.MovementName ==="FG_TRANSFER_WM")?
                    (dataHeader.EventStatus === 32 || dataHeader.EventStatus === 11) ?
                        <div style={{ marginLeft: "92%", width: "100px" }}>
    <AmButton styleType="info" onClick={ExportPDF}>
        {t("Export PDF")}
    </AmButton>
</div>:null

    :null
}
            

            {typeDoc ? (
                <Table columns={columns} pageSize={100} data={data} sortable={false} />
            ) : null}

            <br />
            <br />

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
                                    <br />
                                    {typeDoc ? (
                                        <Table
                                            columns={columnsDetailSOU}
                                            pageSize={100}
                                            data={dataDetailSOU}
                                            sortable={false}
                                        />
                                    ) : null}
                                </Col>
                            </Row>
                        </TabPane>
                        <TabPane tabId="2">
                            <Row>
                                <Col sm="12">
                                    <br />
                                    {typeDoc ? (
                                        <Table
                                            columns={columnsDetailDES}
                                            pageSize={100}
                                            data={dataDetailDES}
                                            sortable={false}
                                        />
                                    ) : null}
                                </Col>
                            </Row>
                        </TabPane>
                    </TabContent>
                </div>

            ) : props.openSOU === true ? (
                typeDoc ? (
                    <Table
                        columns={columnsDetailSOU}
                        pageSize={100}
                        data={dataDetailSOU}
                        sortable={false}
                    />
                ) : null
            ) : props.openDES === true ? (
                typeDoc ? (
                    <div>

                        <Table
                            columns={columnsDetailDES}
                            pageSize={100}
                            data={dataDetailDES}
                            sortable={false}
                        />
                    </div>
                ) : null
            ) : (
                            ""
                        )}
            <br />
            {props.buttonBack === true ? (
                <AmButton styleType="default" onClick={buttonBack}>
                    {t("Back")}
                </AmButton>
            ) : null}
        </div>
    );
};
AmDocumentViewPDF.propTypes = {
    openSOU: PropType.bool.isRequired,
    openDES: PropType.bool.isRequired
};
export default withStyles(styles)(AmDocumentViewPDF);
// export default DocumentView;
