// import { common } from "@material-ui/core/colors";
import Grid from '@material-ui/core/Grid';
import React, { useState, useEffect } from "react";
import styled from 'styled-components'
import AmButton from '../components/AmButton'
import AmDate from '../components/AmDate'
import AmDatepicker from '../components/AmDate'
import AmDialogs from '../components/AmDialogs'
import AmDropdown from '../components/AmDropdown'
import AmEditorTable from '../components/table/AmEditorTable'
import AmFindPopup from '../components/AmFindPopup'
import AmDialogConfirm from '../components/AmDialogConfirm'
import AmInput from '../components/AmInput'
import AmTable from '../components/table/AmTable'
import { useTranslation } from 'react-i18next'
import { apicall } from '../components/function/CoreFunction2'
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
    // const [editDatas, setEditDatas] = useState(false);
    const [dialog, setDialog] = useState(false);
    const [editData, setEditData] = useState(false);
    const [addDataID, setAddDataID] = useState(-1);
    const [title, setTitle] = useState("");
    const [dataSource, setDataSource] = useState([]);
    const [reload, setRelaod] = useState();
    const [headerCreate, setheaderCreate] = useState(props.headerCreate)
    const [createDocumentData, setcreateDocumentData] = useState({});
    const [valueText, setValueText] = useState({});
    const [dataDDLHead, setdataDDLHead] = useState({});
    const [valueFindPopup, setvalueFindPopup] = useState({});
    const [apicreate, setapicreate] = useState(props.apicreate)
    const [stateDialog, setStateDialog] = useState(false);
    const [msgDialog, setMsgDialog] = useState("");
    const [stateDialogErr, setStateDialogErr] = useState(false);
    const [btnProps, setbtnProps] = useState(props.btnProps);
    const [skuIDs, setskuIDs] = useState();
    const [cusIDs, setcusIDs] = useState();
    const [skuByCus, setskuByCus] = useState();
    const [palletByCus, setpalletByCus] = useState();
    const [openDialogClear, setopenDialogClear] = useState(false)
    const [bodyDailogClear, setbodyDailogClear] = useState();
    const [ParentStorageObjects, setParentStorageObjects] = useState();
    const [columns, setColumns] = useState(() => {
        var rem = [
            { Header: "", width: 110, Cell: (e) => <AmButton style={{ width: "100px" }} styleType="info" onClick={() => { setEditData(e); setDialog(true); setTitle("Edit") }}>{t("Edit")}</AmButton>, },
            {
                Header: "", width: 110, Cell: (e) => <AmButton style={{ width: "100px" }} styleType="delete" onClick={
                    () => {
                        onHandleDelete(e.original.ID, e.original, e);
                        //setRelaod({});
                    }}>{t("Remove")}</AmButton>,
            }];

        if (props.columns !== undefined) {
            return props.columns.concat(rem)
        }
    })

    useEffect(() => {
        if (props.slectBase === true) {
            setParentStorageObjects({
                queryString: window.apipath + "/v2/SelectDataViwAPI/",
                t: "ParentStorageObject",
                q: "[{ 'f': 'SKUMaster_ID', c: '=', 'v': " + skuIDs + " }]",
                f: "SKUMaster_ID,SKUMaster_Code,SKUMaster_Name,ParentStorageObject_ID,ParentStorageObject_Code as baseCode",
                g: "",
                s: "[{'f':'SKUMaster_ID','od':'asc'}]",
                sk: 0,
                l: 100,
                all: "",
            })
        }
    }, [skuIDs])

    useEffect(() => {
        if (props.createByCus === true && cusIDs !== null) {
            setskuByCus({
                queryString: window.apipath + "/v2/SelectDataViwAPI/",
                t: "SKUMaster",
                q: "[{ 'f': 'Customer_ID', c: '=', 'v': " + cusIDs + " }]",
                f: "ID,Code,Name,UnitTypeCode,concat(Code, ':' ,Name) as SKUItem, ID as SKUID,concat(Code, ':' ,Name) as SKUItems, ID as SKUIDs,Code as skuCode",
                g: "",
                s: "[{'f':'ID','od':'asc'}]",
                sk: 0,
                l: 100,
                all: "",
            })
            console.log(dataSource)
            if (dataSource[0] !== undefined) {

                CleareDataByCus();
            }
        }
    }, [cusIDs])

    const CleareDataByCus = () => {
        setopenDialogClear(true)
        setbodyDailogClear(<div style={{ width: "500px", height: "100px" }}>
            <LabelH>{t("Change  DesCustomer")}</LabelH>
            <FormInline><label>Confirm Clare SKUItem</label></FormInline>
        </div>)
    }

    const OnConfirmClear = () => {
        setDataSource([])
        setopenDialogClear(false)
    }


    const onHandleDelete = (v, o, rowdata) => {
        let idx = dataSource.findIndex(x => x.ID === v);
        dataSource.splice(idx, 1);
        setDataSource(dataSource);
        setRelaod({})
        //setDeleteFlag(true)
    }

    const onHandleChangeHeaderDDL = (value, dataObject, inputID, fieldDataKey, key) => {
        if (key === "desCustomerID" && props.createByCus === true) {
            console.log(dataObject.ID, "CusID")
            setcusIDs(dataObject.ID)
            createDocumentData[key] = value
            setcreateDocumentData(createDocumentData)
        } else {
            createDocumentData[key] = value
            setcreateDocumentData(createDocumentData)
        }
    }

    const onHandleDDLChange = (value, dataObject, inputID, fieldDataKey, field, data, pair) => {
        setValueText({
            ...valueText, [inputID]: {
                value: value,
                dataObject: dataObject,
                fieldDataKey: fieldDataKey,
            }
        });
        if (value !== null) {
            if (dataObject[field] !== null) {
                onChangeEditor(field, data, dataObject[field], pair, dataObject[pair], dataObject.UnitTypeCode, dataObject.Code)
            }
        }
    };

    const onHandleDDLChangeBase = (value, dataObject, inputID, fieldDataKey, field, data, pair) => {
        console.log(dataObject)
        console.log(value)
        if (value !== null) {
            if (dataObject[field] !== null) {
                onChangeEditor(field, data, dataObject[field], pair, dataObject[pair], dataObject.UnitTypeCode, dataObject.Code)
            }
        }
    };
    //เช็ตค่าที่หัวของหน้าใน Findpopup
    const onHandleChangeFindpopup = (value, dataObject, inputID, fieldDataKey, pair, key) => {
        setvalueFindPopup({
            ...valueText, [inputID]: {
                value: value,
                dataObject: dataObject,
                fieldDataKey: fieldDataKey,
                key: key,
            }
        })
        createDocumentData[key] = value
        setcreateDocumentData(createDocumentData)
    }

    const onHandleChangeinPop = (value, dataObject, inputID, fieldDataKey, field, data, pair) => {
        console.log(dataObject)
        if (dataObject) {
            onChangeEditor(field, data, dataObject[field], pair, dataObject[pair], dataObject.UnitTypeCode, dataObject.Code)
        } else {
            onChangeEditor(field, data, null, pair, null, null, null)
        }
    }

    const onHandleChangeinPopSKU = (value, dataObject, inputID, fieldDataKey, field, data, pair) => {
        if (dataObject) {
            console.log(field)
            setskuIDs(dataObject.ID)
            onChangeEditor(field, data, dataObject[field], pair, dataObject[pair], dataObject.UnitTypeCode, dataObject.Code)
        } else {
            setskuIDs(dataObject.ID)
            console.log(field)
            onChangeEditor(field, data, null, pair, null, null, null)
        }
    }

    const onChangeEditor = (field, rowdata, value, pair, dataPair, UnitCode, SKUCode) => {
        console.log(field)
        if (addData) {
            if (editData) {
                editData[field] = value;
                if (field === "SKUItems") {
                    UnitCode ? editData["unitType"] = UnitCode : delete editData["unitType"]
                }
                if (pair) {
                    editData[pair] = dataPair;
                }
                //setEditRow(cloneEditRow)
                setEditData(editData);
                // setUnitCodes(UnitCode);
            } else {
                let addData = {};
                addData["ID"] = addDataID;
                addData[field] = value;
                if (field === "SKUItems") {
                    UnitCode ? addData["unitType"] = UnitCode : delete addData["unitType"]
                }
                if (pair) {
                    addData[pair] = dataPair;
                }
                //cloneEditRow.unshift(addData)
                //setEditRow(cloneEditRow);
                setEditData(addData);
                // setUnitCodes(UnitCode);
            }
        } else { // EDIT
            let editRowX = editData.original ? { ...editData.original } : { ...editData };
            if (editData.original !== undefined && field === "qtyrandom") {
                let qtyrandoms = (editData.original.qtyrandom).replace("%", "")
                let qtyransOriginal = parseInt(qtyrandoms, 10);
                let values = value.replace("%", "")
                let qtyransValue = parseInt(values, 10);
                if (qtyransValue > 100) {
                    let sumran = qtyransOriginal + qtyransValue
                    if (sumran > 100) {
                        setStateDialogErr(true)
                        setMsgDialog("Random > 100 ")


                    }
                } else {
                    console.log(value)
                    editRowX["qtyrandom"] = value

                }
            } else {
                if (field === "qtyrandom" && value > 100) {
                    setStateDialogErr(true)
                    setMsgDialog("Random > 100 ")
                } else {
                    editRowX[field] = value;
                }
            }
            if (field === "SKUItems") {
                UnitCode ? editRowX["unitType"] = UnitCode : delete editRowX["unitType"]
            }
            if (pair) {
                editRowX[pair] = dataPair;
            }
            setEditData(editRowX);
            // setUnitCodes(UnitCode)
        }
    }

    const onHandleEditConfirm = (status, rowdata) => {

        if (status) {
            var chkData = dataSource.filter(x => {
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
                console.log(editData)
                if (editData === false) {
                    setStateDialogErr(true)
                    setMsgDialog("Data Items Invalid")
                } else {

                    if (editData.qtyrandom !== undefined) {
                        if (editData.qtyrandom > 100) {
                            setStateDialogErr(true)
                            setMsgDialog("Random > 100 ")
                        } else {
                            editData["qtyrandom"] = (editData.qtyrandom + "%")
                            dataSource.push(editData)
                        }
                    } else {

                        if (editData["qtyrandom"] !== undefined || editData["qtyrandom"] !== null)
                            editData["qtyrandom"] = (0 + "%")

                        dataSource.push(editData)

                    }
                }
            }
        }
        setEditData()
        setAddDataID(addDataID - 1);
        setAddData(false)
        setDialog(false)
        // setUnitCodes();
        setDataSource(dataSource);
    }

    const editorListcolunm = () => {
        if (props.columnEdit !== undefined) {
            return props.columnEdit.map(row => {
                return {
                    "field": row.accessor,
                    "component": (data = null, cols, key) => {
                        return <div key={key}>
                            {getTypeEditor(row.type, row.Header, row.accessor, data, cols, row, row.idddl, row.queryApi, row.columsddl, row.fieldLabel, row.style, row.width, row.validate, row.placeholder, row.TextInputnum, row.texts)}
                        </div>
                    }
                }
            })
        }
    }



    const getTypeEditor = (type, Header, accessor, data, cols, row, idddl, queryApi, columsddl, fieldLabel, style, width, validate, placeholder, TextInputnum, texts) => {
        console.log(accessor)
        if (type === "input") {
            return (
                <FormInline>
                    <LabelH>{Header} : </LabelH>
                    <InputDiv>
                        <AmInput style={style ? style : { width: "300px" }}
                            defaultValue={data ? data[accessor] : ""}
                            validate={true}
                            msgError="Error"
                            regExp={validate ? validate : ""}
                            onChange={(ele) => { onChangeEditor(cols.field, data, ele, row.pair) }}
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
                                    defaultValue={data !== null && data !== {} && data["qtyrandom"] !== undefined ? data[accessor].replace("%", "") : ""}
                                    style={TextInputnum ? { width: "100px" } : { width: "300px" }}
                                    type="number"
                                    onChange={(ele) => { onChangeEditor(cols.field, data, ele, row.pair) }} />
                                <div style={{ paddingLeft: "5px", paddingTop: "5px" }}>
                                    <labelH>{TextInputnum}</labelH>
                                </div>
                            </FormInline>
                        ) : (
                                <AmInput
                                    defaultValue={data ? data[accessor] : ""}
                                    style={TextInputnum ? { width: "100px" } : { width: "300px" }}
                                    type="number"
                                    onChange={(ele) => { onChangeEditor(cols.field, data, ele, row.pair) }} />
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
                            placeholder={placeholder ? placeholder : "Select"}
                            fieldDataKey="ID" //ฟิล์ดดColumn ที่ตรงกับtable ในdb 
                            fieldLabel={fieldLabel} //ฟิล์ดที่ต้องการเเสดงผลใน optionList และ ช่อง input
                            labelPattern=" : " //สัญลักษณ์ที่ต้องการขั้นระหว่างฟิล์ด
                            width={width ? width : 300} //กำหนดความกว้างของช่อง input
                            ddlMinWidth={width ? width : 300} //กำหนดความกว้างของกล่อง dropdown
                            valueData={valueText[idddl]} //ค่า value ที่เลือก
                            queryApi={queryApi}
                            returnDefaultValue={true}
                            defaultValue={data !== {} && data !== null ? data[row.pair] : ""}
                            onChange={(value, dataObject, inputID, fieldDataKey) => onHandleDDLChange(value, dataObject, inputID, fieldDataKey, cols.field, data, row.pair)}
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
                            id={idddl}
                            placeholder={placeholder ? placeholder : "Select"}
                            // fieldDataKey="ID" //ฟิล์ดดColumn ที่ตรงกับtable ในdb 
                            labelPattern=" : " //สัญลักษณ์ที่ต้องการขั้นระหว่างฟิล์ด
                            fieldLabel={fieldLabel} //ฟิล์ดที่ต้องการเเสดงผลใน ช่อง input
                            // valueData={valueFindPopupin[idddl]} //ค่า value ที่เลือก
                            labelTitle="Search of Code" //ข้อความแสดงในหน้าpopup
                            queryApi={queryApi} //object query string
                            defaultValue={data ? data[accessor] : ""}
                            columns={columsddl} //array column สำหรับแสดง table
                            width={width ? width : 300}
                            ddlMinWidth={width ? width : 100}
                            onChange={(value, dataObject, inputID, fieldDataKey) => onHandleChangeinPop(value, dataObject, inputID, fieldDataKey, cols.field, data, row.pair)}
                        />
                    </InputDiv>
                </FormInline>
            )
        } else if (type === "unitType") {
            return (
                <FormInline>
                    <LabelH>{Header} : </LabelH>
                    <InputDiv>
                        {<label>{data !== {} && data !== null ? data[accessor] : ""}</label>}
                    </InputDiv>
                </FormInline>
            )
        } else if (type === "dateTime") {
            return (
                <AmDate
                    TypeDate={"datetime-local"}
                    defaultValue={true}
                    onChange={(ele) => { onChangeEditor(cols.field, data, ele.fieldDataObject, row.pair) }}
                />
            )

        } else if (type === "text") {
            return (<FormInline>
                <LabelH>{Header}</LabelH>
                <label>{texts}</label >
            </FormInline>
            )
        } else if (type === "selectBase") {
            return (<FormInline>
                <LabelH>{Header} : </LabelH>
                <InputDiv>
                    <AmFindPopup
                        id={idddl}
                        placeholder={placeholder ? placeholder : "Select"}
                        // fieldDataKey="ID" //ฟิล์ดดColumn ที่ตรงกับtable ในdb 
                        labelPattern=" : " //สัญลักษณ์ที่ต้องการขั้นระหว่างฟิล์ด
                        fieldLabel={fieldLabel} //ฟิล์ดที่ต้องการเเสดงผลใน ช่อง input
                        // valueData={valueFindPopupin[idddl]} //ค่า value ที่เลือก
                        labelTitle="Search of Code" //ข้อความแสดงในหน้าpopup
                        queryApi={queryApi} //object query string
                        defaultValue={data ? data[accessor] : ""}
                        columns={columsddl} //array column สำหรับแสดง table
                        width={width ? width : 300}
                        ddlMinWidth={width ? width : 100}
                        onChange={(value, dataObject, inputID, fieldDataKey) => onHandleChangeinPopSKU(value, dataObject, inputID, fieldDataKey, cols.field, data, row.pair)}
                    />
                </InputDiv>
            </FormInline>
            )
        } else if (type === "bases") {
            return (<FormInline>
                <LabelH>Base : </LabelH>
                <InputDiv>
                    <AmDropdown
                        id={idddl}
                        placeholder={placeholder ? placeholder : "Select"}
                        fieldDataKey="ID" //ฟิล์ดดColumn ที่ตรงกับtable ในdb 
                        fieldLabel={["baseCode"]} //ฟิล์ดที่ต้องการเเสดงผลใน optionList และ ช่อง input
                        labelPattern=" : " //สัญลักษณ์ที่ต้องการขั้นระหว่างฟิล์ด
                        width={width ? width : 300} //กำหนดความกว้างของช่อง input
                        ddlMinWidth={width ? width : 300} //กำหนดความกว้างของกล่อง dropdown
                        valueData={valueText[idddl]} //ค่า value ที่เลือก
                        queryApi={ParentStorageObjects}
                        //returnDefaultValue={true}
                        //defaultValue={data !== {} && data !== null ? data[row.pair] : ""}
                        //onChange={(value, dataObject, inputID, fieldDataKey) => onHandleDDLChangeBase(value, dataObject, inputID, fieldDataKey, cols.field, data, row.pair)}
                        onChange={(value, dataObject, inputID, fieldDataKey) => onHandleDDLChange(value, dataObject, inputID, fieldDataKey, cols.field, data, "baseCode")}
                        ddlType={"search"} //รูปแบบ Dropdown 
                    />
                </InputDiv>
            </FormInline>)
        } else if (type === "palletbyCus") {
            return (<FormInline>
                <LabelH>{Header} : </LabelH>
                <InputDiv>
                    <AmFindPopup
                        id={idddl}
                        placeholder={placeholder ? placeholder : "Select"}
                        // fieldDataKey="ID" //ฟิล์ดดColumn ที่ตรงกับtable ในdb 
                        labelPattern=" : " //สัญลักษณ์ที่ต้องการขั้นระหว่างฟิล์ด
                        fieldLabel={fieldLabel} //ฟิล์ดที่ต้องการเเสดงผลใน ช่อง input
                        // valueData={valueFindPopupin[idddl]} //ค่า value ที่เลือก
                        labelTitle="Search of Code" //ข้อความแสดงในหน้าpopup
                        queryApi={queryApi} //object query string
                        defaultValue={data ? data[accessor] : ""}
                        columns={columsddl} //array column สำหรับแสดง table
                        width={width ? width : 300}
                        ddlMinWidth={width ? width : 100}
                        onChange={(value, dataObject, inputID, fieldDataKey) => onHandleChangeinPop(value, dataObject, inputID, fieldDataKey, cols.field, data, row.pair)}
                    />
                </InputDiv>
            </FormInline>)

        } else if (type === "skubyCus") {
            return (<FormInline>
                <LabelH>{Header} : </LabelH>
                <InputDiv>
                    <AmFindPopup
                        id={idddl}
                        placeholder={placeholder ? placeholder : "Select"}
                        // fieldDataKey="ID" //ฟิล์ดดColumn ที่ตรงกับtable ในdb 
                        labelPattern=" : " //สัญลักษณ์ที่ต้องการขั้นระหว่างฟิล์ด
                        fieldLabel={fieldLabel} //ฟิล์ดที่ต้องการเเสดงผลใน ช่อง input
                        // valueData={valueFindPopupin[idddl]} //ค่า value ที่เลือก
                        labelTitle="Search of Code" //ข้อความแสดงในหน้าpopup
                        queryApi={skuByCus} //object query string
                        //defaultValue={data ? data[accessor] : ""}
                        columns={columsddl} //array column สำหรับแสดง table
                        width={width ? width : 300}
                        ddlMinWidth={width ? width : 100}
                        onChange={(value, dataObject, inputID, fieldDataKey) => onHandleChangeinPop(value, dataObject, inputID, fieldDataKey, cols.field, data, row.pair)}
                    />
                </InputDiv>
            </FormInline>)

        }
    }

    const getDataHead = (type, key, idddls, pair, queryApi, columsddl, fieldLabel, texts, style, width, validate, valueTexts, placeholder, defaultValue) => {
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
                    style={style ? style : { width: "300px" }}
                    onChange={(e) => {
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
        return headerCreate.map((x, xindex) => {
            return (
                <Grid key={xindex} container spacing={24}>
                    {x.map((y, yindex) => {
                        return (
                            <Grid item key={yindex} xs={12} sm={6} style={{ paddingLeft: "20px", paddingTop: "10px" }}>
                                <div style={{ marginTop: "5px" }}> <FormInline>
                                    <LabelH>{y.label}</LabelH>
                                    {getDataHead(y.type, y.key, y.idddls, y.pair, y.queryApi, y.columsddl, y.fieldLabel, y.texts, y.style, y.width, y.validate, y.valueTexts, y.placeholder, y.defaultValue)}
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
                    var options = "palletcode=" + x.palletcode + "&" + "locationcode=" + x.locationcode + "&" + "qtyrandom=" + qtyrandoms
                if (x.palletcode !== undefined && x.locationcode !== undefined && qtyrandoms === undefined)
                    var options = "palletcode=" + x.palletcode + "&" + "locationcode=" + x.locationcode
                if (x.palletcode !== undefined && x.locationcode == undefined && qtyrandoms !== undefined)
                    var options = "palletcode=" + x.palletcode + "&" + "qtyrandom=" + qtyrandoms
                if (x.palletcode === undefined && x.locationcode !== undefined && qtyrandoms !== undefined)
                    var options = "locationcode=" + x.locationcode + "&" + "qtyrandom=" + qtyrandoms
                if (x.palletcode !== undefined && x.locationcode === undefined && qtyrandoms === undefined)
                    var options = "palletcode=" + x.palletcode
                if (x.locationcode !== undefined && x.palletcode === undefined && qtyrandoms === undefined)
                    var options = "locationcode=" + x.locationcode
                if (qtyrandoms !== undefined && x.palletcode === undefined && x.locationcode === undefined)
                    var options = "qtyrandom=" + qtyrandoms
                if (x.palletcode === undefined && x.locationcode === undefined && qtyrandoms === undefined)
                    var options = null
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
                "orderno": dataCreate.orderno === undefined ? null : dataCreate.orderno,
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
                    var options = "palletcode=" + x.palletcode + "&" + "locationcode=" + x.locationcode + "&" + "qtyrandom=" + qtyrandoms
                if (x.palletcode !== undefined && x.locationcode !== undefined && qtyrandoms === undefined)
                    var options = "palletcode=" + x.palletcode + "&" + "locationcode=" + x.locationcode
                if (x.palletcode !== undefined && x.locationcode == undefined && qtyrandoms !== undefined)
                    var options = "palletcode=" + x.palletcode + "&" + "qtyrandom=" + qtyrandoms
                if (x.palletcode === undefined && x.locationcode !== undefined && qtyrandoms !== undefined)
                    options = "locationcode=" + x.locationcode + "&" + "qtyrandom=" + qtyrandoms
                if (x.palletcode !== undefined && x.locationcode === undefined && qtyrandoms === undefined)
                    var options = "palletcode=" + x.palletcode
                if (x.locationcode !== undefined && x.palletcode === undefined && qtyrandoms === undefined)
                    options = "locationcode=" + x.locationcode
                if (qtyrandoms !== undefined && x.palletcode === undefined && x.locationcode === undefined)
                    var options = "qtyrandom=" + qtyrandoms
                if (x.palletcode === undefined && x.locationcode === undefined && qtyrandoms === undefined)
                    var options = null
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
                "orderno": dataCreate.orderno === undefined ? null : dataCreate.orderno,
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
                "orderno": dataCreate.orderno === undefined ? null : dataCreate.orderno,
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
                    var options = "palletcode=" + x.palletcode + "&" + "locationcode=" + x.locationcode + "&" + "perpallet=" + qtyrandoms
                if (x.palletcode !== undefined && x.locationcode !== undefined && qtyrandoms === undefined)
                    var options = "palletcode=" + x.palletcode + "&" + "locationcode=" + x.locationcode
                if (x.palletcode !== undefined && x.locationcode == undefined && qtyrandoms !== undefined)
                    var options = "palletcode=" + x.palletcode + "&" + "perpallet=" + qtyrandoms
                if (x.palletcode === undefined && x.locationcode !== undefined && qtyrandoms !== undefined)
                    var options = "locationcode=" + x.locationcode + "&" + "perpallet=" + qtyrandoms
                if (x.palletcode !== undefined && x.locationcode === undefined && qtyrandoms === undefined)
                    var options = "palletcode=" + x.palletcode
                if (x.locationcode !== undefined && x.palletcode === undefined && qtyrandoms === undefined)
                    var options = "locationcode=" + x.locationcode
                if (qtyrandoms !== undefined && x.palletcode === undefined && x.locationcode === undefined)
                    var options = "perpallet=" + qtyrandoms
                if (x.palletcode === undefined && x.locationcode === undefined && qtyrandoms === undefined)
                    var options = null
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
                "orderno": dataCreate.orderno === undefined ? null : dataCreate.orderno,
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
                "ref1": dataCreate.ref1 === undefined ? null : dataCreate.ref1,
                "ref2": dataCreate.ref2 === undefined ? null : dataCreate.ref2,
                "remark": dataCreate.remark === undefined ? null : dataCreate.remark,
                "receiveItems": dataCreate.receiveItems === undefined ? null : dataCreate.receiveItems,
            }
            CreateDocuments(CreateData, docItem);
        }
        //else if (props.columnsModifi !== undefined) {
        //    //console.log("1")
        //    let docItem = props.dataCreate["itemIssue"];

        //    CreateDocuments(dataCreate, docItem);
        //} else {
        //    dataCreate.docItems = props.dataSource;
        //    let docItem = dataCreate.docItems;
        //    CreateDocuments(dataCreate, docItem);
        //}
    }

    const CreateDocuments = (CreateData, docItem) => {
        console.log(CreateData)
        console.log(docItem)
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
                    Axios.post(window.apipath + apicreate, CreateData).then((res) => {
                        if (res.data._result.status === 1) {
                            setMsgDialog(" Create Document success Document ID = " + res.data.ID);
                            // setTypeDialog("success");
                            setStateDialog(true);
                            if (props.apiRes != undefined)
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

    const Addbtn = () => {
        if (props.createByCus === true) {
            console.log(cusIDs)
            if (cusIDs === undefined || cusIDs === null) {
                setMsgDialog("DesCustomer invalid");
                setStateDialogErr(true);
            } else {
                setDialog(true);
                setAddData(true);
                setTitle("Add");
            }
        } else {
            setDialog(true);
            setAddData(true);
            setTitle("Add");
        }
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
            <Grid container spacing={16}>
                <Grid item xs container direction="column" spacing={16}>
                </Grid>
                <Grid item>
                    <div style={{ marginTop: "20px" }}>
                        {btnProps ? btnProps : <AmButton className="float-right" styleType="add" style={{ width: "150px" }} onClick={() => {
                            Addbtn()
                        }} >
                            {'ADD'}
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
            />

            {/* Btn CREATE */}
            <Grid container spacing={16}>
                <Grid item xs container direction="column" spacing={16}>
                </Grid>
                <Grid item>
                    <div style={{ marginTop: "10px" }}>
                        <AmButton className="float-right" styleType="confirm" style={{ width: "150px" }} onClick={() => { CreateDoc() }}>
                            {'CREATE'}
                        </AmButton>
                    </div>
                </Grid>
            </Grid>


            <AmDialogConfirm
                open={openDialogClear}
                close={a => setopenDialogClear(a)}
                bodyDialog={bodyDailogClear}
                //styleDialog={{ width: "1500px", height: "500px" }}
                customAcceptBtn={<AmButton styleType="confirm_clear" onClick={() => { OnConfirmClear() }}>{t("OK")}</AmButton>}
                customCancelBtn={<AmButton styleType="delete_clear" onClick={() => { setopenDialogClear(false) }}>{t("Cancel")}</AmButton>}
            ></AmDialogConfirm>
        </div>
    )
}

export default AmCreateDocument;