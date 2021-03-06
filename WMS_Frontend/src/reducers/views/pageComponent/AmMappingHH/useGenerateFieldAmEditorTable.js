import React, { useState, useRef, createRef, useEffect } from 'react'
import styled from 'styled-components'
import AmInput from '../../../components/AmInput'
import LabelT from '../../../components/AmLabelMultiLanguage'
import AmDropdown from '../../../components/AmDropdown'
import AmFindPopup from '../../../components/AmFindPopup'
import AmDate from '../../../components/AmDate'


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

const LabelTStyle = {
    "font-weight": "bold",
    width: "200px"
}

const InputDiv = styled.div`
margin: 5px;
@media(max - width: 800px) {
    margin: 0;
}
`;

export default (arrObj, itemSelect) => {
    const [inputError, setInputError] = useState([])
    const ref = useRef(arrObj.map(() => createRef()))
    const [editData, setEditData] = useState()

    useEffect(() => {
        if (itemSelect)
            setEditData(itemSelect)
    }, [itemSelect])

    const onChangeEditor = (field, data, required, row) => {
        // if (addData && Object.keys(editData).length === 0) {
        //     editData["ID"] = addDataID
        // }

        if (typeof data === "object" && data) {
            editData[field] = data[field] ? data[field] : data.value
        }
        else {
            editData[field] = data
        }
        // console.log(ref);

        if (row && row.related && row.related.length) {
            let indexField = row.related.reduce((obj, x) => {
                obj[x] = arrObj.findIndex(y => y.accessor === x)
                return obj
            }, {})
            for (let [key, index] of Object.entries(indexField)) {
                if (data) {
                    if (key === "packID") {
                        editData.packID_map_skuID = data.packID + "-" + data.skuID
                    }
                    editData[key] = data[key]
                } else {
                    delete editData[key]
                }

                if (index !== -1) {
                    if (data) {
                        ref.current[index].current.value = data[key]
                    } else {
                        ref.current[index].current.value = ""
                    }
                }
            }
        }

        if (row && row.removeRelated && row.removeRelated.length && editData.packID_map_skuID && (+editData.packID_map_skuID.split('-')[0] !== +editData.packID || +editData.packID_map_skuID.split('-')[1] !== +editData.skuID)) {
            row.removeRelated.forEach(x => delete editData[x])
        }

        setEditData({ ...editData })

        if (required) {
            if (!editData[field]) {
                const arrNew = [...new Set([...inputError, field])]
                setInputError(arrNew)
            } else {
                const arrNew = [...inputError]
                const index = arrNew.indexOf(field);
                if (index > -1) {
                    arrNew.splice(index, 1);
                }
                setInputError(arrNew)
            }
        }
    }

    const GenerateFieldAmEditorTable = () => {
        console.log(itemSelect);
        if (Array.isArray(arrObj)) {
            console.log(arrObj)
            return arrObj.map((row, index) => {
                return {
                    "field": row.accessor,
                    "component": (data = null, cols, key) => {
                        let rowError = inputError.length ? inputError.some(x => {
                            return x === row.accessor
                        }) : false
                        return getTypeEditor(row, index, rowError)
                    }
                }
            })
        }
    }


    const getTypeEditor = (row, index, rowError) => {
        // console.log(editData);
        // console.log(itemSelect);
        if (row.type === "input") {
            return (
                <FormInline>
                    <LabelT style={LabelTStyle}>{row.label} :</LabelT>

                    <InputDiv>
                        <AmInput style={row.style ? row.style : { width: "300px" }}
                            required={row.required}
                            error={rowError}
                            // helperText={inputError.length ? "required field" : false}
                            inputRef={ref.current[index]}
                            defaultValue={editData[row.accessor] ? editData[row.accessor] : ""}
                            validate={true}
                            msgError="Error"
                            regExp={row.validate ? row.validate : ""}
                            onChange={(ele) => { onChangeEditor(row.accessor, ele, row.required) }}
                        />

                    </InputDiv>
                </FormInline>
            )
        }
        else if (row.type === "inputNum") {
            console.log(row);
            return (
                <FormInline>
                    <LabelT style={LabelTStyle}>{row.label} :</LabelT>
                    <InputDiv>
                        <FormInline>
                            <AmInput
                                required={row.required}
                                error={rowError}
                                // helperText={inputError.length ? "required field" : false}
                                inputRef={ref.current[index]}
                                defaultValue={itemSelect && itemSelect[row.accessor[0]] ? itemSelect[row.accessor[0]] : ""}
                                style={Array.isArray(row.accessor) && row.accessor.length >= 2 ? { width: "100px" } : { width: "300px" }}
                                type="number"
                                onChange={(ele) => { onChangeEditor(row.accessor, ele, row.required) }} />
                            {Array.isArray(row.accessor) && row.accessor.length >= 2 && <label style={{ paddingLeft: "5px", paddingTop: "5px" }}>{itemSelect && itemSelect[row.accessor[1]]}</label>}
                        </FormInline>
                    </InputDiv>
                </FormInline>
            )
        }
        else if (row.type === "dropdown") {
            return (
                <FormInline>
                    <LabelT style={LabelTStyle}>{row.label} :</LabelT>
                    <InputDiv>
                        <AmDropdown
                            required={row.required}
                            error={rowError}
                            // helperText={inputError.length ? "required field" : false}
                            id={row.idddl}
                            DDref={ref.current[index]}
                            placeholder={row.placeholder ? row.placeholder : "Select"}
                            fieldDataKey="ID" //??????????????????Column ???????????????????????????table ??????db 
                            fieldLabel={row.fieldLabel} //???????????????????????????????????????????????????????????????????????? optionList ????????? ???????????? input
                            labelPattern=" : " //?????????????????????????????????????????????????????????????????????????????????????????????????????????
                            width={row.width ? row.width : 300} //??????????????????????????????????????????????????????????????? input
                            ddlMinWidth={row.width ? row.width : 300} //?????????????????????????????????????????????????????????????????? dropdown
                            // valueData={valueText[idddl]} //????????? value ????????????????????????
                            queryApi={row.queryApi}
                            // data={dataUnit}
                            // returnDefaultValue={true}
                            defaultValue={editData[row.accessor] ? editData[row.accessor] : ""}
                            onChange={(value, dataObject, inputID, fieldDataKey) => onChangeEditor(row.accessor, dataObject, row.required, row)}
                            ddlType={"search"} //?????????????????? Dropdown 
                        />
                    </InputDiv>
                </FormInline>
            )

        } else if (row.type === "unitType") {
            return (
                <FormInline>
                    <LabelT style={LabelTStyle}>{row.label} :</LabelT>
                    <InputDiv>
                        {<label>{editData !== {} && editData !== null ? editData[row.accessor] : ""}</label>}
                    </InputDiv>
                </FormInline>
            )
        } else if (row.type === "text") {
            return (<FormInline>
                <LabelT style={LabelTStyle}>{row.label} :</LabelT>
                <label ref={ref.current[index]}>{row.texts || editData && editData[row.accessor]}</label >
            </FormInline>
            )
        }
    }

    return [GenerateFieldAmEditorTable, editData]
}
