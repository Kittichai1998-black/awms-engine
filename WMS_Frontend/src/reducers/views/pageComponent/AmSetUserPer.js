import axios from 'axios';
import guid from 'guid';
import moment from 'moment';
import React, { useState, useEffect } from "react";
import styled from 'styled-components'
import { useTranslation } from 'react-i18next'

import AmButton from "../../components/AmButton";
// import AmCheckBox from '../../components/AmCheckBox'
import AmDate from "../../components/AmDate";
import AmDialogs from "../../components/AmDialogs";
import AmDropdown from '../../components/AmDropdown';
import AmEditorTable from '../../components/table/AmEditorTable';
import AmFilterTable from '../../components/table/AmFilterTable';
import AmFindPopup from '../../components/AmFindPopup';
import AmInput from "../../components/AmInput";
import { apicall, createQueryString } from '../../components/function/CoreFunction';
import Clone from '../../components/function/Clone'
// import DocView from "./DocumentView";
import Pagination from '../../components/table/AmPagination';
import Table from '../../components/table/AmTable';

const Axios = new apicall()


const LabelH = styled.label`
font-weight: bold;
  width: 200px;
`;

const InputDiv = styled.div`

`;
const FormInline = styled.div`

display: flex;
flex-flow: row wrap;
align-items: center;
label {
  margin: 5px 0 5px 0;
}
input {
    vertical-align: middle;
}
@media (max-width: 800px) {
    flex-direction: column;
    align-items: stretch;
    
  }
`;
const AmSetUserPer = (props) => {
  const [inputError, setInputError] = useState([])
  const { t } = useTranslation()
  const Query = {
    queryString: window.apipath + "/v2/SelectDataViwAPI/",
    t: props.tableQuery,
    q: "[{ 'f': 'Status', c:'<', 'v': 2}]",
    f: "*",
    g: "",
    s: props.tableQuery === "AreaRoute" || props.tableQuery === "ObjectSizeMap" ? "[{'f':'ID','od':'asc'}] " : "[{'f':'Code','od':'asc'}]",
    sk: 0,
    l: 100,
    all: "",
  };
  // ExportQuery
  const ExportQuery = {
    queryString: window.apipath + "/v2/SelectDataViwAPI/",
    t: props.tableQuery,
    q: "[{ 'f': 'Status', c:'<', 'v': 2}]",
    f: "*",
    g: "",
    s: props.tableQuery === "AreaRoute" || props.tableQuery === "ObjectSizeMap" ? "[{'f':'ID','od':'asc'}] " : "[{'f':'Code','od':'asc'}]",
    sk: 0,
    l: 0,
    all: "",
  };
  //===========================================================
  const Query2 = {
    queryString: window.apipath + "/v2/SelectDataMstAPI/",
    t: props.tableQuery,
    q: "[{ 'f': 'Status', c:'<', 'v': 2}]",
    f: "*",
    g: "",
    s: props.tableQuery === "AreaRoute" || props.tableQuery === "ObjectSizeMap" ? "[{'f':'ID','od':'asc'}] " : "[{'f':'Code','od':'asc'}]",
    sk: 0,
    l: 100,
    all: "",
  };
  //===========================================================


  const FuncSetTable = () => {
    const iniCols = props.iniCols
    if (props.customPer === true) {
      iniCols.push(
        {
          Header: 'Permission',
          width: 100,
          Cell: (e) =>
            <AmButton style={{ lineHeight: "1" }} styleType="confirm" onClick={() => { FuncSetEleRole(e); setEditData(Clone(e.original)); setTimeout(() => setDialogRole(true), 500) }} >
              {t('Permission')}
            </AmButton>,
          sortable: false,
        }, {
        Header: 'Edit',
        width: 80,
        Cell: (e) =>
          <AmButton style={{ lineHeight: "1" }} styleType="info" onClick={() => { setEditData(Clone(e.original)); edit(e, "edit") }} >
            {t('Info')}
          </AmButton>,
        sortable: false,
      }, {
        Header: 'Delete',
        width: 80,
        Cell: (e) =>
          <AmButton style={{ lineHeight: "1" }} styleType="delete" onClick={() => { setDeleteData(e); edit(e, "delete"); }} >
            {t('Delete')}
          </AmButton>,
        sortable: false,
      })
    }


    return iniCols

  }
  //===========================================================
  const [totalSizePer, setTotalSizePer] = useState(0);
  const [datax, setDatax] = useState([])
  const FuncGetRole = () => {

    const iniCols = [
      { Header: 'Code', accessor: 'Code', fixed: 'left', width: 250 },
      { Header: 'Name', accessor: 'Name', width: 250 },
    ];

    return [{
      "field": "Code",
      "component": (data, cols, key) => {

        return <div key={key}>
          <Table
            primaryKey="ID"
            sortable={false}
            defaultSelection={datax}
            primaryKey="ID"
            data={props.dataUser}
            columns={iniCols}
            pageSize={100}
            style={{ maxHeight: "400px" }}
            selection={true}
            selectionType="checkbox"
            getSelection={(data) => { setSelection(data); }}
          /> </div>

      }
    }]


  }

  async function FuncSetEleRole(data) {

    var defaultRole = []
    const Query = {
      queryString: window.apipath + "/v2/SelectDataMstAPI/",
      t: "Role_Permission",
      q: "[{ 'f': 'Role_ID', c:'==', 'v': " + data.original.ID + "},{ 'f': 'Status', 'c':'==', 'v': 1}]",
      f: "ID,Role_ID,Permission_ID",
      g: "",
      s: "[{'f':'ID','od':'asc'}]",
      sk: 0,
      l: 100,
      all: "",
    };
    await Axios.get(createQueryString(Query)).then((res) => {
      var row = res.data.datas

      row.forEach(x => {
        //defaultRole.push(x.Role_ID)
        defaultRole.push({ "ID": x.Permission_ID })
      })
    })

    setDatax(defaultRole)
    //return randerFunc(defaultRole,iniCols)
  }



  //=============================================================
  const onHandleSetRoleConfirm = (status, rowdata) => {

    if (status) {
      UpdateRole(rowdata)
    }
    setDialogRole(false)

  }


  //=============================================================
  async function UpdateRole(rowdata) {

    const Query3 = {
      queryString: window.apipath + "/v2/SelectDataMstAPI/",
      t: "Role_Permission",
      q: "[{ 'f': 'Role_ID', c:'==', 'v': " + rowdata.ID + "}]",
      f: "ID,Role_ID,Permission_ID,Status",
      g: "",
      s: "[{'f':'ID','od':'asc'}]",
      sk: 0,
      l: 100,
      all: "",
    };

    await Axios.get(createQueryString(Query3)).then((res) => {
      var row = res.data.datas

      var datafi = row.map(dataMap => {
        var dataselect = selection.find(list => {
          return list.ID === dataMap.Permission_ID
        })
        if (dataselect) {
          dataMap.Status = 1
        } else {
          dataMap.Status = 0
        }
        return dataMap
      })



      var dataselectInsert = selection.map(datas => {
        var datafiInsert = row.find(listInsert => {
          return listInsert.Permission_ID === datas.ID
        })
        if (!datafiInsert) {
          return {
            ID: 0,
            Permission_ID: datas.ID,
            Role_ID: rowdata.ID,
            Status: 1
          }
        }
      })


      return datafi.concat(dataselectInsert.filter(x => x !== undefined))

    }).then(response => {
      let updjson = {
        "t": "ams_Role_Permission",
        "pk": "ID",
        "datas": response,
        "nr": false,
        "_token": localStorage.getItem("Token")
      }
      Axios.put(window.apipath + "/v2/InsUpdDataAPI", updjson).then((res) => {

        if (res.data._result !== undefined) {
          if (res.data._result.status === 1) {
            setOpenSuccess(true)
            getData(createQueryString(query))
            Clear()
          } else {
            setOpenError(true)
            setTextError(res.data._result.message)
            getData(createQueryString(query))
            Clear()
          }
        }
      })

    })

  }
  //===========================================================
  const [idEdit, setiIdEdit] = useState({})
  const [query3, setQuery3] = useState()
  const edit = (e, type) => {

    const Query3 = {
      queryString: window.apipath + "/v2/SelectDataMstAPI/",
      t: props.tableQuery,
      q: "[{ 'f': 'ID', c:'==', 'v': " + e.original.ID + "}]",
      f: "*",
      g: "",
      s: props.tableQuery === "AreaRoute" || props.tableQuery === "ObjectSizeMap" ? "[{'f':'ID','od':'asc'}] " : "[{'f':'Code','od':'asc'}]",
      sk: 0,
      l: 100,
      all: "",
    };
    setQuery3(Query3)

    Axios.get(createQueryString(Query3)).then((res) => {
      //setDataSource1(res.data.datas) 
      setiIdEdit(res.data.datas)
    })

    if (type === "edit") {
      setDialogEdit(true)
    } else if (type === "editPass") {
      setDialogEditPassWord(true)
    } else {
      setDialogDelete(true)
    }


  }

  //===========================================================
  //const [query2, setQuery2] = useState(Query2)
  const [valueText1, setValueText1] = useState({})

  const FuncTest = () => {
    const x = props.dataAdd

    return x.map(y => {
      return {
        "field": y.field,
        "component": (data = null, cols, key) => {
          let rowError = inputError.length ? inputError.some(z => {
            return z === y.field
          }) : false
          return <div key={key}>{FuncTestSetEle(y.name, y.type, data, cols, y.dataDropDow, y.typeDropdow, y.colsFindPopup, y.placeholder, y.labelTitle, y.fieldLabel, y.validate, y.required, rowError)}
          </div>
        }
      }

    })
  }
  //===========================================================
  const FuncTestEdit = () => {
    const x = props.dataEdit
    return x.map(y => {
      return {
        "field": y.field,
        "component": (data = null, cols, key) => {
          let rowError = inputError.length ? inputError.some(z => {
            return z === y.field
          }) : false
          return <div key={key}>{FuncTestSetEleEdit(y.name, y.type, data, cols, y.dataDropDow, y.typeDropdow, y.colsFindPopup, y.placeholder, y.labelTitle, y.fieldLabel, y.validate, y.inputType, y.required, rowError)}</div>
        }
      }
    })
  }
  const FuncTestEditPassWord = () => {
    if (props.columnsEditPassWord) {
      const x = props.columnsEditPassWord
      return x.map(y => {
        return {
          "field": y.field,
          "component": (data = null, cols, key) => {
            return <div key={key}>{FuncTestSetEleEdit(y.name, y.type, data, cols, y.dataDropDow, y.typeDropdow, y.colsFindPopup, y.placeholder, y.labelTitle, y.fieldLabel, y.validate, y.inputType)}</div>
          }
        }
      })
    }
  }
  //===========================================================
  const FuncFilterPri = () => {
    const x = props.columnsFilterPrimary
    return x.map(y => {
      return {
        "field": y.field,
        "component": (condition, cols, key) => {
          return <div key={key} style={{ display: "inline-block" }}>{FuncFilterSetEle(key, y.field, y.type, y.name, condition, cols.field, y.fieldLabel, y.placeholder, y.dataDropDow, y.typeDropdow, y.labelTitle, y.colsFindPopup, y.fieldDataKey, y.checkBox)}</div>
        }
      }
    })
  }
  const FuncFilter = () => {
    const x = props.columnsFilter
    return x.map(y => {
      return {
        "field": y.field,
        "component": (condition, cols, key) => {
          return <div key={key} style={{ display: "inline-block" }}>{FuncFilterSetEle(key, y.field, y.type, y.name, condition, cols.field, y.fieldLabel, y.placeholder, y.dataDropDow, y.typeDropdow, y.labelTitle, y.colsFindPopup, y.fieldDataKey, y.checkBox)}</div>
        }
      }
    })
  }
  //===========================================================
  const onHandleChangeKeyEnter = (
    value,
    dataObject,
    field,
    fieldDataKey,
    event
  ) => {
    if (event && event.key == "Enter") {
      onHandleFilterConfirm(true);
    }
  };
  const FuncFilterSetEle = (key, field, type, name, condition, colsField, fieldLabel, placeholder, dataDropDow, typeDropdow, labelTitle, colsFindPopup, fieldDataKey, inputType) => {
    if (type === "input") {
      return (
        <div key={key}>
          <label style={{ width: "150px", paddingLeft: "20px" }}>{t(name)} : </label>
          <AmInput
            id={field}
            placeholder={placeholder}
            style={{ width: "200px" }}
            type="input"
            onChangeV2={(ele) => { onChangeFilter(condition, colsField, ele) }}
            onKeyPress={(value, obj, element, event) =>
              onHandleChangeKeyEnter(
                value,
                null,
                "PalletCode",
                null,
                event
              )
            } />
        </div>
      )
    } else if (type === "dropdow") {
      return <FormInline> <label style={{ margin: "0px", width: "150px", paddingLeft: "20px" }}>{t(name)} : </label>   <AmDropdown
        id={field}
        placeholder={placeholder}
        fieldDataKey={fieldDataKey}
        fieldLabel={fieldLabel}
        labelPattern=" : "
        width={200}
        ddlMinWidth={200}
        zIndex={1000}
        valueData={valueText2[field]}
        queryApi={dataDropDow}
        onChange={(value, dataObject, inputID, fieldDataKey) => onHandleDDLChangeFilter(value, dataObject, inputID, fieldDataKey, condition, colsField)}
        ddlType={typeDropdow}
      /> </FormInline>
    } else if (type === "findPopup") {
      return <FormInline><label style={{ margin: "0px", width: "150px", paddingLeft: "20px" }}>{t(name)} : </label><AmFindPopup
        id={field}
        placeholder={placeholder}
        fieldDataKey={fieldDataKey}
        fieldLabel={fieldLabel}
        labelPattern=" : "
        valueData={valueText2[field]}
        labelTitle={labelTitle}
        queryApi={dataDropDow}
        columns={colsFindPopup}
        width={200}
        onChange={(value, dataObject, inputID, fieldDataKey) => onHandleDDLChangeFilter(value, dataObject, inputID, fieldDataKey, condition, colsField)}
      /></FormInline>
    } else if (type === "status" || type === "iotype") {

      return <FormInline> <label style={{ margin: "0px", width: "150px", paddingLeft: "20px" }}>{t(name)} : </label><AmDropdown
        id={field}
        placeholder={placeholder}
        fieldDataKey={"value"}
        width={200}
        ddlMinWidth={200}
        zIndex={1000}
        valueData={valueText2[field]}
        data={dataDropDow}
        onChange={(value, dataObject, inputID, fieldDataKey) => onHandleDDLChangeFilter(value, dataObject, inputID, fieldDataKey, condition, colsField)}
        ddlType={typeDropdow}
      /> </FormInline>
    } else if (type === "dateFrom") {
      return <FormInline> <label style={{ margin: "0px", width: "150px", paddingLeft: "20px" }}>{t(name)} : </label>
        <AmDate
          id={field}
          TypeDate={"date"}
          style={{ width: "200px" }}
          onChange={(value) => onChangeFilterDateTime(value, colsField, "dateFrom")}
          FieldID={"dateFrom"} >
        </AmDate>
      </FormInline>
    } else if (type === "dateTo") {
      return <FormInline> <label style={{ margin: "0px", width: "150px", paddingLeft: "20px" }}>{t(name)} : </label>
        <AmDate
          id={field}
          TypeDate={"date"}
          style={{ width: "200px" }}
          onChange={(value) => onChangeFilterDateTime(value, colsField, "dateTo")}
          FieldID={"dateTo"} >
        </AmDate>
      </FormInline>
    }
  }
  //===========================================================

  const [filterData, setFilterData] = useState([{ "f": "status", "c": "!=", "v": "2" }]);
  const [filterDialog, setFilterDialog] = useState(false);
  const [datetime, setDatetime] = useState({});
  //===========================================================
  const onChangeFilterDateTime = (value, field, type) => {
    let datetimeRange = datetime;
    if (value === null || value === undefined) {
      delete datetimeRange[type]
    }
    else {
      datetimeRange["field"] = field
      if (type === "dateFrom")
        datetimeRange[type] = value.fieldDataKey
      if (type === "dateTo")
        datetimeRange[type] = value.fieldDataKey ? value.fieldDataKey + "T23:59:59" : null
    }
    setDatetime(datetimeRange)
  }
  const onChangeFilter = (condition, field, value, type) => {

    let obj
    if (filterData.length > 0)
      obj = [...filterData];
    else
      obj = [condition];

    let filterDataList = filterData.filter(x => x.f === field)
    if (filterDataList.length > 0) {
      obj.forEach((x, idx) => {
        if (x.f === field) {
          if (typeof value === "object" && value !== null) {
            if (value.length > 0) {
              x.v = value.join(",")
              x.c = "in"
            } else {
              obj.splice(idx, 1)
            }
          }
          else {
            if (value) {
              x.v = value + '%';
              x.c = "like"
            } else {
              obj.splice(idx, 1)
            }
          }
        }
      })

    } else {
      if (type === "dateFrom") {
        let createObj = {};
        createObj.f = field
        createObj.type = "dateFrom"
        createObj.v = value
        createObj.c = ">="
        obj.push(createObj)
      } else if (type === "dateTo") {
        let createObj = {};
        createObj.f = field
        createObj.type = "dateTo"
        createObj.v = moment(value).format('YYYY-MM-DDT23:59:00')
        createObj.c = "<="
        obj.push(createObj)
      } else {
        let createObj = {};
        createObj.f = field
        createObj.v = value + "%"
        createObj.c = "like"
        obj.push(createObj)
      }
    }
    setFilterData(obj)
  }
  //===========================================================

  const onHandleFilterConfirm = (status, obj) => {
    if (status) {
      let getQuery = Clone(query);
      let filterDatas = [...filterData]
      if (datetime) {
        if (datetime["dateFrom"]) {
          let createObj = {}
          createObj.f = datetime.field
          createObj.v = datetime["dateFrom"]
          createObj.c = ">="
          filterDatas.push(createObj)
        }
        if (datetime["dateTo"]) {
          let createObj = {}
          createObj.f = datetime.field
          createObj.v = datetime["dateTo"]
          createObj.c = "<="
          filterDatas.push(createObj)
        }
      }
      getQuery.q = JSON.stringify(filterDatas);
      setQuery(getQuery)
    }
    setDatetime({})
    //setFilterData([{"f":"status","c":"!=","v":"2"}])
    setFilterDialog(false)
    setFilterDialog(false)
  }
  //===========================================================
  const [packCode, setPackCode] = useState("");
  const [packName, setPackName] = useState("");

  const onHandleDDLChange = (value, dataObject, inputID, fieldDataKey, data, required) => {
    setValueText1({
      ...valueText1, [inputID]: {
        value: value,
        dataObject: dataObject,
        fieldDataKey: fieldDataKey,
      }
    });
    onChangeEditor(inputID, data, value, null, null, required)
  }
  //=============================================================

  const [valueText2, setValueText2] = useState({})

  const onHandleDDLChangeFilter = (value, dataObject, inputID, fieldDataKey, condition, colsField) => {
    setValueText2({
      ...valueText2, [inputID]: {
        value: value,
        dataObject: dataObject,
        fieldDataKey: fieldDataKey,
      }
    });
    onChangeFilter(condition, colsField, value)
  }
  //=============================================================

  const FuncTestSetEle = (name, type, data, cols, dataDropDow, typeDropdow, colsFindPopup, placeholder, labelTitle, fieldLabel, validate, required, rowError) => {
    if (type === "input") {
      return <FormInline> <LabelH>{t(name)} : </LabelH>
        <InputDiv>
          <AmInput
            error={rowError}
            id={cols.field}
            required={required}
            validate={true}
            // msgError="Error"
            regExp={validate}
            style={{ width: "270px", margin: "0px" }}
            placeholder={placeholder}
            type="input"
            // value={data ? data[cols.field] : ""}
            onChange={(val) => { onChangeEditor(cols.field, data, val, null, null, required) }}
          />
        </InputDiv>
      </FormInline>
    } else if (type === "password") {
      return <FormInline> <LabelH>{t(name)} : </LabelH>
        <InputDiv>
          <AmInput
            error={rowError}
            autoComplete="off"
            id={cols.field}
            required={required}
            validate={true}
            // msgError="Error"
            regExp={validate}
            style={{ width: "270px", margin: "0px" }}
            placeholder={placeholder}
            type="password"
            // value={data ? data[cols.field] : ""}
            onChange={(val) => { onChangeEditor(cols.field, data, val, null, null, required) }}
          />
        </InputDiv>
      </FormInline>
    } else if (type === "dropdow") {
      return <FormInline> <LabelH>{t(name)} : </LabelH>
        <AmDropdown
          error={rowError}
          required={required}
          id={cols.field}
          placeholder={placeholder}
          fieldDataKey={"ID"}
          fieldLabel={fieldLabel}
          labelPattern=" : "
          width={270}
          ddlMinWidth={270}
          valueData={valueText1[cols.field]}
          queryApi={dataDropDow}
          defaultValue={data ? data[cols.field] : ""}
          onChange={(value, dataObject, inputID, fieldDataKey) => onHandleDDLChange(value, dataObject, inputID, fieldDataKey, data, required)}
          ddlType={typeDropdow}
        />
      </FormInline>
    } else if (type === "findPopup") {
      return <FormInline><LabelH>{t(name)} : </LabelH>
        <AmFindPopup
          error={rowError}
          required={required}
          id={cols.field}
          placeholder={placeholder}
          fieldDataKey="ID"
          fieldLabel={fieldLabel}
          labelPattern=" : "
          valueData={valueText1[cols.field]}
          labelTitle={labelTitle}
          queryApi={dataDropDow}
          columns={colsFindPopup}
          defaultValue={data ? data[cols.field] : ""}
          width={270}
          onChange={(value, dataObject, inputID, fieldDataKey) => onHandleChange(value, dataObject, inputID, fieldDataKey, data, required)}
        />
      </FormInline>
    } else if (type === "inputPackCode") {
      return <FormInline> <LabelH>{t(name)} : </LabelH>
        <InputDiv>
          <AmInput
            error={rowError}
            required={required}
            id={cols.field}
            style={{ width: "270px", margin: "0px" }}
            placeholder={placeholder}
            type="input"
            // value={(data[cols.field] && data ? data[cols.field] : packCode)}
            onChange={(val) => { onChangeEditor(cols.field, data, val, "Pack Code", null, required) }}
          />
        </InputDiv>
      </FormInline>
    } else if (type === "inputPackName") {
      return <FormInline> <LabelH>{t(name)} : </LabelH>
        <InputDiv>
          <AmInput
            error={rowError}
            required={required}
            id={cols.field}
            style={{ width: "270px", margin: "0px" }}
            placeholder={placeholder}
            type="input"
            // value={(data[cols.field] && data ? data[cols.field] : packName)}
            onChange={(val) => { onChangeEditor(cols.field, data, val, "Pack Name", null, required) }}
          />
        </InputDiv>
      </FormInline>
    } else if (type === "status" || type === "iotype") {
      return <FormInline> <LabelH>{t(name)} : </LabelH>
        <AmDropdown
          error={rowError}
          id={cols.field}
          required={required}
          placeholder={placeholder}
          fieldDataKey={"value"}
          width={270}
          ddlMinWidth={270}
          valueData={valueText1[cols.field]}
          data={dataDropDow}
          defaultValue={data ? data[cols.field] : ""}
          onChange={(value, dataObject, inputID, fieldDataKey) => onHandleDDLChange(value, dataObject, inputID, fieldDataKey, data, required)}
          ddlType={typeDropdow}
        />
      </FormInline>
    }
  }
  //=============================================================

  const FuncTestSetEleEdit = (name, type, data, cols, dataDropDow, typeDropdow, colsFindPopup, placeholder, labelTitle, fieldLabel, validate, inputType, required, rowError) => {
    if (type === "input") {
      return <FormInline> <LabelH>{t(name)} : </LabelH>
        <InputDiv>
          <AmInput
            error={rowError}
            required={required}
            id={cols.field}
            validate={true}
            // msgError="Error"
            regExp={validate}
            style={{ width: "270px", margin: "0px" }}
            placeholder={placeholder}
            type={"input"}
            defaultValue={data ? data[cols.field] : ""}
            onChange={(val) => { onChangeEditor(cols.field, data, val, "", inputType, required) }}
          />
        </InputDiv>
      </FormInline>
    } else if (type === "password") {
      return <FormInline> <LabelH>{t(name)} : </LabelH>
        <InputDiv>
          <AmInput
            error={rowError}
            required={required}
            id={cols.field}
            validate={true}
            // msgError="Error"
            regExp={validate}
            style={{ width: "270px", margin: "0px" }}
            placeholder={placeholder}
            type={"password"}
            defaultValue={data ? data[cols.field] : ""}
            onChange={(val) => { onChangeEditor(cols.field, data, val, "", inputType, required) }}
          />
        </InputDiv>
      </FormInline>
    } else if (type === "dropdow") {
      return <FormInline> <LabelH>{t(name)} : </LabelH>
        <AmDropdown
          error={rowError}
          required={required}
          id={cols.field}
          placeholder={placeholder}
          fieldDataKey={"ID"}
          fieldLabel={fieldLabel}
          labelPattern=" : "
          width={270}
          ddlMinWidth={270}
          valueData={valueText1[cols.field]}
          queryApi={dataDropDow}
          defaultValue={data ? data[cols.field] : ""}
          onChange={(value, dataObject, inputID, fieldDataKey) => onHandleDDLChange(value, dataObject, inputID, fieldDataKey, data, required)}
          ddlType={typeDropdow}
        />
      </FormInline>
    } else if (type === "findPopup") {
      return <FormInline> <LabelH>{t(name)} : </LabelH>
        <AmFindPopup
          error={rowError}
          required={required}
          id={cols.field}
          placeholder={placeholder}
          fieldDataKey="ID"
          fieldLabel={fieldLabel}
          labelPattern=" : "
          valueData={valueText1[cols.field]}
          labelTitle={labelTitle}
          queryApi={dataDropDow}
          columns={colsFindPopup}
          defaultValue={data ? data[cols.field] : ""}
          width={270}
          onChange={(value, dataObject, inputID, fieldDataKey) => onHandleChange(value, dataObject, inputID, fieldDataKey, data, required)}
        />
      </FormInline>
    } else if (type === "inputPackCode") {
      if (!valueText1["SKUMaster_ID"]) {
        setPackCode(data[cols.field])
      }
      return <FormInline> <LabelH>{t(name)} : </LabelH>
        <InputDiv>
          <AmInput
            error={rowError}
            required={required}
            id={cols.field}
            style={{ width: "270px", margin: "0px" }}
            placeholder={placeholder}
            type="input"
            // value={packCode}
            onChange={(val) => { onChangeEditor(cols.field, data, val, "Pack Code", null, required) }}
          />
        </InputDiv>
      </FormInline>
    } else if (type === "inputPackName") {
      if (!valueText1["SKUMaster_ID"]) {
        setPackName(data[cols.field])
      }
      return <FormInline> <LabelH>{t(name)} : </LabelH>
        <InputDiv>
          <AmInput
            error={rowError}
            required={required}
            id={cols.field}
            style={{ width: "270px", margin: "0px" }}
            placeholder={placeholder}
            type="input"
            // value={packName}
            onChange={(val) => { onChangeEditor(cols.field, data, val, "Pack Name", null, required) }}
          />
        </InputDiv>
      </FormInline>
    } else if (type === "status" || type === "iotype") {
      return <FormInline> <LabelH>{t(name)} : </LabelH>
        <AmDropdown
          error={rowError}
          required={required}
          id={cols.field}
          placeholder={placeholder}
          fieldDataKey={"value"}
          width={270}
          ddlMinWidth={270}
          valueData={valueText1[cols.field]}
          data={dataDropDow}
          defaultValue={data ? data[cols.field] : ""}
          onChange={(value, dataObject, inputID, fieldDataKey) => onHandleDDLChange(value, dataObject, inputID, fieldDataKey, data, required)}
          ddlType={typeDropdow}
        />
      </FormInline>
    }
  }
  //=============================================================

  const onHandleChange = (value, dataObject, inputID, fieldDataKey, data, required) => {
    setValueText1({
      ...valueText1, [inputID]: {
        value: value,
        dataObject: dataObject,
        fieldDataKey: fieldDataKey,
      }
    });

    if (props.tableQuery === "PackMaster") {
      if (dataObject !== null) {
        setPackCode(dataObject.Code)
        setPackName(dataObject.Name)
      }
      if (dataObject === null) {
        setPackCode("")
        setPackName("")
      }

    }
    onChangeEditor(inputID, data, value, null, null, required)
  };
  //=============================================================
  const [dataSource, setDataSource] = useState([]);
  const [dataSource1, setDataSource1] = useState([]);
  const [totalSize, setTotalSize] = useState(0);
  const [columns, setColumns] = useState(FuncSetTable());
  const [sort, setSort] = useState(0);
  const [page, setPage] = useState();
  const [selection, setSelection] = useState();
  const [query, setQuery] = useState(Query);
  const [query2, setQuery2] = useState(Query2)
  const [editRow, setEditRow] = useState([]);
  const [editData, setEditData] = useState({});
  const [deleteData, setDeleteData] = useState();
  const [deleteDataTmp, setDeleteDataTmp] = useState([]);
  const [addData, setAddData] = useState(false);
  const [dialog, setDialog] = useState(false);
  const [dialogEdit, setDialogEdit] = useState(false);
  const [dialogEditPassWord, setDialogEditPassWord] = useState(false);
  const [dialogRole, setDialogRole] = useState(false);
  const [dialogDelete, setDialogDelete] = useState(false);
  const [data2, setData2] = useState({});
  // const [dataSentToAPI, setDataSentToAPI] = useState([]);
  const [openSuccess, setOpenSuccess] = useState(false);
  const [openError, setOpenError] = useState(false);
  const [textError, setTextError] = useState("");
  const [excelDataSrouce, setExcelDataSource] = useState([]);
  //===========================================================

  const onHandleEditConfirm = (status, rowdata, arrObjInputError, type) => {

    if (status) {
      if (arrObjInputError.length) {
        setInputError(arrObjInputError.map(x => x.field))
      } else {
        console.log("is Action");
        UpdateData(rowdata, type);
        // UpdateData();
      }
      // UpdateData()
    } else {
      setValueText1([])
      setEditData()
      setAddData(false)
      setDialog(false)
      setDialogEdit(false)
      setDialogEditPassWord(false)
      setPackCode("")
      setPackName("")
    }

  }

  //===========================================================  

  const onHandleDeleteConfirm = (status, rowdata) => {
    if (status) {
      DeleteData()
    }
    setDialogDelete(false)
  }
  //===========================================================  
  useEffect(() => {
  }, [editRow])

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

  useEffect(() => {
    if (sort) {
      const queryEdit = JSON.parse(JSON.stringify(query));
      queryEdit.s = '[{"f":"' + sort.field + '", "od":"' + sort.order + '"}]';
      setQuery(queryEdit)

    }
  }, [sort])
  //===========================================================

  async function getData(qryString) {

    const res = await Axios.get(qryString).then(res => res)
    setDataSource(res.data.datas)
    setTotalSize(res.data.counts)
    setPackCode("")
    Axios.get(createQueryString(query2)).then((res) => {
      setDataSource1(res.data.datas)
    })

    let getExcelQuery = Clone(ExportQuery);
    getExcelQuery.q = query.q
    const resExcel = await Axios.get(createQueryString(getExcelQuery)).then(res => res)
    setExcelDataSource(resExcel.data.datas)
  }
  //===========================================================
  let fil1 = {}
  const DeleteData = () => {
    let dataDelete = idEdit[0]
    dataDelete["Status"] = 2
    delete dataDelete["ModifyBy"]
    delete dataDelete["ModifyTime"]

    var DataTmp = []
    DataTmp.push(dataDelete)
    let updjson = {
      "t": props.table,
      "pk": "ID",
      "datas": DataTmp,
      "nr": false,
      "_token": localStorage.getItem("Token")
    }
    Axios.put(window.apipath + "/v2/InsUpdDataAPI", updjson).then((res) => {
      if (res.data._result !== undefined) {
        if (res.data._result.status === 1) {
          setOpenSuccess(true)
          getData(createQueryString(query))
          Clear()
        } else {
          setOpenError(true)
          setTextError(res.data._result.message)
          getData(createQueryString(query))
          Clear()
        }
      }
    })
  }
  //===========================================================

  const onChangeEditor = (field, rowdata, value, type, inputType, required) => {

    if (inputType === "number" && value == "") {
      value = null
    }
    let fil = {}
    if (type === "Pack Code") {
      setPackCode(value)
      setValueText1({ SKUMaster_ID: "xxxxxx" })
    } else if (type === "Pack Name") {
      setPackName(value)
      setValueText1({ SKUMaster_ID: "xxxxxx" })
    }

    let editDataNew = Clone(editData)

    if (addData && Object.getOwnPropertyNames(editDataNew).length === 0) {
      editDataNew["ID"] = null
      editDataNew["Revision"] = 1;
      editDataNew["Status"] = 1;
      editDataNew[field] = value;
      if (props.tableQuery === "PackMaster") {
        editDataNew["Code"] = packCode;
        editDataNew["Name"] = packName;
      }
    } else {
      editDataNew[field] = value;
    }

    setEditData(editDataNew);

    if (required) {
      if (!editDataNew[field]) {
        const arrNew = [...new Set([...inputError, field])]
        setInputError(arrNew)
      } else {
        const arrNew = [...inputError]
        const index = arrNew.indexOf(field);
        if (index > -1) {
          arrNew.splice(index, 1);
        }
        setInputError(arrNew)
      }
    }
  }
  //===========================================================
  useEffect(() => {
    setColumns(Clone(columns))
  }, [dataSource, editRow])

  //===========================================================
  const UpdateData = (rowdata, type) => {
    console.log(rowdata)
    console.log(props.dataEdit)

    var dataEditx = {}
    if (type === "edit") {

      console.log(props.dataEdit)
      props.dataEdit.forEach(y => {
        dataEditx["ID"] = rowdata["ID"]
        dataEditx[y.field] = rowdata[y.field]

      })
    } else {

      props.dataAdd.forEach(y => {
        dataEditx["ID"] = null
        dataEditx[y.field] = rowdata[y.field]
        dataEditx["Status"] = 1
      })
    }
    console.log(dataEditx)
    let updjson = {
      "t": props.table,
      "pk": "ID",
      "datas": [dataEditx],
      "nr": false,
      "_token": localStorage.getItem("Token")
    }
    console.log(updjson)
    Axios.put(window.apipath + "/v2/InsUpdDataAPI", updjson).then((res) => {
      if (res.data._result !== undefined) {
        if (res.data._result.status === 1) {
          setOpenSuccess(true)

          dataEditx = {}
          getData(createQueryString(query))
          Clear()
        } else {
          setOpenError(true)

          dataEditx = {}
          setTextError(res.data._result.message)
          getData(createQueryString(query))
          Clear()
        }
      }
    })
  }
  //===========================================================

  const Clear = () => {
    setEditRow([])
    setDeleteDataTmp([])
    setData2({})
    setDialog(false)
    setDialogRole(false)
    setDialogEdit(false)
    // setDataSentToAPI([])
    setValueText1([])
    setPackCode("")
    setPackName("")
  }
  //===========================================================
  return (
    <div>
      <AmFilterTable defaultCondition={{ "f": "status", "c": "!=", "v": "2" }} primarySearch={FuncFilterPri()} extensionSearch={FuncFilter()} onAccept={(status, obj) => onHandleFilterConfirm(status, obj)} /><br />
      <AmDialogs typePopup={"success"} onAccept={(e) => { setOpenSuccess(e) }} open={openSuccess} content={"Success"} ></AmDialogs>
      <AmDialogs typePopup={"error"} onAccept={(e) => { setOpenError(e) }} open={openError} content={textError} ></AmDialogs>
      <AmEditorTable
        // renderOptionalText={<span style={{ color: "red" }}>* required field  </span>}
        //style={{width:"600",height:"300px"}} 
        open={dialog}
        onAccept={(status, rowdata, inputError) => onHandleEditConfirm(status, rowdata, inputError, "add")}
        titleText={addData === true ? 'Add' : 'Edit'}
        data={editData}
        columns={FuncTest()}
        objColumnsAndFieldCheck={{ objColumn: props.dataAdd, fieldCheck: "field" }}
      />
      <AmEditorTable
        open={dialogEdit}
        onAccept={(status, rowdata, inputError) => onHandleEditConfirm(status, rowdata, inputError, "edit")}
        titleText={addData === true ? 'Add' : 'Edit'}
        data={editData}
        columns={FuncTestEdit()}
        objColumnsAndFieldCheck={{ objColumn: props.dataEdit, fieldCheck: "field" }}
      />
      <AmEditorTable
        open={dialogEditPassWord}
        onAccept={(status, rowdata) => onHandleEditConfirm(status, rowdata)}
        titleText={addData === true ? 'Add' : 'Edit Password '}
        data={editData}
        columns={FuncTestEditPassWord()}
      />
      <AmEditorTable
        open={dialogDelete}
        onAccept={(status) => onHandleDeleteConfirm(status)}
        titleText={'Confirm Delete'}
        columns={[]}
      />
      <AmEditorTable
        open={dialogRole}
        onAccept={(status, rowdata) => onHandleSetRoleConfirm(status, rowdata)}
        titleText={'Edit Role'}
        data={editData}
        columns={FuncGetRole()}
      />

      <Table
        primaryKey="ID"
        data={dataSource}
        columns={columns}
        pageSize={100}
        sort={(sort) => setSort({ field: sort.id, order: sort.sortDirection })}
        style={{ maxHeight: "550px" }}
        editFlag="editFlag"
        currentPage={page}
        exportData={true}
        excelData={excelDataSrouce}
        renderCustomButtonB4={<AmButton style={{ marginRight: "5px" }} styleType="add" onClick={() => { FuncTest(); setAddData(true); setDialog(true) }} >{t("Add")}</AmButton>}
      />
      <Pagination
        totalSize={totalSize}
        pageSize={100}
        onPageChange={(page) => setPage(page)}
      />
      <br />
    </div>
  )
}
export default AmSetUserPer;