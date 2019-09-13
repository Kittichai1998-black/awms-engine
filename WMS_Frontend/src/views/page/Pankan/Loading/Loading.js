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
  const [transport, setTransport] = useState("");

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
    onGetData(value);
  };

  function onGetData(value) {
    Axios.get(createQueryString(transportQuery)).then(res => {
      console.log(res);
      setTransport(res.data.datas[0].transport);
    });

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

  return (
    <div className={classes.root}>
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
            onChange={(value, dataObject, field) =>
              onHandleDDLChange(value, dataObject, field)
            }
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
                    id={"cols.field"}
                    style={{ width: "115px" }}
                    type="input"

                    //onChange={(val)=>{onChangeEditor(cols.field, data, val,"Pack Name")}}
                  />
                  <AmButton styleType="confirm" style={{ marginLeft: "15px" }}>
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
