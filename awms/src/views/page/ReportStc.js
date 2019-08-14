import React, { Component, useState, useEffect } from "react";
import PropTypes from 'prop-types';
import AmReaport from '../../components/AmReport'
import AmButton from '../../components/AmButton'
import AmReport from '../../components/AmReport'
import Axios from 'axios';
import { Badge, Row, Col, Input, Card, CardBody, Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import { apicall } from '../../components/function/CoreFunction'

//const Axios = new apicall()


const ReportStc = () => {


    const [bodyReport, setbodyReport] = useState();
   
    const [totalSize, setTotalSize] = useState(0);
    const [batch, setbatch] = useState();
    const [lot, setlot] = useState();
    const [orderno, setorderno] = useState();
    const [movementType, setmovementType] = useState();
    const [sapDoc, setsapDoc] = useState();
    const [datavalue, setdatavalue] = useState([]);
  
    
    useEffect(() => {
        GetBodyReports()
    }, [GetBodyReports])



  



    const onGetDocument = () => {
      
        Axios.get(window.apipath + "/api/report/sp?apikey=FREE01&skuid=" + "11648"
            + "&startDate=" + "2019-02-01"
            + "&endDate=" + "2019-03-01"
            + "&batch=" + (batch === undefined ? '' : batch)
            + "&lot=" + (lot === undefined ? '' : lot)
            + "&orderno=" + (orderno === undefined ? '' : orderno)
            + "&movementType=" + (movementType === undefined ? '' : movementType)
            + "&sapDoc=" + (sapDoc === undefined ? '' : sapDoc)
            + "&spname=STOCK_CARD").then((rowselect1) => {
                if (rowselect1) {
                    console.log(rowselect1)
                    if (rowselect1.data._result.status !== 0) {                 
                        setdatavalue(rowselect1.data.datas)
                        setTotalSize(rowselect1.data.datas.length)
                    }
                }
            })
    }

    const GetBodyReports = () => {
        setbodyReport(
            <div>
               <div>
                    <Row>
                        <Col xs="6">
                            <div className=""><label>Lot : </label>
                                <Input style={{ display: "inline-block", width: "200px", marginLeft: '100px' }}
                                />
                            </div>
                        </Col>
                        <Col xs="6">
                            <div className=""><label>Order No : </label>
                                <Input style={{ display: "inline-block", width: "200px", marginLeft: '5px' }}
                                />
                            </div>
                        </Col>
                    </Row>
                 

                </div>

                <AmButton styleType="add" onClick={onGetDocument}>
                    {'Select'}
                </AmButton>
            </div>

        )

    }

    const columns = [   
    { Header: 'Actiontime', accessor: 'ActionTime', width: 100 },
    { Header: 'Batch', accessor: 'Batch', width: 100 },
    { Header: 'Credit', accessor: 'Credit', width: 100,Footer:true },
        { Header: 'Debit', accessor: 'Debit', width: 100, Footer: true  },
    { Header: 'Des', accessor: 'Des', width: 100 },
    { Header: 'Doc_Code', accessor: 'Doc_Code', width: 100 },
    { Header: 'Doc_ID', accessor: 'Doc_ID', width: 100 },
    { Header: 'Doc_Type', accessor: 'Doc_Type', width: 100 },
    { Header: 'Lot', accessor: 'Lot', width: 100 },
    { Header: 'MovementType', accessor: 'MovementType', width: 100 },
    { Header: 'OrderNo', accessor: 'OrderNo', width: 100 },
    { Header: 'Ref2', accessor: 'Ref2', width: 100 },
    { Header: 'RefID', accessor: 'RefID', width: 100 },
    { Header: 'Rownum', accessor: 'Rownum', width: 100 },
    { Header: 'SKU_Code', accessor: 'SKU_Code', width: 100 },
    { Header: 'SKU_Name', accessor: 'SKU_Name', width: 100 },
    { Header: 'Sou', accessor: 'Sou', width: 100 },
        {
            Header: 'Total', accessor: 'Total', width: 100, Footer: true, },
    { Header: 'Unit', accessor: 'Unit', width: 100 },
   
    ];


    return (
        <div>
            <AmReaport bodyHeadReport={bodyReport} columnTable={columns} dataTable={datavalue}
                pageSize={1000} pages={(x) => { console.log(x) }} page={false}  sumwhere={"Unit"}
            ></AmReaport>
        </div>
    )

}

export default ReportStc;
