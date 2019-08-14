import Axios from 'axios';
import React, { useState, useEffect } from "react";
import styled from 'styled-components'

import { createQueryString } from '../../../../components/function/CoreFunction'
import AmButton from "../../../../components/AmButton";
import AmCreateDocument from '../../../../components/AmCreateDocument'
import AmEditorTable from '../../../../components/table/AmEditorTable'
import AmFindPopup from '../../../../components/AmFindPopup'
import AmInput from '../../../../components/AmInput'
import DocView from "../../../pageComponent/DocumentView";//css

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

export default (props) => {
    const [title, setTitle] = useState("")
    const [dialog, setDialog] = useState(false)
    const [editData, setEditData] = useState();
    const [addData, setAddData] = useState(false);
    const [addDataID, setAddDataID] = useState(-1);
    const [dataWarehouse, setDataWarehouse] = useState("");
    const [boolFlag, setBoolFlag] = useState(true)
    const [headerCreate, setHeaderCreate] = useState([])
    const [table, setTable] = useState()
    const [dataSou, setDataSou] = useState([]);
    const [dataCreate, setDataCreate] = useState()

    let test = {
        "souWarehouseID": 1,
        "desWarehouseID": 1,
        "actionTime": "2019/03/04T16:56:50",
        "documentDate": "2019/03/04",
        "remark": 2,
        "movementTypeID": 1091,
        "receiveItems": [
            {
                "packCode": "GZIKACB1-0001",
                "quantity": "2024",
                "batch": "19B1018AA1",
                "unitType": "BOX",
                "baseStos": [
                    {
                        "baseCode": "THIP004586",
                        "areaCode": "FS",
                        "quantity": "2024",
                        "options": null,
                        "isRegisBaseCode": "false"
                    }
                ]
            }
        ]
    }
    // console.log(test);


    //get api set dataWarehouse
    useEffect(() => {
        Axios.get(createQueryString(WarehouseQuery)).then((row) => {
            if (row.data.datas.length > 0) {
                setDataWarehouse(row.data.datas[0])
            }
        })
    }, [])

    //set headerCreate check state dataWarehouse
    useEffect(() => {
        if (dataWarehouse !== "") {
            const headerCreates = [
                [
                    { label: "Document No.", type: "labeltext", key: "", texts: "-" },
                    { label: "Document Date", type: "date", key: "documentDate" }
                ],
                [
                    { label: "Movement Type", type: "labeltext", key: "movementTypeID", texts: "FG_RETURN_WM", valueTexts: "1091" },
                    { label: "Action Time", type: "dateTime", key: "actionTime" }
                ],
                [
                    { label: "Source Warehouse", type: "labeltext", key: "souWarehouseID", texts: dataWarehouse.Name, valueTexts: dataWarehouse.ID },
                    { label: "Destination Warehouse", type: "labeltext", key: "desWarehouseID", texts: dataWarehouse.Name, valueTexts: dataWarehouse.ID }
                ],
                [
                    { label: "Doc Status", type: "labeltext", key: "", texts: "NEW" },
                    { label: "Remark", type: "input", key: "remark" }
                ]
            ];
            setHeaderCreate(headerCreates)
        }
    }, [dataWarehouse])

    //set table check [headerCreate, boolFlag]
    useEffect(() => {
        if (headerCreate.length > 0) {
            setTable(
                <AmCreateDocument
                    headerCreate={headerCreate} //ข้อมูลตรงด้านบนตาราง
                    columnsModifi={columnsModifi} //ใช้เฉพาะหน้าที่ต้องทำปุ่มเพิ่มขึ้นมาใหม่
                    // columns={columns}  //colums 
                    // columnEdit={columnEdit} //ข้อมูลที่จะแก้ไขใน popUp 
                    apicreate={apicreate} //api ที่จะทำการสร้างเอกสาร
                    // createDocType={"recive"} //createDocType มี audit issue recive
                    history={props.history} //ส่ง porps.history ไปทุกรอบ
                    apiRes={apiRes} //หน้ารายละเอียดเอกสาร
                    btnProps={btnAdd}  //ปุ่มที่ส่งเข้าไป
                    dataSource={dataSou} //ข้อมูลที่จัดการจากปุ่มที่ส่งเข้าไป
                    dataCreate={dataCreate} //dataที่จะส่งไปสร้างเอกสาร
                />
            )
        }
        setBoolFlag(false)
    }, [headerCreate, boolFlag])

    //ตัวอย่างการใช้  findPopUp
    //{ Header: "SKU Items", accessor: 'SKUItems', type: "findPopUp", pair: "SKUIDs", idddl: "skuitems", queryApi: SKUMaster, fieldLabel: ["Code", "Name"], cols: columsFindpopUp },],

    /*
     Type คือประเภทที่จะแสดง โดยประกอบด้วย
     labeltext แสดงเป็นตัวหนังสือ  ซึ่งมีให้ใช้แค่ข้อมูลตรงด้านบนตาราง
     dateTime
     input
     dropdown ต้องส่ง idddl เป็น id ของ dropdown, fieldLabel ตัวแสดงข้อมูล ,queryApi ,pair 
     inputNum
     unitTypes ใช้ได้กับเฉพาะ Unit เท่านั้น
     findPopUp

     key ต้องตรงกับข้อมูลที่จะส่งไป api
     */

    const PalletCode = {
        queryString: window.apipath + "/v2/SelectDataViwAPI/",
        t: "PalletCode_RP",
        q: '', //เงื่อนไข '[{ "f": "Status", "c":"<", "v": 2}]'
        f: "*",
        g: "",
        s: "[{'f':'bstoID','od':'ASC'}]",
        sk: 0,
        l: 100,
        all: ""
    }

    const WarehouseQuery = {
        queryString: window.apipath + "/v2/SelectDataMstAPI/",
        t: "Warehouse",
        q: '[{ "f": "Status", "c":"<", "v": 2},{ "f": "ID", "c":"=", "v": 1}]',
        f: "ID,Code,Name",
        g: "",
        s: "[{'f':'ID','od':'asc'}]",
        sk: 0,
        l: 100,
        all: ""
    }

    const columsFindpopUp = [
        {
            Header: 'Pallet Code',
            accessor: 'bstoCode',
            fixed: 'left',
            width: 130,
            sortable: true
        },
        {
            Header: 'Pack Code',
            accessor: 'pstoCode',
            width: 200,
            sortable: true
        },
        {
            Header: 'Batch',
            accessor: 'pstoBatch',
            width: 200,
            sortable: true
        },
        {
            Header: 'Name',
            accessor: 'pstoName',
            width: 200,
            sortable: true
        }
    ];

    const columnEdit = [
        { Header: "Pallet Code", accessor: 'palletCode', type: "findPopUp", idddl: "palletCode", queryApi: PalletCode, fieldLabel: ["bstoCode"], columsddl: columsFindpopUp, placeholder: "Select Pallet Code" },
        { Header: 'Pack Code', accessor: 'packCode', type: "unitType" },
        { Header: 'Batch', accessor: 'batch', type: "unitType" },
        { Header: "Quantity", accessor: 'quantity', type: "inputNum" },
        { Header: "Unit", accessor: 'unitType', type: "unitType" }
    ];

    const columnsModifi = [
        { Header: 'Pallet Code', accessor: 'palletCode' },
        { Header: "Pack Code", accessor: 'packCode' },
        { Header: "Batch", accessor: 'batch' },
        { Header: "Quantity", accessor: 'quantity' },
        { Header: "Unit", accessor: 'unitType' },
        {
            Header: "", Cell: (e) => {
                return <AmButton styleType="info" onClick={() => { setEditData(e); setDialog(true); setTitle("Edit") }}>Edit</AmButton>
            }
        },
        {
            Header: "", Cell: (e) => {
                return <AmButton styleType="delete" onClick={() => onHandleDelete(e.original.ID, e.original, e)}>Remove</AmButton>
            }
        }
    ];

    const apicreate = "/v2/CreateGRDocAPI/"   //API สร้าง Doc
    const apiRes = "/receive/detail?docID=" //path หน้ารายละเอียด ตอนนี้ยังไม่เปิด

    //generate 
    const editorListcolunm = () => {
        if (columnEdit !== undefined) {
            return columnEdit.map(row => {
                return {
                    "field": row.accessor,
                    "component": (data = null, cols, key) => {
                        return (
                            <div key={key}>
                                {getTypeEditor(row.type, row.Header, row.accessor, data, cols, row, row.idddl, row.queryApi, row.columsddl, row.fieldLabel, row.style, row.width, row.validate, row.placeholder)}
                            </div>
                        )
                    }
                }
            })
        }
    }

    const getTypeEditor = (type, Header, accessor, data, cols, row, idddl, queryApi, columsddl, fieldLabel, style, width, validate, placeholder) => {
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
                            onChange={(value) => { onChangeEditor(cols.field, value) }}></AmInput>
                    </InputDiv>
                </FormInline>
            )

        } else if (type === "inputNum") {
            return (
                <FormInline>
                    <LabelH>{Header} : </LabelH>
                    <InputDiv>
                        <AmInput defaultValue={data ? data[accessor] : ""}
                            style={style ? style : { width: "300px" }}
                            type="number"
                            onChange={(value) => { onChangeEditor(cols.field, value) }}></AmInput>
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
                            fieldDataKey="" //ฟิล์ดดColumn ที่ตรงกับtable ในdb 
                            labelPattern=" : " //สัญลักษณ์ที่ต้องการขั้นระหว่างฟิล์ด
                            fieldLabel={fieldLabel} //ฟิล์ดที่ต้องการเเสดงผลใน ช่อง input
                            // valueData={valueFindPopupin[idddl]} //ค่า value ที่เลือก
                            labelTitle="Search of Code" //ข้อความแสดงในหน้าpopup
                            queryApi={queryApi} //object query string
                            value={""}
                            // defaultValue={"ddddd"}
                            columns={columsddl} //array column สำหรับแสดง table
                            width={width ? width : 300}
                            ddlMinWidth={width ? width : 100}
                            onChange={(value, dataObject, inputID, fieldDataKey) => onChangeEditor(cols.field, dataObject)} />
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
        }
    }

    const funcSetEditData = (field, value, datas) => {
        if (field === "palletCode") {
            datas.packCode = value.pstoCode
            datas.batch = value.pstoBatch
            datas.palletCode = value.bstoCode
            datas.unitType = value.Code
            datas.quantity = value.Quantity
        } else {
            datas[field] = value;
        }
        setEditData(datas);
    }

    //for input modal
    const onChangeEditor = (field, value) => {
        let rowEditData = {}
        if (addData) {//ADD
            if (editData) { //พิมตัวถัดมา
                rowEditData = { ...editData }
            } else { //พิมตัวแรก
                rowEditData["ID"] = addDataID;
            }
        } else {//EDIT
            rowEditData = editData.original ? { ...editData.original } : { ...editData };
        }
        funcSetEditData(field, value, rowEditData)
    }

    const formatDataCreate = (data) => {
        return data.map(row => {
            return {
                "packCode": row.packCode,
                "quantity": row.quantity,
                "batch": row.batch,
                "unitType": row.unitType,
                "baseStos": [{
                    "baseCode": row.palletCode,
                    "areaCode": "FS",
                    "quantity": row.quantity,
                    "options": null,
                    "isRegisBaseCode": "false"
                }]
            }
        })
    }

    //for button modal
    const onHandleEditConfirm = (status, rowdata) => {
        let GetDataSource = dataSou
        if (status) {
            let chkData = GetDataSource.find(x => {
                return x.ID === rowdata.ID
            })
            if (chkData !== undefined) {
                for (let row in editData) {
                    chkData[row] = editData[row]
                }
            }
            else {//add
                GetDataSource.push(editData)
            }
        }
        setDataCreate(formatDataCreate(GetDataSource))
        setEditData()
        setAddDataID(addDataID - 1);
        setAddData(false)
        setDialog(false)
        setDataSou(GetDataSource);
        setBoolFlag(true)
    }

    const onHandleDelete = (v, o, rowdata) => {
        let idx = dataSou.findIndex(x => x.ID === v);
        dataSou.splice(idx, 1);
        setDataCreate(formatDataCreate(dataSou))
        setDataSou(dataSou);
        setBoolFlag(true)
    }

    const btnAdd = (
        <AmButton className="float-right" styleType="add" style={{ width: "150px" }} onClick={() => { setDialog(true); setTitle("Add"); setAddData(true) }}>
            {'ADD'}
        </AmButton>
    )

    return (
        <div>
            <AmEditorTable style={{ width: "600px", height: "500px" }} titleText={title} open={dialog} data={editData} onAccept={(status, rowdata) => onHandleEditConfirm(status, rowdata)} columns={editorListcolunm()} />
            {table}
        </div>
    )
}