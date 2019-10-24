import * as signalR from '@aspnet/signalr';
// import Axios from 'axios'
import React, { useState, useEffect } from 'react'

// import AmDropdown from '../../../../components/AmDropdown';
import AmIconStatus from "../../../../components/AmIconStatus";
import AmPageDashboard from '../../../../components/AmPageDashboard';
// import { createQueryString } from '../../../../components/function/CoreFunction'

//type time,datetime,datelog
const headercol1 = [
    { accessor: "ActualTime", Header: "Time", type: "time", sortable: false, width: 100, style: { textAlign: "center" } },
    { accessor: "doc_code", Header: "Doc No.", sortable: false, width: 160, style: { textAlign: "center" } },
    // { accessor: "Gate", Header: "Gate",  style: { fontWeight: '900' }, sortable: false },
    { accessor: "mvt_name", Header: "MVT", sortable: false, width: 100, style: { textAlign: "center" } },
    { accessor: "Product", Header: "Product", sortable: false },
    { accessor: "OrderNo", Header: "Order", sortable: false, width: 100, style: { textAlign: "center" } },

    { accessor: "qty", Header: "Qty/Total", sortable: false, width: 100, style: { textAlign: "center" } },
    // { accessor: "Destination", Header: "Destination", sortable: false },
]

const headercol2 = [
    { accessor: "Time", Header: "Time", width: 100, type: "time", sortable: false, style: { textAlign: "center" } },
    { accessor: "DocNo", Header: "Doc No.", width: 160, sortable: false, style: { textAlign: "center" } },
    {
        accessor: "TaskName", Header: "Task", width: 120, sortable: false, style: { textAlign: "center" },
        Cell: row => (
            <AmIconStatus styleType={row.value} style={{ fontSize: '1em', fontWeight: '600' }}>{row.value}</AmIconStatus>
        )
    },
    { accessor: "PalletCode", Header: "Pallet", width: 140, sortable: false },
    { accessor: "Product", Header: "Product", sortable: false },

    // { accessor: "LocationCode", Header: "Stage", width: 70, style: { fontWeight: '900' }, sortable: false },
    { accessor: "OrderNo", Header: "Order", width: 100, sortable: false },

    { accessor: "Qty", Header: "Qty", width: 100, className: 'right', sortable: false },
    // { accessor: "Destination", Header: "Destination", width: 170, sortable: false },

    // { accessor: "SAPRef", Header: "SAP.Doc No.", width: 160, sortable: false }
]

export default props => {

    // const [valueDD, setValueDD] = useState('DASHBOARD_PICKING_ALL')
    const [data, setData] = useState([
        [ //row
            { //col 
                type: null,
                table: [
                    { //table in col
                        data: [],
                        headercol: headercol1,
                        title: "Return Picking"
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
                        title: "Pallet Return"
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
                connection.on("DASHBOARD_COUNTING_1", res => {
                    console.log(JSON.parse(res));
                    data[0][0].table[0].data = JSON.parse(res)
                    setData([...data])
                })
                connection.on("DASHBOARD_COUNTING_2", res => {
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
    }, [])

    const time = {
        format: "DD/MM/YYYY HH:mm:ss", //formet in moment
        // label: "Date/Time"
    }

    // const optionsArea = [
    //     { value: 'DASHBOARD_PICKING_ALL', label: 'All Area' },
    //     { value: 'DASHBOARD_PICKING_1', label: 'Outbound FastWork' },
    //     { value: 'DASHBOARD_PICKING_2', label: 'Outbound AS/RS Location' }
    // ]

    // const dropdown = {
    //     label: "Select :",
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
    //             defaultValue={'0'} //value เรื่มต้น
    //             onChange={(value, dataObject, inputID, fieldDataKey) => onHandleDDLChange(value)}
    //             ddlType={"search"} //รูปแบบ Dropdown 
    //         />
    //     )
    // }

    // const onHandleDDLChange = (value) => {
    //     if (value) {
    //         setValueDD(value);
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
