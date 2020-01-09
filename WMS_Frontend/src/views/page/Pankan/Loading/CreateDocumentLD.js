import React, { Component, useState, useEffect } from "react";
import AmCreateDocument from '../../../../components/AmCreateDocument'
import AmButton from '../../../../components/AmButton'
import AmEditorTable from '../../../../components/table/AmEditorTable'
import AmInput from '../../../../components/AmInput'
import AmDropdown from '../../../../components/AmDropdown'
import AmFindPopup from '../../../../components/AmFindPopup'
import styled from 'styled-components'
import AmDialogs from '../../../../components/AmDialogs'
import AmDate from '../../../../components/AmDate'
import AmTable from '../../../../components/table/AmTable'
import moment from "moment";
import Axios from 'axios';

const createQueryString = (select) => {
    let queryS = select.queryString + (select.t === "" ? "?" : "?t=" + select.t)
        + (select.q === "" ? "" : "&q=" + select.q)
        + (select.f === "" ? "" : "&f=" + select.f)
        + (select.g === "" ? "" : "&g=" + select.g)
        + (select.s === "" ? "" : "&s=" + select.s)
        + (select.sk === "" ? "" : "&sk=" + select.sk)
        + (select.l === 0 ? "" : "&l=" + select.l)
        + (select.all === "" ? "" : "&all=" + select.all)
        + "&isCounts=true"
        + "&apikey=free01"
    return queryS
}

const LabelH = styled.label`
font-weight: bold;
  width: 200px;
`;

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
    @media (max-width: 800px) {
        margin: 0;
    }
`;
const CreateDocumentLD = (props) => {
    const [addData, setAddData] = useState(false);
    const [editDatas, setEditDatas] = useState(false);
    const [dialog, setDialog] = useState(false);
    const [editData, setEditData] = useState(false);
    const [addDataID, setAddDataID] = useState(0);
    const [title, setTitle] = useState("");
    const [dataSource, setDataSource] = useState([]);
    const [reload, setRelaod] = useState();
    const [actiontimes, setactiontimes] = useState("");
    const [stateDialogErr, setStateDialogErr] = useState(false);
    const [stateDialog, setStateDialog] = useState(false);
    const [msgDialog, setMsgDialog] = useState("");
    const [dataCreate, setdataCreate] = useState([]);
    const [docIds, setdocIds] = useState();
    const [docItems, setdocItems] = useState([])




    const SKUMaster = {
        queryString: window.apipath + "/v2/SelectDataViwAPI/",
        t: "SKUMaster",
        q: '[{ "f": "Status", "c":"<", "v": 2}]',
        f: "ID,Code,Name,UnitTypeCode,concat(Code, ':' ,Name) as SKUItem, ID as SKUID,concat(Code, ':' ,Name) as SKUItems, ID as SKUIDs,Code as skuCode",
        g: "",
        s: "[{'f':'ID','od':'asc'}]",
        sk: 0,
        l: 100,
        all: "",
    }

 
    const Warehouses = {
        queryString: window.apipath + "/v2/SelectDataMstAPI/",
        t: "Warehouse",
        q: '[{ "f": "Status", "c":"=", "v": 1}]',
        f: "ID,Code,Name",
        g: "",
        s: "[{'f':'ID','od':'asc'}]",
        sk: 0,
        l: 100,
        all: "",
    }
    
    const Customers = {
        queryString: window.apipath + "/v2/SelectDataMstAPI/",
        t: "Customer",
        q: '[{ "f": "Status", "c":"=", "v": 1}]',
        f: "ID,Code,Name",
        g: "",
        s: "[{'f':'ID','od':'asc'}]",
        sk: 0,
        l: 100,
        all: "",

    }

    const Transport = {
        queryString: window.apipath + "/v2/SelectDataMstAPI/",
        t: "Transport",
        q: '[{ "f": "Status", "c":"=", "v": 1}]',
        f: "ID,Code,Name",
        g: "",
        s: "[{'f':'ID','od':'asc'}]",
        sk: 0,
        l: 100,
        all: "",

    }

    const DocmentGI = {
        queryString: window.apipath + "/v2/SelectDataViwAPI/",
        t: "Document",
        q: '[{ "f": "Status", "c":"=", "v": 1},{ "f": "DocumentType_ID", "c":"=", "v": 1002}]',
        f: "ID,Code,Name,ActionTime,ID as issuedDocID,ActionTime as actiontime,Code as Doccode",
        g: "",
        s: "[{'f':'ID','od':'asc'}]",
        sk: 0,
        l: 100,
        all: "",


    }
    const columsFindpopUp = [
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

    const headerCreates = [
        [{ label: "Document Code :", type: "labeltext", key: "documentCode", texts: "-" },
        { label: "Document Date :", type: "dateTime", key: "documentDate" }],
        [{ label: "Action Time:", type: "dateTime", key: "actionTime" },
            { label: "Doc Status :", type: "labeltext", texts: "New" }
        ],
        [{
            label: "Transport:", type: "dropdown", key: "transportID",
            idddl: "transportID", queryApi: Transport, fieldLabel: ["Code", "Name"]
        },
        {
            label: "Warehouse:", type: "dropdown", key: "souWarehouseID",
            idddl: "souWarehouseID", queryApi: Warehouses, fieldLabel: ["Code", "Name"]
        },],
        [{
            label: "Customer:", type: "dropdown", key: "desCustomerID",
            idddl: "desCustomerID", queryApi: Customers, fieldLabel: ["Code", "Name"]
        },
       ]

    ];



    const columnsModifi = [{ Header: "Issue No", accessor: 'Doccode' },
    { Header: "ActionTime", accessor: 'actiontime' },
    { Header: "", width: 110, Cell: (e) => <AmButton style={{ width: "100px" }} styleType="info" onClick={() => { setEditData(e); setDialog(true); setTitle("Edit") }}>Edit</AmButton>, },
    {
        Header: "", width: 110, Cell: (e) => <AmButton style={{ width: "100px" }} styleType="delete" onClick={
            () => {
                onHandleDelete(e.original.ID, e.original, e);
                //setRelaod({});
            }}>REMOVE</AmButton>,
    }

    ];

    const onHandleDelete = (v, o, rowdata) => {
        let idx = dataSource.findIndex(x => x.ID === v);
        dataSource.splice(idx, 1);
        setDataSource(dataSource);
        setRelaod({})
        //setDeleteFlag(true)
    }

    const btnAdd = <AmButton className="float-right" styleType="add" style={{ width: "150px" }} onClick={() => { setDialog(true); setAddData(true); setTitle("Add"); }}>
        {'ADD'}
    </AmButton>


    const primaryFilterList = [
        {
            "field": "Doccode",
            "component": (condition, cols, key) => {
                return (
                    <div key={key} style={{ display: "inline-block" }}>
                        <FormInline>
                            <LabelH>Document : </LabelH>
                            <InputDiv>
                                <AmDropdown
                                    id={"Doccode"}
                                    placeholder={"Select Document"}
                                    fieldDataKey="issuedDocID" //ฟิล์ดดColumn ที่ตรงกับtable ในdb 
                                    fieldLabel={["Code"]} //ฟิล์ดที่ต้องการเเสดงผลใน optionList และ ช่อง input
                                    labelPattern=" : " //สัญลักษณ์ที่ต้องการขั้นระหว่างฟิล์ด
                                    width={300} //กำหนดความกว้างของช่อง input                                    
                                    ddlMinWidth={300} //กำหนดความกว้างของกล่อง dropdown
                                    //valueData={value} //ค่า value ที่เลือก
                                    queryApi={DocmentGI}                                  
                                    onChange={(value, dataObject, field) => onHandleDDLChangeDoc(value, dataObject, field)}
                                    ddlType={"search"} //รูปแบบ Dropdown 
                                />
                            </InputDiv>
                        </FormInline>
                    </div>
                )
            }
        },
      {
            "field": "actiontime",
            "component": (condition, cols, key) => {
                return (
                    <div key={key} style={{ display: "inline-block" }}>
                        <FormInline>
                            <LabelH>ActiomTime : </LabelH>
                            <InputDiv>
                                {moment(actiontimes).format("YYYY-MM-DDTHH:mm") ?
                                    <label>{moment(actiontimes).format("YYYY-MM-DD HH:mm")}</label>
                                    :null}
                            </InputDiv>
                        </FormInline>
                    </div>
                )
          }



        },];



    const onHandleDDLChangeDoc = (value, dataObject, field) => {
        if (value !== null || value !== undefined) {
            if (dataObject !== null) {
                console.log(value)
                setdocIds(value)
                let docItem = {
                    "issuedDocID": value
                    }
                docItems.push(docItem)
                setactiontimes(dataObject.ActionTime)     
                if (dataObject !== null) {
                    onChangeEditor(field, value, dataObject[field], dataObject.ActionTime, "Doccode", dataObject.Code)
                }
            }
        } else { }

    }

    const onHandleEditConfirm = (status, rowdata) => {
        console.log(rowdata)
        if (status) {
            var chkData = dataSource.filter(x => {
                return x.ID === rowdata.ID
            })

            if (chkData.length > 0) {
                for (let row in editData) {
                    chkData[0][row] = editData[row]

                }
            }
            else {
                //console.log(editData["actiontime"])
                let actiontimes = moment(editData["actiontime"]).format("YYYY-MM-DD HH:mm")
                let editDatas = {
                   "ID": editData["ID"],
                    "Doccode": editData["Doccode"] ,
                    "actiontime": actiontimes 

                }
                dataSource.push(editDatas)
            }

        }
        setEditData()
        setAddDataID(addDataID + 1);
        setAddData(false)
        setDialog(false)
        setDataSource(dataSource);
        setDatacreateDoc();
    }
    const onChangeEditor = (field, rowdata, value, actiontimes, pair, dataPair) => {
        if (addData) {
            if (editData) {
                editData[field] = value;
                if (field === "Doccode") {
                    actiontimes ? editData["actiontime"] = actiontimes : delete editData["actiontime"]
                }
                if (pair) {
                    editData[pair] = dataPair;
                }
                //addData["actiontime"] = actiontime;
                setEditData(editData);

            } else {            
                let addData = {};
                addData["ID"] = addDataID;
                addData[field] = value;
                if (field === "Doccode") {
                    console.log(actiontimes)
                    actiontimes ? addData["actiontime"] = actiontimes : delete addData["actiontime"]
                }
                if (pair) {
                    addData[pair] = dataPair;
                }
                //addData["actiontime"] = actiontime;
                setEditData(addData);

            }
        } else { // EDIT
            if (editData !== undefined) {
                let editRowX = editData.original ? { ...editData.original } : { ...editData };
                editRowX[field] = value;
                if (field === "Doccode") {
                    actiontimes ? editRowX["actiontime"] = actiontimes : delete editRowX["actiontime"]
                }

                if (pair) {
                    editRowX[pair] = dataPair;
                }
                setEditData(editRowX);
            }
        }

    }

    const setDatacreateDoc = () => {
        if (dataSource !== [] || dataSource !== undefined) {
            console.log(dataSource)
            //let docItems = []
            let BaseSto = {}
            let Items = {}
            dataSource.map((x, idx) => {
                console.log(x)
                Items = {
                    " issuedDocID": docItems
                }

                //docItems.push(Items)
            })
            console.log(docItems)
            dataCreate["docItems"] = docItems
            //dataCreate["BaseSto"] = BaseSto
        }
    
    }

    const apicreate = "/v2/CreateLDDocAPI/"  //API สร้าง Doc
    const apiRes = "/loading/detail?docID=" 

    return (
        <div>
            <AmCreateDocument
                headerCreate={headerCreates} //ข้อมูลตรงด้านบนตาราง
                dataSource={dataSource}
                reload={reload}
                //columns={columns}  //colums 
                //columnEdit={columnEdit} //ข้อมูลที่จะแก้ไขใน popUp 
                apicreate={apicreate} //api ที่จะทำการสร้างเอกสาร
                createDocType={"load"} //createDocType มี audit issue recive
                columnsModifi={columnsModifi}
                history={props.history} //ส่ง porps.history ไปทุกรอบ
                apiRes={apiRes} //หน้ารายละเอียดเอกสาร    
                btnProps={btnAdd}
                dataCreate={dataCreate}
                movementTypeID={"1011"}
            >
            </AmCreateDocument>

            <AmEditorTable
                style={{ width: "600px", height: "500px" }}
                titleText={title}
                open={dialog}
                onAccept={(status, rowdata) => onHandleEditConfirm(status, rowdata)}
                data={editData}
                columns={primaryFilterList}
            />
            <AmDialogs typePopup={"error"} content={msgDialog} onAccept={(e) => { setStateDialogErr(e) }} open={stateDialogErr}></AmDialogs >
            <div >
            </div>
        </div>

    )
}

export default CreateDocumentLD;
