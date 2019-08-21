import React, { useState } from 'react';

import { AmEditorTable } from '../../../../components/table';

import {
    apicall,
} from '../../../../components/function/CoreFunction';

import AmCreateDocument from './AmCreateDocument';
import AmButton from '../../../../components/AmButton';
import AmInput from '../../../../components/AmInput';
import styled from 'styled-components'

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
    const [editData, setEditData] = useState({});
    const [editPopup, setEditPopup] = useState(false);
    const [sapReq, setSAPReq] = useState([]);
    const [headerData, setHeaderData] = useState([]);

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

    const columnEdit = [
        { Header: "Storage Unit Number", accessor: 'LENUM', type: "input" },
        { Header: "Dest. Storage Type", accessor: 'LGTYP', type: "input" },
        { Header: "Dest. Storage Section", accessor: 'LGBER', type: "input" },
        { Header: "Dest. Storage BIN", accessor: 'LGPLA', type: "input" },
    ];

    var columnsModify = [
        { Header: 'lenum', accessor: 'lenum' },
        { Header: 'lgtyp', accessor: 'lgtyp' },
        { Header: 'lgber', accessor: 'lgber' },
        { Header: 'lgpla', accessor: 'lgpla' },
        { Header: 'bwlvs', accessor: 'bwlvs' },
        { Header: 'bestQ_BLK', accessor: 'bestQ_BLK' },
        { Header: 'bestQ_QI', accessor: 'bestQ_QI' },
        { Header: 'bestQ_UR', accessor: 'bestQ_UR' }
    ];

    const apicreate = '/v2/CreateGIDocAPI/'; //API สร้าง Doc
    const apiRes = '/';

    const sapConnectorR1 = postData => {
        Axios.post(window.apipath + '/v2/SAPZWMRF003R1API', postData).then(res => {
            if (res.data._result.status && res.data.datas.erR_MSG === undefined) {
                setSAPResponse(res.data.datas);
            } else {

            }
        });
    };

    const onHandleEditConfirm = (status, rowdata) => {
        if (status) {
            rowdata._token = localStorage.getItem('Token');
            sapConnectorR1(rowdata);
        }
        setEditPopup(false);
    };

    const onChangeEditor = (field, data) => {
        editData[field] = data
        setEditData(editData)
    };

    const editorListcolunm = () => {
        if (columnEdit) {
            return columnEdit.map(row => {
                return {
                    field: row.accessor,
                    component: (data = null, cols, key) => {
                        return <div key={key}>
                            {getTypeEditor(row, data, cols)}
                        </div>
                    }
                }
            })
        }
    }
    const getTypeEditor = (row, data, cols) => {
        if (row.type === "input") {
            return (
                <FormInline>
                    <LabelH>{row.Header} : </LabelH>
                    <InputDiv>
                        <AmInput style={row.style ? row.style : { width: "300px" }}
                            // defaultValue={data ? data[row.accessor] : ""}
                            validate={true}
                            msgError="Error"
                            regExp={row.validate ? row.validate : ""}
                            onChange={(ele) => { onChangeEditor(row.accessor, ele) }}
                        />
                    </InputDiv>
                </FormInline>
            )
        }
    }

    // const editorList = [
    //     {
    //         field: 'Storage Unit Number',
    //         component: (data, cols, key) => {
    //             return (
    //                 <div key={key}>
    //                     <FormInline>
    //                         <LabelH>Storage Unit Number :</LabelH>
    //                         <InputDiv>
    //                             <AmInput
    //                                 defaultValue={data ? data.Name2 : ''}
    //                                 onChange={value => {
    //                                     onChangeEditor('LENUM', value);
    //                                 }}
    //                             />
    //                         </InputDiv>
    //                     </FormInline>
    //                 </div>
    //             );
    //         }
    //     }
    // ];

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

        let documentItem = sapResponse.map((item, idx) => {
            let options =
                'bestq_ur=' +
                item.BESTQ_UR +
                '&bestq_qi=' +
                item.BESTQ_QI +
                '&bestq_blk=' +
                item.BESTQ_BLK +
                '&bwlvs=' +
                item.BWLVS +
                '&lgpla=' +
                item.LGPLA +
                '&rsnum=' +
                item.RSNUM;
            return {
                ID: null,
                skuCode: item.MATNR,
                packCode: item.MATNR,
                quantity: item.BDMNG,
                unitType: item.MEINS,
                batch: item.CHARG,
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
                >Add</AmButton>
            }
            customAddComponentRender={customAdd()}
            customDataSource={sapResponse}
            customTableColumns={columnsModify}
            customDocumentData={CreateDocument()}
            customGetHeaderData={headerData => setHeaderData(headerData)}
        />
    )
};
