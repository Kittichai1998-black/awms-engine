import Grid from "@material-ui/core/Grid";
import moment from "moment";
import React, { useState, useEffect, useContext } from "react";
import styled from "styled-components";
import _ from 'lodash';
import AmButton from "../../../../components/AmButton"

// import "react-bootstrap-table-next/dist/react-bootstrap-table2.min.css";

import {
    withStyles,
    MuiThemeProvider,
    createMuiTheme
} from "@material-ui/core/styles";
import Axios from "axios";
import Table from "../../../../components/table/AmTable";
import queryString from "query-string";
import DocumentEventStatus from "../../../../components/AmStatus";
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

const AmDocumentViewPDFLD = props => {
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
    const [head1, sethead1] = useState("มูลนิธิยุวพัฒน์")

    const columnsDetailSOUs = [
        { "width": 150, "accessor": "code", "Header": "Code" },
        { "accessor": "Item", "Header": "Item" },
        { "accessor": "IssueCode", "Header": "Issue Document" },
        { "width": 110, "accessor": "packQty", "Header": "Qty" },
        { "width": 60, "accessor": "packUnitCode", "Header": "Unit" }
    ]

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
            1012 +
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
                    res.data.sou_bstos
                        .filter(y => y.docItemID == row.ID)
                        .forEach(y => {
                            sumQty += y.distoQty;
                        });
                    row._sumQtyDisto = sumQty;

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
                                        : null
                    });
                });

                //============================================================================

                res.data.sou_bstos.forEach(rowDetail => {
                    rowDetail.eventStatusDoc = res.data.document["eventStatus"];
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
                                : typeDoc === "received"
                                    ? rowDetail.packQty
                                    : typeDoc === "audit"
                                        ? rowDetail.distoQty
                                        : null
                    });
                });

                res.data.des_bstos.forEach(rowDetail => {
                    rowDetail.eventStatusDoc = res.data.document["eventStatus"];
                    var qryStr = queryString.parse(rowDetail.Options);
                    if (optionDesBstos) {
                        optionDesBstos.forEach(x => {
                            rowDetail[x.optionName] =
                                qryStr[x.optionName] === "undefined"
                                    ? null
                                    : qryStr[x.optionName];
                        });
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
        console.log(dataDetailExport)
        var descus = dataDetailExport.document.DesCustomerName
        var doccode = dataDetailExport.document.Code
        var docdate = dataDetailExport.document.ModifyTime
        console.log(descus)
        //var head1 = "มูลนิธิยุวพัฒน์"
        sethead1("มูลนิธิยุวพัฒน์");
       
        var docDefinition = {
            content: [
                { text: 'มูลนิธิยุวพัฒน์' + head1, fontSize: 15 },
                { text: 'ใบขออนุญาตนำสินค้าร่วมปันออกนอกคลังปันกัน', fontSize: 15 },
                { text: 'สาขาที่ส่ง' + descus  , fontSize: 15 },
                { text: 'เลขที่เอกสาร' + doccode, fontSize: 15 },
                { text: 'วันที่นำออก' + docdate, fontSize: 15 },


            ],
            defaultStyle: {
                font: 'THSarabunNew',
            }
        };
        pdfMake.createPdf(docDefinition).open()

    }



    return (
        <div>
            {getHeader()}
            {console.log(dataHeader)}
            <br />
            <br />

                        <div style={{ marginLeft: "92%", width: "100px" }}>
                            <AmButton styleType="info" onClick={ExportPDF}>
                                {t("Export PDF")}
                            </AmButton>
                        </div> 


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
AmDocumentViewPDFLD.propTypes = {
    openSOU: PropType.bool.isRequired,
    openDES: PropType.bool.isRequired
};
export default withStyles(styles)(AmDocumentViewPDFLD);
// export default DocumentView;
