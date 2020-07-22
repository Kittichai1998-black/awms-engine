import React, {useState, useEffect, useRef} from "react";
import AmEntityStatus from "../../../components/AmEntityStatus";
import AmMaster from "../../pageComponent/AmMasterData/AmMaster";
import {EntityEventStatus} from "../../../components/Models/EntityStatus";
import AmButton from "../../../components/AmButton";
import AmEditorTable from '../../../components/table/AmEditorTable';
import AmTable from "../../../components/AmTable/AmTable";
import { apicall } from '../../../components/function/CoreFunction2';
import { FaPallet } from 'react-icons/fa';
import IconButton from "@material-ui/core/IconButton";
import AmDialogs from "../../../components/AmDialogs";

const Axios = new apicall()
//======================================================================
const ObjectSize = props => {
  const [editObjectSizeID, setEditObjectSizeID] = useState();
  const [objectSizeData, setObjectSizeData] = useState([]);
  const [relationComponent, setRelationComponent] = useState([]);
  const updateObjSize = useRef([]);
  const [open, setOpen] = useState(false);
  const [dialogState, setDialogState] = useState({});


  const EntityObjectType = [
    { label: "Location", value: 0 },
    { label: "Base", value: 1 },
    { label: "Pack", value: 2 }
  ];

  const iniCols = [
    {
      Header: "Status",
      accessor: "Status",
      fixed: "left",
      fixWidth: 162,
      sortable: false,
      filterType:"dropdown",
      filterConfig:{
        filterType:"dropdown",
        dataDropDown:EntityEventStatus,
        typeDropDown:"normal"
      },
      Cell: e => getStatus(e.original)
    },
    { Header: "Code", accessor: "Code", width: 120 },
    { Header: "Name", accessor: "Name", width: 250 },
    //{ Header: 'ObjectType',accessor: 'ObjectType', width:100,type:'number'},
    {
      Header: "ObjectType Name",
      accessor: "ObjectName",
      width: 120,
      type: "number"
    },
    {
      Header: "WeightAccept",
      accessor: "PercentWeightAccept",
      width: 120,
      type: "number"
    },
    { Header: "Update By", accessor: "LastUpdateBy", width: 100 },
    {
      Header: "Update Time",
      accessor: "LastUpdateTime",
      width: 150,
      type: "datetime",
      dateFormat: "DD/MM/YYYY HH:mm"
    },
    {
      Header: "",
      width: 15,
      filterable:false,
      Cell: e => <IconButton
        size="small"
        aria-label="info"
        onClick={()=>{setEditObjectSizeID(e.original.ID)}}
        style={{ marginLeft: "3px" }}>
        <FaPallet style={{ color: "#3E5FFA" }}/>
      </IconButton>}
  ];

  const columns = [
    {
      field: "Code",
      type: "input",
      name: "Code",
      placeholder: "Code",
      required: true
    },
    {
      field: "Name",
      type: "input",
      name: "Name",
      placeholder: "Name",
      required: true
    },
    //{"field": "ObjectType","type":"input","name":"Object Type","placeholder":"ObjectType","validate":/^[0-9\.]+$/},
    {
      field: "ObjectType",
      type: "dropdown",
      typeDropDown: "normal",
      name: "ObjectType",
      dataDropDown: EntityObjectType,
      placeholder: "ObjectType"
    },
    {
      field: "PercentWeightAccept",
      type: "input",
      name: "Weight Accept",
      placeholder: "PercentWeightAccept"
    }
  ];

  const columnsEdit = [
    {
      field: "Code",
      type: "input",
      name: "Code",
      placeholder: "Code",
      validate: /^.+$/,
      required: true
    },
    {
      field: "Name",
      type: "input",
      name: "Name",
      placeholder: "Name",
      validate: /^.+$/,
      required: true
    },
    //{"field": "ObjectType","type":"input","name":"Object Type","placeholder":"ObjectType","validate":/^[0-9\.]+$/},
    {
      field: "ObjectType",
      type: "dropdown",
      typeDropDown: "search",
      name: "ObjectType",
      dataDropDown: EntityObjectType,
      placeholder: "ObjectType"
    },
    {
      field: "PercentWeightAccept",
      type: "input",
      name: "Weight Accept",
      placeholder: "PercentWeightAccept"
    },
    {
      field: "Status",
      type: "dropdown",
      typeDropDown: "normal",
      name: "Status",
      dataDropDown: EntityEventStatus,
      placeholder: "Status"
    }
  ];
  const primarySearch = [
    { field: "Code", type: "input", name: "Code", placeholder: "Code" },
    { field: "Name", type: "input", name: "Name", placeholder: "Name" }
  ];
  const columnsFilter = [
    //{"field": "ObjectType","type":"input","name":"Object Type","placeholder":"ObjectType"},
    {
      field: "ObjectType",
      type: "dropdown",
      typeDropDown: "search",
      name: "ObjectType",
      dataDropDown: EntityObjectType,
      placeholder: "ObjectType"
    },
    {
      field: "PercentWeightAccept",
      type: "input",
      name: "Weight Accept",
      placeholder: "PercentWeightAccept"
    },
    {
      field: "Status",
      type: "dropdown",
      typeDropDown: "normal",
      name: "Status",
      dataDropDown: EntityEventStatus,
      placeholder: "Status"
    },
    {
      field: "LastUpdateBy",
      type: "input",
      name: "Update By",
      placeholder: "Update By"
    },
    {
      field: "LastUpdateTime",
      type: "dateFrom",
      name: "Update From",
      placeholder: "Update Time From"
    },
    {
      field: "LastUpdateTime",
      type: "dateTo",
      name: "Update To",
      placeholder: "Update Time To"
    }
  ];

  const getStatus = value => {
    if (value.Status === "0" || value.Status === 0) {
      return <AmEntityStatus key={0} statusCode={0} />;
    } else if (value.Status === "1" || value.Status === 1) {
      return <AmEntityStatus key={1} statusCode={1} />;
    } else if (value.Status === "2" || value.Status === 2) {
      return <AmEntityStatus key={2} statusCode={2} />;
    } else {
      return null;
    }
  };
  
  useEffect(()=> {
    if(editObjectSizeID !== undefined){
      Axios.get(
        window.apipath + "/v2/GetObjectSizeMapAPI?ID=" + editObjectSizeID
      ).then(res => {
        console.log(res)
        setObjectSizeData(res.data.datas)})
    }
  }, [editObjectSizeID]);

  useEffect(() => {
    const getObjectSizeColumns = (objSizeData) => {
      const objSizeCols = [
        { Header: "Code", accessor: "Code", width: 250 },
        { Header: "Name", accessor: "Name", width: 250 }
      ];

      console.log(objSizeData)
      if(objSizeData !== undefined && objSizeData.length > 0){
        console.log("xx")
        setOpen(true)
      }

      const defaultValue = () => {
        return objSizeData.filter(x=> x.ObjMapID !== null && (x.Status !== 0 && x.Status !== 2 && x.Status !== null))
      }
      return [
        {
          field: "ID",
          component: (data, cols, key) => {
            return (
              <div key={key}>
                <AmTable
                  columns={objSizeCols}
                  dataKey={"ID"}
                  dataSource={objSizeData}
                  selection={"checkbox"}
                  selectionData={sel => {
                    var select = [...sel];
                    var objUpdate = [];
                    var newObjSize = select.filter(x => x.ObjMapID === null);
                    var oldObjSize = objSizeData.filter(x => x.ObjMapID !== null);
                    oldObjSize.forEach(e => {
                      var oldObj = select.find(x => x.ObjMapID === e.ObjMapID);
                      if(oldObj === undefined){
                        objUpdate.push({"ID":e.ObjMapID, "Status":0})
                      }else{
                        if(e.Status !== 1)
                          objUpdate.push({"ID":e.ObjMapID, "Status":1})
                      }
                    });
                    newObjSize.forEach(x=> {
                      objUpdate.push({"ID":null, "Status":1, "ObjectSize_ID":editObjectSizeID, "InnerObjectSize_ID":x.ID, "Revision":1 })
                    });

                    updateObjSize.current = objUpdate;
                  }}
                  selectionDefault={defaultValue()}
                  height={400}
                />{" "}
              </div>
            );
          }
        }
      ]
    }
    console.log(objectSizeData)
    setRelationComponent(getObjectSizeColumns(objectSizeData))
  }, [objectSizeData])
  
  const PopupObjSize = React.memo(({relationComponent, open}) => {
    return <AmEditorTable 
    open={open} 
    onAccept={(status, rowdata)=> {
      if(!status)
        setOpen(false)
      else{
        UpdateObjectSizeMap();
        setOpen(false)
      }
    }}
    titleText={"Object Size"} 
    data={{}}
    columns={relationComponent}
  />});

  const UpdateObjectSizeMap = () => {
    let updjson = {
      t: "ams_ObjectSizeMap",
      pk: "ID",
      datas: updateObjSize.current,
      nr: false,
      _token: localStorage.getItem("Token")
    };

    Axios.put(window.apipath + "/v2/InsUpdDataAPI", updjson).then(res => {
      if(res.data._result.status === 1){
        setDialogState({type:"success", content:"Success", state:true})
      }
      else{
        setDialogState({type:"error", content:res.data._result.message, state:true})
      }
    });
  }

  return (
    <div>
      <PopupObjSize relationComponent={relationComponent} open={open}/>
      <AmDialogs
            typePopup={dialogState.type}
            onAccept={(e) => { setDialogState({ ...dialogState, state: false }) }}
            open={dialogState.state}
            content={dialogState.content} />
      <AmMaster
        columnsFilterPrimary={primarySearch}
        columnsFilter={columnsFilter}
        tableQuery={"ObjectSize"}
        table={"ams_ObjectSize"}
        dataAdd={columns}
        history={props.history}
        columns={iniCols}
        dataEdit={columnsEdit}
        pageSize={25}
        tableType="view"
        updateURL={window.apipath + "/v2/InsUpdDataAPI"}
      />
    </div>
  );
};

export default ObjectSize;
