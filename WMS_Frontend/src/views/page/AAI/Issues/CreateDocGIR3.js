import React, { Component, useEffect, useState } from 'react';
import { AmEditorTable } from '../../../../components/table';
import {
  apicall,
  createQueryString
} from '../../../../components/function/CoreFunction';

import AmCreateDocument from './AmCreateDocument';
import AmButton from '../../../../components/AmButton';
import AmInput from '../../../../components/AmInput';
import AmCheckBox from '../../../../components/AmCheckBox';
import Checkbox from '@material-ui/core/Checkbox';

const Axios = new apicall();

const AmCreateDocumentR2 = props => {
  const [sapResponse, setSAPResponse] = useState([]);
  const [editData, setEditData] = useState({});
  const [editPopup, setEditPopup] = useState(false);
  const [sapReq, setSAPReq] = useState([]);
  const [headerData, setHeaderData] = useState([]);
  const [flagStock, setFlagStock] = useState(false);
  const [stockStatus, setStockStatus] = useState([
    {
      BESTQ_QI: { field: 'BESTQ_QI', value: false },
      BESTQ_UR: { field: 'BESTQ_UR', value: false },
      BESTQ_BLK: { field: 'BESTQ_BLK', value: false }
    }
  ]);

  const headerCreates = [
    [
      { label: 'Document No.', type: 'labeltext', key: 'sapdoc', texts: '-' },
      { label: 'Document Date', type: 'dateTime', key: 'documentDate' }
    ],
    [
      {
        label: 'Movement Type',
        type: 'labeltext',
        key: 'movementTypeID',
        texts: 'STO_TRANSFER',
        valueTexts: '5010'
      },
      { label: 'Action Time', type: 'dateTime', key: 'actionTime' }
    ],
    [
      {
        label: 'Source Warehouse',
        type: 'labeltext',
        key: 'souWarehouseID',
        texts: 'Warehouse1/ASRS',
        valueTexts: 1
      }
    ],
    [
      { label: 'Doc Status', type: 'labeltext', key: '', texts: 'New' },
      {
        label: 'Mode',
        type: 'labeltext',
        key: 'ref1',
        texts: 'R03',
        valueTexts: 'R03'
      }
    ]
  ];

  var columnsModify = [
    {
      Header: 'Reservation',
      accessor: 'RSNUM'
    },
    {
      Header: 'Material',
      accessor: 'MATNR'
    },
    {
      Header: 'Batch',
      accessor: 'CHARG'
    },
    {
      Header: 'Quantity',
      accessor: 'BDMNG'
    },
    {
      Header: 'Unit',
      accessor: 'MEINS'
    },
    {
      Header: 'BIN',
      accessor: 'LGPLA'
    },
    {
      Header: 'MVT',
      accessor: 'BWLVS'
    },
    {
      Header: 'UR',
      accessor: 'BESTQ_UR'
    },
    {
      Header: 'QI',
      accessor: 'BESTQ_QI'
    },
    {
      Header: 'Blocked',
      accessor: 'BESTQ_BLK'
    }
  ];

  const apicreate = '/v2/CreateGIDocAPI/'; //API สร้าง Doc
  const apiRes = '/';

  const sapConnectorR3 = postData => {
    Axios.post(window.apipath + '/v2/SAPZWMRF003R3API', postData).then(res => {
      if (res.data._result.status === 1) {
        setSAPResponse(res.data.datas);
      } else {
      }
    });
  };

  const onHandleEditConfirm = (status, rowdata) => {
    if (status) {
      var postData = {};
      sapReq.forEach(x => {
        postData[x.field] = x.value;
      });
      postData['_token'] = localStorage.getItem('Token');
      sapConnectorR3(postData);
    }
    setEditPopup(false);
  };

  const onChangeEditor = (field, value) => {
    let setsap = [];
    setSAPReq([{ field: field, value: value }]);
    if (flagStock) {
      //stockStatus
      setsap.push();
    }
  };

  const editorList = [
    {
      field: 'Storage Unit Number',
      component: (data, cols, key) => {
        return (
          <div key={key}>
            Storage Unit Number :
            <AmInput
              defaultValue={data ? data.Name2 : ''}
              onChange={value => {
                onChangeEditor('LENUM', value);
              }}
            />
          </div>
        );
      }
    },
    {
      field: 'Reservation Number',
      component: (data, cols, key) => {
        return (
          <div key={key}>
            Reservation Number :
            <AmInput
              defaultValue={data ? data.Name2 : ''}
              onChange={value => {
                onChangeEditor('RSNUM', value);
              }}
            />
          </div>
        );
      }
    },
    {
      field: 'Material Number',
      component: (data, cols, key) => {
        return (
          <div key={key}>
            Material Number :
            <AmInput
              defaultValue={data ? data.Name2 : ''}
              onChange={value => {
                onChangeEditor('MATNR', value);
              }}
            />
          </div>
        );
      }
    },
    {
      field: 'Select Include : ',
      component: (data, cols, key) => {
        return (
          <div key={key}>
            Include Stock :
            <Checkbox
              onChange={e => {
                if (e.target.checked) setFlagStock(true);
                else setFlagStock(false);
              }}
            />
          </div>
        );
      }
    },
    {
      field: 'Include UR',
      component: (data, cols, key) => {
        return (
          <div key={key}>
            <label>Include UR :</label>
            <Checkbox
              onChange={e => {
                onChangeEditor('BESTQ_UR', e.checked ? true : false);
                stockStatus.BESTQ_UR = {
                  field: 'BESTQ_UR',
                  value: e.checked ? true : false
                };
              }}
              disabled={!flagStock}
            />
          </div>
        );
      }
    },
    {
      field: 'Include QI',
      component: (data, cols, key) => {
        return (
          <div key={key}>
            <label>Include QI :</label>
            <Checkbox
              onChange={e => {
                onChangeEditor('BESTQ_QI', e.checked ? true : false);
                stockStatus.BESTQ_QI = {
                  field: 'BESTQ_QI',
                  value: e.checked ? true : false
                };
              }}
              disabled={!flagStock}
            />
          </div>
        );
      }
    },
    {
      field: 'Include Blocked',
      component: (data, cols, key) => {
        return (
          <div key={key}>
            <label>Include Blocked :</label>
            <Checkbox
              onChange={e => {
                onChangeEditor('BESTQ_BLK', e.checked ? true : false);
                stockStatus.BESTQ_BLK = {
                  field: 'BESTQ_BLK',
                  value: e.checked ? true : false
                };
              }}
              disabled={!flagStock}
            />
          </div>
        );
      }
    }
  ];

  const CreateDocument = () => {
    var groupMVT = sapResponse
      .map((item, idx) => {
        return item.BWLVS;
      })
      .filter((value, index, self) => self.indexOf(value) === index)
      .join(',');
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
      ref1: 'R03',
      ref2: groupMVT,
      refID: sapResponse[0].RSNUM,
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
        '&lgpla=' +
        item.LGPLA;

      if (item.LENUM !== '' && item.LENUM !== null) {
        options = options + '&lgpla=' + item.LENUM;
      }
      return {
        ID: null,
        skuCode: item.MATNR,
        packCode: item.MATNR,
        quantity: item.BDMNG,
        unitType: item.MEINS,
        batch: item.CHARG,
        ref1: 'R03',
        ref2: item.BWLVS,
        refID: item.RSNUM,
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
        columns={editorList}
      />
    );
  };

  return (
    <div>
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
          >
            Add
          </AmButton>
        }
        customAddComponentRender={customAdd()}
        customDataSource={sapResponse}
        customTableColumns={columnsModify}
        customDocumentData={CreateDocument()}
        customGetHeaderData={headerData => setHeaderData(headerData)}
      />

      <div />
    </div>
  );
};

export default AmCreateDocumentR2;
