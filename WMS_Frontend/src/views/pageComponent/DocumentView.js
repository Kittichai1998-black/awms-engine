import Grid from "@material-ui/core/Grid";
import moment from "moment";
import React, { useState, useEffect, useContext } from "react";
import styled from "styled-components";
import {
  withStyles,
  MuiThemeProvider,
  createMuiTheme
} from "@material-ui/core/styles";
import AmDialogs from '../../components/AmDialogs'
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
import LabelT from "../../components/AmLabelMultiLanguage";
import { apicall } from '../../components/function/CoreFunction'
import BtnAddPallet from '../../components/AmMappingPalletAndDisto';
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
  "font-weight": "bold",
  width: "200px"
};

const DocumentView = props => {
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

  //set dialog Add pallet
  const [dataDoc, setDataDoc] = useState(false);
  const [eventStatus, setEventStatus] = useState(null);


  useEffect(() => {
    getData();
    // console.log(props.optionDocItems);
  }, []);

  const getData = () => {
    //========================================================================================================
    // console.log(props.typeDocNo);
    // console.log(props);

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
        setDataHeader(res.data.document);
        setEventStatus(res.data.document.EventStatus);
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
                      : null
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


  const CreateBtnAddPallet = () => {
    if (eventStatus === 10) {
      return <BtnAddPallet dataDocument={dataDoc} dataDocItems={data} />
    }
    else{
      return null;
    }
  }
 
  return (
    <div>
      {getHeader()}
      <br />
      <br />
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
          <div>

            {props.useAddPalletMapSTO ?
              CreateBtnAddPallet()
              : null}
            <Table
              columns={columnsDetailSOU}
              pageSize={100}
              data={dataDetailSOU}
              sortable={false}
            /></div>
        ) : null
      ) : props.openDES === true ? (
        typeDoc ? (
          <Table
            columns={columnsDetailDES}
            pageSize={100}
            data={dataDetailDES}
            sortable={false}
          />
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
DocumentView.propTypes = {
  openSOU: PropType.bool.isRequired,
  openDES: PropType.bool.isRequired
};
export default withStyles(styles)(DocumentView);
// export default DocumentView;
