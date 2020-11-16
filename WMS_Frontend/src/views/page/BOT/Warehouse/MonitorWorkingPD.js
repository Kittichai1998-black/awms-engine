import * as signalR from '@aspnet/signalr';

// import Axios from 'axios'
import React, { useState, useEffect } from 'react'
import AmStorageObjectStatus from "../../../../components/AmStorageObjectStatus";
import AmDropdown from '../../../../components/AmDropdown';
import AmIconStatus from "../../../../components/AmIconStatus";
import AmPageDashboard from '../../../../components/AmPageDashboard';
// import { createQueryString } from '../../../../components/function/CoreFunction'
import { useTranslation } from 'react-i18next'
//type time,datetime,datelog
export default props => {
    const { t } = useTranslation()
    const headercol1 = [
        { accessor: "ActualTime", Header: t("Time"), className: 'center', width: 80, type: "time", sortable: false, style: { textAlign: "center" } },
        // { accessor: "Cur_AreaLocation_Code", Header: "Gate", width: 60, sortable: false, style: { textAlign: "center" } },
        { accessor: "Priority", Header: t("Priority"), type: "priority", width: 80, sortable: false, style: { textAlign: "center" } },
        // { accessor: "Lot", Header: t("Lot"), width: 100, sortable: false, style: { textAlign: "center" } },
        // { accessor: "OrderNo", Header: t("Control No."), width: 100, sortable: false, style: { textAlign: "center" } },
        { accessor: "PalletCode", Header: t("Pallet"), width: 100, sortable: false, style: { textAlign: "center" } },
        { accessor: "PackName", Header: t("Item Code"), width: 40, sortable: false, cellStyle: { overflow: 'hidden', whiteSpace: 'nowrap', whiteSpace: 'nowrap' } },
        { accessor: "Qty", Header: t("Qty"), width: 80, sortable: false },
        { accessor: "Ref1", Header: t("สถาบัน"), width: 80, sortable: false },
        { accessor: "Ref2", Header: t("แบบ"), width: 80, sortable: false },
        { accessor: "Ref3", Header: t("ประเภท"), width: 80, sortable: false },
        { accessor: "Ref4", Header: t("ศูนย์เงินสด"), width: 80, sortable: false },
        // { accessor: "Sou_Area", Header: "Source", width: 100, sortable: false },
        // { accessor: "Cur_Area", Header: "Current", width: 170, sortable: false },
        // { accessor: "Des_Area", Header: "Destination", width: 160, sortable: false },


        { accessor: "DocumentCode", Header: t("Doc No."), width: 100, sortable: false, style: { textAlign: "center" } },
    ]
    const [Hub, setHub] = useState(["DASHBOARD_WORKING_OUT"])
    const [data, setData] = useState([
        [ //row
            { //col 
                type: null,
                table: [
                    { //table in col
                        data: [],
                        headercol: headercol1,
                        title: ""
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
                    //console.log(JSON.parse(res));
                    data[0][0].table[0].data = JSON.parse(res)
                    setData([...data])
                })
            })
            .catch((err) => {
                //console.log(err);
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
