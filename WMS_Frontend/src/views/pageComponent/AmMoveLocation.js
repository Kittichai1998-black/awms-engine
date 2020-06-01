import React, { useState, useEffect, useRef } from "react";
import { withStyles } from "@material-ui/core/styles";
import {
  apicall,
  createQueryString
} from "../../components/function/CoreFunction";
import AmDialogs from "../../components/AmDialogs";
import AmButton from "../../components/AmButton";
import AmInput from "../../components/AmInput";
import {
  indigo,
  deepPurple,
  lightBlue,
  red,
  grey,
  green
} from "@material-ui/core/colors";
import moment from "moment";
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
import PropTypes from "prop-types";
import queryString from "query-string";
import Grid from "@material-ui/core/Grid";
const Axios = new apicall();

const styles = theme => ({
  root: {
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
  },
  stepperContainer: {
    padding: "10px"
  },
  buttonAuto: {
    margin: theme.spacing(),
    width: "auto",
    lineHeight: 1
  },
  button: {
    marginTop: theme.spacing(),
    marginRight: theme.spacing()
  },
  actionsContainer: {
    marginBottom: theme.spacing(2),
    textAlign: "end"
  },
  resetContainer: {
    textAlign: "center"
  },
  stepLabel: {
    fontWeight: "bold",
    fontSize: "medium"
  },
  avatarHead: {
    // color: '#fff',
    width: "35px",
    height: "35px",
    // marginRight: '0px',
    backgroundColor: "#fff"
  },
  avatarHeadStatus: {
    width: "30px",
    height: "30px",
    fontSize: "1.125em"
  },
  cardHeader: {
    padding: "5px 0px 5px 5px"
  },
  cardTitle: {
    fontWeight: "bolder",
    fontSize: "1em"
  },
  cardAvatar: {
    marginRight: "10px"
  },
  avatar2: {
    width: "30px",
    height: "30px",
    // color: '#fff',
    backgroundColor: "#fff"
  },
  avatarStatus: {
    width: "25px",
    height: "25px"
  },
  textNowrap: {
    overflow: "hidden",
    textOverflow: "ellipsis",
    display: "block",
    whiteSpace: "nowrap"
  },
  labelHead: {
    fontWeight: "bold",
    display: "inline-block"
  },
  divLevel1: { display: "block" },
  divLevel2: { marginLeft: 22, display: "block" },
  chip: {
    margin: "2px 2px",
    height: "24px",
    // padding: '1px',
    borderRadius: "15px",
    backgroundColor: "rgba(255, 255, 255, 0.2)"
  },
  avatar: {
    width: 24,
    height: 24,
    color: "#fff",
    fontSize: "95%",
    backgroundColor: grey[500]
  },
  listRoot: {
    width: "100%",
    padding: "5px 5px"
  },
  listItemAvatarRoot: {
    minWidth: "30px",
    maxWidth: "30px"
  },
  inline: {
    display: "inline"
  },
  gutters: {
    padding: "0px 5px 0px 35px"
  },
  guttersHead: {
    padding: "0px 5px 0px 5px"
  },
  gutters2: { paddingRight: "40px" },
  bgFocus: {
    // backgroundColor: red[50],
    borderRadius: "5px",
    backgroundColor: "rgba(255, 224, 0, 0.3)"
  }
});

const BaseMaster = {
  queryString: window.apipath + "/v2/SelectDataMstAPI/",
  t: "BaseMaster",
  q: '[{ "f": "Status", "c":"=", "v": 1}]',
  f: "ID,Code",
  g: "",
  s: "[{'f':'ID','od':'asc'}]",
  sk: 0,
  all: ""
};

const AreaLocationMaster = {
  queryString: window.apipath + "/v2/SelectDataMstAPI/",
  t: "AreaLocationMaster",
  q: '[{ "f": "Status", "c":"=", "v": 1}]',
  f: "ID,Code,Name",
  g: "",
  s: "[{'f':'ID','od':'asc'}]",
  sk: 0,
  all: ""
};

const AmMoveLocation = props => {
  const { classes } = props;

  const [valueInput, setValueInput] = useState({});

  const [showDialog, setShowDialog] = useState(null);
  const [stateDialog, setStateDialog] = useState(false);
  const [msgDialog, setMsgDialog] = useState("");
  const [typeDialog, setTypeDialog] = useState("");



  return (
    <div>
    </div>
  );
};


export default withStyles(styles)(AmMoveLocation);
