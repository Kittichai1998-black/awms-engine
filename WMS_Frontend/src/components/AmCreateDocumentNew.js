import Grid from '@material-ui/core/Grid';
import PropTypes from 'prop-types';
import React, { useState, useRef, createRef } from "react";
import styled from 'styled-components'
import { useTranslation } from 'react-i18next'

import AmButton from '../components/AmButton'
import AmDate from '../components/AmDate'
import AmDatepicker from '../components/AmDate'
import AmDialogs from '../components/AmDialogs'
import AmDropdown from '../components/AmDropdown'
import AmEditorTable from '../components/table/AmEditorTable'
import AmFindPopup from '../components/AmFindPopup'
import AmInput from '../components/AmInput'
import AmTable from '../components/table/AmTable'
import { apicall, Clone } from '../components/function/CoreFunction2'
import BtnAddList from './AmCreateDocument_BtnAddList'
import { getUnique } from './function/ObjectFunction'

const Axios = new apicall()

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

const LabelH = styled.label`
font-weight: bold;
  width: 200px;
`;

const InputDiv = styled.div`
    margin: 5px;
    @media (max-width: 800px) {
        margin: 0;
    }
`;

const cols = [
    {
        Header: 'Code',
        accessor: 'Code',
        fixed: 'left',
        width: 130,
        sortable: true,
    },
    {
        Header: 'Name',
        accessor: 'Name',
        width: 200,
        sortable: true,
    },
];

const AmCreateDocument = (props) => {
    const { t } = useTranslation();
    const [addData, setAddData] = useState(false);
    const [dialog, setDialog] = useState(false);
    const [editData, setEditData] = useState({});
    const [addDataID, setAddDataID] = useState(-1);
    const [title, setTitle] = useState("");
    const [dataSource, setDataSource] = useState([]);
    const [reload, setReload] = useState();

    const dataHeader = props.headerCreate.reduce((arr, el) => arr.concat(el), []).filter(x => x.valueTexts || x.defaultValue).reduce((arr, el) => {
        arr[el.key] = el.valueTexts || el.defaultValue
        return arr
    }, {})
    const [createDocumentData, setcreateDocumentData] = useState(dataHeader);

    // const [valueText, setValueText] = useState({});
    const [dataDDLHead, setdataDDLHead] = useState({});
    const [valueFindPopup, setvalueFindPopup] = useState({});
    const [stateDialog, setStateDialog] = useState(false);
    const [msgDialog, setMsgDialog] = useState("");
    const [stateDialogErr, setStateDialogErr] = useState(false);
    // const [dataUnit, setDataUnit] = useState()
    const [dataCheck, setDataCheck] = useState()
    const ref = useRef(props.columnEdit.map(() => createRef()))
    const rem = [
        {
            Header: "", width: 110, Cell: (e) => <AmButton style={{ width: "100px" }} styleType="info" onClick={() => {
                setEditData(Clone(e.original));
                setDialog(true);
                setTitle("Edit")
                setAddData(false);
                // let unitArr = [{ label: e.original.UnitCode, value: e.original.UnitCode }]
                // if (e.original.UnitCode !== e.original.BaseUnitCode)
                //     unitArr.push({ label: e.original.BaseUnitCode, value: e.original.BaseUnitCode })
                // setDataUnit(unitArr)
            }}>{t("Edit")
                }</AmButton>,
        },
        {
            Header: "", width: 110, Cell: (e) => <AmButton style={{ width: "100px" }} styleType="delete" onClick={
                () => {
                    onHandleDelete(e.original.ID, e.original, e);
                    //setReload({});
                }}>{t("Remove")}</AmButton>,
        }
    ];

    const columns = props.columns.concat(rem)

    const onHandleDelete = (v, o, rowdata) => {
        let idx = dataSource.findIndex(x => x.ID === v);
        dataSource.splice(idx, 1);
        setDataSource(dataSource);
        setDataCheck(dataSource);
        setReload({})
    }

    const onHandleChangeHeaderDDL = (value, dataObject, inputID, fieldDataKey, key) => {
        setdataDDLHead({
            [inputID]: {
                value: value,
                dataObject: dataObject,
                fieldDataKey: fieldDataKey,
                key: key,
            }
        });
        createDocumentData[key] = value
        setcreateDocumentData(createDocumentData)
    }

    //เช็ตค่าที่หัวของหน้าใน Findpopup
    const onHandleChangeFindpopup = (value, dataObject, inputID, fieldDataKey, pair, key) => {
        setvalueFindPopup({
            [inputID]: {
                value: value,
                dataObject: dataObject,
                fieldDataKey: fieldDataKey,
                key: key,
            }
        })
        createDocumentData[key] = value
        setcreateDocumentData(createDocumentData)
    }

    const onChangeEditor = (field, data) => {
        if (addData && Object.getOwnPropertyNames(editData).length === 0) {
            editData["ID"] = addDataID
        }
        if (typeof data === "object" && data) {
            editData[field] = data[field] ? data[field] : data.value
        } else {
            editData[field] = data
        }

        let indexPalletCode = props.columnEdit.findIndex(x => x.accessor === "palletcode"),
            indexBatch = props.columnEdit.findIndex(x => x.accessor === "batch"),
            indexQuantity = props.columnEdit.findIndex(x => x.accessor === "quantity"),
            indexOrderNo = props.columnEdit.findIndex(x => x.accessor === "orderNo"),
            indexUnitType = props.columnEdit.findIndex(x => x.accessor === "unitType"),
            indexSKUItems = props.columnEdit.findIndex(x => x.accessor === "SKUItems"),

            // indexBQuantity = props.columnEdit.findIndex(x => x.accessor === "Quantity"),
            // indexBUnit = props.columnEdit.findIndex(x => x.accessor === "BaseUnitCode"),
            indexSQuantity = props.columnEdit.findIndex(x => x.accessor === "SaleQuantity"),
            indexSUnit = props.columnEdit.findIndex(x => x.accessor === "UnitCode")


        //CaseByCase
        if (field === "palletcode") {
            if (data) {
                editData.ID = data.ID

                editData.SKUItems = data.SKUItems
                editData.skuCode = data.Code
                editData.skuName = data.Name

                editData.batch = data.Batch
                editData.quantity = data.Quantity
                editData.unitType = data.BaseUnitCode

                editData.locationcode = data.LocationCode

                editData.orderNo = data.orderNo

                editData.Quantity = data.Quantity
                editData.BaseUnitCode = data.BaseUnitCode
                editData.SaleQuantity = data.SaleQuantity
                editData.UnitCode = data.UnitCode


                // if (indexSKUItems !== -1)
                //     setTimeout(() => {
                //         ref.current[indexSKUItems].current.value = data.SKUItems
                //     }, 1);
                if (indexBatch !== -1)
                    ref.current[indexBatch].current.value = data.Batch
                if (indexQuantity !== -1)
                    ref.current[indexQuantity].current.value = data.Quantity
                if (indexOrderNo !== -1)
                    ref.current[indexOrderNo].current.value = data.orderNo
                if (indexUnitType !== -1)
                    ref.current[indexUnitType].current.textContent = data.BaseUnitCode

                // if (indexBQuantity !== -1)
                //     ref.current[indexBQuantity].current.textContent = data.Quantity
                // if (indexBUnit !== -1)
                //     ref.current[indexBUnit].current.textContent = data.BaseUnitCode
                if (indexSQuantity !== -1)
                    ref.current[indexSQuantity].current.textContent = data.SaleQuantity
                if (indexSUnit !== -1)
                    ref.current[indexSUnit].current.textContent = data.UnitCode

            } else {
                delete editData.ID
            }

            // editData.UnitCode = data.UnitCode //forcheck dropdown UnitType
            // editData.BaseUnitCode = data.BaseUnitCode
            // let unitArr = [{ label: data.UnitCode, value: data.UnitCode }]
            // if (data.UnitCode !== data.BaseUnitCode)
            //     unitArr.push({ label: data.BaseUnitCode, value: data.BaseUnitCode })
            //  setDataUnit({})

        }
        if (field === "SKUItems") {
            delete editData.palletcode
            editData["ID"] = addDataID
            if (indexPalletCode !== -1)
                setTimeout(() => {
                    ref.current[indexPalletCode].current.value = ""
                }, 1);
            if (data) {
                editData.skuCode = data.Code
                editData.unitType = data.UnitTypeCode
                editData.skuName = data.Name

                editData.Quantity = data.Quantity
                editData.BaseUnitCode = data.BaseUnitCode
                editData.SaleQuantity = data.SaleQuantity
                editData.UnitCode = data.UnitCode
                if (indexUnitType !== -1)
                    ref.current[indexUnitType].current.textContent = data.UnitTypeCode
                // if (indexBQuantity !== -1)
                //     ref.current[indexBQuantity].current.textContent = data.Quantity
                // if (indexBUnit !== -1)
                //     ref.current[indexBUnit].current.textContent = data.BaseUnitCode
                if (indexSQuantity !== -1)
                    ref.current[indexSQuantity].current.textContent = data.SaleQuantity
                if (indexSUnit !== -1)
                    ref.current[indexSUnit].current.textContent = data.UnitCode
            } else {
                delete editData.skuCode
                delete editData.unitType
                delete editData.skuName

                delete editData.Quantity
                delete editData.BaseUnitCode
                delete editData.SaleQuantity
                delete editData.UnitCode
                if (indexUnitType !== -1)
                    ref.current[indexUnitType].current.textContent = ""
                // if (indexBQuantity !== -1)
                //     ref.current[indexBQuantity].current.textContent = ""
                // if (indexBUnit !== -1)
                //     ref.current[indexBUnit].current.textContent = ""
                if (indexSQuantity !== -1)
                    ref.current[indexSQuantity].current.textContent = ""
                if (indexSUnit !== -1)
                    ref.current[indexSUnit].current.textContent = ""
            }



            // editData.UnitCode = data.UnitCode //forcheck dropdown UnitType
            // editData.BaseUnitCode = data.BaseUnitCode

            // let unitArr = [{ label: data.UnitCode, value: data.UnitCode }]
            // if (data.UnitCode !== data.BaseUnitCode)
            //     unitArr.push({ label: data.BaseUnitCode, value: data.BaseUnitCode })
            // setDataUnit(unitArr)
        }
        setReload({})
        // setEditData(editData)
    }


    const onHandleEditConfirm = (status, rowdata) => {
        if (status) {
            let chkData = dataSource.filter(x => {
                return x.ID === rowdata.ID
            })
            if (chkData.length > 0) {
                for (let row in editData) {
                    if (row === "qtyrandom") {
                        let editdatas = editData[row].replace("%", "")
                        chkData[0]["qtyrandom"] = (editdatas + "%")
                    } else if (row === "SKUItems") {
                        if (!editData[row])
                            delete chkData[0]["unitType"]
                        chkData[0][row] = editData[row]
                    } else {
                        chkData[0][row] = editData[row]
                    }
                }
            }
            else {
                if (editData.qtyrandom !== undefined) {
                    if (editData.qtyrandom > 100) {
                        setStateDialogErr(true)
                        setMsgDialog("Random > 100 ")
                    } else {
                        editData["qtyrandom"] = (editData.qtyrandom + "%")
                        dataSource.push(editData)
                    }
                } else {
                    editData["qtyrandom"] = (0 + "%")
                    dataSource.push(editData)
                }
            }
            setDataCheck(dataSource);
            setDataSource(dataSource);
        }
        setEditData({})
        setAddDataID(addDataID - 1);
        setDialog(false)
        // // setDataUnit()
        // // setUnitCodes();

    }

    const editorListcolunm = () => {
        if (props.columnEdit !== undefined) {
            return props.columnEdit.map((row, i) => {
                return {
                    "field": row.accessor,
                    "component": (data = null, cols, key) => {
                        return <div key={key}>
                            {getTypeEditor(row.type, row.Header, row.accessor, data, cols, row, row.idddl, row.queryApi, row.columsddl, row.fieldLabel, row.style, row.width, row.validate, row.placeholder, row.TextInputnum, row.texts, i)}
                        </div>
                    }
                }
            })
        }
    }

    const getTypeEditor = (type, Header, accessor, data, cols, row, idddl, queryApi, columsddl, fieldLabel, style, width, validate, placeholder, TextInputnum, texts, index) => {

        if (type === "input") {
            return (
                <FormInline>
                    <LabelH>{Header} : </LabelH>
                    <InputDiv>
                        <AmInput style={style ? style : { width: "300px" }}
                            inputRef={ref.current[index]}
                            defaultValue={editData ? editData[accessor] : ""}
                            validate={true}
                            msgError="Error"
                            regExp={validate ? validate : ""}
                            onChange={(ele) => { onChangeEditor(cols.field, ele) }}
                        />
                    </InputDiv>
                </FormInline>
            )
        } else if (type === "inputNum") {
            return (
                <FormInline>
                    <LabelH>{Header} : </LabelH>
                    <InputDiv>
                        <FormInline>{TextInputnum ? (
                            <FormInline>
                                <AmInput
                                    inputRef={ref.current[index]}
                                    defaultValue={editData !== null && editData !== {} && editData["qtyrandom"] !== undefined ? editData[accessor].replace("%", "") : ""}
                                    style={TextInputnum ? { width: "100px" } : { width: "300px" }}
                                    type="number"
                                    onChange={(ele) => { onChangeEditor(cols.field, ele) }} />
                                <div style={{ paddingLeft: "5px", paddingTop: "5px" }}>
                                    <labelH>{TextInputnum}</labelH>
                                </div>
                            </FormInline>
                        ) : (
                                <AmInput
                                    inputRef={ref.current[index]}
                                    defaultValue={editData ? editData[accessor] : ""}
                                    style={TextInputnum ? { width: "100px" } : { width: "300px" }}
                                    type="number"
                                    onChange={(ele) => { onChangeEditor(cols.field, ele) }} />
                            )
                        }</FormInline>
                    </InputDiv>
                </FormInline>
            )
        } else if (type === "dropdown") {
            return (
                <FormInline>
                    <LabelH>{Header} : </LabelH>
                    <InputDiv>
                        <AmDropdown
                            id={idddl}
                            DDref={ref.current[index]}
                            placeholder={placeholder ? placeholder : "Select"}
                            fieldDataKey="ID" //ฟิล์ดดColumn ที่ตรงกับtable ในdb 
                            fieldLabel={fieldLabel} //ฟิล์ดที่ต้องการเเสดงผลใน optionList และ ช่อง input
                            labelPattern=" : " //สัญลักษณ์ที่ต้องการขั้นระหว่างฟิล์ด
                            width={width ? width : 300} //กำหนดความกว้างของช่อง input
                            ddlMinWidth={width ? width : 300} //กำหนดความกว้างของกล่อง dropdown
                            // valueData={valueText[idddl]} //ค่า value ที่เลือก
                            queryApi={queryApi}
                            // data={dataUnit}
                            // returnDefaultValue={true}
                            defaultValue={editData ? editData[accessor] : ""}
                            onChange={(value, dataObject, inputID, fieldDataKey) => onChangeEditor(row.accessor, dataObject)}
                            ddlType={"search"} //รูปแบบ Dropdown 
                        />
                    </InputDiv>
                </FormInline>
            )
        } else if (type === "findPopUp") {
            return (
                <FormInline>
                    <LabelH>{Header} : </LabelH>
                    <InputDiv>
                        <AmFindPopup
                            popupref={ref.current[index]}
                            id={idddl}
                            placeholder={placeholder ? placeholder : "Select"}
                            // fieldDataKey="ID" //ฟิล์ดดColumn ที่ตรงกับtable ในdb 
                            labelPattern=" : " //สัญลักษณ์ที่ต้องการขั้นระหว่างฟิล์ด
                            fieldLabel={fieldLabel} //ฟิล์ดที่ต้องการเเสดงผลใน ช่อง input
                            // valueData={valueFindPopupin[idddl]} //ค่า value ที่เลือก
                            labelTitle="Search of Code" //ข้อความแสดงในหน้าpopup
                            queryApi={queryApi} //object query string
                            defaultValue={editData ? editData[accessor] : ""}
                            columns={columsddl} //array column สำหรับแสดง table
                            width={width ? width : 300}
                            ddlMinWidth={width ? width : 100}
                            onChange={(value, dataObject, inputID, fieldDataKey) => onChangeEditor(row.accessor, dataObject)}
                        />
                    </InputDiv>
                </FormInline>
            )
        } else if (type === "unitType") {
            return (
                <FormInline>
                    <LabelH>{Header} : </LabelH>
                    <InputDiv>
                        {<label>{editData !== {} && editData !== null ? editData[accessor] : ""}</label>}
                    </InputDiv>
                </FormInline>
            )
        } else if (type === "dateTime") {
            return (
                <AmDate
                    TypeDate={"datetime-local"}
                    defaultValue={true}
                    onChange={(ele) => { onChangeEditor(cols.field, ele.fieldDataObject) }}
                />
            )
        } else if (type === "text") {
            return (<FormInline>
                <LabelH>{Header}</LabelH>
                <label ref={ref.current[index]}>{texts || editData[accessor]}</label >
            </FormInline>
            )
        }
    }

    const getDataHead = (type, key, idddls, pair, queryApi, columsddl, fieldLabel, texts, style, width, validate, valueTexts, placeholder, defaultValue, obj) => {
        if (type === "date") {
            return (
                <AmDate
                    TypeDate={"date"}
                    defaultValue={true}
                    value={createDocumentData[key]}
                    onChange={(e) => {
                        if (e !== null) {
                            let docData = createDocumentData
                            docData[key] = e.fieldDataObject
                            setcreateDocumentData(docData)
                        } else { }
                    }}
                />
            )
        } else if (type === "dateTime") {
            return (
                <AmDate
                    TypeDate={"datetime-local"}
                    defaultValue={true}
                    value={createDocumentData[key]}
                    onChange={(e) => {
                        if (e !== null) {
                            let docData = createDocumentData
                            docData[key] = e.fieldDataObject
                            setcreateDocumentData(docData)
                        } else { }
                    }}
                />
            )
        } else if (type === "input") {
            return (
                <AmInput
                    validate={true}
                    msgError="Error"
                    regExp={validate ? validate : ""}
                    //value={createDocumentData[key]}              
                    //style={style ? style : { width: "300px" }}

                    onChange={(e) => {
                        if (obj.search)
                            props.addList.search.find(x => x.accessor === key).defaultValue = e

                        let docData = createDocumentData
                        docData[key] = e
                        setcreateDocumentData(docData)
                    }}
                />
            )
        } else if (type === "labeltext") {
            //getTextsValue(key, valueTexts)
            return <label>{texts}</label>
        } else if (type === "dropdown") {
            return (
                <AmDropdown
                    id={idddls}
                    placeholder={placeholder ? placeholder : "Select"}
                    fieldDataKey="ID" //ฟิล์ดดColumn ที่ตรงกับtable ในdb 
                    fieldLabel={fieldLabel} //ฟิล์ดที่ต้องการเเสดงผลใน optionList และ ช่อง input
                    labelPattern=" : " //สัญลักษณ์ที่ต้องการขั้นระหว่างฟิล์ด
                    width={width ? width : 300}
                    ddlMinWidth={width ? width : 300}//กำหนดความกว้างของกล่อง dropdown
                    valueData={dataDDLHead[idddls]} //ค่า value ที่เลือก
                    queryApi={queryApi}
                    //returnDefaultValue={true}
                    defaultValue={defaultValue ? defaultValue : ""}
                    onChange={(value, dataObject, inputID, fieldDataKey) => onHandleChangeHeaderDDL(value, dataObject, inputID, fieldDataKey, key)}
                    ddlType={"search"} //รูปแบบ Dropdown 
                />
            )
        } else if (type === "datepicker") {
            return (
                <AmDatepicker
                    value={createDocumentData[key]}
                    TypeDate={"datetime-local"}
                    onChange={(e) => {
                        let docData = createDocumentData
                        docData[key] = e
                        setcreateDocumentData(docData)
                    }}
                />
            )
        } else if (type === "findPopUp") {
            return (
                <AmFindPopup
                    id={idddls}
                    placeholder={placeholder ? placeholder : "Select"}
                    fieldDataKey="ID" //ฟิล์ดดColumn ที่ตรงกับtable ในdb 
                    labelPattern=" : " //สัญลักษณ์ที่ต้องการขั้นระหว่างฟิล์ด
                    fieldLabel={fieldLabel} //ฟิล์ดที่ต้องการเเสดงผลใน ช่อง input
                    valueData={valueFindPopup[idddls]} //ค่า value ที่เลือก
                    labelTitle="Search of Code" //ข้อความแสดงในหน้าpopup
                    queryApi={queryApi} //object query string
                    columns={cols} //array column สำหรับแสดง table
                    width={width ? width : 300}
                    ddlMinWidth={width ? width : 300}//กำหนดความกว้างของช่อง input
                    onChange={(value, dataObject, inputID, fieldDataKey) => onHandleChangeFindpopup(value, dataObject, inputID, fieldDataKey, pair, key)}
                />
            )
        }
    }

    const getHeaderCreate = () => {
        return props.headerCreate.map((x, xindex) => {
            return (
                <Grid key={xindex} container>
                    {x.map((y, yindex) => {
                        let syn = y.label ? " :" : "";
                        return (
                            <Grid item key={yindex} xs={12} sm={6} style={{ paddingLeft: "20px", paddingTop: "10px" }}>
                                <div style={{ marginTop: "5px" }}> <FormInline>
                                    <LabelH>{t(y.label) + syn}</LabelH>
                                    {getDataHead(y.type, y.key, y.idddls, y.pair, y.queryApi, y.columsddl, y.fieldLabel, y.texts, y.style, y.width, y.validate, y.valueTexts, y.placeholder, y.defaultValue, y)}
                                </FormInline></div>
                            </Grid>
                        )
                    })}
                </Grid>
            )
        })
    }

    const CreateDoc = () => {
        let dataCreate = createDocumentData;
        let dataLebel = [];
        let options
        //var options = null
        props.headerCreate.forEach(x => {
            x.forEach(y => {
                if (y.type === "labeltext" && y.valueTexts) {
                    dataLebel.push(y)
                }
            })
        });
        dataLebel.forEach((x) => {
            dataCreate[x.key] = x.valueTexts
        })
        if (props.createDocType === "audit" && props.columnsModifi === undefined) {
            dataCreate.docItems = dataSource.map((x, idx) => {
                let findPair = props.columnEdit.filter(y => y.pair)
                findPair.forEach(z => {
                    Object.keys(x).forEach(xx => {
                        if (xx === z.pair) {
                            // delete x[z.accessor]
                        }
                    })
                });

                if (x.qtyrandom)
                    var qtyrandoms = x.qtyrandom.replace("%", "")
                if (x.palletcode !== undefined && x.locationcode !== undefined && qtyrandoms !== undefined)
                    options = "palletcode=" + x.palletcode + "&locationcode=" + x.locationcode + "&qtyrandom=" + qtyrandoms
                if (x.palletcode !== undefined && x.locationcode !== undefined && qtyrandoms === undefined)
                    options = "palletcode=" + x.palletcode + "&locationcode=" + x.locationcode
                if (x.palletcode !== undefined && x.locationcode === undefined && qtyrandoms !== undefined)
                    options = "palletcode=" + x.palletcode + "&qtyrandom=" + qtyrandoms
                if (x.palletcode === undefined && x.locationcode !== undefined && qtyrandoms !== undefined)
                    options = "locationcode=" + x.locationcode + "&qtyrandom=" + qtyrandoms
                if (x.palletcode !== undefined && x.locationcode === undefined && qtyrandoms === undefined)
                    options = "palletcode=" + x.palletcode
                if (x.locationcode !== undefined && x.palletcode === undefined && qtyrandoms === undefined)
                    options = "locationcode=" + x.locationcode
                if (qtyrandoms !== undefined && x.palletcode === undefined && x.locationcode === undefined)
                    options = "qtyrandom=" + qtyrandoms
                if (x.palletcode === undefined && x.locationcode === undefined && qtyrandoms === undefined)
                    options = null
                return {
                    ...x, ID: null,
                    "skuCode": x.skuCode === undefined ? null : x.skuCode,
                    "packCode": x.packCode === undefined ? null : x.packCode,
                    "skuID": x.skuID === undefined ? null : x.skuID,
                    "quantity": x.quantity === undefined ? null : x.quantity,
                    "unitType": x.unitType === undefined ? null : x.unitType,
                    "expireDate": x.expireDate === undefined ? null : x.expireDate,
                    "productionDate": x.productionDate === undefined ? null : x.productionDate,
                    "orderNo": x.orderNo === undefined ? null : x.orderNo,
                    "batch": x.batch === undefined ? null : x.batch,
                    "lot": x.lot === undefined ? null : x.lot,
                    "ref1": x.ref1 === undefined ? null : x.ref1,
                    "ref2": x.ref2 === undefined ? null : x.ref2,
                    "refID": x.refID === undefined ? null : x.refID,
                    "options": options,
                    "palletcode": x.palletcode === undefined ? null : x.palletcode,
                    "locationcode": x.locationcode === undefined ? null : x.locationcode,
                    "qtyrandom": x.qtyrandom === undefined ? null : x.qtyrandom,
                    "x": x
                }
            });
            let docItem = dataCreate.docItems;
            let CreateData = {
                "forCustomerID": dataCreate.forCustomerID === undefined ? null : dataCreate.forCustomerID,
                "batch": dataCreate.batch === undefined ? null : dataCreate.batch,
                "lot": dataCreate.lot === undefined ? null : dataCreate.lot,
                "orderno": dataCreate.orderno === undefined ? null : dataCreate.orderno.trim(),
                "souBranchID": dataCreate.souBranchID === undefined ? null : dataCreate.souBranchID,
                "desBranchID": dataCreate.desBranchID === undefined ? null : dataCreate.desBranchID,
                "souWarehouseID": dataCreate.souWarehouseID === undefined ? null : dataCreate.souWarehouseID,
                "desWarehouseID": dataCreate.desWarehouseID === undefined ? null : dataCreate.desWarehouseID,
                "souAreaMasterID": dataCreate.souAreaMasterID === undefined ? null : dataCreate.souAreaMasterID,
                "desCustomerID": dataCreate.desCustomerID === undefined ? null : dataCreate.desCustomerID,
                "desSupplierID": dataCreate.desSupplierID === undefined ? null : dataCreate.desSupplierID,
                "refID": dataCreate.refID === undefined ? null : dataCreate.refID,
                "ref1": dataCreate.ref1 === undefined ? null : dataCreate.ref1,
                "ref2": dataCreate.ref2 === undefined ? null : dataCreate.ref2,
                "actionTime": dataCreate.actionTime === undefined ? null : dataCreate.actionTime,
                "documentDate": dataCreate.documentDate === undefined ? null : dataCreate.documentDate,
                "remark": dataCreate.remark === undefined ? null : dataCreate.remark,
                "movementTypeID": dataCreate.movementTypeID === undefined ? null : dataCreate.movementTypeID,
                "docItems": dataCreate.docItems === undefined ? null : dataCreate.docItems
            }
            CreateDocuments(CreateData, docItem);
        } else if (props.createDocType === "issue" && props.columnsModifi === undefined) {

            dataCreate.issueItems = dataSource.map((x, idx) => {
                let findPair = props.columnEdit.filter(y => y.pair)
                findPair.forEach(z => {
                    Object.keys(x).forEach(xx => {
                        if (xx === z.pair) {
                            //delete x[z.accessor]
                        }
                    })
                });
                if (x.qtyrandom)
                    var qtyrandoms = x.qtyrandom.replace("%", "")
                if (x.palletcode !== undefined && x.locationcode !== undefined && qtyrandoms !== undefined)
                    options = "palletcode=" + x.palletcode + "&locationcode=" + x.locationcode + "&qtyrandom=" + qtyrandoms
                if (x.palletcode !== undefined && x.locationcode !== undefined && qtyrandoms === undefined)
                    options = "palletcode=" + x.palletcode + "&locationcode=" + x.locationcode
                if (x.palletcode !== undefined && x.locationcode === undefined && qtyrandoms !== undefined)
                    options = "palletcode=" + x.palletcode + "&qtyrandom=" + qtyrandoms
                if (x.palletcode === undefined && x.locationcode !== undefined && qtyrandoms !== undefined)
                    options = "locationcode=" + x.locationcode + "&qtyrandom=" + qtyrandoms
                if (x.palletcode !== undefined && x.locationcode === undefined && qtyrandoms === undefined)
                    options = "palletcode=" + x.palletcode
                if (x.locationcode !== undefined && x.palletcode === undefined && qtyrandoms === undefined)
                    options = "locationcode=" + x.locationcode
                if (qtyrandoms !== undefined && x.palletcode === undefined && x.locationcode === undefined)
                    options = "qtyrandom=" + qtyrandoms
                if (x.palletcode === undefined && x.locationcode === undefined && qtyrandoms === undefined)
                    options = null
                return {
                    ...x, ID: null,
                    "SKUIDs": x.SKUIDs === undefined ? null : x.SKUIDs,
                    "SKUItems": x.SKUItems === undefined ? null : x.SKUItems,
                    "batch": x.batch === undefined ? null : x.batch,
                    "expireDate": x.expireDate === undefined ? null : x.expireDate,
                    "lot": x.lot === undefined ? null : x.lot,
                    "options": options,
                    "orderNo": x.orderNo === undefined ? null : x.orderNo,
                    "packCode": x.packCode === undefined ? null : x.packCode,
                    "packItemQty": x.packItemQty === undefined ? null : x.packItemQty,
                    "productionDate": x.productionDate === undefined ? null : x.productionDate,
                    "quantity": x.quantity === undefined ? null : x.quantity,
                    "ref1": x.ref1 === undefined ? null : x.ref1,
                    "ref2": x.ref2 === undefined ? null : x.ref2,
                    "refID": x.refID === undefined ? null : x.refID,
                    "skuCode": x.skuCode === undefined ? null : x.skuCode,
                    "skuID": x.skuID === undefined ? null : x.skuID,
                    "unitType": x.unitType === undefined ? null : x.unitType
                }
            });
            // dataCreate.issueItems = mbodd3t_gorDnaja;
            let docItem = dataCreate.issueItems;
            let CreateData = {
                "forCustomerID": dataCreate.forCustomerID === undefined ? null : dataCreate.forCustomerID,
                "batch": dataCreate.batch === undefined ? null : dataCreate.batch,
                "lot": dataCreate.lot === undefined ? null : dataCreate.lot,
                "orderno": dataCreate.orderno === undefined ? null : dataCreate.orderno.trim(),
                "souBranchID": dataCreate.souBranchID === undefined ? null : dataCreate.souBranchID,
                "desBranchID": dataCreate.desBranchID === undefined ? null : dataCreate.desBranchID,
                "souWarehouseID": dataCreate.souWarehouseID === undefined ? null : dataCreate.souWarehouseID,
                "desWarehouseID": dataCreate.desWarehouseID === undefined ? null : dataCreate.desWarehouseID,
                "souAreaMasterID": dataCreate.souAreaMasterID === undefined ? null : dataCreate.souAreaMasterID,
                "desCustomerID": dataCreate.desCustomerID === undefined ? null : dataCreate.desCustomerID,
                "desSupplierID": dataCreate.desSupplierID === undefined ? null : dataCreate.desSupplierID,
                "refID": dataCreate.refID === undefined ? null : dataCreate.refID,
                "ref1": dataCreate.ref1 === undefined ? null : dataCreate.ref1,
                "ref2": dataCreate.ref2 === undefined ? null : dataCreate.ref2,
                "actionTime": dataCreate.actionTime === undefined ? null : dataCreate.actionTime,
                "documentDate": dataCreate.documentDate === undefined ? null : dataCreate.documentDate,
                "remark": dataCreate.remark === undefined ? null : dataCreate.remark,
                "movementTypeID": dataCreate.movementTypeID === undefined ? null : dataCreate.movementTypeID,
                "issueItems": dataCreate.issueItems === undefined ? null : dataCreate.issueItems,
            }

            CreateDocuments(CreateData, docItem);

        } else if (props.createDocType === "issue" && props.columnsModifi !== undefined) {

            let CreateData = {
                "forCustomerID": dataCreate.forCustomerID === undefined ? null : dataCreate.forCustomerID,
                "batch": dataCreate.batch === undefined ? null : dataCreate.batch,
                "lot": dataCreate.lot === undefined ? null : dataCreate.lot,
                "orderno": dataCreate.orderno === undefined ? null : dataCreate.orderno.trim(),
                "souBranchID": dataCreate.souBranchID === undefined ? null : dataCreate.souBranchID,
                "desBranchID": dataCreate.desBranchID === undefined ? null : dataCreate.desBranchID,
                "souWarehouseID": dataCreate.souWarehouseID === undefined ? null : dataCreate.souWarehouseID,
                "desWarehouseID": dataCreate.desWarehouseID === undefined ? null : dataCreate.desWarehouseID,
                "souAreaMasterID": dataCreate.souAreaMasterID === undefined ? null : dataCreate.souAreaMasterID,
                "desCustomerID": dataCreate.desCustomerID === undefined ? null : dataCreate.desCustomerID,
                "desSupplierID": dataCreate.desSupplierID === undefined ? null : dataCreate.desSupplierID,
                "refID": dataCreate.refID === undefined ? null : dataCreate.refID,
                "ref1": dataCreate.ref1 === undefined ? null : dataCreate.ref1,
                "ref2": dataCreate.ref2 === undefined ? null : dataCreate.ref2,
                "actionTime": dataCreate.actionTime === undefined ? null : dataCreate.actionTime,
                "documentDate": dataCreate.documentDate === undefined ? null : dataCreate.documentDate,
                "remark": dataCreate.remark === undefined ? null : dataCreate.remark,
                "movementTypeID": dataCreate.movementTypeID === undefined ? props.movementTypeID : dataCreate.movementTypeID,
                "issueItems": props.dataCreate["itemIssue"],
            }

            let docItem = props.dataCreate["itemIssue"];
            CreateDocuments(CreateData, docItem);


        } else if (props.createDocType === "receive" && props.columnsModifi === undefined) {
            dataCreate.receiveItems = dataSource.map((x, idx) => {
                let findPair = props.columnEdit.filter(y => y.pair)
                findPair.forEach(z => {
                    Object.keys(x).forEach(xx => {
                        if (xx === z.pair) {
                            //delete x[z.accessor]
                        }
                    })
                });
                if (x.qtyrandom)
                    var qtyrandoms = x.perpallet
                if (x.palletcode !== undefined && x.locationcode !== undefined && qtyrandoms !== undefined)
                    options = "palletcode=" + x.palletcode + "&locationcode=" + x.locationcode + "&perpallet=" + qtyrandoms
                if (x.palletcode !== undefined && x.locationcode !== undefined && qtyrandoms === undefined)
                    options = "palletcode=" + x.palletcode + "&locationcode=" + x.locationcode
                if (x.palletcode !== undefined && x.locationcode === undefined && qtyrandoms !== undefined)
                    options = "palletcode=" + x.palletcode + "&perpallet=" + qtyrandoms
                if (x.palletcode === undefined && x.locationcode !== undefined && qtyrandoms !== undefined)
                    options = "locationcode=" + x.locationcode + "&perpallet=" + qtyrandoms
                if (x.palletcode !== undefined && x.locationcode === undefined && qtyrandoms === undefined)
                    options = "palletcode=" + x.palletcode
                if (x.locationcode !== undefined && x.palletcode === undefined && qtyrandoms === undefined)
                    options = "locationcode=" + x.locationcode
                if (qtyrandoms !== undefined && x.palletcode === undefined && x.locationcode === undefined)
                    options = "perpallet=" + qtyrandoms
                if (x.palletcode === undefined && x.locationcode === undefined && qtyrandoms === undefined)
                    options = null
                return {
                    ...x, ID: null,
                    "SKUIDs": x.SKUIDs === undefined ? null : x.SKUIDs,
                    "skuCode": x.skuCode === undefined ? null : x.skuCode,
                    "packCode": x.packCode === undefined ? null : x.packCode,
                    "skuID": x.skuID === undefined ? null : x.skuID,
                    "packItemQty": x.quantity === undefined ? null : x.quantity,
                    "unitType": x.unitType === undefined ? null : x.unitType,
                    "expireDate": x.expireDate === undefined ? null : x.expireDate,
                    "productionDate": x.productionDate === undefined ? null : x.productionDate,
                    "orderNo": x.orderNo === undefined ? null : x.orderNo,
                    "batch": x.batch === undefined ? null : x.batch,
                    "lot": x.lot === undefined ? null : x.lot,
                    "ref1": x.ref1 === undefined ? null : x.ref1,
                    "ref2": x.ref2 === undefined ? null : x.ref2,
                    "refID": x.refID === undefined ? null : x.refID,
                    "options": options,
                    "x": x


                }
            });
            // dataCreate.receiveItems = mbodd3t_gorDnaja;
            let docItem = dataCreate.receiveItems;
            let CreateData = {
                "actionTime": dataCreate.actionTime === undefined ? null : dataCreate.actionTime,
                "forCustomerID": dataCreate.forCustomerID === undefined ? null : dataCreate.forCustomerID,
                "forCustomerCode": dataCreate.forCustomerCode === undefined ? null : dataCreate.forCustomerCode,
                "batch": dataCreate.batch === undefined ? null : dataCreate.batch,
                "lot": dataCreate.lot === undefined ? null : dataCreate.lot,
                "orderno": dataCreate.orderno === undefined ? null : dataCreate.orderno.trim(),
                "souSupplierID": dataCreate.souSupplierID === undefined ? null : dataCreate.souSupplierID,
                "souCustomerID": dataCreate.souCustomerID === undefined ? null : dataCreate.souCustomerID,
                "souBranchID": dataCreate.souBranchID === undefined ? null : dataCreate.souBranchID,
                "souAreaMasterID": dataCreate.souAreaMasterID === undefined ? null : dataCreate.souAreaMasterID,
                "souSupplierCode": dataCreate.souSupplierCode === undefined ? null : dataCreate.souSupplierCode,
                "souCustomerCode": dataCreate.souCustomerCode === undefined ? null : dataCreate.souCustomerCode,
                "souBranchCode": dataCreate.souBranchCode === undefined ? null : dataCreate.souBranchCode,
                "souWarehouseID": dataCreate.souWarehouseID === undefined ? 1 : dataCreate.souWarehouseID,
                "souAreaMasterCode": dataCreate.souAreaMasterCode === undefined ? null : dataCreate.souAreaMasterCode,
                "desBranchID": dataCreate.desBranchID === undefined ? null : dataCreate.desBranchID,
                "desWarehouseID": dataCreate.desWarehouseID === undefined ? null : dataCreate.desWarehouseID,
                "desAreaMasterID": dataCreate.desAreaMasterID === undefined ? null : dataCreate.desAreaMasterID,
                "desBranchCode": dataCreate.desBranchCode === undefined ? null : dataCreate.desBranchCode,
                "desCustomerID": dataCreate.desCustomerID === undefined ? null : dataCreate.desCustomerID,
                "desSupplierID": dataCreate.desSupplierID === undefined ? null : dataCreate.desSupplierID,
                "desWarehouseCode": dataCreate.issueItems === undefined ? null : dataCreate.issueItems,
                "desAreaMasterCode": dataCreate.desAreaMasterCode === undefined ? null : dataCreate.desAreaMasterCode,
                "documentDate": dataCreate.documentDate === undefined ? null : dataCreate.documentDate,
                "movementTypeID": dataCreate.movementTypeID === undefined ? null : dataCreate.movementTypeID,
                "refID": dataCreate.refID === undefined ? null : dataCreate.refID,
                "ref1": dataCreate.ref1 === undefined ? null : dataCreate.ref1,
                "ref2": dataCreate.ref2 === undefined ? null : dataCreate.ref2,
                "remark": dataCreate.remark === undefined ? null : dataCreate.remark,
                "receiveItems": dataCreate.receiveItems === undefined ? null : dataCreate.receiveItems,
                options: props.optionDoneDesEstatus ? props.optionDoneDesEstatus : null
            }
            CreateDocuments(CreateData, docItem);
        }
        //else if (props.columnsModifi !== undefined) {
        //    let docItem = props.dataCreate["itemIssue"];

        //    CreateDocuments(dataCreate, docItem);
        //} else {
        //    dataCreate.docItems = props.dataSource;
        //    let docItem = dataCreate.docItems;
        //    CreateDocuments(dataCreate, docItem);
        //}
    }

    const CreateDocuments = (CreateData, docItem) => {
        var skus = null
        if (docItem !== undefined) {
            docItem.map((x) => {
                return skus = x.SKUItems
            })
            if (skus === null) {
                setMsgDialog("SKU Item invalid");
                setStateDialogErr(true);
            } else {
                if (docItem.length > 0) {
                    Axios.post(window.apipath + props.apicreate, CreateData).then((res) => {
                        if (res.data._result.status === 1) {
                            setMsgDialog(" Create Document success Document ID = " + res.data.ID);
                            // setTypeDialog("success");
                            setStateDialog(true);
                            if (props.apiRes !== undefined)
                                props.history.push(props.apiRes + res.data.ID)
                        } else {

                            setMsgDialog(res.data._result.message);
                            setStateDialogErr(true);
                        }
                    })
                } else {
                    setMsgDialog("Data DocumentItem Invalid");
                    setStateDialogErr(true);
                }
            }
        } else {
            setMsgDialog("SKU Item invalid");
            setStateDialogErr(true);
        }
    }

    const setFormatData = (data) => {
        dataSource.length = 0
        getUnique(data, "ID").forEach(x => {
            // let chkData = dataSource.filter(z => z.ID === x.ID)
            // if (chkData.length === 0) {

            let y = {
                ID: x.ID,
                palletcode: x.palletcode,
                SKUItems: x.SKUItems,
                batch: x.Batch || x.batch,
                quantity: x.Quantity || x.quantity,
                unitType: x.BaseUnitCode || x.unitType,
                skuCode: x.Code || x.skuCode,
                skuName: x.Name || x.skuName,
                orderNo: x.orderNo,
                UnitCode: x.UnitCode,
                BaseUnitCode: x.BaseUnitCode,
                locationcode: x.LocationCode || x.locationcode,
                Quantity: x.Quantity,
                SaleQuantity: x.SaleQuantity
            };
            // ['Batch', 'Quantity', 'UnitCode'].forEach(e => delete y[e]);
            if (props.createDocType === "audit")
                y.qtyrandom = "100%"
            dataSource.push(y)
            // }
        })
        return dataSource
    }

    return (
        <div>
            {/* Dialog */}
            <AmDialogs typePopup={"success"} content={msgDialog} onAccept={(e) => { setStateDialog(e) }} open={stateDialog}></AmDialogs >
            <AmDialogs typePopup={"error"} content={msgDialog} onAccept={(e) => { setStateDialogErr(e) }} open={stateDialogErr}></AmDialogs >

            {/* Modal when ADD or EDIT */}
            <AmEditorTable
                style={{ width: "600px", height: "500px" }}
                titleText={title}
                open={dialog}
                onAccept={(status, rowdata) => onHandleEditConfirm(status, rowdata)}
                data={editData}
                columns={editorListcolunm()}
            />

            {/* Header */}
            {getHeaderCreate()}

            {/* Btn ADD */}
            <Grid container>
                <Grid item xs container direction="column">
                </Grid>
                <Grid item>
                    <div style={{ marginTop: "20px" }}>
                        {props.addList ? <BtnAddList
                            headerCreate={props.headerCreate}
                            queryApi={props.addList.queryApi}
                            columns={props.addList.columns}
                            search={props.addList.search}
                            textBtn={t("Add List")}
                            onSubmit={(data) => { setDataSource(setFormatData(data)); setDataCheck(data); }}
                            dataCheck={dataCheck}
                        /> : null}

                        {props.add === false ? null : <AmButton className="float-right" styleType="add" style={{ width: "150px" }} onClick={() => { setDialog(true); setAddData(true); setTitle("Add"); }} >
                            {t('Add')}
                        </AmButton>}

                    </div>
                </Grid>
            </Grid>

            {/* Table */}
            <AmTable
                data={props.dataSource ? props.dataSource : dataSource ? dataSource : []}
                reload={props.reload ? props.reload : reload}
                columns={props.columnsModifi ? props.columnsModifi : columns}
                sortable={false}
                pageSize={200}
            />

            {/* Btn CREATE */}
            <Grid container>
                <Grid item xs container direction="column">
                </Grid>
                <Grid item>
                    <div style={{ marginTop: "10px" }}>
                        <AmButton className="float-right" styleType="confirm" style={{ width: "150px" }} onClick={() => { CreateDoc() }}>
                            {t('Create')}
                        </AmButton>
                    </div>
                </Grid>
            </Grid>
        </div>
    )
}
AmCreateDocument.propTypes = {
    addList: PropTypes.object,
    headerCreate: PropTypes.isRequired,
    columns: PropTypes.isRequired,
    columnEdit: PropTypes.isRequired,
    apicreate: PropTypes.isRequired,
    apiRes: PropTypes.isRequired,
    history: PropTypes.isRequired,
    createDocType: PropTypes.isRequired,
};

export default AmCreateDocument;