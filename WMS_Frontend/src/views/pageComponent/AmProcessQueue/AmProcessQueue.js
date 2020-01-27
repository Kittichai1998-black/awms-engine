import React, { useState, useEffect, useRef } from "react";
import { withStyles } from "@material-ui/core/styles";
import {
    apicall,
    createQueryString,
    Clone
  } from "../../../components/function/CoreFunction2";
  import AmDialogs from "../../../components/AmDialogs";
import AmButton from "../../../components/AmButton";
import AmInput from "../../../components/AmInput";
import queryString from "query-string";
import Table from '../../../components/table/AmTable';
import AmDropdown from '../../../components/AmDropdown';

const ProcessQueue = (props) => {
  return <div>xxxx
  <AmDropdown
    id={field}
    placeholder={placeholder}
    fieldDataKey={fieldDataKey}
    fieldLabel={fieldLabel} 
    labelPattern=" : "
    width={200}
    ddlMinWidth={200} 
    zIndex={1000}
    valueData={valueText2[field]} 
    queryApi={dataDropDow}
    onChange={(value, dataObject, inputID, fieldDataKey) => onHandleDDLChangeFilter(value, dataObject, inputID, fieldDataKey,condition,colsField)}
    ddlType={typeDropdow}/>
  </div>
}
  
  export default ProcessQueue;