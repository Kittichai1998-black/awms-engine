import React, { useState, useEffect } from "react";
import Table from '../../components/table/AmTable';
// import DocView from "./DocumentView";
import Pagination from '../../components/table/AmPagination';
import AmEditorTable from '../../components/table/AmEditorTable';
import axios from 'axios';
import { apicall, createQueryString } from '../../components/function/CoreFunction';
import Clone from '../../components/function/Clone'
import AmButton from "../../components/AmButton";
import AmInput from "../../components/AmInput";
import AmDialogs from "../../components/AmDialogs";
import styled from 'styled-components'
import AmDropdown from '../../components/AmDropdown';
import AmFindPopup from '../../components/AmFindPopup';
import AmFilterTable from '../../components/table/AmFilterTable';
// import AmCheckBox from '../../components/AmCheckBox'
import AmDate from "../../components/AmDate";
import guid from 'guid';
import moment from 'moment';
import { useTranslation } from 'react-i18next'
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
const AmSetOjectSize = (props) => {
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
  const [selection, setSelection] = useState();
  useEffect(() => {
    
  }, [selection])

  const FuncSetTable = () => {
    const iniCols = props.iniCols
    if (props.customPer === true) {
      iniCols.push(
        {
          Header: 'ObjectSize Map',
          width: 130,
          Cell: (e) =>
            <AmButton style={{ lineHeight: "1" }} styleType="confirm" onClick={() => { FuncSetEleRole(e); setEditData(e); setTimeout(() => setDialogRole(true), 500) }} >
              {t('ObjectSize Map')}
            </AmButton>,
          sortable: false,
        }, {
          Header: 'Edit',
          width: 80,
          Cell: (e) =>
            <AmButton style={{ lineHeight: "1" }} styleType="info" onClick={() => { setEditData(e); edit(e, "edit") }} >
              {t('Edit')}
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
  const [dataObjectType, setDataObjectType] = useState("");
  const [datax, setDatax] = useState([])
  const FuncGetRole = () => {
    // console.log(datax)
    // console.log(objectSize)
    const iniCols = [
      { Header: 'Code', accessor: 'Code', fixed: 'left', width: 250 },
      { Header: 'Name', accessor: 'Name', width: 250 },
      {
        Header: 'MinQuantity',
        width: 120,
        Cell: (e) =>
          //console.log(e)
          <AmInput
            id={"MinQuantity"}
            type="input"
            defaultValue={e.original.MinQuantity}
            onChange={(val) => { onChangeEditorObjectSize(e.column.Header, e.original, val) }}
          />
        ,
        sortable: false,
      }, {
        Header: 'MaxQuantity',
        width: 120,
        Cell: (e) =>
          //console.log(e)
          <AmInput
            id={"MaxQuantity"}
            type="input"
            //value={data ? data[cols.field]:""}
            defaultValue={e.original.MaxQuantity}
            onChange={(val) => { onChangeEditorObjectSize(e.column.Header, e.original, val) }}
          />,
        sortable: false,
      }
    ];

    return [{
      "field": "Code",
      "component": (data, cols, key) => {

        return <div key={key}>
          <Table
            primaryKey="ID"
            sortable={false}
            //defaultSelection={datax}
            //primaryKey="ID"
            data={objectSize}
            columns={iniCols}
            pageSize={100}
            style={{ maxHeight: "400px" }}
            selection={true}
            selectionType="checkbox"
            getSelection={(data) => { onSetSelection(data); }}
          /> </div>

      }
    }]


  }
  //===============================================================
  const [maxQuantity, setMaxQuantity] = useState("");
  const [minQuantity, setMinQuantity] = useState("");
  const [row, setRow] = useState({});

  const [dataQty, setDataQty] = useState({});
  const [dataRow, setDataRow] = useState();

  async function onSetSelection(dataSel) {

    setSelection(dataSel)
  }

  async function onChangeEditorObjectSize(field, rowdata, value, type, inputType) {

    if (selection.length === 0) {
      datax.forEach(y => {
        selection.push(y)
      })
    }

    selection.forEach(x => {
      if (x.ID === rowdata.ID) {
        x[field] = value;

        var dataOb = objectSize.find(y => y.ID === x.ID)
        dataOb[field] = value;
      }
    })


  }

  //================================================================================
  const [objectSize, setObjectSize] = useState([]);
  async function FuncSetEleRole(data) {
    //console.log(data)
    setDataObjectType(data.original.ObjectType)
    setDataRow(data.original.ID)
    // const ObjectSizeQuery = {
    //   queryString: window.apipath + "/v2/SelectDataMstAPI/",
    //   t: "ObjectSize",
    //   q:
    //   data.original.ObjectType !== 0 ?'[{ "f": "Status", "c":"<", "v": 2},{ "f": "ObjectType", "c":"in", "v": "0,1"}]':'[{ "f": "Status", "c":"=", "v": 10}]',
    //   f: "*",
    //   g: "",
    //   s: "[{'f':'ID','od':'asc'}]",
    //   sk: 0,
    //   l: 100,
    //   all: ""
    // };

    // await Axios.get(createQueryString(ObjectSizeQuery)).then(res => {
    //   setObjectSize(res.data.datas);
    // });
    await Axios.get(window.apipath + "/v2/GetObjectSizeMapAPI?"
      + "ID=" + data.original.ID
    ).then((rowselect1) => {
      //console.log(rowselect1)
      if (rowselect1) {
        if (rowselect1.data._result.status !== 0) {
          //console.log(rowselect1.data.datas)
          rowselect1.data.datas.forEach(x => {

            x.ID = x.ID
            x.MaxQuantity = x.MaxQuantity
            x.MinQuantity = x.MinQuantity
        
          })
          setObjectSize(rowselect1.data.datas);
        }
      }
    })

    var defaultRole = []
    const Query = {
      queryString: window.apipath + "/v2/SelectDataMstAPI/",
      t: "ObjectSizeMap",
      q: "[{ 'f': 'OuterObjectSize_ID', c:'==', 'v': " + data.original.ID + "},{ 'f': 'Status', 'c':'==', 'v': 1}]",
      f: "ID,InnerObjectSize_ID,OuterObjectSize_ID,MinQuantity,MaxQuantity",
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
        defaultRole.push({ "ID": x.InnerObjectSize_ID, "MinQuantity": x.MinQuantity, "MaxQuantity": x.MaxQuantity })
      })
    })
    //console.log(defaultRole)
    setDatax(defaultRole)
    setSelection(defaultRole)
    //return randerFunc(defaultRole,iniCols)
  }



  //=============================================================
  const onHandleSetRoleConfirm = (status, rowdata) => {

    if (status) {
      UpdateRole(rowdata)
    }
    setDialogRole(false)
    setMaxQuantity("")
    setMinQuantity("")
    setRow({})
  }


  //=============================================================
  async function UpdateRole(rowdata) {

    selection.forEach(sel => {
      for (var x in row) {
        if (row["ID"] === sel.ID) {
          sel.MaxQuantity = row["MaxQuantity"]
          sel.MinQuantity = row["MinQuantity"]
        }

      }
    })

    // console.log(rowdata)
    //console.log(selection)
    const Query3 = {
      queryString: window.apipath + "/v2/SelectDataMstAPI/",
      t: "ObjectSizeMap",
      q: "[{ 'f': 'OuterObjectSize_ID', c:'==', 'v': " + rowdata.ID + "}]",
      f: "ID,OuterObjectSize_ID,InnerObjectSize_ID,Status,MinQuantity,MaxQuantity",
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
          return list.ID === dataMap.InnerObjectSize_ID
        })
        //console.log(dataselect)
        if (dataselect) {
          selection.forEach(sel => {
            //console.log(sel)
            if (dataselect.ID === sel.ID) {
              dataMap.MinQuantity = sel.MinQuantity
              dataMap.MaxQuantity = sel.MaxQuantity
            }
          })

          dataMap.Status = 1
        } else {
          dataMap.Status = 0
        }
        return dataMap
      })

      var dataselectInsert = selection.map(datas => {
        var datafiInsert = row.find(listInsert => {
          return listInsert.InnerObjectSize_ID === datas.ID
        })

        if (!datafiInsert) {
          // console.log(row)
          // console.log(datas)
          return {
            ID: null,
            OuterObjectSize_ID: dataRow,
            InnerObjectSize_ID: datas.ID,
            MinQuantity: datas.MinQuantity,
            MaxQuantity: datas.MaxQuantity,
            Status: 1
          }
        }
      })


      return datafi.concat(dataselectInsert.filter(x => x !== undefined))

    }).then(response => {

      //console.log(response)
      let updjson = {
        "t": "ams_ObjectSizeMap",
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
  const [valueText1, setValueText1] = useState({})

  const FuncTest = () => {
    const x = props.dataAdd

    return x.map(y => {
      return {
        "field": y.field,
        "component": (data = null, cols, key) => {
          return <div key={key}>{FuncTestSetEle(y.name, y.type, data, cols, y.dataDropDow, y.typeDropdow, y.colsFindPopup, y.placeholder, y.labelTitle, y.fieldLabel, y.validate, y.required)}
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
          return <div key={key}>{FuncTestSetEleEdit(y.name, y.type, data, cols, y.dataDropDow, y.typeDropdow, y.colsFindPopup, y.placeholder, y.labelTitle, y.fieldLabel, y.validate, y.inputType)}</div>
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
            onChange={(ele) => { onChangeFilter(condition, colsField, ele) }} />
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

  const onHandleDDLChange = (value, dataObject, inputID, fieldDataKey, data) => {
    setValueText1({
      ...valueText1, [inputID]: {
        value: value,
        dataObject: dataObject,
        fieldDataKey: fieldDataKey,
      }
    });
    onChangeEditor(inputID, data, value)
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

  const FuncTestSetEle = (name, type, data, cols, dataDropDow, typeDropdow, colsFindPopup, placeholder, labelTitle, fieldLabel, validate, required) => {
    if (type === "input") {
      return <FormInline> <LabelH>{t(name)} : </LabelH>
        <InputDiv>
          <AmInput
            id={cols.field}
            required={required}
            validate={true}
            msgError="Error"
            regExp={validate}
            style={{ width: "270px", margin: "0px" }}
            placeholder={placeholder}
            type="input"
            value={data ? data[cols.field] : ""}
            onChange={(val) => { onChangeEditor(cols.field, data, val) }}
          />
        </InputDiv>
      </FormInline>
    } else if (type === "password") {
      return <FormInline> <LabelH>{t(name)} : </LabelH>
        <InputDiv>
          <AmInput
            autoComplete="off"
            id={cols.field}
            required={required}
            validate={true}
            msgError="Error"
            regExp={validate}
            style={{ width: "270px", margin: "0px" }}
            placeholder={placeholder}
            type="password"
            value={data ? data[cols.field] : ""}
            onChange={(val) => { onChangeEditor(cols.field, data, val) }}
          />
        </InputDiv>
      </FormInline>
    } else if (type === "dropdow") {
      return <FormInline> <LabelH>{t(name)} : </LabelH>
        <AmDropdown
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
          onChange={(value, dataObject, inputID, fieldDataKey) => onHandleDDLChange(value, dataObject, inputID, fieldDataKey, data)}
          ddlType={typeDropdow}
        />
      </FormInline>
    } else if (type === "findPopup") {
      return <FormInline><LabelH>{t(name)} : </LabelH>
        <AmFindPopup
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
          onChange={(value, dataObject, inputID, fieldDataKey) => onHandleChange(value, dataObject, inputID, fieldDataKey, data)}
        />
      </FormInline>
    } else if (type === "inputPackCode") {
      return <FormInline> <LabelH>{t(name)} : </LabelH>
        <InputDiv>
          <AmInput
            required={required}
            id={cols.field}
            style={{ width: "270px", margin: "0px" }}
            placeholder={placeholder}
            type="input"
            value={(data[cols.field] && data ? data[cols.field] : packCode)}
            onChange={(val) => { onChangeEditor(cols.field, data, val, "Pack Code") }}
          />
        </InputDiv>
      </FormInline>
    } else if (type === "inputPackName") {
      return <FormInline> <LabelH>{t(name)} : </LabelH>
        <InputDiv>
          <AmInput
            required={required}
            id={cols.field}
            style={{ width: "270px", margin: "0px" }}
            placeholder={placeholder}
            type="input"
            value={(data[cols.field] && data ? data[cols.field] : packName)}
            onChange={(val) => { onChangeEditor(cols.field, data, val, "Pack Name") }}
          />
        </InputDiv>
      </FormInline>
    } else if (type === "status" || type === "iotype") {
      return <FormInline> <LabelH>{t(name)} : </LabelH>
        <AmDropdown
          id={cols.field}
          required={required}
          placeholder={placeholder}
          fieldDataKey={"value"}
          width={270}
          ddlMinWidth={270}
          valueData={valueText1[cols.field]}
          data={dataDropDow}
          defaultValue={data ? data[cols.field] : ""}
          onChange={(value, dataObject, inputID, fieldDataKey) => onHandleDDLChange(value, dataObject, inputID, fieldDataKey, data)}
          ddlType={typeDropdow}
        />
      </FormInline>
    }
  }
  //=============================================================

  const FuncTestSetEleEdit = (name, type, data, cols, dataDropDow, typeDropdow, colsFindPopup, placeholder, labelTitle, fieldLabel, validate, inputType) => {
    if (type === "input") {
      return <FormInline> <LabelH>{t(name)} : </LabelH>
        <InputDiv>
          <AmInput
            id={cols.field}
            validate={true}
            msgError="Error"
            regExp={validate}
            style={{ width: "270px", margin: "0px" }}
            placeholder={placeholder}
            type={"input"}
            defaultValue={data ? data[cols.field] : ""}
            onChange={(val) => { console.log(val); onChangeEditor(cols.field, data, val, "", inputType) }}
          />
        </InputDiv>
      </FormInline>
    } else if (type === "password") {
      return <FormInline> <LabelH>{t(name)} : </LabelH>
        <InputDiv>
          <AmInput
            id={cols.field}
            validate={true}
            msgError="Error"
            regExp={validate}
            style={{ width: "270px", margin: "0px" }}
            placeholder={placeholder}
            type={"password"}
            defaultValue={data ? data[cols.field] : ""}
            onChange={(val) => { console.log(val); onChangeEditor(cols.field, data, val, "", inputType) }}
          />
        </InputDiv>
      </FormInline>
    } else if (type === "dropdow") {
      return <FormInline> <LabelH>{t(name)} : </LabelH>
        <AmDropdown
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
          onChange={(value, dataObject, inputID, fieldDataKey) => onHandleDDLChange(value, dataObject, inputID, fieldDataKey, data)}
          ddlType={typeDropdow}
        />
      </FormInline>
    } else if (type === "findPopup") {
      return <FormInline> <LabelH>{t(name)} : </LabelH>
        <AmFindPopup
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
          onChange={(value, dataObject, inputID, fieldDataKey) => onHandleChange(value, dataObject, inputID, fieldDataKey, data)}
        />
      </FormInline>
    } else if (type === "inputPackCode") {
      if (!valueText1["SKUMaster_ID"]) {
        setPackCode(data[cols.field])
      }
      return <FormInline> <LabelH>{t(name)} : </LabelH>
        <InputDiv>
          <AmInput
            id={cols.field}
            style={{ width: "270px", margin: "0px" }}
            placeholder={placeholder}
            type="input"
            value={packCode}
            onChange={(val) => { onChangeEditor(cols.field, data, val, "Pack Code") }}
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
            id={cols.field}
            style={{ width: "270px", margin: "0px" }}
            placeholder={placeholder}
            type="input"
            value={packName}
            onChange={(val) => { onChangeEditor(cols.field, data, val, "Pack Name") }}
          />
        </InputDiv>
      </FormInline>
    } else if (type === "status" || type === "iotype") {
      return <FormInline> <LabelH>{t(name)} : </LabelH>
        <AmDropdown
          id={cols.field}
          placeholder={placeholder}
          fieldDataKey={"value"}
          width={270}
          ddlMinWidth={270}
          valueData={valueText1[cols.field]}
          data={dataDropDow}
          defaultValue={data ? data[cols.field] : ""}
          onChange={(value, dataObject, inputID, fieldDataKey) => onHandleDDLChange(value, dataObject, inputID, fieldDataKey, data)}
          ddlType={typeDropdow}
        />
      </FormInline>
    }
  }
  //=============================================================

  const onHandleChange = (value, dataObject, inputID, fieldDataKey, data) => {
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
    onChangeEditor(inputID, data, value)
  };
  //=============================================================
  const [dataSource, setDataSource] = useState([]);
  const [dataSource1, setDataSource1] = useState([]);
  const [totalSize, setTotalSize] = useState(0);
  const [columns, setColumns] = useState(FuncSetTable());
  const [sort, setSort] = useState(0);
  const [page, setPage] = useState();

  const [query, setQuery] = useState(Query);
  const [query2, setQuery2] = useState(Query2)
  const [editRow, setEditRow] = useState([]);
  const [editData, setEditData] = useState();
  const [deleteData, setDeleteData] = useState();
  const [deleteDataTmp, setDeleteDataTmp] = useState([]);
  const [addData, setAddData] = useState(false);
  const [dialog, setDialog] = useState(false);
  const [dialogEdit, setDialogEdit] = useState(false);
  const [dialogEditPassWord, setDialogEditPassWord] = useState(false);
  const [dialogRole, setDialogRole] = useState(false);
  const [dialogDelete, setDialogDelete] = useState(false);
  const [data2, setData2] = useState({});
  const [dataSentToAPI, setDataSentToAPI] = useState([]);
  const [openSuccess, setOpenSuccess] = useState(false);
  const [openError, setOpenError] = useState(false);
  const [textError, setTextError] = useState("");
  const [excelDataSrouce, setExcelDataSource] = useState([]);
  //===========================================================

  const onHandleEditConfirm = (status, rowdata) => {

    if (status) {
      UpdateData()
    }
    setValueText1([])
    setEditData()
    setAddData(false)
    setDialog(false)
    setDialogEdit(false)
    setDialogEditPassWord(false)
    setPackCode("")
    setPackName("")
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
    const resExcel = await axios.get(createQueryString(getExcelQuery)).then(res => res)
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

  const onChangeEditor = (field, rowdata, value, type, inputType) => {

    if (inputType === "number" && value == "") {
      value = null
    }
    let fil = {}

    let cloneEditRow = [];
    let cloneData = idEdit[0]

    if (addData) {
      data2["ID"] = null;
      data2["Revision"] = 1;
      data2["Status"] = 1;
      data2[field] = value;

      cloneEditRow.push(data2)
      setDataSentToAPI(cloneEditRow)
    } else {
      cloneData[field] = value;
      setDataSentToAPI([cloneData])
    }
  }
  //===========================================================
  useEffect(() => {
    setColumns(Clone(columns))
  }, [dataSource, editRow])

  //===========================================================
  const UpdateData = () => {
    if (props.tableQuery === "User") {
      dataSentToAPI.forEach(row => {
        var guidstr = guid.raw().toUpperCase()
        var i = 0, strLength = guidstr.length;
        for (i; i < strLength; i++) {

          guidstr = guidstr.replace('-', '');

        }
        row["password"] = "@@sql_gen_password," + row["password"] + "," + guidstr
        row["SaltPassword"] = guidstr

        delete row["Password"]
        delete row["ModifyBy"]
        delete row["ModifyTime"]
      })
    } else {
      dataSentToAPI.forEach(row => {
        delete row["ModifyBy"]
        delete row["ModifyTime"]
      })
    }

    let updjson = {
      "t": props.table,
      "pk": "ID",
      "datas": dataSentToAPI,
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

  const Clear = () => {
    setEditRow([])
    setDeleteDataTmp([])
    setData2({})
    setDataSentToAPI([])
    setValueText1([])
    setPackCode("")
    setPackName("")
    setMaxQuantity("")
    setMinQuantity("")
    setRow({})
    setDatax([])
    setSelection()
  }
  //===========================================================
  return (
    <div>
      <AmFilterTable defaultCondition={{ "f": "status", "c": "!=", "v": "2" }} extensionSearch={FuncFilter()} onAccept={(status, obj) => onHandleFilterConfirm(status, obj)} /><br />
      <AmDialogs typePopup={"success"} onAccept={(e) => { setOpenSuccess(e) }} open={openSuccess} content={"Success"} ></AmDialogs>
      <AmDialogs typePopup={"error"} onAccept={(e) => { setOpenError(e) }} open={openError} content={textError} ></AmDialogs>
      <AmEditorTable renderOptionalText={<span style={{ color: "red" }}>* required field  </span>}
        //style={{width:"600",height:"300px"}} 
        open={dialog} onAccept={(status, rowdata) => onHandleEditConfirm(status, rowdata)} titleText={addData === true ? 'Add' : 'Edit'} data={editData} columns={FuncTest()} />
      <AmEditorTable open={dialogEdit} onAccept={(status, rowdata) => onHandleEditConfirm(status, rowdata)} titleText={addData === true ? 'Add' : 'Edit'} data={editData} columns={FuncTestEdit()} />
      <AmEditorTable open={dialogEditPassWord} onAccept={(status, rowdata) => onHandleEditConfirm(status, rowdata)} titleText={addData === true ? 'Add' : 'Edit Password '} data={editData} columns={FuncTestEditPassWord()} />
      <AmEditorTable open={dialogDelete} onAccept={(status) => onHandleDeleteConfirm(status)} titleText={'Confirm Delete'} columns={[]} />
      <AmEditorTable open={dialogRole} onAccept={(status, rowdata) => onHandleSetRoleConfirm(status, rowdata)} titleText={'Set ObjectSize'} data={editData} columns={FuncGetRole()} />

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
export default AmSetOjectSize;