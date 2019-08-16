import React, { Component, useEffect, useState } from 'react';
import { AmTable, AmEditorTable } from '../../../../components/table';
import {
  apicall,
  createQueryString
} from '../../../../components/function/CoreFunction';
import styled from 'styled-components';
import AmButton from '../components/AmButton';
import AmDate from '../components/AmDate';
import AmDatepicker from '../components/AmDate';
import AmDialogs from '../components/AmDialogs';
import AmDropdown from '../components/AmDropdown';
import AmEditorTable from '../components/table/AmEditorTable';
import AmFindPopup from '../components/AmFindPopup';
import AmInput from '../components/AmInput';
import Grid from '@material-ui/core/Grid';

const Axios = new apicall();

const useColumns = columns => {
  var rem = [
    {
      Header: '',
      width: 110,
      Cell: e => (
        <AmButton
          style={{ width: '100px' }}
          styleType='info'
          onClick={() => {
            setEditData(e);
            setDialog(true);
            setTitle('Edit');
          }}
        >
          {t('Edit')}
        </AmButton>
      )
    },
    {
      Header: '',
      width: 110,
      Cell: e => (
        <AmButton
          style={{ width: '100px' }}
          styleType='delete'
          onClick={() => {
            onHandleDelete(e.original.ID, e.original, e);
          }}
        >
          {t('Remove')}
        </AmButton>
      )
    }
  ];

  if (columns !== undefined) {
    return props.columns.concat(rem);
  }
  return columns;
};

const AmCreateDocument = props => {
  const columns = useColumns(props.columns);
  const [sapResponse, setSAPResponse] = useState([]);

  const SKUMaster = {
    queryString: window.apipath + '/v2/SelectDataViwAPI/',
    t: 'SKUMaster',
    q: '[{ "f": "Status", "c":"<", "v": 2}]',
    f:
      "ID,Code,Name,UnitTypeCode,concat(Code, ':' ,Name) as SKUItem, ID as SKUID,concat(Code, ':' ,Name) as SKUItems, ID as SKUIDs,Code as skuCode",
    g: '',
    s: "[{'f':'ID','od':'asc'}]",
    sk: 0,
    l: 100,
    all: ''
  };

  const headerCreates = [
    [
      { label: 'SAP Document', type: 'labeltext', key: 'sapdoc', texts: '-' },
      { label: 'Document Date', type: 'dateTime', key: 'documentDate' }
    ],
    [
      { label: 'Action Time', type: 'dateTime', key: 'actionTime' },
      {
        label: 'Remark',
        type: 'input',
        key: 'remark',
        style: { width: '200px' }
      }
    ],
    [
      {
        label: 'Source Branch',
        type: 'labeltext',
        key: 'souBranchID',
        texts: '1100 : THIP',
        valueTexts: 1
      },
      {
        label: 'Warehouse',
        type: 'labeltext',
        key: 'souWarehouseID',
        texts: '5005 : ASRS',
        valueTexts: 1
      }
    ],
    [
      {
        label: 'MoveMent Type',
        type: 'labeltext',
        key: 'movementTypeID',
        texts: 'FG ISSUED',
        valueTexts: '1002'
      },
      {
        label: 'Mode',
        type: 'labeltext',
        key: 'ref',
        texts: 'R02',
        valueTexts: 'R02'
      }
    ]
  ];

  const columns = [
    { Header: 'Location Code', accessor: 'locationcode' },
    { Header: 'SKU Items', accessor: 'SKUItems' },
    { Header: 'Batch', accessor: 'Batch' },
    { Header: 'Quantity', accessor: 'quantity' },
    { Header: 'Random', accessor: 'qtyrandom' },
    { Header: 'Unit', accessor: 'unitType' }
  ];

  const apicreate = '/v2/CreateADDocAPI/'; //API สร้าง Doc
  const apiRes = '/';

  const sapConnectorR2 = () => {
    Axios.get(window.apipath + 'v2/SAPZWMRF003R2').then(res => {
      if (res.data._result.status === 1) {
        setSAPResponse(res.data.datas);
      }
    });
  };

  const customAdd = () => {
    return (
      <AmEditorTable
        style={{ width: '600px', height: '500px' }}
        titleText={title}
        open={dialog}
        onAccept={(status, rowdata) => onHandleEditConfirm(status, rowdata)}
        data={editData}
        columns={}
      />
    );
  };

  return (
    <div>
      <AmCreateDocument
        headerCreate={headerCreates} //ข้อมูลตรงด้านบนตาราง
        //columnsModifi={columnsModifi} //ใช้เฉพาะหน้าที่ต้องทำปุ่มเพิ่มขึ้นมาใหม่
        columns={columns} //colums
        columnEdit={columnEdit} //ข้อมูลที่จะแก้ไขใน popUp
        apicreate={apicreate} //api ที่จะทำการสร้างเอกสาร
        createDocType={'issue'} //createDocType มี audit issue recive
        history={props.history} //ส่ง porps.history ไปทุกรอบ
        apiRes={apiRes} //หน้ารายละเอียดเอกสาร
        //btnProps={btnAdd}  //ปุ่มที่ส่งเข้าไป
        //dataSource={dataSou} //ข้อมูลที่จัดการจากปุ่มที่ส่งเข้าไป
        // dataCreate={} //dataที่จะส่งไปสร้างเอกสาร
      />

      <div />
    </div>
  );
};
