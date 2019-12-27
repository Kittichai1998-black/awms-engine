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
    { accessor: "Priority", Header: "Priority", type: "priority", width: 80, sortable: false, style: { textAlign: "center" } },
    { accessor: "PalletCode", Header: "Pallet", width: 140, sortable: false, style: { textAlign: "center" } },
    { accessor: "PackName", Header: "Product", sortable: false },
    // { accessor: "Sou_Area", Header: "Source", width: 100, sortable: false },
    // { accessor: "Cur_Area", Header: "Current", width: 170, sortable: false },
    // { accessor: "Des_Area", Header: "Destination", width: 160, sortable: false },
    { accessor: "DocumentCode", Header: "Doc No.", width: 160, sortable: false, style: { textAlign: "center" } },
]

const headercol2 = [
    { accessor: "ActualTime", Header: "Time", className: 'center', width: 100, type: "time", sortable: false, style: { textAlign: "center" } },
    { accessor: "Priority", Header: "Priority", type: "priority", width: 80, sortable: false, style: { textAlign: "center" } },
    { accessor: "PalletCode", Header: "Pallet", width: 140, sortable: false, style: { textAlign: "center" } },
    { accessor: "PackName", Header: "Product", sortable: false },
    // { accessor: "Sou_Area", Header: "Source", width: 100, sortable: false },
    // { accessor: "Cur_Area", Header: "Current", width: 170, sortable: false },
    // { accessor: "Des_Area", Header: "Destination", width: 160, sortable: false },
    { accessor: "DocumentCode", Header: "Doc No.", width: 160, sortable: false, style: { textAlign: "center" } },
]

export default props => {

    const [valueDD, setValueDD] = useState('DASHBOARD_WORKING_IN_ALL')
    const [data, setData] = useState([
        [ //row
            { //col 
                type: null,
                table: [
                    { //table in col
                        data: [],
                        headercol: headercol1,
                        // title: "In Bound"
                    }
                ]
            }
        ],
        // [ //row
        //     { //col 
        //         type: null,
        //         table: [
        //             { //table in col
        //                 data: [],
        //                 headercol: headercol2,
        //                 title: "Out Bound"
        //             }
        //         ]
        //     }
        // ]
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
                connection.on(valueDD, res => {
                    console.log(JSON.parse(res));
                    data[0][0].table[0].data = JSON.parse(res)
                    setData([...data])
                })
                // connection.on("DASHBOARD_OUT", res => {
                //     console.log(JSON.parse(res));
                //     data[1][0].table[0].data = JSON.parse(res)
                //     setData([...data])
                // })
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

    const optionsArea = [
        { value: 'DASHBOARD_WORKING_IN_ALL', label: 'All Area' },
        { value: 'DASHBOARD_WORKING_IN_LS', label: 'Staging Loading Area' },
        { value: 'DASHBOARD_WORKING_IN_PS', label: 'Staging Production Area' }
    ]

    const dropdown = {
        label: "Areas",
        dropdown: (
            <AmDropdown
                id={"dd_area"}
                placeholder="Select"
                fieldDataKey="value" //ฟิล์ดด Column ที่ตรงกับ table ในdb 
                // fieldLabel={dropdown.fieldLabel} //ฟิล์ดที่ต้องการเเสดงผลใน optionList และ ช่อง input
                labelPattern=" : " //สัญลักษณ์ที่ต้องการขั้นระหว่างฟิล์ด
                // width={250} //กำหนดความกว้างของช่อง input
                ddlMinWidth={230} //กำหนดความกว้างของกล่อง dropdown
                // queryApi={dataMovementType}
                data={optionsArea} //request {value,label}
                defaultValue={'DASHBOARD_WORKING_IN_ALL'} //value เรื่มต้น
                onChange={(value, dataObject, inputID, fieldDataKey) => onHandleDDLChange(value)}
                ddlType={"search"} //รูปแบบ Dropdown 
            />
        )
    }

    const onHandleDDLChange = (value) => {
        if (value) {
            setValueDD(value);
        }
    };

    return (
        <AmPageDashboard
            time={time}
            dropdown={dropdown}
            coltable={data}
        />
    )
}
