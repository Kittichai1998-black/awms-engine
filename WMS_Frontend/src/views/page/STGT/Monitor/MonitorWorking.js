import * as signalR from '@aspnet/signalr';

// import Axios from 'axios'
import React, { useState, useEffect } from 'react'

import AmDropdown from '../../../../components/AmDropdown';
import AmIconStatus from "../../../../components/AmIconStatus";
import AmPageDashboard from '../../../../components/AmPageDashboard';
// import { createQueryString } from '../../../../components/function/CoreFunction'

//type time,datetime,datelog
const headercol1 = [
    { accessor: "ActualTime", Header: "Time", className: 'center', width: 100, type: "time", sortable: false, style: { textAlign: "center" } },
    { accessor: "Gate", Header: "Gate", width: 80, sortable: false, style: { textAlign: "center" } },
    { accessor: "Pallet_Code", Header: "Pallet", width: 140, sortable: false, style: { textAlign: "center" } },
    { accessor: "Product", Header: "Reorder", sortable: false },
    // { accessor: "Sou_Area", Header: "Source", width: 100, sortable: false },
    // { accessor: "Cur_Area", Header: "Current", width: 170, sortable: false },
    // { accessor: "Des_Area", Header: "Destination", width: 160, sortable: false },
    { accessor: "OrderNo", Header: "SI", width: 100, sortable: false, style: { textAlign: "center" } },
    { accessor: "Qty", Header: "Qty", width: 100, sortable: false },
    { accessor: "Document_Code", Header: "Doc No.", width: 160, sortable: false, style: { textAlign: "center" } },
]

const headercol2 = [
    { accessor: "TIME", Header: "Time", className: 'center', width: 100, type: "time", sortable: false, style: { textAlign: "center" } },
    { accessor: "TaskName", Header: "Task", width: 130, sortable: false, style: { textAlign: "center" }, Cell: row => <AmIconStatus styleType={row.value} style={{ fontSize: '1em', fontWeight: '600' }}>{row.value}</AmIconStatus> },
    // { accessor: "Priority", Header: "Priority", type: "priority", width: 80, sortable: false, style: { textAlign: "center" } },
    { accessor: "Pallet_Code", Header: "Pallet", width: 140, sortable: false, style: { textAlign: "center" } },
    { accessor: "Product", Header: "Reorder", sortable: false },
    { accessor: "OrderNo", Header: "SI", width: 100, sortable: false, style: { textAlign: "center" } },
    { accessor: "Qty", Header: "Qty", width: 100, sortable: false },
    // { accessor: "Remark", Header: "Remark", sortable: false },
    // { accessor: "Des_Area", Header: "Destination", width: 160, sortable: false },
    { accessor: "Document_Code", Header: "Doc No.", width: 160, sortable: false, style: { textAlign: "center" } },
]

export default props => {

    const [Hub, setHub] = useState(["DASHBOARD_WORKING_OUT_ALL", "DASHBOARD_WORKING_IN_ALL"])
    const [data, setData] = useState([
        [ //row
            { //col 
                type: null,
                table: [
                    { //table in col
                        data: [],
                        headercol: headercol1,
                        title: "Outbound"
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
                        headercol: headercol2,
                        title: "Inbound"
                    }
                ]
            }
        ]
    ])

    let url = window.apipath + '/dashboard'
    let connection = new signalR.HubConnectionBuilder()
        .withUrl(url, {
            skipNegotiation: true,
            transport: signalR.HttpTransportType.WebSockets //1
        })
        // .configureLogging(signalR.LogLevel.Information)
        .build();

    const signalrStart = () => {
        connection.start()
            .then(() => {
                connection.on(Hub[0], res => {
                    console.log(JSON.parse(res));
                    data[0][0].table[0].data = JSON.parse(res)
                    setData([...data])
                })
                connection.on(Hub[1], res => {
                    console.log(JSON.parse(res));
                    data[1][0].table[0].data = JSON.parse(res)
                    setData([...data])
                })
            })
            .catch((err) => {
                console.log(err);
                setTimeout(() => signalrStart(), 5000);
            })
    };

    useEffect(() => {
        signalrStart()

        connection.onclose((err) => {
            if (err) {
                signalrStart()
            }
        });

        return () => {
            connection.stop()
        }
    }, [Hub])

    const time = {
        format: "DD/MM/YYYY HH:mm:ss", //formet in moment
        // label: "Date/Time"
    }

    // const optionsArea = [
    //     { value: "L", label: 'Loading Area' },
    //     { value: "P", label: 'Production Area' }
    // ]

    // const dropdown = {
    //     label: "Areas",
    //     dropdown: (
    //         <AmDropdown
    //             id={"dd_area"}
    //             placeholder="Select"
    //             fieldDataKey="value" //ฟิล์ดด Column ที่ตรงกับ table ในdb 
    //             // fieldLabel={dropdown.fieldLabel} //ฟิล์ดที่ต้องการเเสดงผลใน optionList และ ช่อง input
    //             labelPattern=" : " //สัญลักษณ์ที่ต้องการขั้นระหว่างฟิล์ด
    //             // width={250} //กำหนดความกว้างของช่อง input
    //             ddlMinWidth={230} //กำหนดความกว้างของกล่อง dropdown
    //             // queryApi={dataMovementType}
    //             data={optionsArea} //request {value,label}
    //             defaultValue={'L'} //value เรื่มต้น
    //             onChange={(value, dataObject, inputID, fieldDataKey) => onHandleDDLChange(value)}
    //             ddlType={"search"} //รูปแบบ Dropdown 
    //         />
    //     )
    // }

    // const onHandleDDLChange = (value) => {
    //     if (value) {
    //         if (value === "L") {
    //             setHub(["DASHBOARD_WORKING_IN_LS", "DASHBOARD_WORKING_OUT_LD"])
    //         } else {
    //             setHub(["DASHBOARD_WORKING_IN_PS", "DASHBOARD_WORKING_OUT_PD"])
    //         }
    //     }
    // };

    return (
        <AmPageDashboard
            time={time}
            // dropdown={dropdown}
            coltable={data}
        />
    )
}
