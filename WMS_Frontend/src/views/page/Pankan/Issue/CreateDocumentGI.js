import React, { Component, useState, useEffect } from "react";
import AmCreateDocument from '../../../../components/AmCreateDocument'
import AmButton from '../../../../components/AmButton'
import AmEditorTable from '../../../../components/table/AmEditorTable'
import AmInput from '../../../../components/AmInput'
import AmDropdown from '../../../../components/AmDropdown'
import AmFindPopup from '../../../../components/AmFindPopup'
import styled from 'styled-components'
import AmDialogs from '../../../../components/AmDialogs'
import AmTable from '../../../../components/table/AmTable'
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
const CreateDocumentGI = (props) => {
    const [addData, setAddData] = useState(false);
    const [editDatas, setEditDatas] = useState(false);
    const [dialog, setDialog] = useState(false);
    const [dialogAdd, setDialogAdd] = useState(false);
    const [editData, setEditData] = useState(false);
    const [addDataID, setAddDataID] = useState(0);
    const [title, setTitle] = useState("");
    const [dataSource, setDataSource] = useState([]);
    const [reload, setRelaod] = useState();
    const [units, setunits] = useState("");
    const [datasBase, setdatasBase] = useState();
    const [skuIDs, setskuIDs] = useState();
    const [skuCodes, setskuCodes] = useState();
    const [ParentStorageObjects, setParentStorageObjects] = useState();
    const [stateDialogErr, setStateDialogErr] = useState(false);
    const [stateDialog, setStateDialog] = useState(false);
    const [msgDialog, setMsgDialog] = useState("");
    const [baseIDs, setbaseIDs] = useState(25);
    const [skubyBase, setskubyBase] = useState();
    const [dataCreate, setdataCreate] = useState([]);



    //useEffect(() => {
    //    setParentStorageObjects({
    //        queryString: window.apipath + "/v2/SelectDataViwAPI/",
    //        t: "ParentStorageObject",
    //        q: "[{ 'f': 'SKUMaster_ID', c: '=', 'v': " + skuIDs + " }]",
    //        f: "SKUMaster_ID,SKUMaster_Code,SKUMaster_Name,ParentStorageObject_ID,ParentStorageObject_Code as BaseCode",
    //        g: "",
    //        s: "[{'f':'SKUMaster_ID','od':'asc'}]",
    //        sk: 0,
    //        l: 100,
    //        all: "",
    //    })
    //}, [skuIDs, units])



    useEffect(() => {
        setskubyBase({
            queryString: window.apipath + "/v2/SelectDataViwAPI/",
            t: "BstoAndPsto",
            q: '[{ "f": "bstoID", c: "=", "v":" ' + baseIDs + ' "}]',
            f: "bstoID,bstoCode,pstoCode,pstoName,pstoID,concat(pstoCode, ':' ,pstoName) as SKUItems,pstoUnitCode as UnitTypeCode,pstoCode as skuCode,pstoCode as Code",
            g: "",
            s: "[{'f':'bstoID','od':'asc'}]",
            sk: 0,
            l: 100,
            all: "",
        })

    }, [baseIDs])



    const SKUbyPallet = {
        queryString: window.apipath + "/v2/SelectDataViwAPI/",
        t: "BstoAndPsto",
        q: '[{ "f": "bstoID", c: "=", "v":" ' + baseIDs +' "}]',
        f: "bstoID,bstoCode,pstoCode,pstoName,pstoID,concat(pstoCode, ':' ,pstoName) as SKUItems,pstoUnitCode as UnitTypeCode",
        g: "",
        s: "[{'f':'bstoID','od':'asc'}]",
        sk: 0,
        l: 100,
        all: "",
 }


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

    const Branchs = {
        queryString: window.apipath + "/v2/SelectDataMstAPI/",
        t: "Branch",
        q: '[{ "f": "Status", "c":"=", "v": 1}]',
        f: "ID,Code,Name",
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


    const BaseSto = {
        queryString: window.apipath + "/v2/SelectDataViwAPI/",
        t: "BstoAndPsto",
        q: '[{ "f": "bstoStatus", "c":"=", "v": 1}]',
        f: "bstoID,bstoCode,pstoCode,pstoName,bstoCode as BaseCode",
        g: "",
        s: "[{'f':'bstoID','od':'asc'}]",
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


    const columsFindpopUpSKUbase = [
        {
            Header: 'Code',
            accessor: 'pstoCode',
            fixed: 'left',
            width: 130,
            sortable: true,
        },
        {
            Header: 'Name',
            accessor: 'pstoName',
            width: 200,
            sortable: true,
        },
    ];

    const headerCreates = [
        [{ label: "Document Code", type: "labeltext", key: "documentCode", texts: "-" },
        { label: "Document Date", type: "dateTime", key: "documentDate" }],
        [{ label: "Action Time", type: "dateTime", key: "actionTime" },
        { label: "Remark", type: "input", key: "remark", style: { width: "200px" } }],
        [{
            label: "Branch:", type: "dropdown", key: "souBranchID",
            idddl: "souBranchID", queryApi: Branchs, fieldLabel: ["Code", "Name"]
        },
        {
            label: "Warehouse", type: "dropdown", key: "souWarehouseID",
            idddl: "souWarehouseID", queryApi: Warehouses, fieldLabel: ["Code", "Name"]
        },],
        [{
            label: "Customer", type: "dropdown", key: "desCustomerID",
            idddl: "desCustomerID", queryApi: Customers, fieldLabel: ["Code", "Name"]
        },
        { label: "Doc Status", type: "labeltext", texts: "New" }],

    ];



    const columnsModifi = [
        { Header: "Base", accessor: 'BaseCode' },
        { Header: "SKU Items", accessor: 'SKUItems', },
    { Header: "Quantity", accessor: 'quantity' },
    { Header: "Unit", accessor: 'unitType', },
    { Header: "", width: 110, Cell: (e) => <AmButton style={{ width: "100px" }} styleType="info" onClick={() => { setEditData(e); setDialog(true); setTitle("Edit") }}>Edit</AmButton>, },
    {
        Header: "", width: 110, Cell: (e) => <AmButton style={{ width: "100px" }} styleType="delete" onClick={
            () => {
                onHandleDelete(e.original.ID, e.original, e);
                //setRelaod({});
            }}>REMOVE</AmButton>,
    }

    ];


    const columns = [
        { Header: "SKU Items", accessor: 'SKUItems', },
        { Header: "Base", accessor: 'baseCode' },
        { Header: "Quantity", accessor: 'quantity' },
        { Header: "Unit", accessor: 'unitType', },
    ];

    const columnEdit = [
        {
            Header: "SKU Items", accessor: 'SKUItems', type: "selectBase", pair: "skuCode", idddl: "skuitems",
            queryApi: SKUMaster, fieldLabel: ["Code", "Name"], columsddl: columsFindpopUp,
            placeholder: "Select SKU"
        },
        {
            Header: "Base", accessor: 'base', type: "bases",
            key: "baseCode", idddl: "baseCode", placeholder: "Select Base",
            pair: "baseCode",
        },
        { Header: "Quantity", accessor: 'quantity', type: "inputNum" }, ,
        { Header: "Unit", accessor: 'unitType', type: "unitType" },
    ]

    const onHandleDelete = (v, o, rowdata) => {
        let idx = dataSource.findIndex(x => x.ID === v);
        dataSource.splice(idx, 1);
        setDataSource(dataSource);
        setRelaod({})
        //setDeleteFlag(true)
    }

    const btnAdd = <div>     
        <AmButton className="float-right" styleType="info" style={{ width: "100px",paddingLeft:"10px" }} onClick={() => { setDialog(true); setAddData(true); setTitle("Add"); }}>
            {'Base'}
            </AmButton>
        <AmButton className="float-right" styleType="add" style={{ width: "100px",marginLeft:"10px" }} onClick={() => { setDialogAdd(true); setAddData(true); setTitle("Add"); }}>
        {'ADD'}
            </AmButton>             
    </div>
     

    const primaryFilterList = [
        {

            "field": "BaseCode",
            "component": (condition, cols, key) => {
                return (
                    <div key={key} style={{ display: "inline-block" }}>
                        <FormInline>
                            <LabelH>Base : </LabelH>

                            <InputDiv>
                                <AmDropdown
                                    id={"BaseCode"}
                                    placeholder={"Select Base"}
                                    fieldDataKey="bstoID" //ฟิล์ดดColumn ที่ตรงกับtable ในdb 
                                    fieldLabel={["bstoCode"]} //ฟิล์ดที่ต้องการเเสดงผลใน optionList และ ช่อง input
                                    labelPattern=" : " //สัญลักษณ์ที่ต้องการขั้นระหว่างฟิล์ด
                                    width={300} //กำหนดความกว้างของช่อง input
                                    ddlMinWidth={300} //กำหนดความกว้างของกล่อง dropdown
                                    //valueData={value} //ค่า value ที่เลือก
                                    queryApi={BaseSto}
                                    //returnDefaultValue={true}
                                    //defaultValue={baseIDs}
                                    onChange={(value, dataObject, field) => onHandleDDLChangeBse(value, dataObject, field)}
                                    ddlType={"search"} //รูปแบบ Dropdown 
                                />
                            </InputDiv>
                        </FormInline>
                    </div>
                )

            }
        },

        {
            "field": "SKUItems",
            "component": (condition, cols, key) => {
                return (
                    <div key={key} style={{ display: "inline-block" }}>
                        <FormInline>
                            <LabelH>SKU : </LabelH>
                            <InputDiv>
                                <AmFindPopup
                                    id={"SKUItems"}
                                    placeholder={"Select SKU"}
                                    fieldDataKey="pstoID" //ฟิล์ดดColumn ที่ตรงกับtable ในdb 
                                    fieldLabel={["pstoCode", "pstoName"]} //ฟิล์ดที่ต้องการเเสดงผลใน optionList และ ช่อง input
                                    labelPattern=" : " //สัญลักษณ์ที่ต้องการขั้นระหว่างฟิล์ด
                                    width={300} //กำหนดความกว้างของช่อง input
                                    columns={columsFindpopUpSKUbase}
                                    ddlMinWidth={300} //กำหนดความกว้างของกล่อง dropdown
                                    //valueData={value} //ค่า value ที่เลือก
                                    queryApi={skubyBase}
                                    //returnDefaultValue={true}
                                    //defaultValue={skuIDs}
                                    onChange={(value, dataObject, field) => onHandleDDLChangeSKU(value, dataObject, field)}
                                    ddlType={"search"} //รูปแบบ Dropdown 
                                />
                            </InputDiv>
                        </FormInline>
                    </div>
                )
            }
        },
        {
            "field": "quantity",
            "component": (condition, cols, key) => {
                return (
                    <div key={key} style={{ display: "inline-block" }}>
                        <FormInline>
                            <LabelH>Quantity : </LabelH>
                            <InputDiv>
                                <AmInput style={{ width: "300px" }}
                                    defaultValue={""}
                                    type="number"
                                    onChange={(ele) => { onChangeEditor(cols.field, ele.value, ele) }}
                                />
                            </InputDiv>
                        </FormInline>
                    </div>
                )
            }
        },
        {
            "field": "unitType",
            "component": (condition, cols, key) => {
                return (
                    <div key={key} style={{ display: "inline-block" }}>
                        <FormInline>
                            <LabelH>Unit : </LabelH>
                            <InputDiv>
                                {<label>{units}</label>}
                            </InputDiv>
                        </FormInline>
                    </div>
                )
            }
        },];


    const primaryFilterListAdd = [
        {
            "field": "SKUItems",
            "component": (condition, cols, key) => {
                return (
                    <div key={key} style={{ display: "inline-block" }}>
                        <FormInline>
                            <LabelH>SKU : </LabelH>
                            <InputDiv>
                                <AmFindPopup
                                    id={"SKUItems"}
                                    placeholder={"Select SKU"}
                                    fieldDataKey="ID" //ฟิล์ดดColumn ที่ตรงกับtable ในdb 
                                    fieldLabel={["Code", "Name"]} //ฟิล์ดที่ต้องการเเสดงผลใน optionList และ ช่อง input
                                    labelPattern=" : " //สัญลักษณ์ที่ต้องการขั้นระหว่างฟิล์ด
                                    width={300} //กำหนดความกว้างของช่อง input
                                    columns={columsFindpopUp}
                                    ddlMinWidth={300} //กำหนดความกว้างของกล่อง dropdown
                                    //valueData={value} //ค่า value ที่เลือก
                                    queryApi={SKUMaster}
                                    //returnDefaultValue={true}
                                    //defaultValue={skuIDs}
                                    onChange={(value, dataObject, field) => onHandleDDLChangeSKU(value, dataObject, field)}
                                    ddlType={"search"} //รูปแบบ Dropdown 
                                />
                            </InputDiv>
                        </FormInline>
                    </div>
                )
            }
        },
        {
            "field": "quantity",
            "component": (condition, cols, key) => {
                return (
                    <div key={key} style={{ display: "inline-block" }}>
                        <FormInline>
                            <LabelH>Quantity : </LabelH>
                            <InputDiv>
                                <AmInput style={{ width: "300px" }}
                                    defaultValue={""}
                                    type="number"
                                    onChange={(ele) => { onChangeEditor(cols.field, ele.value, ele) }}
                                />
                            </InputDiv>
                        </FormInline>
                    </div>
                )
            }
        },
         {
            "field": "unitType",
            "component": (condition, cols, key) => {
                return (
                    <div key={key} style={{ display: "inline-block" }}>
                        <FormInline>
                            <LabelH>Unit : </LabelH>
                            <InputDiv>
                                {<label>{units}</label>}
                            </InputDiv>
                        </FormInline>
                    </div>
                )
            }
        },];




    const onHandleDDLChangeBse = (value, dataObject, field) => {
        console.log(field)
        if (value !== null || value !== undefined) {
            if (dataObject !== null) {
                if (field === "base")
                    setbaseIDs(value)

                //onChangeEditor(field, value, dataObject.BaseCode, "bstoCode", dataObject[field])
                onChangeEditor(field, value, dataObject[field], dataObject.UnitTypeCode, "Code", dataObject.Code)
            }
        } else { }
    }

    const onHandleDDLChangeSKU = (value, dataObject, field) => {
        if (value !== null || value !== undefined) {
            if (dataObject !== null) {
                setskuIDs(dataObject.ID)
                setunits(dataObject.UnitTypeCode)
                setskuCodes(dataObject.Code)
                if (dataObject !== null) {
                    onChangeEditor(field, value, dataObject[field], dataObject.UnitTypeCode, "Code", dataObject.Code)
                }
            }
        } else { }

    }

    const onHandleEditConfirm = (status, rowdata) => {
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

                dataSource.push(editData)

            }

        }
        setEditData()
        setAddDataID(addDataID + 1);
        setAddData(false)
        setDialog(false)
        setDataSource(dataSource);
        setDatacreateDoc();
    }
    const onChangeEditor = (field, rowdata, value, UnitCode, pair, dataPair) => {
        if (addData) {
            if (editData) {
                editData[field] = value;
                if (field === "SKUItems") {
                    UnitCode ? editData["unitType"] = UnitCode : delete editData["unitType"]
                }
                if (pair) {
                    editData[pair] = dataPair;
                }

                setEditData(editData);

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
                setEditData(addData);

            }
        } else { // EDIT
            if (editData !== undefined) {
                let editRowX = editData.original ? { ...editData.original } : { ...editData };
                if (field === "SKUItems") {
                    UnitCode ? editRowX["unitType"] = UnitCode : delete editRowX["unitType"]
                }

                if (pair) {
                    editRowX[pair] = dataPair;
                }
                editRowX[field] = value;
                setEditData(editRowX);
            }
        }
    }

    const setDatacreateDoc = () => {
        if (dataSource !== [] || dataSource !== undefined) {
            console.log(dataSource)
            let itemIssue = []
            let BaseSto = {}
            let Items = {}
            dataSource.map((x, idx) => {
                console.log(x)
                BaseSto = {
                    "baseCode": x.BaseCode !== undefined ? x.BaseCode : null,
                    "quantity": null,
                    "isRegisBaseCode": null,
                    "isRegisBaseCode": null

                }

                Items = {
                    "packID": null,
                    "packCode": null,
                    "skuCode": x.Code,
                    "quantity": x.quantity,
                    "unitType": x.unitType,
                    "batch": null,
                    "lot": null,
                    "orderNo": null,
                    "refID": null,
                    "ref1": null,
                    "ref2": null,
                    "options": null,
                    "expireDate": null,
                    "productionDate": null,
                    "BaseSto": BaseSto


                }
                itemIssue.push(Items)

            })

            dataCreate["itemIssue"] = itemIssue
            //dataCreate["BaseSto"] = BaseSto
        }

        console.log(dataCreate)

    }

    const apicreate = "/v2/CreateGIDocAPI/"  //API สร้าง Doc
    const apiRes = "/issue/detail?docID=" //path หน้ารายละเอียด ตอนนี้ยังไม่เปิด


    return (
        <div>
            <AmCreateDocument
                headerCreate={headerCreates} //ข้อมูลตรงด้านบนตาราง
                dataSource={dataSource}
                // reload={reload}
                //columns={columns}  //colums 
                //columnEdit={columnEdit} //ข้อมูลที่จะแก้ไขใน popUp 
                apicreate={apicreate} //api ที่จะทำการสร้างเอกสาร
                createDocType={"issue"} //createDocType มี audit issue recive
                columnsModifi={columnsModifi}
                history={props.history} //ส่ง porps.history ไปทุกรอบ
                apiRes={apiRes} //หน้ารายละเอียดเอกสาร    
                btnProps={btnAdd}
                dataCreate={dataCreate}
                slectBase={true}
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

            <AmEditorTable
                style={{ width: "600px", height: "500px" }}
                titleText={title}
                open={dialogAdd}
                onAccept={(status, rowdata) => onHandleEditConfirm(status, rowdata)}
                data={editData}
                columns={primaryFilterListAdd}
            />

            <AmDialogs typePopup={"error"} content={msgDialog} onAccept={(e) => { setStateDialogErr(e) }} open={stateDialogErr}></AmDialogs >
            <div >
            </div>
        </div>

    )
}

export default CreateDocumentGI;
