// import React, { Component } from 'react';
import moment from "moment";
import TextField from "@material-ui/core/TextField";
import classNames from "classnames";
import "moment/locale/pt-br";
import React, { useState, useEffect } from "react";
import {
  withStyles,
  MuiThemeProvider,
  createMuiTheme
} from "@material-ui/core/styles";

const AmDate = props => {
  const [type, setType] = useState(props.TypeDate);
  const [style, setStyle] = useState(props.style);
  const [disabled, setDisabled] = useState(props.disabled);
  const [DateNow, setDateNow] = useState(
    type === "date"
      ? moment().format("YYYY-MM-DD")
      : moment().format("YYYY-MM-DDTHH:mm")
  );
  const [TimeNow, setTimeNow] = useState(moment().format("HH:mm"));
  const [fieldID, setFieldID] = useState(props.FieldID);

  useEffect(() => {
    if (props.defaultValue === true) {
      const dataReturndefault = {};
      if (props.defaultValueDateTime !== null || props.defaultValueDateTime !== undefined) {
        dataReturndefault.fieldID = fieldID;
        dataReturndefault.fieldDataKey = props.defaultValueDateTime;
        dataReturndefault.fieldDataObject = props.defaultValueDateTime;
        props.onChange(dataReturndefault);
      } else {
        if (type === "time") {
          dataReturndefault.fieldID = fieldID;
          dataReturndefault.fieldDataKey = TimeNow;
          dataReturndefault.fieldDataObject = TimeNow;
          props.onChange(dataReturndefault);
        } else {
          dataReturndefault.fieldID = fieldID;
          dataReturndefault.fieldDataKey = DateNow;
          dataReturndefault.fieldDataObject = DateNow;
          props.onChange(dataReturndefault);
        }
      }
      //props.onChange(type === "time"?TimeNow:DateNow);
    }
  }, []);

  const onHandleDateChange = (text, tDate) => {
    const dataReturn = {};
    if (tDate === "date") {
      if (text === null) {
        props.onChange(null);
      } else {
        dataReturn.fieldID = fieldID;
        dataReturn.fieldDataKey = text.format("YYYY-MM-DD");
        dataReturn.fieldDataObject = text.format("YYYY-MM-DD");
        props.onChange(dataReturn);
      }
    } else if (tDate === "datetime-local") {
      // console.log(text)
      if (text === null) {
        props.onChange(null);
      } else {
        dataReturn.fieldID = fieldID;
        dataReturn.fieldDataKey = text.format("YYYY-MM-DDTHH:mm");
        dataReturn.fieldDataObject = text.format("YYYY-MM-DDTHH:mm");
        props.onChange(dataReturn);
      }
    } else if (tDate === "time") {
      if (text === null) {
        props.onChange(null);
      } else {
        dataReturn.fieldID = fieldID;
        dataReturn.fieldDataKey = text;
        dataReturn.fieldDataObject = text;
        props.onChange(dataReturn);
      }
    }
    //props.onChange(text)
  };
  return (
    <form noValidate>
      <TextField
        style={{ backgroundColor: "white", width: props.width }}
        id="date"
        type={type}
        disabled={disabled ? disabled : false}
        defaultValue={
          props.defaultValue === true ?
            (props.defaultValueDateTime !== undefined && props.defaultValueDateTime !== null) ? props.defaultValueDateTime :
              type === "time" ? TimeNow : DateNow
            : ""
        }
        //defaultValue={type === "time"?TimeNow:DateNow}
        InputLabelProps={{
          shrink: true
        }}
        onChange={e => {
          // console.log("d")
          // console.log(moment(e.target.value).isValid())

          if (type === "time") {
            if (e.target.value) {
              onHandleDateChange(e.target.value, type);
            } else {
              onHandleDateChange(null, type);
            }
          } else {
            if (moment(e.target.value).isValid() === true) {
              onHandleDateChange(moment(e.target.value), type);
            } else {
              onHandleDateChange(null, type);
            }
          }
        }}
      />
    </form>
  );
};

export default AmDate;
