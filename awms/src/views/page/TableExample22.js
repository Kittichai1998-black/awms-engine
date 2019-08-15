import React, { useState, useEffect  } from "react";
import Table from '../../components/table/table';
import Pagination from '../../components/table/pagination';
import Axios from 'axios';
import {clone} from '../../components/function/clone';
import { CallbackContext } from '../../reducers/context';
import { isNumber } from "util";

const abcdef = (Component, xx) => {
    return () => {
        return <Component/>
    }
}

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
        + "&apikey=free03"
    return queryS
}
const TableExample = (props) => {


  const Query = {
    queryString: window.apipath + "/api/trx",
    t: "StorageObject",
    q: '[{ "f": "Status", "c":"=", "v": 1},{ "f": "ObjectType", "c":"=", "v": 2},{ "f": "EventStatus", "c":"in", "v": "11,12"}]',
    f: "ID, concat(Code, ':' ,Name) as Name, 0 as Name2",
    g: "",
    s: "[{'f':'ID','od':'asc'}]",
    sk: "",
    l: "100",
    all: "",
  };


    const [data, setData] = useState([]);
    const [totalSize, setTotalSize] = useState(0);
    const [sort, setSort] = useState(0);
    const [page, setPage] = useState();
    const [query, setQuery] = useState(Query);

    async function getData(qryString){
      const res = await Axios.get(qryString).then(res => res)
      setData(res.data.datas)
      setTotalSize(res.data.counts)
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

    //อัพเดทข้อมูลเมื่อมีคำสั่ง sort เข้ามา
    useEffect(()=> {
        if(sort){
            const queryEdit = JSON.parse(JSON.stringify(query));
            queryEdit.s = '[{"f":"'+ sort.field +'", "od":"'+sort.order+'"}]';
            setQuery(queryEdit)
        }
    }, [sort])

    //สร้าง Columns สำหรับแสดงข้อมูล
    
    const calWidth = (columsList) => {
      let tableWidth = 0;
      columsList.forEach((row)=> tableWidth = tableWidth+row.width);
      return tableWidth
    }

    const columns = [
    {"width": 150,"dataKey":"ID", "label":"ID"},
    {"width": 400, "flexGrow": 1.0, "dataKey":"Name", "label":"Name",},
    {"width": 200, "dataKey":"Name2", "label":"Name2",},
    {"width": 500, "flexGrow": 1.0, "dataKey":"Name", "label":"Name",},
    {"width": 500, "flexGrow": 1.0, "dataKey":"Name", "label":"Name",},
    {"width": 500, "flexGrow": 1.0, "dataKey":"Name", "label":"Name",},
    {"width": 500, "flexGrow": 1.0, "dataKey":"Name", "label":"Name",},
    {"width": 500, "flexGrow": 1.0, "dataKey":"Name", "label":"Name",},
    {"width": 500, "flexGrow": 1.0, "dataKey":"Name", "label":"Name",},]

    return (
      <div>
        <div style={{width:"100%", overflow:"auto"}}>
          <div style={{ height: 600, width: '100%', minWidth:calWidth(columns)}}>
              <Table 
              columns={columns}
              rowCount={data.length}
              rowGetter={({ index }) => {return data[index]}}
              onRowClick={event => console.log(event)}
              //onSelectData={(row) => setSelect(row)}
              sort={(sort) => setSort({field:sort.sortBy, order:sort.sortDirection})}
              sortBy={sort.field}
              sortDirection={sort.order}
              selectRow={true}
              selectType={"checkbox"}
            />
          </div>
        </div>
        <Pagination
              //จำนวนข้อมูลทั้งหมด
              totalSize={totalSize} 
              //จำนวนข้อมูลต่อหน้า
              pageSize={100}
              //return หน้าที่ถูกกด : function
              onPageChange={(page) => setPage(page)}/>
      </div>
    )
}

export default abcdef(TableExample);