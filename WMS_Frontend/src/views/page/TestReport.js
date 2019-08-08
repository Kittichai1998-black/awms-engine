import React, { Component, useState, useEffect } from "react";
import PropTypes from 'prop-types';
import AmReaport from '../../components/AmReport'
import AmButton from '../../components/AmButton'
import { GetPermission, CheckWebPermission, CheckViewCreatePermission } from '../../components/Ampermision'
import { Badge, Row, Col, Input, Card, CardBody, Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
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



const TestReport = () => {

    const Query = {
        queryString: "https://localhost:44366/api/viw",
        t: "r_CurrentInventory",
        q: '[{ "f": "Base_Unit", "c":"=", "v": "PAC"}]',
        f: "*",
        g: "",
        s: "[{'f':'SKU_Code','od':'asc'}]",
        sk: 0,
        l: 100,
        all: "",
    };

    const [bodyReport, setbodyReport] = useState();
    const [data, setData] = useState([]);
    const [totalSize, setTotalSize] = useState(0);
    const [sort, setSort] = useState(0);
    const [page, setPage] = useState();
    const [query, setQuery] = useState(Query);
    const [permissionView, setpermissionView] = useState();
    const [current, setcurrent] = useState();
   

    const [bodyFooterReport, setbodyFooterReport] = useState(<AmButton styleType="dark_outline" style={{ width: "150px" }}>
        {'SAVE'}
    </AmButton>);





    async function getData(qryString) {
        const res = await Axios.get(qryString).then(res => res)
        setData(res.data.datas)
        setTotalSize(res.data.counts)
    }

    useEffect(() => {
        getData(createQueryString(query))
    }, [query])

    useEffect(() => {
        if (typeof (page) === "number") {
            const queryEdit = JSON.parse(JSON.stringify(query));
            queryEdit.sk = page === 0 ? 0 : page * parseInt(queryEdit.l, 10);
            setQuery(queryEdit)
        }
    }, [page])

    //�Ѿഷ������������դ���� sort �����
    useEffect(() => {
        if (sort) {
            const queryEdit = JSON.parse(JSON.stringify(query));
            queryEdit.s = '[{"f":"' + sort.field + '", "od":"' + sort.order + '"}]';
            setQuery(queryEdit)
        }
    }, [sort])

    useEffect(() => {
        getPermisions()

    })

    async function getPermisions(props) {
        let dataGetPer = await GetPermission()

        CheckWebPermission("Pack", dataGetPer);
        displayButtonByPermission(dataGetPer) 
    }

    const displayButtonByPermission = (dataGetPer) => {
        let checkview = true
        if (CheckViewCreatePermission("SKU_view", dataGetPer)) {
            checkview = true //�ʴ����������
        }
        if (CheckViewCreatePermission("SKU_create&modify", dataGetPer)) {
            checkview = false //���
        }
        if (checkview === true) {
            setpermissionView(false)
        } else if (checkview === false) {
            setpermissionView(true)
        }
        console.log(checkview)
    }

    console.log(permissionView)




    const calWidth = (columsList) => {
        let tableWidth = 0;
        columsList.forEach((row) => tableWidth = tableWidth + row.width);
        return tableWidth
    }
    const columns = [
    { accessor: 'SKU_Code',  Header: window.project === "TAP" ? "Part NO." : 'SKU Code',  },
    { accessor: 'SKU_Name', Header: window.project === "TAP" ? "Part Name" : 'SKU Name',},
    { accessor: 'Warehouse', Header: 'Warehouse', },
    { accessor: 'Area', Header: 'Area',  },
    { accessor: 'Batch', Header: 'Batch',},
    { accessor: 'Lot', Header: 'Lot',  },
    { accessor: 'OrderNo', Header: 'Order No.',},
        { accessor: 'QtyReceiving', Header: 'Qty Receiving', Footer: true,},
        { accessor: 'QtyReceived', Header: 'Qty Received', Footer: true,},
        { accessor: 'QtyPicking', Header: 'Qty Picking',Footer: true,},
        { accessor: 'QtyAuditing', Header: 'Qty Auditing', Footer: true,},
        { accessor: 'QtySummary', Header: 'Qty', Footer: true,},
    { accessor: 'Base_Unit', Header: 'Unit',},
        { accessor: 'Wei_Pack', Header: 'Weight Pack (kg)', Footer: true,},
        { accessor: 'Wei_PackStd', Header: 'Weight Standard (kg)', Footer: true,},
    ];

    useEffect(() => {
        GetBodyReports()}, [GetBodyReports])

 
    const GetBodyReports = () => {
        setbodyReport(
            <div>
                   <Row>
                        <Col xs="1">
                        {permissionView == true ? <div className=""><label>Batch : </label>
                            <Input style={{ display: "inline-block", width: "300px", marginLeft: '28px' }}
                            />
                        </div> : null}
                        </Col>

                        <Col xs="1">
                            <div className=""><label>Batch : </label>
                                <Input style={{ display: "inline-block", width: "300px", marginLeft: '28px' }}
                                    />
                            </div>
                        </Col>
                    </Row>            
            </div>
         )  
        

    }

  
    return (
        <div>

            <AmReaport bodyHeadReport={bodyReport} bodyFooterReport={bodyFooterReport} columnTable={columns} dataTable={data}
                totalSize={totalSize} page={(page) => setPage(page)} pageSize={50} sortable={true} sumwhere={"Base_Unit"} sort={(x)=>setSort(x)}        
                ></AmReaport>           
            </div>
    )
}


export default TestReport;