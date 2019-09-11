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
import {
  indigo,
  deepPurple,
  lightBlue,
  red,
  grey,
  green
} from "@material-ui/core/colors";
import Paper from "@material-ui/core/Paper";
import Stepper from "@material-ui/core/Stepper";
import Step from "@material-ui/core/Step";
import StepLabel from "@material-ui/core/StepLabel";
import StepContent from "@material-ui/core/StepContent";
import Typography from "@material-ui/core/Typography";
import _ from "lodash";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import styled from "styled-components";
import { useTranslation } from "react-i18next";
import AmRadioGroup from "../../../../components/AmRadioGroup";
import AmDropdown from "../../../../components/AmDropdown";
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
  width: 100px;
  paddingleft: 20px;
`;

const InputDiv = styled.div``;
const Loading = props => {
  const { classes } = props;
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
  return (
    <div className={classes.root}>
      <Paper className={classes.paperContainer}>
        <FormInline>
          <LabelH>Document : </LabelH>
          <InputDiv>
            <AmDropdown
              id={"issuedDocID"}
              placeholder={"Select Document"}
              fieldDataKey="ID"
              fieldLabel={["Code"]}
              labelPattern=" : "
              width={300}
              ddlMinWidth={300}
              zIndex={1000}
              queryApi={DocumentQuery}
              //   onChange={(value, dataObject, field) =>
              //     onHandleDDLChangeDoc(value, dataObject, field)
              //   }
              ddlType={"search"}
            />
          </InputDiv>
        </FormInline>
      </Paper>
    </div>
  );
};

export default withStyles(styles)(Loading);
