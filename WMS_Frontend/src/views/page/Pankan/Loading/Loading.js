import React, { useState, useEffect, useRef } from "react";
import { withStyles } from "@material-ui/core/styles";
import {
  apicall,
  createQueryString,
  Clone
} from "../../../../components/function/CoreFunction2";
import AmDialogs from "../../../../components/AmDialogs";
import AmButton from "../../../../components/AmButton";
import AmInput from "../../../../components/AmInput";
import CheckCircle from "@material-ui/icons/CheckCircle";
import HighlightOff from "@material-ui/icons/HighlightOff";
import {
  indigo,
  deepPurple,
  lightBlue,
  red,
  grey,
  green
} from "@material-ui/core/colors";
import Paper from "@material-ui/core/Paper";

import _ from "lodash";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import styled from "styled-components";
import AmTable from "../../../../components/table/AmTable";
import AmDropdown from "../../../../components/AmDropdown";
import AmEntityStatus from "../../../../components/AmEntityStatus";

const Axios = new apicall();

const styles = theme => ({
  root: {
    // maxWidth: '100%',
    fontFamily: [
      "-apple-system",
      "BlinkMacSystemFont",
      '"Segoe UI"',
      "Roboto",
      '"Helvetica Neue"',
      "Arial",
      "sans-serif",
      '"Apple Color Emoji"',
      '"Segoe UI Emoji"',
      '"Segoe UI Symbol"'
    ].join(",")
  },
  paperContainer: {
    maxWidth: "450px",
    width: "100%",
    minWidth: "300px",
    padding: theme.spacing(2, 1)
  }
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
  width: 120px;
  paddingleft: 20px;
`;
const LabelHCard = styled.label`
  font-weight: bold;
  width: 80px;
  paddingleft: 20px;
`;

const InputDiv = styled.div``;
const Loading = props => {
  const { classes } = props;
  const [data, setData] = useState([]);
  const [docID, setDocID] = useState();
  const [doc, setDoc] = useState();
  const [valueDoc, setValueDoc] = useState();
  const [transport, setTransport] = useState("");
  const [openSuccess, setOpenSuccess] = useState(false);
  const [openError, setOpenError] = useState(false);
  const [textError, setTextError] = useState("");

  const DocumentQuery = {
    queryString: window.apipath + "/v2/SelectDataTrxAPI/",
    t: "Document",
    q:
      '[{ "f": "EventStatus", "c":"=", "v": 11},{ "f": "DocumentType_ID", "c":"=", "v": 1012}]',
    f: "*",
    g: "",
    s: "[{'f':'ID','od':'asc'}]",
    sk: 0,
    l: 100,
    all: ""
  };
  const transportQuery = {
    queryString: window.apipath + "/v2/SelectDataViwAPI/",
    t: "Document",
    q:
      '[{ "f": "EventStatus", "c":"=", "v": 11},{ "f": "DocumentType_ID", "c":"=", "v": 1012}]',
    f: "ID,transport",
    g: "",
    s: "[{'f':'ID','od':'asc'}]",
    sk: 0,
    l: 100,
    all: ""
  };
  const iniCols = [
    { Header: "Item", accessor: "items", sortable: false },
    {
      Header: "Issue Doc",
      accessor: "issuedCode",
      sortable: false,
      width: 110
    },
    {
      Header: "Loaded",
      accessor: "isLoaded",
      sortable: false,
      width: 57,
      Cell: e => getStatus(e.original)
    }
  ];

  const getStatus = value => {
    if (value.isLoaded === true) {
      return (
        <div style={{ textAlign: "center" }}>
          {" "}
          <CheckCircle style={{ color: "green" }} />
        </div>
      );
    } else if (value.isLoaded === false) {
      return (
        <div style={{ textAlign: "center" }}>
          <HighlightOff style={{ color: "red" }} />
        </div>
      );
    } else {
      return null;
    }
  };
  const onHandleDDLChange = (value, dataObject, fieldDataKey) => {
    // setValueText1({
    //   ...valueText1,
    //   [inputID]: {
    //     value: value,
    //     dataObject: dataObject,
    //     fieldDataKey: fieldDataKey
    //   }
    // });

    console.log(value);
    setDoc(value);
    onGetData(value);
  };

  function onGetData(value) {
    Axios.get(createQueryString(transportQuery)).then(res => {
      console.log(res);
      if (res.data.datas.length > 0) {
        setTransport(res.data.datas[0].transport);
      }
    });
    setDocID(value);
    console.log(value);
    const data = {
      docID: value
    };

    Axios.post(window.apipath + "/v2/ListLoadingConsoAPI", data).then(res => {
      console.log(res);

      let groupdata = _.groupBy(res.data.datas, e => {
        return e.id;
      });
      let groupdisplay = [];
      let sou_packName = [];
      for (let row in groupdata) {
        groupdata[row].forEach(grow => {
          sou_packName.forEach((prow, index) => {
            if (prow === grow.sou_packName) sou_packName.splice(index, 1);
          });
          sou_packName.push(grow.sou_packName);
        });
        let result = groupdata[row][0];
        result.item = sou_packName.join(",");
        result.items = result.code + " : " + result.item;
        groupdisplay.push(groupdata[row][0]);
        sou_packName = [];
      }
      setData(groupdisplay);

      //this.setState({ data: groupdisplay });
    });
  }

  const getDocument = barcodeDetail => {
    const data = {
      docID: docID,
      scanCode: barcodeDetail
    };
    Axios.post(window.apipath + "/v2/LoadedStoByScanConsoAPI", data).then(
      res => {
        if (res.data._result.status === 1) {
          setOpenSuccess(true);
          onGetData(doc);
          Clear();
        } else {
          setOpenError(true);
          setTextError(res.data._result.message);
          onGetData(doc);
          Clear();
        }
      }
    );
  };
  const Clear = () => {
    var element = document.getElementById("issuedDocID");
    element.value = "";

    var elementBarcode = document.getElementById("Barcode");
    elementBarcode.value = "";
  };

  const onChangeEditor = value => {
    setValueDoc(value);
    console.log(value);
  };
  return (
    <div className={classes.root}>
      <AmDialogs
        typePopup={"success"}
        onAccept={e => {
          setOpenSuccess(e);
        }}
        open={openSuccess}
        content={"Success"}
      ></AmDialogs>
      <AmDialogs
        typePopup={"error"}
        onAccept={e => {
          setOpenError(e);
        }}
        open={openError}
        content={textError}
      ></AmDialogs>

      <Paper className={classes.paperContainer}>
        <FormInline
          style={{
            display: "-webkit-inline-box"
          }}
        >
          <LabelH>Loading Doc : </LabelH>

          <AmDropdown
            id={"issuedDocID"}
            placeholder={"Select Document"}
            fieldDataKey="ID"
            fieldLabel={["Code"]}
            labelPattern=" : "
            width={150}
            ddlMinWidth={150}
            zIndex={1000}
            queryApi={DocumentQuery}
            onChange={(value, dataObject, field) => onHandleDDLChange(value)}
            ddlType={"search"}
          />
        </FormInline>
        <br />
        <br />

        {data.map((list, index) => {
          console.log(list);
          return (
            <Card
              key={index}
              style={{
                border: "2px solid blue"
              }}
            >
              <CardContent>
                <LabelHCard>Transport :</LabelHCard> {transport}
                <br />
                <FormInline
                  style={{
                    display: "-webkit-inline-box"
                  }}
                >
                  <LabelHCard>Barcode : </LabelHCard>
                  <AmInput
                    id={"Barcode"}
                    style={{ width: "115px" }}
                    type="input"
                    onKeyPress={(value, xx, target, event) => {
                      if (event.key === "Enter") {
                        //let barcodeDetail = getBarcodeDetail(value);
                        //setBarcode(barcodeDetail);
                        getDocument(value);
                      }
                    }}
                    onChange={val => {
                      onChangeEditor(val);
                    }}
                  />
                  <AmButton
                    styleType="confirm"
                    style={{ marginLeft: "15px" }}
                    onClick={() => getDocument(valueDoc)}
                  >
                    {"Scan"}
                  </AmButton>
                </FormInline>
                <br />
                <AmTable
                  primaryKey="ID"
                  data={data}
                  columns={iniCols}
                  style={{ maxHeight: "500px" }}
                />
              </CardContent>
            </Card>
          );
        })}
      </Paper>
    </div>
  );
};

export default withStyles(styles)(Loading);
