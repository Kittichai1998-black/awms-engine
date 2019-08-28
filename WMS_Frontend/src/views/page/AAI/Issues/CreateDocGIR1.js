import React, { useState, useRef, createRef } from 'react';

import { AmEditorTable } from '../../../../components/table';

import {
    apicall,
} from '../../../../components/function/CoreFunction';

import AmCreateDocument from './AmCreateDocument';
import AmButton from '../../../../components/AmButton';
import AmInput from '../../../../components/AmInput';
import styled from 'styled-components'
import AmFindPopup from '../../../../components/AmFindPopup'
import { createQueryString } from '../../../../components/function/CoreFunction2'
import AmDialogs from '../../../../components/AmDialogs'
import AmAux from '../../../../components/AmAux'

const Axios = new apicall();

const FormInline = styled.div`
display: flex;
flex-flow: row wrap;
align-items: center;
label {
    margin: 5px 5px 5px 0;
}
input {
    vertical-align: middle;
}
@media (max-width: 800px) {
    flex-direction: column;
    align-items: stretch;
    
  }
`;

const LabelH = styled.label`
font-weight: bold;
  width: 200px;
`;

const InputDiv = styled.div`
    margin: 5px;
    @media (max-width: 800px) {
        margin: 0;
    }
`;

export default props => {
    const [sapResponse, setSAPResponse] = useState([]);
    const [headerData, setHeaderData] = useState([]);
    const [dataSource, setDataSource] = useState([])
    const [editPopup, setEditPopup] = useState(false);
    const [editData, setEditData] = useState({}
        // {
        //     LGTYP: "C00",
        //     LGBER: "001",
        //     LGPLA: "C00"
        // }
    );

    // const [sapReq, setSAPReq] = useState([]);
    const [dialogError, setDialogError] = useState({
        status: false,
        type: null,
        message: null
    });

    const headerCreates = [
        [
            { label: 'SAP Document', type: 'labeltext', key: 'sapdoc', texts: '-' },
            { label: 'Document Date', type: 'dateTime', key: 'documentDate' }
        ],
        [
            { label: 'Action Time', type: 'dateTime', key: 'actionTime' },
            { label: 'Remark', type: 'input', key: 'remark', style: { width: '200px' } }
        ],
        [
            { label: 'Source Branch', type: 'labeltext', key: 'souBranchID', texts: '1100 : THIP', valueTexts: 1 },
            { label: 'Warehouse', type: 'labeltext', key: 'souWarehouseID', texts: '5005 : ASRS', valueTexts: 1 }
        ],
        [
            { label: 'MoveMent Type', type: 'labeltext', key: 'movementTypeID', texts: 'FG ISSUED', valueTexts: '1002' },
            { label: 'Mode', type: 'labeltext', key: 'ref1', texts: 'R01', valueTexts: 'R01' }
        ]
    ];

    const Sto = {
        queryString: window.apipath + "/v2/SelectDataViwAPI/",
        t: "PalletSto",
        q: '', //เงื่อนไข '[{ "f": "Status", "c":"<", "v": 2}]'
        f: "ID,BaseCode,PackCode,Name,Quantity,UnitTypeName,Batch",
        g: "",
        s: "[{'f':'ID','od':'ASC'}]",
        sk: 0,
        l: 100,
        all: ""
    }

    // const BaseCode = {
    //     queryString: window.apipath + "/v2/SelectDataTrxAPI/",
    //     t: "StorageObject",
    //     q: '[{ "f": "ObjectType", "c":"=", "v": "1"}]', //เงื่อนไข '[{ "f": "Status", "c":"<", "v": 2}]'
    //     f: "Code",
    //     g: "Code",
    //     s: "[{'f':'Code','od':'ASC'}]",
    //     sk: 0,
    //     l: 100,
    //     all: ""
    // }

    // const columsFindpopUpPalletCode = [
    //     {  Header: 'SU No.',accessor: 'Code',fixed: 'left'}
    // ];

    const columnEdit = [
        { Header: "SU No.", accessor: 'LENUM', type: "input" },
        // { Header: "SU No.", accessor: 'Code', type: "findPopUp", idddl: "SUCode", queryApi: Sto, fieldLabel: ["Code"], columsddl: columsFindpopUpPalletCode, placeholder: "Select SU" },
        { Header: "Dest. Storage Type", accessor: 'LGTYP', type: "input" },
        { Header: "Dest. Storage Section", accessor: 'LGBER', type: "input" },
        { Header: "Dest. Storage BIN", accessor: 'LGPLA', type: "input" }
    ];

    const ref = useRef(columnEdit.map(() => createRef()))

    var columnsModify = [
        { Header: 'SU No.', accessor: 'BaseCode' },
        { Header: 'SKU Code', accessor: 'PackCode' },
        { Header: 'SKU Name', accessor: 'Name' },
        { Header: 'Qty', accessor: 'Quantity' },
        { Header: 'Batch', accessor: 'Batch' },
        { Header: 'UnitType', accessor: 'UnitTypeName' }
    ];

    const apicreate = '/v2/CreateGIDocAPI/'; //API สร้าง Doc
    const apiRes = "/issue/detail?docID=";

    const sapConnectorR1 = postData => {
        Axios.post(window.apipath + '/v2/SAPZWMRF003R1API', postData).then(res => {
            if (res.data._result.status) {
                if (res.data.datas && !res.data.datas[0].ERR_MSG) {
                    setSAPResponse(res.data.datas);
                    GetDataByBaesCode(postData.LENUM)
                } else {
                    setDialogError({
                        status: true,
                        message: res.data.datas ? res.data.datas[0].ERR_MSG : "Please input Reservation No."
                    });
                }
            } else {
                setDialogError({
                    status: true,
                    message: res.data._result.message
                });
            }
        })
    };

    const GetDataByBaesCode = baseCode => {
        Sto.q = `[{ "f": "BaseCode", "c":"=", "v": '${baseCode}'}]`
        Axios.get(createQueryString(Sto)).then(res => {
            if(res.data.count>0){
                setDataSource(res.data.datas)
            }else{
                setDialogError({
                    status: true,
                    message: "Base Code is Empty in StorageObject."
                });
            }
        });
    }

    const onHandleEditConfirm = (status, rowdata) => {
        if (status) {
            // let postData = {}
            // postData.LENUM = rowdata.LENUM
            // postData.LGBER = rowdata.LGBER
            // postData.LGPLA = rowdata.LGPLA
            // postData.LGTYP = rowdata.LGTYP
            rowdata._token = localStorage.getItem('Token');
            sapConnectorR1(rowdata);
        }
        setEditData({})
        setEditPopup(false);
    };

    const editorListcolunm = () => {
        if (columnEdit) {
            return columnEdit.map((row, index) => {
                return {
                    field: row.accessor,
                    component: (data = null, cols, key) => {
                        return <div key={key}>
                            {getTypeEditor(row, index, data, cols)}
                        </div>
                    }
                }
            })
        }
    }
    const getTypeEditor = (row, index, data, cols) => {
        if (row.type === "input") {
            return (
                <FormInline>
                    <LabelH>{row.Header} : </LabelH>
                    <InputDiv>
                        <AmInput style={row.style ? row.style : { width: "300px" }}
                            defaultValue={row.defultValue ? row.defultValue : ""}
                            inputRef={ref.current[index]}
                            validate={true}
                            msgError="Error"
                            regExp={row.validate ? row.validate : ""}
                            onChange={(value) => { onChangeEditor(row.accessor, value) }}
                        />
                    </InputDiv>
                </FormInline>
            )
        } else if (row.type === "findPopUp") {
            return (
                <FormInline>
                    <LabelH>{row.Header} : </LabelH>
                    <InputDiv>
                        <AmFindPopup
                            id={row.idddl}
                            popupref={ref.current[index]}
                            placeholder={row.placeholder ? row.placeholder : "Select"}
                            // fieldDataKey="ID" //ฟิล์ดดColumn ที่ตรงกับtable ในdb 
                            labelPattern=" : " //สัญลักษณ์ที่ต้องการขั้นระหว่างฟิล์ด
                            fieldLabel={row.fieldLabel} //ฟิล์ดที่ต้องการเเสดงผลใน ช่อง input
                            // valueData={valueFindPopupin[idddl]} //ค่า value ที่เลือก
                            labelTitle="Search of Code" //ข้อความแสดงในหน้าpopup
                            queryApi={row.queryApi} //object query string
                            // defaultValue={row.data ? data[accessor] : ""}
                            columns={row.columsddl} //array column สำหรับแสดง table
                            width={row.width ? row.width : 300}
                            ddlMinWidth={row.width ? row.width : 100}
                            onChange={(value, dataObject, inputID, fieldDataKey) => onChangeEditor(row.accessor, dataObject[row.accessor], dataObject)}
                        />
                    </InputDiv>
                </FormInline>
            )
        }
    }

    const onChangeEditor = (field, value, valueObject) => {
        // if (field === "BaseCode") {
        //     valueObject ? editData.skuCode = valueObject.Code : delete editData["skuCode"]
        // }
        editData[field] = value
        setEditData(editData)
    };

    const CreateDocument = () => {
        let document = {
            actionTime:
                headerData.actionTime === undefined ? null : headerData.actionTime,
            forCustomerID:
                headerData.forCustomerID === undefined
                    ? null
                    : headerData.forCustomerID,
            forCustomerCode:
                headerData.forCustomerCode === undefined
                    ? null
                    : headerData.forCustomerCode,
            batch: headerData.batch === undefined ? null : headerData.batch,
            lot: headerData.lot === undefined ? null : headerData.lot,
            orderno: headerData.orderno === undefined ? null : headerData.orderno,
            souSupplierID:
                headerData.souSupplierID === undefined
                    ? null
                    : headerData.souSupplierID,
            souCustomerID:
                headerData.souCustomerID === undefined
                    ? null
                    : headerData.souCustomerID,
            souBranchID:
                headerData.souBranchID === undefined ? null : headerData.souBranchID,
            souAreaMasterID:
                headerData.souAreaMasterID === undefined
                    ? null
                    : headerData.souAreaMasterID,
            souSupplierCode:
                headerData.souSupplierCode === undefined
                    ? null
                    : headerData.souSupplierCode,
            souCustomerCode:
                headerData.souCustomerCode === undefined
                    ? null
                    : headerData.souCustomerCode,
            souBranchCode:
                headerData.souBranchCode === undefined
                    ? null
                    : headerData.souBranchCode,
            souWarehouseID:
                headerData.souWarehouseID === undefined ? 1 : headerData.souWarehouseID,
            souAreaMasterCode:
                headerData.souAreaMasterCode === undefined
                    ? null
                    : headerData.souAreaMasterCode,
            desBranchID:
                headerData.desBranchID === undefined ? null : headerData.desBranchID,
            desWarehouseID:
                headerData.desWarehouseID === undefined
                    ? null
                    : headerData.desWarehouseID,
            desAreaMasterID:
                headerData.desAreaMasterID === undefined
                    ? null
                    : headerData.desAreaMasterID,
            desBranchCode:
                headerData.desBranchCode === undefined
                    ? null
                    : headerData.desBranchCode,
            desCustomerID:
                headerData.desCustomerID === undefined
                    ? null
                    : headerData.desCustomerID,
            desSupplierID:
                headerData.desSupplierID === undefined
                    ? null
                    : headerData.desSupplierID,
            desWarehouseCode:
                headerData.issueItems === undefined ? null : headerData.issueItems,
            desAreaMasterCode:
                headerData.desAreaMasterCode === undefined
                    ? null
                    : headerData.desAreaMasterCode,
            documentDate:
                headerData.documentDate === undefined ? null : headerData.documentDate,
            movementTypeID:
                headerData.movementTypeID === undefined
                    ? null
                    : headerData.movementTypeID,
            ref1: 'R01',
            remark: headerData.remark === undefined ? null : headerData.remark,
            receiveItems:
                headerData.receiveItems === undefined ? null : headerData.receiveItems
        };

        let documentItem = dataSource.map((item, idx) => {
            let options =
                'bwlvs=' + sapResponse[0].BWLVS +
                '&lenum=' + sapResponse[0].LENUM +
                '&lgtyp=' + sapResponse[0].LGTYP +
                '&lgber=' + sapResponse[0].LGBER +
                '&lgpla=' + sapResponse[0].LGPLA +
                '&bestq_ur=' + sapResponse[0].BESTQ_UR +
                '&bestq_qi=' + sapResponse[0].BESTQ_QI +
                '&bestq_blk=' + sapResponse[0].BESTQ_BLK;
            return {
                ID: null,
                palletcode: item.BaseCode,
                skuCode: item.PackCode,
                packCode: item.PackCode,
                quantity: item.Quantity,
                unitType: item.UnitTypeName,
                batch: item.Batch,
                options: options
            };
        });

        document.issueItems = documentItem;

        let documentData = {
            document: document,
            docItem: documentItem
        };
        return documentData;
    };

    const customAdd = () => {
        return (
            <AmEditorTable
                style={{ width: '600px', height: '500px' }}
                titleText={'Add'}
                open={editPopup}
                onAccept={(status, rowdata) => onHandleEditConfirm(status, rowdata)}
                data={editData}
                columns={editorListcolunm()}
            />
        );
    };

    return (
        <AmAux>
            <AmDialogs typePopup={dialogError.type} content={dialogError.message} onAccept={(e) => { setDialogError(e) }} open={dialogError.status}></AmDialogs >
            <AmCreateDocument
                headerCreate={headerCreates} //ข้อมูลตรงด้านบนตาราง
                //columnsModifi={columnsModifi} //ใช้เฉพาะหน้าที่ต้องทำปุ่มเพิ่มขึ้นมาใหม่
                columns={[]} //colums
                columnEdit={[]} //ข้อมูลที่จะแก้ไขใน popUp
                apicreate={apicreate} //api ที่จะทำการสร้างเอกสาร
                createDocType={'custom'} //createDocType มี audit issue recive
                history={props.history} //ส่ง porps.history ไปทุกรอบ
                apiRes={apiRes} //หน้ารายละเอียดเอกสาร
                //btnProps={btnAdd}  //ปุ่มที่ส่งเข้าไป
                //dataSource={dataSou} //ข้อมูลที่จัดการจากปุ่มที่ส่งเข้าไป
                // dataCreate={} //dataที่จะส่งไปสร้างเอกสาร

                //customEditData={(editData)=> setEditData(editData)}
                customAddBtnRender={
                    <AmButton
                        className='float-right'
                        styleType='add'
                        style={{ width: '150px' }}
                        onClick={() => setEditPopup(true)}
                    >Load</AmButton>
                }
                customAddComponentRender={customAdd()}
                customDataSource={dataSource}
                customTableColumns={columnsModify}
                customDocumentData={CreateDocument()}
                customGetHeaderData={headerData => setHeaderData(headerData)}
            />
        </AmAux>
    )
};
