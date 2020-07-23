import React, {useState, useEffect} from "react";
import styled from 'styled-components';

import AmInput from "../../../components/AmInput";
import AmDropdown from '../../../components/AmDropdown';
import AmFindPopup from '../../../components/AmFindPopup';
import AmDate from "../../../components/AmDate";
import { IsEmptyObject } from "../../../components/function/CoreFunction2";

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
    width: 200px;
`;

const InputComponent = ({config, defaultData, response}) => {
    const [value, setValue] = useState({});

    return  (
        <FormInline>
          <label style={{width:"150px",paddingLeft:"20px"}}>{config.name} : </label>
          <AmInput 
            id={config.field}
            placeholder={config.placeholder}
            style={{width:"200px"}}
            type= "input"
            required={config.required}
            value={!IsEmptyObject(value) ? value.value : defaultData !== undefined ? defaultData : ""}
            onChangeV2={(value)=>{setValue({field:config.field, value:value}); response({field:config.field, value:value})}}/>
        </FormInline>
      )
};

const DropDownComponent = ({config, response, defaultData, queryData}) => {
    const [selection, setSelection] = useState({});
    var checkType  = Array.isArray(queryData);
    if(!checkType){
        return <FormInline> <label style={{width:"150px",paddingLeft:"20px"}}>{config.name} : </label>
        <AmDropdown
          required={config.required}
          id={config.field}
          placeholder={config.placeholder}
          fieldDataKey={config.fieldValue === undefined ? "ID" : config.fieldValue}
          fieldLabel={config.fieldLabel === undefined ? ["label"] : config.fieldLabel}
          labelPattern=" : "
          width={270} 
          ddlMinWidth={270}
          zIndex={99999999}
          value={selection !== undefined && selection !== null ? selection[config.field] : ""}
          queryApi={queryData}
          defaultValue={defaultData}
          onChange={(value, dataObject, inputID, fieldDataKey) => {setSelection(dataObject); response(dataObject, value)}}
          ddlType={"search"}
        /> 
      </FormInline>
    }else{
        return <FormInline> <label style={{width:"150px",paddingLeft:"20px"}}>{config.name} : </label>
        <AmDropdown
            id={config.field}
            required={config.required}
            placeholder={config.placeholder}
            fieldDataKey={config.fieldValue === undefined ? "value" : config.fieldValue}
            fieldLabel={config.fieldLabel === undefined ? ["label"] : config.fieldLabel}
            width={200}
            ddlMinWidth={200}
            zIndex={99999999}
            value={selection !== undefined && selection !== null ? selection[config.field] : ""}
            data={queryData}
            defaultValue={defaultData}
            onChange={(value, dataObject, inputID, fieldDataKey) => {setSelection(dataObject); response(dataObject, value)}}
            ddlType={"normal"}
        /> 
        </FormInline>
    }
}

const FindPopupComponent = ({config, response, columns, queryData, defaultData}) => {
    const [selection, setSelection] = useState({});
    return  <FormInline><label style={{margin:"0px", width:"150px",paddingLeft:"20px"}}>{config.name} : </label><AmFindPopup
      id={config.field}
      required={config.required}
      placeholder={config.placeholder}
      fieldDataKey={config.fieldValue}
      fieldLabel={config.fieldLabel}
      labelPattern=" : "
      value={selection !== undefined && selection !== null ? selection[config.field] : ""}
      labelTitle={config.title}
      queryApi={queryData}
      columns={columns}
      defaultValue={defaultData !== undefined ? defaultData.toString() : ""}
      width={300}
      onChange={(value, dataObject, inputID, fieldDataKey) => {setSelection(dataObject); response(dataObject, value)}}
  /></FormInline>
}

const DateTimeComponent = ({config, response}) => {
    return <FormInline> <label style={{margin:"0px", width:"150px",paddingLeft:"20px"}}>{config.name} : </label> 
      <AmDate
        id={config.field}
        TypeDate={"date"}
        style={{width:"200px"}}
        onChange={(value)=> response({field : config.field, value:value})}
        FieldID={config.field} >
      </AmDate>
    </FormInline>
}

export {InputComponent, DropDownComponent, FindPopupComponent, DateTimeComponent}