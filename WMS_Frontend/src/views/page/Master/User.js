import React, {useState, useEffect, useRef} from "react";
import AmEntityStatus from "../../../components/AmEntityStatus";
import AmMaster from "../../pageComponent/AmMasterData/AmMaster";
import {EntityEventStatus} from "../../../components/Models/EntityStatus";

import IconButton from "@material-ui/core/IconButton";
import AmEditorTable from '../../../components/table/AmEditorTable';
import AmTable from "../../../components/AmTable/AmTable";
import { apicall } from '../../../components/function/CoreFunction2';
import GroupIcon from '@material-ui/icons/Group';

const Axios = new apicall()

//======================================================================
const User = props => {

  const [role, setRole] = useState();
  const [roleID, setRoleID] = useState();
  const [rolePermissionData, setRolePermissionData] = useState([]);
  const [relationComponent, setRelationComponent] = useState([]);
  const updateRolePermission = useRef([]);
  const [open, setOpen] = useState(false);

  const RoleQuery = {
    queryString: window.apipath + "/v2/SelectDataMstAPI/",
    t: "Role",
    q: '[{ "f": "Status", "c":"<", "v": 2}]',
    f: "ID,Code,Name",
    g: "",
    s: "[{'f':'ID','od':'asc'}]",
    sk: 0,
    l: 100,
    all: ""
  };

  const iniCols = [
    {
      Header: "Status",
      accessor: "Status",
      fixed: "left",
      width: 35,
      sortable: false,
      filterType:"dropdown",
      filterConfig:{
        filterType:"dropdown",
        dataDropDown:EntityEventStatus,
        typeDropDown:"normal"
      },
      Cell: e => getStatus(e.original)
    },
    { Header: "Code", accessor: "Code", fixed: "left", width: 120 },
    { Header: "Name", accessor: "Name", width: 200 },
    { Header: "Email Addres", accessor: "EmailAddress", width: 250 },
    { Header: "Mobile", accessor: "TelMobile", width: 150 },
    { Header: "Update By", accessor: "LastUpdateBy", width: 150 },
    {
      Header: "Update Time",
      accessor: "LastUpdateTime",
      width: 150,
    }
  ];
  const columns = [
    {
      field: "Code",
      type: "input",
      name: "Username",
      placeholder: "Username",
      required: true
    },
    {
      field: "Name",
      type: "input",
      name: "Name",
      placeholder: "Name",
      required: true
    },
    {
      field: "password",
      type: "password",
      name: "Password",
      placeholder: "Password",
      required: true
    },
    {
      field: "EmailAddress",
      type: "input",
      name: "Email Address",
      placeholder: "Email Address",
      validate: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
    },
    {
      field: "TelMobile",
      type: "input",
      name: "Mobile",
      placeholder: "Mobiles",
      validate: /^[0-9\.]+$/
    }
  ];
  const columnsEditPassWord = [
    {
      field: "password",
      type: "password",
      name: "Password",
      placeholder: "Password",
      required: true
    }
  ];
  const columnsEdit = [
    {
      field: "Code",
      type: "input",
      name: "Username",
      placeholder: "Username",
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
    {
      field: "EmailAddress",
      type: "input",
      name: "Email Address",
      placeholder: "Email Address",
      validate: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
    },
    {
      field: "TelMobile",
      type: "input",
      name: "Mobile",
      placeholder: "Mobiles",
      validate: /^[0-9\.]+$/
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
    {
      field: "Code",
      type: "input",
      name: "Username",
      placeholder: "Username"
    },
    {
      field: "Name",
      type: "input",
      name: "Name"
    }
  ];
  const columnsFilter = [
    {
      field: "EmailAddress",
      type: "input",
      name: "Email Address",
      placeholder: "Email Address"
    },
    {
      field: "TelMobile",
      type: "input",
      name: "Mobile",
      placeholder: "Mobiles"
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
    if(role !== undefined){
      Axios.get(
        window.apipath + "/v2/GetRolePermissionAPI?ID=" + roleID
      ).then(res => {
        setRolePermissionData(res.data.datas)})
    }
    return () => setRole()
  }, [role]);

  useEffect(() => {
    const getObjectSizeColumns = (dataSou) => {
      const objSizeCols = [
        { Header: "Code", accessor: "Code", width: 250 },
        { Header: "Name", accessor: "Name", width: 250 }
      ];

      if(dataSou !== undefined && dataSou.length > 0){
        setOpen(true)
      }

      const defaultValue = () => {
        console.log(dataSou.filter(x=> { console.log(x.Status !== 0 && x.Status !== 2 && x.Status !== null); console.log(x.Status);
          return x.RolePermissionID !== null && (x.Status !== 0 && x.Status !== 2 && x.Status !== null)
        }))
        return dataSou.filter(x=> x.RolePermissionID !== null && (x.Status !== 0 && x.Status !== 2 && x.Status !== null))
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
                  dataSource={dataSou}
                  selection={"checkbox"}
                  selectionData={sel => {
                    var select = [...sel];
                    var objUpdate = [];
                    var newObjSize = select.filter(x => x.RolePermissionID === null);
                    var oldObjSize = dataSou.filter(x => x.RolePermissionID !== null);
                    oldObjSize.forEach(e => {
                      var oldObj = select.find(x => x.RolePermissionID === e.RolePermissionID);
                      if(oldObj === undefined){
                        objUpdate.push({"ID":e.RolePermissionID, "Status":0})
                      }else{
                        if(e.Status !== 1)
                          objUpdate.push({"ID":e.RolePermissionID, "Status":1})
                      }
                    });
                    newObjSize.forEach(x=> {
                      objUpdate.push({"ID":null, "Status":1, "Role_ID":roleID, "Permission_ID":x.ID, "Revision":1 })
                    });

                    updateRolePermission.current = objUpdate;
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
    
    setRelationComponent(getObjectSizeColumns(rolePermissionData))
  }, [rolePermissionData])
  
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
      datas: updateRolePermission.current,
      nr: false,
      _token: localStorage.getItem("Token")
    };

    Axios.put(window.apipath + "/v2/InsUpdDataAPI", updjson).then(res => {
      if (res.data._result !== undefined) {
      }
    });
  }

  return (
    <div>
      {/* <MasterData
        columnsFilterPrimary={primarySearch}
        columnsFilter={columnsFilter}
        tableQuery={"User"}
        table={"ams_User"}
        dataAdd={columns}
        iniCols={iniCols}
        dataEdit={columnsEdit}
        customUser={true}
        dataUser={dataUser}
        columnsEditPassWord={columnsEditPassWord}
        history={props.history}
      /> */}
      <PopupObjSize relationComponent={relationComponent} open={open}/>
      <AmMaster
        columnsFilterPrimary={primarySearch}
        columnsFilter={columnsFilter}
        tableQuery={"User"}
        table={"ams_User"}
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

export default User;
