import * as signalR from '@aspnet/signalr';

// import Axios from 'axios'
import httpToObject from 'query-string'
// import Moment from 'moment'
import React, { useState, useEffect } from 'react'
// import { useTranslation } from 'react-i18next'

import AmPageDashboard from '../../../components/AmPageDashboard';
// import { createQueryString } from '../../../components/function/CoreFunction'

export default props => {
    // const { t } = useTranslation()
    let dashboard = "";
    useEffect(() => {
        var location = window.location;
        const search = httpToObject.parse(location.search)

        if (search.IOType && search.IOType === "IN") {
            // if (location.pathname === "/monitor/inbound") {
                dashboard = 'DASHBOARD_IN';
                document.title = "Inbound Progress : AMW";
            // } else {
            //     window.location.replace("/404");
            // }
        }
        if (search.IOType && search.IOType === "OUT") {
            // if (location.pathname === "/monitor/outbound") {
                dashboard = 'DASHBOARD_OUT';
                document.title = "Outbound Progress : AMW";
            // } else {
            //     window.location.replace("/404");
            // }
        }

    }, [props.location, localStorage.getItem('Lang')]);

    const headercol1 = [
        { accessor: "ActualTime", Header: "Time", className: 'center', width: 100, type: "time", sortable: false, style: { textAlign: "center" } },
        // { accessor: "Cur_AreaLocation_Code", Header: "Gate", width: 60, sortable: false, style: { textAlign: "center" } },
        { accessor: "Priority", Header: "Priority", type: "priority", width: 80, sortable: false, style: { textAlign: "center" } },
        { accessor: "PalletCode", Header: "Pallet", width: 140, sortable: false, style: { textAlign: "center" } },
        { accessor: "PackName", Header: "Reorder", sortable: false },
        // { accessor: "Sou_Area", Header: "Source", width: 100, sortable: false },
        // { accessor: "Cur_Area", Header: "Current", width: 170, sortable: false },
        // { accessor: "Des_Area", Header: "Destination", width: 160, sortable: false },
        { accessor: "OrderNo", Header: "SI", width: 100, sortable: false, style: { textAlign: "center" } },
        { accessor: "Qty", Header: "Qty", width: 100, sortable: false },
        { accessor: "DocumentCode", Header: "Doc No.", width: 160, sortable: false, style: { textAlign: "center" } },
    ]

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

    useEffect(() => {
        // console.log(dashboard)
        let url = window.apipath + '/dashboard'
        let connection = new signalR.HubConnectionBuilder()
            .withUrl(url, {
                skipNegotiation: true,
                transport: signalR.HttpTransportType.WebSockets
            })
            //.configureLogging(signalR.LogLevel.Information)
            .build();

        const signalrStart = () => {
            connection.start()
                .then(() => {
                    connection.on(dashboard, res => {
                        console.log(JSON.parse(res));

                        data[0][0].table[0].headercol = headercol1
                        data[0][0].table[0].data = JSON.parse(res)
                        setData([...data])
                    })
                })
                .catch((err) => {
                    console.log(err);
                    setTimeout(() => signalrStart(), 5000);
                })
        };

        connection.onclose((err) => {
            if (err) {
                signalrStart()
            }
        });

        signalrStart()

        return () => {
            connection.stop()
        }

    }, [localStorage.getItem('Lang')])

    useEffect(() => {
        data[0][0].table[0].headercol = headercol1
        data[0][0].table[0].data = data[0][0].table[0].data ? data[0][0].table[0].data : []
        setData([...data])
    }, [localStorage.getItem('Lang')])

    const time = {
        format: "DD/MM/YYYY HH:mm:ss", //formet in moment
        // label: "Date/Time"
    }

    return (
        <AmPageDashboard
            time={time}
            // dropdown={dropdown}
            coltable={data}
        />
    )
}
