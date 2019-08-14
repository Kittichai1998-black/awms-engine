import * as signalR from '@aspnet/signalr';
import Axios from 'axios'
import React, { useState, useEffect } from 'react'

import { createQueryString } from '../../components/function/CoreFunction'
import AmDropdown from '../../components/AmDropdown';
import AmIconStatus from "../../components/AmIconStatus";
import AmPageDashboard from '../../components/AmPageDashboard';
import jsonsignalr from '../../components/jsonsignalr'

export default props => {

    const [valueDD, setValueDD] = useState('2,3')
    const [areaIDOnFloor, setAreaIDOnFloor] = useState("8,9");

    const headercol1 = [
        { accessor: "Time", Header: "Time", className: 'center', sortable: false },
        { accessor: "AreaLoc_Code", Header: "Gate", className: 'center', style: { fontWeight: '900' }, sortable: false },
        { accessor: "MVT", Header: "MVT", className: 'center', sortable: false },
        { accessor: "Base_Code", Header: "Pallet", sortable: false },
        { accessor: "Product", Header: "Product", sortable: false },
        { accessor: "QtyUnit", Header: "Qty", sortable: false },
        { accessor: "Destination", Header: "Des", sortable: false },
        { accessor: "Document_Code", Header: "Doc No.", sortable: false },
        { accessor: "SAPRef", Header: "SAP.Doc No.", sortable: false }
    ]
    const headercol2 = [
        { accessor: "baseUnitType", Header: "Unit Type", className: 'center', sortable: false },
        { accessor: "bstoCode", Header: "Base Code", className: 'center', style: { fontWeight: '900' }, sortable: false },
        { accessor: "bstoName", Header: "Base Name", className: 'center', sortable: false },
        { accessor: "pstoCode", Header: "Pack Code", sortable: false },
        { accessor: "pstoEventStatus", Header: "Status", sortable: false },
        { accessor: "pstoName", Header: "Pack Name", sortable: false }
    ]

    const [data, setData] = useState([
        [ //row
            { //col 1
                type: 'col', //row,col
                table: [
                    { //table in col
                        data: [],
                        headercol: headercol1
                    },
                    { //table in col
                        data: jsonsignalr,
                        headercol: headercol2
                    }
                ]
            },
            { //col 2
                type: "col", //row,col
                table: [
                    { //table in col
                        data: jsonsignalr,
                        headercol: headercol2
                    }
                ]
            }
        ],
        [ //row
            { //col 
                type: null,
                table: [
                    { //table in col
                        data: [],
                        headercol: headercol1
                    }
                ]
            }
        ]
    ])

    useEffect(() => {
        // let config = {
        //     headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json; charset=utf-8', 'accept': 'application/json' }
        // };
        // const url = window.apipath + "/dashboard/"
        // const connection = new signalR.HubConnectionBuilder()
        //     .withUrl(url, options => {
        //         options.UseDefaultCredentials = true;
        //     })
        //     .configureLogging(signalR.LogLevel.Trace)
        //     .build();

        // connection.start().catch(er => console.error(er.toString()))

        // connection.on("ReceiveMessage", (user, message) => {
        //     const li = document.createElement("li");
        //     li.textContent = user + " says " + message;
        //     document.getElementById("messagesList").appendChild(li);
        // });

        // connection.start().catch(err => console.error(err.toString()));
        // console.log("ef1");
        const qData = [
            { 'f': 'IOType', c: '=', 'v': 1 },
            { 'f': 'AreaID', c: 'in', 'v': valueDD }
        ]
        workingOutselect.q = JSON.stringify(qData)
        stoSP = window.apipath + "/api/report/sp?apikey=FREE01&AreaIDs=" + areaIDOnFloor
            + "&spname=DASHBOARD_TASK_ON_FLOOR";
        getData()
    }, [valueDD]);


    const sData = [
        { 'f': 'Status', 'od': 'asc' },
        { 'f': 'IIF(Status = 1, Time, null)', 'od': 'asc' },
        { 'f': 'IIF(Status = 3, Time, null)', 'od': 'desc' }
    ]
    const workingOutselect = {
        queryString: window.apipath + "/v2/SelectDataViwAPI/",
        t: "r_DashboardMoveOut",
        f: "ID,Time,Document_Code,AreaID,AreaLoc_Code,Base_Code,Pack_Code,Pack_Name,Product,Destination,MVT,SAPRef,QtyUnit,EventStatus",
        g: "",
        s: JSON.stringify(sData),
        sk: 0,
        l: 20,
        all: ""
    }

    let stoSP = ""

    useEffect(() => {
        // console.log("ef3");

        var refresh = setInterval(() => {
            getData()
        }, 5000);
        return () => {
            clearInterval(refresh);
        };
    }, [])

    const time = {
        format: "DD/MM/YYYY HH:mm:ss", //formet in moment
        label: "Date/Time : "
    }

    const optionsArea = [
        { value: '0', label: 'All Area' },
        { value: '2', label: 'Front Area' },
        { value: '3', label: 'Rear Area' }
    ]

    const dropdown = {
        label: "Select :",
        dropdown: (
            <AmDropdown
                // id={idddl}
                placeholder="Select"
                fieldDataKey="value" //ฟิล์ดด Column ที่ตรงกับ table ในdb 
                // fieldLabel={dropdown.fieldLabel} //ฟิล์ดที่ต้องการเเสดงผลใน optionList และ ช่อง input
                labelPattern=" : " //สัญลักษณ์ที่ต้องการขั้นระหว่างฟิล์ด
                // width={250} //กำหนดความกว้างของช่อง input
                ddlMinWidth={230} //กำหนดความกว้างของกล่อง dropdown
                // queryApi={dataMovementType}
                data={optionsArea} //request {value,label}
                // defaultValue={0} value เรื่มต้น
                onChange={(value, dataObject, inputID, fieldDataKey) => onHandleDDLChange(value)}
                ddlType={"search"} //รูปแบบ Dropdown 
            />
        )
    }

    const onHandleDDLChange = (value) => {
        setValueDD(value);
        if (value === '2') {
            setAreaIDOnFloor('8');
        } else if (value === '3') {
            setAreaIDOnFloor('9');
        } else {
            setValueDD("2,3");
            setAreaIDOnFloor("8,9");
        }
    };

    const getData = () => {
        Axios.get(createQueryString(workingOutselect)).then((res) => {
            data[0][0].table[0].data = res.data.datas
            // console.log(res.data.datas);
            setData([...data])
        })
        Axios.get(stoSP).then((res) => {
            data[1][0].table[0].data = res.data.datas
            // console.log(res.data.datas);
            setData([...data])
        })
    }

    return (
        <AmPageDashboard
            time={time}
            dropdown={dropdown}
            coltable={data}
        />
    )
}
