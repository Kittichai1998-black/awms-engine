import React, {useState, useEffect} from "React";
import styled from 'styled-components';

import AmInput from "../../../components/AmInput";
import AmDropdown from '../../../components/AmDropdown';
import AmFindPopup from '../../../components/AmFindPopup';
import AmDate from "../../../components/AmDate";

import { useTranslation } from 'react-i18next';
const { t } = useTranslation();

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

const FilterInputComponent = (config, response) => {
    const [value, setValue] = useState({});

    useEffect(() => {
        response(value);
    }, [value, response])

    return  (
        <FormInline>
          <label style={{width:"150px",paddingLeft:"20px"}}>{t(config.name)} : </label>
          <AmInput 
            id={config.field}
            placeholder={config.placeholder}
            style={{width:"200px"}}
            type= "input"
            onChangeV2={(value)=>{setValue({field:config.field, value:value})}}/>
        </FormInline>
      )
};

const FilterDropDownComponent = (config, defaultData, queryData, response) => {
    const [selection, setSelection] = useState({});
    useEffect(() => {
        response(selection);
    }, [selection, response])

    var checkType  = Array.isArray(queryData);
    if(!checkType){
        return <FormInline> <LabelH>{t(config.name)} : </LabelH> 
        <AmDropdown
          required={config.required}
          id={config.field}
          placeholder={config.placeholder}
          fieldDataKey={config.field}
          fieldLabel={config.fieldLabel}
          labelPattern=" : "
          width={270} 
          ddlMinWidth={270}
          valueData={selection[config.field]}
          queryApi={queryData}
          defaultValue={defaultData ? defaultData:""}
          onChange={(value, dataObject, inputID, fieldDataKey) => setSelection(dataObject)}
          ddlType={config.type}
        /> 
      </FormInline>
    }else{
        return <FormInline> <LabelH>{t(config.name)} : </LabelH> 
        <AmDropdown
            id={config.field}
            placeholder={config.placeholder}
            fieldDataKey={"value"} 
            width={200}
            ddlMinWidth={200}
            zIndex={1000}
            valueData={selection[config.field]}
            data={queryData}
            onChange={(value, dataObject, inputID, fieldDataKey) => setSelection(dataObject)}
            ddlType={config.type}
        /> 
        </FormInline>
    }
}

const FilterFindPopupComponent = (config, columns, queryData, response) => {
    const [selection, setSelection] = useState({});
    useEffect(() => {
        response(selection);
    }, [selection, response])

    return  <FormInline><label style={{margin:"0px", width:"150px",paddingLeft:"20px"}}>{t(config.name)} : </label><AmFindPopup
      id={config.field}
      placeholder={config.placeholder}
      fieldDataKey={config.field}
      fieldLabel={config.fieldLabel}
      labelPattern=" : "
      valueData={selection[config.field]}
      labelTitle={config.title}
      queryApi={queryData}
      columns={columns}
      width={200}
      onChange={(value, dataObject, inputID, fieldDataKey) => setSelection(dataObject)}
  /></FormInline>
}

const FilterDateTimeComponent = (config, response) => {
    const [selection, setSelection] = useState({});

    useEffect(() => {
        response(selection);
    }, [selection, response])

    return <FormInline> <label style={{margin:"0px", width:"150px",paddingLeft:"20px"}}>{t(config.name)} : </label> 
      <AmDate
        id={config.field}
        TypeDate={"date"}
        style={{width:"200px"}}
        onChange={(value)=> setSelection({field : config.field, value:value})}
        FieldID={config.field} >
      </AmDate>
    </FormInline>
}

export {FilterInputComponent, FilterDropDownComponent, FilterFindPopupComponent, FilterDateTimeComponent};