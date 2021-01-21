import React, { useState, useEffect } from "react";
import Table from '../../components/table/AmTable';
import Pagination from '../../components/table/AmPagination';
import AmEditorTable from '../../components/table/AmEditorTable';
import AmFilterTable from '../../components/table/AmFilterTable';
import Axios from 'axios';
import Button from '@material-ui/core/Button';
import Clone from '../../components/function/Clone'
import AmButton from "../../components/AmButton";

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

const TableExample = (props) => {
  const Query = {
    queryString: window.apipath + "/v2/SelectDataTrxAPI",
    t: "StorageObject",
    q: '[{ "f": "Status", "c":"!=", "v": 2}]',
    f: "ID, concat(Code, ':' ,Name) as Name, 0 as Name2, CreateTime",
    g: "",
    s: "[{'f':'ID','od':'asc'}]",
    sk: "",
    l: "100",
    all: "",
  };

  let ExportQuery = {
    queryString: window.apipath + "/v2/SelectDataTrxAPI",
    t: "StorageObject",
    q: '[{ "f": "Status", "c":"!=", "v": 2}]',
    f: "ID, concat(Code, ':' ,Name) as Name, 0 as Name2, CreateTime",
    g: "",
    s: "[{'f':'ID','od':'asc'}]",
    sk: "",
    l: "",
    all: "",
  };

  const iniCols=[
    {
      Header: 'ID',
      accessor: 'ID',
      fixed: 'left',
      sortable:false,
    },
    {
      Header: 'Edit',
      width:100,
      Cell:(e)=><div onClick={()=>{setEditData(e); setEditDialog(true); ; setTitle("Edit")}}>Edit</div>,
      sortable:false,
    },
    {
      Header: 'Name2',
      accessor: 'Name2',
      width:100,
      type:"number",
    },
    {
      Header:()=><span>Name</span>,
      accessor: 'Name',
      width:1000,
    },
    {
      Header:()=><span>Date</span>,
      accessor: 'CreateTime',
      width:1000,
      type:"datetime",
      dateFormat:"DD/MM/YYYY"
    }];

    const editorList=[{
      "field":"Name2",
      "component":(data, cols, key)=>{return <div key={key}>Name2 : 
        <input 
          type="input" 
          defaultValue={data ? data.Name2 : ""} 
          onChange={(ele)=>{onChangeEditor(cols.field, data, ele.target.value)}}/>
        </div>
      }
    },{
      "field":"Name",
      "component":(data, cols, key)=>{return <div key={key}>Name : 
        <input 
          type="input" 
          defaultValue={data ? data.Name : ""} 
          onChange={(ele)=>{onChangeEditor(cols.field, data, ele.target.value)}}/>
        </div>
      }
    }];
    const primaryFilterList=[{
      "field":"Code",
      "component":(condition, cols, key)=>{
        return (
          <div key={key} style={{display:"inline-block"}}>
            <label>Code : </label>
            <input 
              type="input"
              value={primaryFilter[cols.field] === undefined ? "" : primaryFilter[cols.field]}
              onChange={(ele)=>{onChangeFilter(condition, cols.field, ele.target.value)}}/>
          </div>
        )
      }
    },{
      "field":"Name",
      "component":(condition, cols, key)=>{return (
        <div key={key} style={{display:"inline-block", padding:"10px"}}>
          <label>Name : </label>
          {console.log(primaryFilter[cols.field])}
          <input 
            type="input"
            value={primaryFilter[cols.field] === undefined ? "" : primaryFilter[cols.field]}
            onChange={(ele)=>{onChangeFilter(condition, cols.field, ele.target.value)}}/>
        </div>
      )
      }
    }];

    const filterList=[{
      "field":"Code",
      "component":(condition, cols, key)=>{
        return (
          <div key={key} style={{display:"inline-block"}}>
            <label>Name2 : </label>
            <input 
              type="input"
              onChange={(ele)=>{onChangeFilter(condition, cols.field, ele.target.value)}}/>
          </div>
        )
      }
    },{
      "field":"Name",
      "component":(condition, cols, key)=>{return (
        <div key={key} style={{display:"inline-block", padding:"10px"}}>
          <label>Name : </label>
          <input 
            type="input" 
            onChange={(ele)=>{onChangeFilter(condition, cols.field, ele.target.value)}}/>
        </div>
      )
      }
    }];

    const [dataSource, setDataSource] = useState([]);
    const [excelDataSrouce, setExcelDataSource] = useState([]);
    const [totalSize, setTotalSize] = useState(0);
    const [columns, setColumns] = useState(iniCols);
    const [sort, setSort] = useState(0);
    const [page, setPage] = useState();
    const [selection, setSelection] = useState();
    const [query, setQuery] = useState(Query);
    const [editRow, setEditRow] = useState([]);
    const [editData, setEditData] = useState();
    const [addData, setAddData] = useState(false);
    const [addDataID, setAddDataID] = useState(-1);
    const [editDialog, setEditDialog] = useState(false);
    const [primaryFilter, setPrimaryFilter] = useState({});
    const [title, setTitle] = useState([]);
    const [reload, setReload] = useState(false);
    
    const [filterData, setFilterData] = useState([]);

    const onHandleEditConfirm = (status, rowdata) => {
      let GetDataSource = Clone(dataSource)
      if(status){
        let res = GetDataSource.map(obj => {
          let edit = editRow.find(o => o.ID === obj.ID);
          if(edit)
            edit.editFlag = true;
          return edit || obj
        });
        setDataSource(res)
      }
      else {
          console.log(status)
        let res = editRow.map(obj => {
          let edit = GetDataSource.find(o => o.ID === obj.ID);
          return edit || obj
        });
          setEditRow(res);
          console.log(res)
      }

      setEditData()
      setAddDataID(addDataID-1);
      setAddData(false)
      setEditDialog(false)
    }

    const onHandleFilterConfirm = (status, obj) => {
      if(status){
        let getQuery = Clone(query);
        getQuery.q = JSON.stringify(filterData);
        setQuery(getQuery)
      }
      
      setFilterData([])
      setPrimaryFilter({})
    }

    useEffect(()=>{
      console.log(primaryFilter)
    })

    const onChangeFilter = (condition, field, value) => {
      let obj
      if(filterData.length > 0)
        obj = [...filterData];
      else
        obj = [condition];
      let filterDataList = filterData.filter(x=>x.f === field)
        if(filterDataList.length > 0){
          obj.forEach((x,idx)=> {
            if(x.f === field){
              x.v = value + "%"
              x.c = "like"
            }
          })
        }
        else{
          let createObj = {};
          createObj.f = field
          createObj.v = value + "%"
          createObj.c = "like"
          obj.push(createObj)
        }

      primaryFilter[field] = value;
      setPrimaryFilter(primaryFilter);
      setFilterData(obj)
    }

    const onChangeEditor = (field, rowdata, value) => {
        console.log(rowdata)
      let cloneEditRow = Clone(editRow);
      let cloneData = Clone(rowdata);
      
      let editList = cloneEditRow.filter(x=>x.ID === (rowdata ? rowdata.ID : addDataID));

      if(addData){
        if(editList.length > 0){
          if(editList.length > 0){
            editList[0][field] = value;
            setEditRow(cloneEditRow)
            setEditData(editList[0]);
          }
        }
        else{
          let addData = {};
          addData["ID"] = addDataID;
          addData[field] = value;
          cloneEditRow.unshift(addData)
          setEditRow(cloneEditRow);
          setEditData(addData);
        }
      }
      else{
        let editList = cloneEditRow.filter(x=>x.ID=== rowdata.ID);
        if(editList.length > 0){
          editList[0][field] = value;
          setEditRow(cloneEditRow)
        }
        else{
          cloneData[field] = value;
          setEditRow([cloneData])
        }
      }
    }

    useEffect(()=> {
      getData(createQueryString(query))
    }, [query])

    useEffect(()=> {
      if(typeof(page) === "number"){
        const queryEdit = JSON.parse(JSON.stringify(query));
        queryEdit.sk = page === 0 ? 0 : page * parseInt(queryEdit.l, 10);
        setQuery(queryEdit)
      }
    }, [page])

    useEffect(()=> {
        if(sort){
            const queryEdit = JSON.parse(JSON.stringify(query));
            queryEdit.s = '[{"f":"'+ sort.field +'", "od":"'+sort.order+'"}]';
            setQuery(queryEdit)
        }
    }, [sort])

    async function getData(qryString){

      let getExcelQuery = Clone(query);
      getExcelQuery.q = JSON.stringify(query.q);
      const resExcel = await Axios.get(createQueryString(getExcelQuery)).then(res => res)
      setExcelDataSource(resExcel.data.datas)

      const res = await Axios.get(qryString).then(res => res)
      setDataSource(res.data.datas)
      setTotalSize(res.data.counts)
    }

    useEffect(()=>{
      setColumns(Clone(columns))
    }, [dataSource, editRow])

    return (
      <div>
        <AmFilterTable defaultCondition={{"f":"status","c":"!=","v":"2"}} primarySearch={primaryFilterList} extensionSearch={filterList} onAccept={(status, obj)=>onHandleFilterConfirm(status, obj)}/>
        <AmEditorTable reload={reload} style={{ width: "600px", height: "500px" }} titleText={title} open={editDialog} onAccept={(status, rowdata)=>onHandleEditConfirm(status, rowdata)} data={editData} columns={editorList}/>
        <AmButton onClick={()=>{setAddData(true); setEditDialog(true); setTitle("Add"); setReload(!reload)}} styleType="confirm">Add</AmButton>
        
        <Table 
            //ข้อมูลตาราง
            primaryKey="ID"
            data={dataSource}
            //ข้อมูลหัวตาราง
            columns={columns}
            //จำนวนข้อมูลต่อหน้า
            pageSize={10}
            //func sort argument = Obj
            sort={(sort) => setSort({field:sort.id, order:sort.sortDirection})}
            //เปิด ปิด selection
            selection={true}
            //รูปแบบ selection
            selectionType="checkbox"
            //fucn รับข้อมูล selection argument=Array
            getSelection={(data)=>setSelection(data)}
            //css
            style={{maxHeight:"550px"}}
            //onRowClick={(e)=>console.log(e)}
            editFlag="editFlag"
            currentPage={page}
            exportData={true}
            renderCustomButtonB4={<button>xxx</button>}
            renderCustomButtonAF={<button>xxx</button>}
            renderCustomButtonBTMLeft={<div>
              <button style={{paddingTop:"100px"}}>xxx</button>
              </div>}
            renderCustomButtonBTMRight={<Pagination
              //จำนวนข้อมูลทั้งหมด
              totalSize={totalSize} 
              //จำนวนข้อมูลต่อหน้า
              pageSize={10}
              //return หน้าที่ถูกกด : function
              onPageChange={(page) => setPage(page)}/>}
            excelData={[]}
          />
        
      </div>
    )
}

export default TableExample;