import * as signalR from '@aspnet/signalr';

// import Axios from 'axios'
import React, { useState, useEffect } from 'react'

import AmDropdown from '../../../../components/AmDropdown';
// import AmIconStatus from "../../../../components/AmIconStatus";
import AmPageDashboard from '../../../../components/AmPageDashboard';
// import httpToObject from 'query-string'
// import { createQueryString } from '../../../../components/function/CoreFunction'

//type time,datetime,datelog
const headercol1 = [
    { accessor: "ActualTime", Header: "Time", type: "time", sortable: false, width: 100, style: { textAlign: "center" } },
    { accessor: "Gate", Header: "Gate", sortable: false, width: 70, style: { textAlign: "center" } },
    // { accessor: "MVT", Header: "MVT", sortable: false },
    { accessor: "PalletCode", Header: "Pallet", sortable: false, width: 140, style: { textAlign: "center" } },
    { accessor: "Product", Header: "Product", sortable: false, width: 550 },
    { accessor: "QtyUnit", Header: "Qty", sortable: false, width: 90, style: { textAlign: "center" } },
    { accessor: "Remark", Header: "Remark", sortable: false, style: { textAlign: "center" }, Cell: row => row.value ? decodeURI(row.value) : null },
    { accessor: "Document_Code", Header: "Doc No.", sortable: false, width: 160, style: { textAlign: "center" } }
]

export default props => {

    const [valueDD, setValueDD] = useState('DASHBOARD_PICKING_1')
    const [data, setData] = useState([
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

    let url = window.apipath + '/dashboard',
        connection = new signalR.HubConnectionBuilder()
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
    }, [valueDD])

    const time = {
        format: "DD/MM/YYYY HH:mm:ss", //formet in moment
        // label: "Date/Time"
    }

    const optionsArea = [
        { value: 'DASHBOARD_PICKING_1', label: 'Inbound/Outbound Rework' },
        { value: 'DASHBOARD_PICKING_2', label: 'Outbound Gate Station' }
    ]

    const dropdown = {
        label: "Area",
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
                defaultValue={'DASHBOARD_PICKING_1'} //value เรื่มต้น
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
