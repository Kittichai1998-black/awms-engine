import React from 'react'
import styled from 'styled-components'

import AmDatepicker from '../AmDatePicker'
import AmDropdown from '../AmDropdown'
import AmFindPopup from '../AmFindPopup'
import AmInput from '../AmInput'
import Label from '../AmLabelMultiLanguage'

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
const InputDiv = styled.div`
margin: 5px;
@media(max - width: 800px) {
    margin: 0;
}
`;
const LabelStyle = {
    "font-weight": "bold",
    width: "200px"
}

const editorListcolunm = (objField, ref, inputError, editData, onChangeEditor) => {
    if (objField) {
        return objField.map((row, i) => {
            return {
                "field": row.accessor,
                "component": (data = null, cols, key) => {
                    let rowError = inputError.length ? inputError.some(x => {
                        return x === row.accessor
                    }) : false
                    return getTypeEditor(row.type, row.Header, row.accessor, data, cols, row, row.idddl, row.queryApi, row.columsddl, row.fieldLabel,
                        row.style, row.width, row.validate, row.placeholder, row.TextInputnum, row.texts, row.key, row.data, row.defaultValue, row.disabled, i, rowError, row.required, ref, editData, onChangeEditor)

                }
            }
        })
    }
}

const getTypeEditor = (type, Header, accessor, data, cols, row, idddl, queryApi, columsddl, fieldLabel, style, width, validate,
    placeholder, TextInputnum, texts, key, datas, defaultValue, disabled, index, rowError, required, ref, editData, onChangeEditor) => {
    if (type === "input") {
        return (
            <FormInline>
                <Label style={LabelStyle}>{Header} :</Label>

                <InputDiv>
                    <AmInput style={style ? style : { width: width }}
                        required={required}
                        error={rowError}
                        // helperText={inputError.length ? "required field" : false}
                        inputRef={ref.current[index]}
                        defaultValue={editData[accessor] ? editData[accessor] : ""}
                        validate={true}
                        msgError="Error"
                        regExp={validate ? validate : ""}
                        onChange={(ele) => { onChangeEditor(cols.field, ele, required, row) }}
                    />

                </InputDiv>
            </FormInline>
        )
    } else if (type === "inputNum") {
        return (
            <FormInline>
                <Label style={LabelStyle}>{Header} :</Label>
                <InputDiv>
                    <FormInline>{TextInputnum ? (
                        <FormInline>
                            <AmInput
                                required={required}
                                error={rowError}
                                // helperText={inputError.length ? "required field" : false}
                                inputRef={ref.current[index]}
                                defaultValue={editData !== null && editData !== {} && editData["quantity"] !== undefined ? editData[accessor].replace("%", "") : ""}
                                style={width ? width : TextInputnum ? { width: "280px" } : { width: "300px" }}
                                type="number"
                                onChange={(ele) => { onChangeEditor(cols.field, ele, required, row) }} />
                            <div style={{ paddingLeft: "5px", paddingTop: "5px" }}>
                                <Label>{TextInputnum}</Label>
                            </div>
                        </FormInline>
                    ) : (
                            <AmInput
                                required={required}
                                error={rowError}
                                // helperText={inputError.length ? "required field" : false}
                                inputRef={ref.current[index]}
                                defaultValue={editData[accessor] ? editData[accessor] : defaultValue ? defaultValue : ""}
                                style={TextInputnum ? { width: "100px" } : { width: "300px" }}
                                type="number"
                                onChange={(ele) => { onChangeEditor(cols.field, ele, required, row) }} />
                        )
                    }</FormInline>
                </InputDiv>
            </FormInline>
        )
    } else if (type === "dropdown") {
        return (
            <FormInline>
                <Label style={LabelStyle}>{Header} :</Label>
                <InputDiv>
                    <AmDropdown
                        required={required}
                        error={rowError}
                        // helperText={inputError.length ? "required field" : false}
                        id={idddl}
                        DDref={ref.current[index]}
                        placeholder={placeholder ? placeholder : "Select"}
                        fieldDataKey={key}//ฟิล์ดดColumn ที่ตรงกับtable ในdb 
                        fieldLabel={fieldLabel} //ฟิล์ดที่ต้องการเเสดงผลใน optionList และ ช่อง input
                        labelPattern=" : " //สัญลักษณ์ที่ต้องการขั้นระหว่างฟิล์ด
                        width={width ? width : 300} //กำหนดความกว้างของช่อง input
                        ddlMinWidth={width ? width : 300} //กำหนดความกว้างของกล่อง dropdown
                        // valueData={valueText[idddl]} //ค่า value ที่เลือก
                        queryApi={queryApi}
                        // data={dataUnit}
                        returnDefaultValue={true}
                        defaultValue={editData[accessor] ? editData[accessor] : defaultValue ? defaultValue : ""}
                        onChange={(value, dataObject, inputID, fieldDataKey) => onChangeEditor(row.accessor, dataObject, required, row)}
                        ddlType={"search"} //รูปแบบ Dropdown 
                    />
                </InputDiv>
            </FormInline>
        )
    } else if (type === "unitConvert") {
        return (
            <FormInline>
                <Label style={LabelStyle}>{Header} :</Label>
                <InputDiv>
                    <AmDropdown
                        required={required}
                        error={rowError}
                        // helperText={inputError.length ? "required field" : false}
                        id={idddl}
                        DDref={ref.current[index]}
                        placeholder={placeholder ? placeholder : "Select"}
                        fieldDataKey={"UnitType_Code"}//ฟิล์ดดColumn ที่ตรงกับtable ในdb 
                        fieldLabel={["UnitType_Code"]} //ฟิล์ดที่ต้องการเเสดงผลใน optionList และ ช่อง input
                        labelPattern=" : " //สัญลักษณ์ที่ต้องการขั้นระหว่างฟิล์ด
                        width={width ? width : 300} //กำหนดความกว้างของช่อง input
                        ddlMinWidth={width ? width : 300} //กำหนดความกว้างของกล่อง dropdown
                        // valueData={valueText[idddl]} //ค่า value ที่เลือก
                        //data={}
                        //queryApi={UnitTypeConqury}
                        // data={dataUnit}
                        returnDefaultValue={true}
                        defaultValue={editData[accessor] ? editData[accessor] : defaultValue ? defaultValue : ""}
                        onChange={(value, dataObject, inputID, fieldDataKey) => onChangeEditor(row.accessor, dataObject, required, row)}
                        ddlType={"search"} //รูปแบบ Dropdown 
                    />
                </InputDiv>
            </FormInline>
        )
    }

    else if (type === "dropdownvalue") {
        return (
            <FormInline>
                <Label style={LabelStyle}>{Header} :</Label>
                <InputDiv>
                    <AmDropdown id="ddlTest" styleType="default"
                        placeholder="Select Test"
                        width={width ? width : '300px'}
                        zIndex={2000}
                        data={datas}
                        style={{ width: width ? width : '300px' }}
                        fieldDataKey={key}
                        disabled={disabled ? disabled : false}
                        returnDefaultValue={true}
                        defaultValue={editData[accessor] ? editData[accessor] : defaultValue ? defaultValue : ""}
                        onChange={(value, dataObject, inputID, fieldDataKey) => onChangeEditor(row.accessor, dataObject, required, row)}
                        ddlType={"normal"}
                    />
                </InputDiv>
            </FormInline>
        )
    } else if (type === "findPopUp") {
        return (
            <FormInline>
                <Label style={LabelStyle}>{Header} :</Label>
                <InputDiv>
                    <AmFindPopup
                        search={row.search}
                        required={required}
                        error={rowError}
                        // helperText={inputError.length ? "required field" : false}
                        popupref={ref.current[index]}
                        id={idddl}
                        placeholder={placeholder ? placeholder : "Select"}
                        fieldDataKey={row.fieldDataKey ? row.fieldDataKey : "ID"}  //ฟิล์ดดColumn ที่ตรงกับtable ในdb 
                        labelPattern=" : " //สัญลักษณ์ที่ต้องการขั้นระหว่างฟิล์ด
                        fieldLabel={fieldLabel} //ฟิล์ดที่ต้องการเเสดงผลใน ช่อง input
                        // valueData={valueFindPopupin[idddl]} //ค่า value ที่เลือก
                        labelTitle="Search of Code" //ข้อความแสดงในหน้าpopup
                        queryApi={queryApi} //object query string
                        defaultValue={editData[accessor] ? editData[accessor] : row.defaultValue ? row.defaultValue : ""}
                        columns={columsddl} //array column สำหรับแสดง table
                        style={{ width: width ? width : '300px' }}
                        ddlMinWidth={width ? width : 100}
                        onChange={(value, dataObject, inputID, fieldDataKey) => onChangeEditor(row.accessor, dataObject, required, row)}
                    />
                </InputDiv>
            </FormInline>
        )
    } else if (type === "unitType") {
        return (
            <FormInline>
                <Label style={LabelStyle}>{Header} :</Label>
                <InputDiv>
                    {<label>{editData !== {} && editData !== null ? editData[accessor] : ""}</label>}
                </InputDiv>
            </FormInline>
        )
    } else if (type === "dateTime") {
        return (
            <FormInline>
                <Label style={LabelStyle}>{Header} :</Label>
                <InputDiv>
                    <AmDatepicker
                        required={required}
                        error={rowError}
                        style={{ width: width ? width : '300px' }}
                        // helperText={inputError.length ? "required field" : false}
                        defaultValue={defaultValue ? defaultValue : true}
                        TypeDate={"datetime-local"}
                        onChange={(ele) => { onChangeEditor(cols.field, ele.fieldDataObject, required, row) }}
                    />
                </InputDiv>
            </FormInline>
        )
    } else if (type === "date") {
        return (
            <FormInline>
                <Label style={LabelStyle}>{Header} :</Label>
                <InputDiv>
                    <AmDatepicker
                        required={required}
                        defaultValue={defaultValue ? defaultValue : true}
                        error={rowError}
                        style={{ width: width ? width : '300px' }}
                        // helperText={inputError.length ? "required field" : false}
                        TypeDate={"date"}
                        onChange={(ele) => { onChangeEditor(cols.field, ele.fieldDataObject, required, row) }}
                    />
                </InputDiv>
            </FormInline>
        )
    } else if (type === "dateFalse") {
        return (
            <FormInline>
                <Label style={LabelStyle}>{Header} :</Label>
                <InputDiv>
                    <AmDatepicker
                        required={required}
                        defaultValue={false}
                        error={rowError}
                        style={{ width: width ? width : '300px' }}
                        // helperText={inputError.length ? "required field" : false}
                        TypeDate={"date"}
                        onChange={(ele) => { onChangeEditor(cols.field, ele.fieldDataObject, required, row) }}
                    />
                </InputDiv>
            </FormInline>
        )
    } else if (type === "text") {
        return (<FormInline>
            <Label style={LabelStyle}>{Header} :</Label>
            <label ref={ref.current[index]}>{texts || editData[accessor]}</label >
        </FormInline>
        )
    } else if (type === "itemNo") {
        return (<FormInline>
            <Label style={LabelStyle}> Item No :</Label>
            <label>{editData[accessor] ? editData[accessor] : '-'}</label>
        </FormInline>)
    }
}

export { editorListcolunm }