import Grid from '@material-ui/core/Grid';
import PropTypes from 'prop-types';
import React, { useState, useRef, createRef, useEffect } from "react";
import styled from 'styled-components'

// import { useTranslation } from 'react-i18next'
import AmButton from '../components/AmButton'
import AmDate from '../components/AmDate'
import AmDatepicker from '../components/AmDate'
import AmDialogs from '../components/AmDialogs'
import AmDropdown from '../components/AmDropdown'
import AmEditorTable from '../components/table/AmEditorTable'
import AmFindPopup from '../components/AmFindPopup'
import AmInput from '../components/AmInput'
import AmCheckBox from '../components/AmCheckBox'
// import AmTable from '../components/table/AmTable'
import { Clone } from '../components/function/CoreFunction'
import { apicall, createQueryString } from "../components/function/CoreFunction2";
import BtnAddList from './AmCreateDocument_BtnAddList'
import { getUnique } from './function/ObjectFunction'
import AmDialogconfirm from './AmDialogConfirm'
import LabelT from './AmLabelMultiLanguage'
import AmTable from './AmTable/AmTable'

// import ValidateInput from './function/ValidateInput'

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

const colss = [
    {
        Header: 'Code',
        accessor: 'Code',
        fixed: 'left',
        width: 130,
        sortable: true,
    }

];

const useDocumentItemQuery = (docID, DocItemQuery) => {
    const [docItemsQuery, setDocItemsQuery] = useState(DocItemQuery)

    useEffect(() => {
        if (DocItemQuery != null && docID != undefined) {
            let objQuery = DocItemQuery;
            if (objQuery !== null) {
                let Itemsqry = JSON.parse(objQuery.q);
                Itemsqry.push({ 'f': 'Document_ID', 'c': '=', 'v': docID })
                objQuery.q = JSON.stringify(Itemsqry);

            }

            setDocItemsQuery(objQuery)
        }
    }, [docID])
    return docItemsQuery
}



const AmCreateDocument = (props) => {
    // const { t } = useTranslation();
    const [addData, setAddData] = useState(false);
    const [dialog, setDialog] = useState(false);
    const [editData, setEditData] = useState({});
    const [editDataItem, setEditDataItem] = useState([]);
    const [addDataID, setAddDataID] = useState(-1);
    const [title, setTitle] = useState("");
    const [dataSource, setDataSource] = useState([]);
    const [reload, setReload] = useState();
    const [inputError, setInputError] = useState([])

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
    const [docIds, setdocIds] = useState();
    const DocItemsquery = useDocumentItemQuery(docIds, props.DocItemQuery)
    const ref = useRef(props.columnEdit.map(() => createRef()))
    const [dataDocItem, setdataDocItem] = useState();
    const [dialogItem, setDialogItem] = useState(false);
    const [ItemBody, setItemBody] = useState();
    const [relationComponent, setRelationComponent] = useState([]);
    const [checkItem, setcheckItem] = useState(false);
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
            }}>Edit</AmButton>,
        },
        {
            Header: "", width: 110, Cell: (e) => <AmButton style={{ width: "100px" }} styleType="delete" onClick={
                () => {
                    onHandleDelete(e.original.ID, e.original, e);
                    //setReload({});
                }}>Remove</AmButton>,
        }
    ];

    const columns = props.columns.concat(rem)


    useEffect(() => {
        if (docIds != undefined) {
            getData()
        }
    }, [docIds])


    useEffect(() => {
        const getSKuItem = (dataDocItem) => {
            if (dataDocItem !== undefined && dataDocItem.length != 0) {
                setDialogItem(true)
            }
            return dataDocItem.map((x, idx) => {
                return props.columnEditItem.map((row, i) => {

                    return {
                        "field": row.accessor,
                        "component": (data = null, cols, key) => {
                            let rowError = inputError.length ? inputError.some(x => { return x === row.accessor }) : false;
                            return <div key={key}>

                                {getTypeEditorItem(row, i, rowError, idx)}

                            </div>
                        }
                    }
                })
            })
        }
        if (dataDocItem !== undefined && dataDocItem.length != 0) {
            var datas = []
            getSKuItem(dataDocItem).forEach(x =>
                x.forEach(y =>
                    datas.push(y)

                )

            );
            let xs = { 'check': true }
            datas.push(xs)
            // console.log(datas)
            setRelationComponent(datas)
        }
    }, [dataDocItem])


    const getDocItem = () => {
        return window.apipath + "/v2/GetSPSearchAPI?"
            + "&docID=" + docIds
            + "&spname=DOCITEM_LISTDRANDDI";
    }

    const getData = () => {
        if (getDocItem != undefined) {
            Axios.get(getDocItem()).then(res => {
                if (res.data.datas == undefined || res.data.datas.length == 0) {
                    getDocItemQuery(DocItemsquery)
                } else if (res.data.datas.length != 0) {
                    setEditData(res.data.datas);
                    setdataDocItem(res.data.datas);
                }

            })
        }

    }

    const PopupObjSize = React.memo(({ relationComponent, open }) => {
        return <AmEditorTable
            open={open}
            onAccept={(status, rowdata, inputError) =>
                onHandleEditConfirmItem(status, rowdata, inputError)}
            titleText={""}
            data={{}}
            columns={relationComponent}
        />
    });
    const getDocItemQuery = (DocItemsquerys) => {
        Axios.get(createQueryString(DocItemsquerys)).then(res => {
            if (res.data.datas.length != 0) {
                setdataDocItem(res.data.datas);
                setEditData(res.data.datas);
                //setDialogItem(true)
            } else {


            }
        })
    }


    const onHandleDelete = (v, o, rowdata) => {
        let idx = dataSource.findIndex(x => x.ID === v);
        dataSource.splice(idx, 1);
        setDataSource(dataSource);
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

    const onHandleChangeFindpopupDoc = (value, dataObject, inputID, fieldDataKey, pair, key) => {

        if (value != undefined) {
            setdocIds(value)

        }
    }

    const onChangeEditor = (field, data, required, related) => {
        if (typeof data === "object" && data) {
            editData[field] = data[field] ? data[field] : data.value
        } else {
            editData[field] = data
        }

        if (related && related.length) {
            let indexField = related.reduce((obj, x) => {
                obj[x] = props.columnEdit.findIndex(y => y.accessor === x)
                return obj
            }, {})

            for (let [key, index] of Object.entries(indexField)) {
                if (data) {
                    editData[key] = data[key]
                    if (key === "packID") {
                        let ID = editData.ID
                        editData.ID = data.packID
                        editData.packID = ID
                    }
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

        if (addData && Object.getOwnPropertyNames(editData).length === 0) {
            editData["ID"] = addDataID

        }

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

        setReload({})
    }

    const onHandleEditConfirm = (status, rowdata, inputError) => {

        if (status) {
            if (!inputError.length) {
                let chkDataPallet = dataSource.find(x => x.ID === rowdata.ID)
                let chkDataSku = dataSource.find(x => {
                    return x.skuCode === rowdata.skuCode && x.batch === rowdata.batch && x.lot === rowdata.lot
                })
                if (chkDataPallet) {
                    for (let key of Object.getOwnPropertyNames(chkDataPallet))
                        delete chkDataPallet[key]
                    for (let row in editData) {
                        chkDataPallet[row] = editData[row]
                    }
                    setEditData({})
                    setInputError([])
                    setDialog(false)
                    setDialogItem(false)
                } else {
                    if (chkDataSku) {
                        setStateDialogErr(true)
                        setMsgDialog("มีข้อมูล SKU นี้แล้ว")
                    }
                    else {
                        if (!addData) {
                            let _dataSource = dataSource.filter(x => x.ID !== rowdata.packID)
                            dataSource.length = 0
                            Object.assign(dataSource, _dataSource)
                        }
                        dataSource.push(editData)
                        setAddDataID(addDataID - 1);
                        setEditData({})
                        setInputError([])
                        setDialog(false)
                        setDialogItem(false)
                    }
                }
                // setEditData({})
                // setAddDataID(addDataID - 1);
                // setDialog(false)
                // setDialogItem(false)
                // setInputError([])
            } else {
                setInputError(inputError.map(x => x.accessor))
            }

        } else {
            setInputError([])
            setEditData({})
            // setAddDataID(addDataID - 1);
            setDialog(false)
            setDialogItem(false)
        }
    }


    const onHandleEditConfirmItem = (status, rowdata, inputError) => {
        // console.log(dataDocItem)
        if (dataDocItem.length != 0) {
            dataDocItem.forEach((rowI, i) => {
                if (status) {
                    if (dataDocItem[i]["Qty"]) {
                        let qtySum = editData[i]["Qty"]
                        let qtys = editData[i]["Quantity"]
                        let ToatalQty = qtys - qtySum
                        if (ToatalQty == 0) {
                            setDialogItem(false)
                            setStateDialogErr(true)
                            setMsgDialog("เอกสารนี้ถูกสร้างครบจำนวนแล้ว")

                        } else {
                            dataDocItem[i]["Quantity"] = ToatalQty
                            setDataSource(dataDocItem);
                            setEditData({})
                            setAddDataID(addDataID - 1);
                            setDialogItem(false)
                            setInputError([])
                        }
                    } else {
                        setDataSource(editData);
                        setEditData({})
                        setAddDataID(addDataID - 1);
                        setDialogItem(false)
                        setInputError([])
                    }

                } else {
                    setInputError([])
                    setEditData({})
                    setDialogItem(false)
                }


            })

        }

    }

    const editorListcolunm = () => {
        if (props.columnEdit !== undefined) {
            return props.columnEdit.map((row, i) => {
                return {
                    "field": row.accessor,
                    "component": (data = null, cols, key) => {
                        let rowError = inputError.length ? inputError.some(x => {
                            return x === row.accessor
                        }) : false
                        return <div key={key}>

                            {getTypeEditor(row.type, row.Header, row.accessor, data, cols, row, row.idddl, row.queryApi, row.columsddl, row.fieldLabel,
                                row.style, row.width, row.validate, row.placeholder, row.TextInputnum, row.texts, i, rowError, row.required)}

                        </div>
                    }
                }
            })
        }
    }



    const getTypeEditorItem = ({ type, Header, accessori, accessor, data, cols, row, idddl, queryApi,
        columsddl, fieldLabel, style, width, validate, placeholder, TextInputnum, texts, required }, index, rowError, idx) => {
        if (type === "inputNum") {
            return (<div>
                <FormInline>
                    <FormInline>
                        <LabelT style={LabelTStyle}>{Header} :</LabelT>
                    </FormInline>
                    <InputDiv>

                        <FormInline>{TextInputnum ? (
                            <FormInline>
                                <AmInput
                                    required={required}
                                    error={rowError}
                                    // helperText={inputError.length ? "required field" : false}
                                    inputRef={ref.current[index]}
                                    defaultValue={dataDocItem[idx] !== null && dataDocItem[idx] !== {} && dataDocItem[idx]["qtyrandom"] !== undefined ?
                                        dataDocItem[idx][accessori].replace("%", "") : ""}
                                    style={TextInputnum ? { width: "100px" } : { width: "300px" }}
                                    type="number"
                                    onChange={(ele) => { onChangeEditor(cols.field, ele, required) }} />
                                <div style={{ paddingLeft: "5px", paddingTop: "5px" }}>
                                    <LabelT>{TextInputnum}</LabelT>
                                </div>
                            </FormInline>
                        ) : (
                                <AmInput
                                    required={required}
                                    error={rowError}
                                    //disable={checkItem[idx] ? checkIem[idx] : false}
                                    // helperText={inputError.length ? "required field" : false}
                                    inputRef={ref.current[index]}
                                    defaultValue={dataDocItem[idx]['Qty'] ? dataDocItem[idx][accessori] - dataDocItem[idx]['Qty'] :
                                        dataDocItem[idx][accessori] ? dataDocItem[idx][accessori] : ""}
                                    style={TextInputnum ? { width: "100px" } : { width: "300px" }}
                                    type="number"
                                    onChange={(ele) => { onChangeEditor(cols.field, ele, required, idx) }} />
                            )
                        }</FormInline>
                    </InputDiv>
                </FormInline>

            </div>)
        } else if (type === "text") {
            return (
                <div>
                    <LabelT style={LabelTStyle}>{Header} :</LabelT>
                    <label ref={ref.current[index]}>{texts || dataDocItem[idx][accessori]}</label >
                </div>

            )
        } else if (type === "checkbox") {
            return <div><AmCheckBox
                label={Header}
                value={true}
                //disable={}
                //checked={true}
                defaultChecked={true}
                defaultValue={true}
                onChange={(e) =>
                    onChangeEditorCheck(e, idx)
                }
            >
            </AmCheckBox></div>

        }
    }

    const onChangeEditorCheck = (e, idx) => {

        // console.log(dataDocItem)
        // console.log(e)
        // console.log(idx)
    }



    const getTypeEditor = (type, Header, accessor, data, cols, row, idddl, queryApi, columsddl, fieldLabel, style, width, validate, placeholder, TextInputnum, texts, index, rowError, required) => {
        if (type === "input") {
            return (
                <FormInline>
                    <LabelT style={LabelTStyle}>{Header} :</LabelT>

                    <InputDiv>
                        <AmInput style={style ? style : { width: "300px" }}
                            required={required}
                            error={rowError}
                            // helperText={inputError.length ? "required field" : false}
                            inputRef={ref.current[index]}
                            defaultValue={editData[accessor] ? editData[accessor] : ""}
                            validate={true}
                            msgError="Error"
                            regExp={validate ? validate : ""}
                            onChange={(ele) => { onChangeEditor(cols.field, ele, required) }}
                        />

                    </InputDiv>
                </FormInline>
            )
        } else if (type === "inputNum") {
            return (
                <FormInline>
                    <LabelT style={LabelTStyle}>{Header} :</LabelT>
                    <InputDiv>
                        <FormInline>{TextInputnum ? (
                            <FormInline>
                                <AmInput
                                    required={required}
                                    error={rowError}
                                    // helperText={inputError.length ? "required field" : false}
                                    inputRef={ref.current[index]}
                                    defaultValue={editData !== null && editData !== {} && editData["qtyrandom"] !== undefined ? editData[accessor].replace("%", "") : ""}
                                    style={TextInputnum ? { width: "100px" } : { width: "300px" }}
                                    type="number"
                                    onChange={(ele) => { onChangeEditor(cols.field, ele, required) }} />
                                <div style={{ paddingLeft: "5px", paddingTop: "5px" }}>
                                    <LabelT>{TextInputnum}</LabelT>
                                </div>
                            </FormInline>
                        ) : (
                                <AmInput
                                    required={required}
                                    error={rowError}
                                    // helperText={inputError.length ? "required field" : false}
                                    inputRef={ref.current[index]}
                                    defaultValue={editData[accessor] ? editData[accessor] : ""}
                                    style={TextInputnum ? { width: "100px" } : { width: "300px" }}
                                    type="number"
                                    onChange={(ele) => { onChangeEditor(cols.field, ele, required) }} />
                            )
                        }</FormInline>
                    </InputDiv>
                </FormInline>
            )
        } else if (type === "dropdown") {
            return (
                <FormInline>
                    <LabelT style={LabelTStyle}>{Header} :</LabelT>
                    <InputDiv>
                        <AmDropdown
                            required={required}
                            error={rowError}
                            // helperText={inputError.length ? "required field" : false}
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
                            defaultValue={editData[accessor] ? editData[accessor] : ""}
                            onChange={(value, dataObject, inputID, fieldDataKey) => onChangeEditor(row.accessor, dataObject, required, row.related)}
                            ddlType={"search"} //รูปแบบ Dropdown 
                        />
                    </InputDiv>
                </FormInline>
            )
        } else if (type === "findPopUp") {
            return (
                <FormInline>
                    <LabelT style={LabelTStyle}>{Header} :</LabelT>
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
                            width={width ? width : 300}
                            ddlMinWidth={width ? width : 100}
                            onChange={(value, dataObject, inputID, fieldDataKey) => onChangeEditor(row.accessor, dataObject, required, row.related)}
                        />
                    </InputDiv>
                </FormInline>
            )
        } else if (type === "unitType") {
            return (
                <FormInline>
                    <LabelT style={LabelTStyle}>{Header} :</LabelT>
                    <InputDiv>
                        {<label>{editData !== {} && editData !== null ? editData[accessor] : ""}</label>}
                    </InputDiv>
                </FormInline>
            )
        } else if (type === "dateTime") {
            return (
                <FormInline>
                    <LabelT style={LabelTStyle}>{Header} :</LabelT>
                    <InputDiv>
                        <AmDate
                            required={required}
                            error={rowError}
                            // helperText={inputError.length ? "required field" : false}
                            TypeDate={"datetime-local"}
                            defaultValue={true}
                            onChange={(ele) => { onChangeEditor(cols.field, ele.fieldDataObject, required) }}
                        />
                    </InputDiv>
                </FormInline>
            )
        } else if (type === "text") {
            return (<FormInline>
                <LabelT style={LabelTStyle}>{Header} :</LabelT>
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
                    defaultValue
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
                    defaultValue
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
        } else if (type === "findPopUpDoc") {
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
                    columns={colss} //array column สำหรับแสดง table
                    width={width ? width : 300}
                    ddlMinWidth={width ? width : 300}//กำหนดความกว้างของช่อง input
                    disabled={docIds ? true : false}
                    onChange={(value, dataObject, inputID, fieldDataKey) => onHandleChangeFindpopupDoc(value, dataObject, inputID, fieldDataKey, pair, key)}
                />
            )
        }
    }

    const getHeaderCreate = () => {
        return props.headerCreate.map((x, xindex) => {
            return (
                <Grid key={xindex} container>
                    {x.map((y, yindex) => {
                        let syn = y.label ? " : " : "";
                        return (
                            <Grid item key={yindex} xs={12} sm={6} style={{ paddingLeft: "20px", paddingTop: "10px" }}>
                                <div style={{ marginTop: "5px" }}> <FormInline>
                                    <LabelT style={LabelTStyle}>{y.label + syn}</LabelT>
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
        const doc = {
            actionTime: null,
            batch: null,
            desAreaMasterCode: null,
            desAreaMasterID: null,
            desBranchCode: null,
            desBranchID: null,
            desCustomerCode: null,
            desCustomerID: null,
            desSupplierCode: null,
            desSupplierID: null,
            desWarehouseCode: null,
            desWarehouseID: null,
            documentDate: null,
            documentProcessTypeID: null,
            forCustomerCode: null,
            forCustomerID: null,
            lot: null,
            movementTypeID: null,
            options: null,
            orderNo: null,
            parentDocumentID: null,
            ref1: null,
            ref2: null,
            refID: null,
            remark: null,
            souAreaMasterCode: null,
            souAreaMasterID: null,
            souBranchCode: null,
            souBranchID: null,
            souCustomerCode: null,
            souCustomerID: null,
            souSupplierCode: null,
            souSupplierID: null,
            souWarehouseCode: null,
            souWarehouseID: null,
            transportID: null
        }
        const docItem = {
            packCode: null,
            packID: null,
            skuCode: null,
            quantity: null,
            unitType: null,
            batch: null,
            lot: null,
            orderNo: null,
            refID: null,
            ref1: null,
            ref2: null,
            options: null,
            expireDate: null,
            productionDate: null,
            docItemStos: [],
            baseStos: []
        }

        //map Header
        const countDoc = Object.keys(doc).length
        for (let [key, value] of Object.entries(createDocumentData)) {
            if (key in doc)
                doc[key] = value
        }

        if (props.createDocType === "shipment") {
            doc.shipmentItems = dataSource.map(x => {
                let _docItem = { ...docItem }
                for (let [key, value] of Object.entries(x)) {
                    if (key in docItem)
                        _docItem[key] = value
                    if (key === "ID" && value > 0)
                        _docItem.packID = value
                }
                //modify _docItem 
                //_docItem.options = x.xxx
                return _docItem
            })
        }
        else if (props.createDocType === "audit") {
            doc.docItems = dataSource.map(x => {
                let _docItem = { ...docItem }
                for (let [key, value] of Object.entries(x)) {
                    if (key in docItem)
                        _docItem[key] = value
                    if (key === "ID" && value > 0)
                        _docItem.packID = value
                }
                return _docItem
            })
        } else if (props.createDocType === "issue") {
            doc.issueItems = dataSource.map(x => {
                let _docItem = { ...docItem }
                for (let [key, value] of Object.entries(x)) {
                    if (key in docItem)
                        _docItem[key] = value
                    if (key === "ID" && value > 0)
                        _docItem.packID = value
                }
                return _docItem
            })
        } else if (props.createDocType === "receive") {
            doc.receiveItems = dataSource.map(x => {
                let _docItem = { ...docItem }
                for (let [key, value] of Object.entries(x)) {
                    if (key in docItem)
                        _docItem[key] = value
                    if (key === "ID" && value > 0)
                        _docItem.packID = value
                }
                return _docItem
            })
        } else if (props.createDocType === "receiveOrder") {
            doc.receivedOrderItem = dataSource.map(x => {
                let _docItem = { ...docItem }
                for (let [key, value] of Object.entries(x)) {
                    if (key in docItem)
                        _docItem[key] = value
                    if (key === "ID" && value > 0)
                        _docItem.packID = value
                }
                return _docItem
            })
        } else if (props.createDocType === "issueOrder") {
            doc.issuedOrderItem = dataSource.map(x => {
                //modify
                //console.log(x.unitType)
                //x.BaseUnitCode = x.unitType
                x.RefDocumentItem_ID = null
                //docItems.options = null
                return x
            })
        } else if (props.createDocType === "reciveByDR") {
            doc.receiveItems = dataSource.map(x => {
                x.unitType = x.UnitTypeCode
                x.RefDocumentItem_ID = x.ID
                x.Options = null
                x.skuCode = x.Code
                return x
            })



        }
        if (Object.keys(doc).length > countDoc) {
            CreateDocuments(doc)
        }
    }

    const CreateDocuments = (CreateData) => {
        Axios.post(window.apipath + props.apicreate, CreateData).then((res) => {
            if (res.data._result.status) {
                setMsgDialog("Create Document success Document ID = " + res.data.ID);
                setStateDialog(true);
                if (props.apiRes !== undefined)
                    props.history.push(props.apiRes + res.data.ID)
            } else {
                setMsgDialog(res.data._result.message);
                setStateDialogErr(true);
            }
        })
    }

    const FormatData = (data) => {
        dataSource.length = 0
        let _dataSource = getUnique(data, props.addList.primaryKeyTable).map(x => ({ ...x, ID: x.packID }))
        // console.log(_dataSource);
        Object.assign(dataSource, _dataSource)
        // return dataSource
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
                onAccept={(status, rowdata, inputError) => onHandleEditConfirm(status, rowdata, inputError)}
                data={editData}
                objColumnsAndFieldCheck={{ objColumn: props.columnEdit, fieldCheck: "accessor" }}
                columns={editorListcolunm()}
            />

            <PopupObjSize relationComponent={relationComponent} open={dialogItem} />
            {/* Header */}
            {getHeaderCreate()}

            {/* Btn ADD */}
            <Grid container>
                <Grid item xs container direction="column">
                </Grid>
                <Grid item>
                    <div style={{ marginTop: "20px" }}>
                        {props.addList ? <BtnAddList
                            primaryKeyTable={props.addList.primaryKeyTable}
                            headerCreate={props.headerCreate}
                            queryApi={props.addList.queryApi}
                            columns={props.addList.columns}
                            search={props.addList.search}
                            textBtn="Add Item List"
                            onSubmit={(data) => { FormatData(data); setReload({}) }}
                            dataCheck={dataSource}
                        /> : null}

                        {props.add === false ? null : <AmButton className="float-right" styleType="add" style={{ width: "150px" }} onClick={() => {
                            if (props.singleItem && dataSource.length > 0) {
                                setStateDialogErr(true)
                                setMsgDialog("ไม่สามารถเพิ่มสินค้าได้ เนื่องจากมีการเพิ่มสินค้าในเอกสารแล้ว")
                            } else {
                                setDialog(true);
                                setAddData(true);
                                setTitle("Add");
                            }
                        }} >Add Item</AmButton>}

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
                        <AmButton className="float-right" styleType="confirm" style={{ width: "150px" }} onClick={() => { CreateDoc() }}>Create</AmButton>
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