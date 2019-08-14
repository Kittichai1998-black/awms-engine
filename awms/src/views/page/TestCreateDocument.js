import React, { Component, useState, useEffect } from "react";
import AmCreateDocument from '../../components/AmCreateDocument'
import AmButton from "../../components/AmButton";




const TestCreateDocument = (props) => {

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

    const MovementType = {
        queryString: window.apipath + "/v2/SelectDataMstAPI/",
        t: "MovementType",
        q: '[{ "f": "Status", "c":"<", "v": 2}]',
        f: "ID, ID as MoveID,Code,Name,concat(Code, ':' ,Name) as Movements",
        g: "",
        s: "[{'f':'ID','od':'asc'}]",
        sk: 0,
        l: 100,
        all: "",
    }

    const Locations = {
        queryString: window.apipath + "/v2/SelectDataMstAPI/",
        t: "AreaLocationMaster",
        q: '[{ "f": "Status", "c":"<", "v": 2}]',
        f: "ID,Code,Name,Code as locationcode,ID as LocationID",
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

    const columsFindpopUpLocation = [
        {
            Header: 'Code',
            accessor: 'Code',
            fixed: 'left',
            width: 130,
            sortable: true,
        }, {
            Header: 'Name',
            accessor: 'Name',
            width: 200,
            sortable: true,
        },]

    //Create Audit////




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
    



    const headerCreates = [
        [{ label: "SAP Document", type: "labeltext", key: "sapdoc", texts: "-" }, { label: "Document Date", type: "dateTime", key: "documentDate" }],
        [{ label: "Action Time", type: "dateTime", key: "actionTime" }, { label: "Remark", type: "input", key: "remark", style: { width: "200px" } }],
        [{ label: "Source Branch", type: "labeltext", key: "souBranchID", texts: "1100 : THIP", valueTexts: 1 }, { label: "Source Warehouse", type: "labeltext", key: "souWarehouseID", texts: "5005 : ASRS", valueTexts: 1 }],
        [{ label: "MoveMent Type", type: "labeltext", key: "movementTypeID", texts: "Text MoveMentType", valueTexts: "100101" }],
       // [{ label: "Movement Type :", type: "dropdown", key: "movementTypeID", pair: "MoveID", idddl: "Movements", queryApi: MovementType, fieldLabel: ["Code", "Name"], placeholder: "Select", defaultValue: "1013" }],

    ];
   
    const columnEdit = [{ Header: 'Pallet Code', accessor: 'palletcode', type: "input" },
        {
            Header: 'Location Code',
            accessor: 'locationcode',
            type: "findPopUp", pair: "locationcode",
            idddl: "locationcode",
            queryApi: Locations,
            fieldLabel: ["Code", "Name"],
            columsddl:columsFindpopUpLocation,
            placeholder: "Select Locations"
        },
    //{ Header: "SKU Items", accessor: 'SKUItems', type: "dropdown", pair: "SKUIDs", idddl: "skuitems", queryApi: SKUMaster, fieldLabel: ["Code", "Name"] },   
        { Header: "SKU Items", accessor: 'SKUItems', type: "findPopUp", pair: "skuCode", idddl: "skuitems", queryApi: SKUMaster, fieldLabel: ["Code", "Name"], columsddl: columsFindpopUp, placeholder:"Select SKU"},
        { Header: 'Batch', accessor: 'Batch', type: "input", validate: /^[0-9\.]+$/  },
        { Header: "Quantity", accessor: 'quantity', type: "inputNum" },
        { Header: "Random", accessor: 'qtyrandom', type: "inputNum", TextInputnum: "%" },
        { Header: "Unit", accessor: 'unitType', type: "unitType", },

    ];



    //const columnsModifi = [{ Header: 'Pallet Code', accessor: 'palletCode', },
    //{ Header: 'Location Code', accessor: 'locationCode', },
    //{ Header: "SKU Items", accessor: 'SKUItems', },
    //{ Header: 'Batch', accessor: 'Batch', },
    //{ Header: "Quantity", accessor: 'quantity' },
    //    { Header: "Unit", accessor: 'unitType', },
    //    {Header: "", Cell: (e) => <AmButton style={{ width: "100px" }} styleType="delete">REMOVE Page</AmButton>,
    //    }
    //    //
    //];


    const columns = [{ Header: 'Pallet Code', accessor: 'palletcode', },
    { Header: 'Location Code', accessor: 'locationcode', },
    { Header: "SKU Items", accessor: 'SKUItems', },
    { Header: 'Batch', accessor: 'Batch', },
    { Header: "Quantity", accessor: 'quantity' },
    { Header: "Random", accessor: 'qtyrandom' },
    { Header: "Unit", accessor: 'unitType', },

    ];

    const apicreate = "/v2/CreateADDocAPI/"  //API สร้าง Doc
    const apiRes = "/" //path หน้ารายละเอียด ตอนนี้ยังไม่เปิด



    //const btnAdd = <AmButton className="float-right" styleType="add" style={{ width: "150px" }} onClick={SetdataSource}>
    //    {'ADD'}
    //</AmButton>


    return (

        <div>
            <AmCreateDocument
                headerCreate={headerCreates} //ข้อมูลตรงด้านบนตาราง
                //columnsModifi={columnsModifi} //ใช้เฉพาะหน้าที่ต้องทำปุ่มเพิ่มขึ้นมาใหม่
                columns={columns}  //colums 
                columnEdit={columnEdit} //ข้อมูลที่จะแก้ไขใน popUp 
                apicreate={apicreate} //api ที่จะทำการสร้างเอกสาร
                createDocType={"audit"} //createDocType มี audit issue recive
                history={props.history} //ส่ง porps.history ไปทุกรอบ
                apiRes={apiRes} //หน้ารายละเอียดเอกสาร
                //btnProps={btnAdd}  //ปุ่มที่ส่งเข้าไป
                //dataSource={dataSou} //ข้อมูลที่จัดการจากปุ่มที่ส่งเข้าไป
               // dataCreate={} //dataที่จะส่งไปสร้างเอกสาร
            >
            </AmCreateDocument>

            <div >

            </div>

        </div>

    )
}

export default TestCreateDocument;
