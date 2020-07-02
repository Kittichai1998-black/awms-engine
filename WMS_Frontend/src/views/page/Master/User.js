import React, {useState, useEffect, useRef} from "react";
import AmEntityStatus from "../../../components/AmEntityStatus";
import AmMaster from "../../pageComponent/AmMasterData/AmMaster";
import {EntityEventStatus} from "../../../components/Models/EntityStatus";

import IconButton from "@material-ui/core/IconButton";
import AmEditorTable from '../../../components/table/AmEditorTable';
import AmTable from "../../../components/AmTable/AmTable";
import { apicall } from '../../../components/function/CoreFunction2';
import GroupIcon from '@material-ui/icons/Group';
import LockIcon from '@material-ui/icons/Lock';
import AmInput from "../../../components/AmInput";
import AmDialogs from "../../../components/AmDialogs";

import guid from 'guid';

import styled from 'styled-components';

const Axios = new apicall()

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
//======================================================================
const User = props => {
  const [userPass, setUserPass] = useState();
  const [userPassID, setUserPassID] = useState();
  const [userID, setUserID] = useState();
  const [userRoleData, setUserRoleData] = useState([]);
  const [relationComponent, setRelationComponent] = useState([]);
  const updateUserRole = useRef([]);
  const [open, setOpen] = useState(false);
  const [openPassword, setOpenPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [dialogState, setDialogState] = useState({});

  const iniCols = [
    {
      Header: "Status",
      accessor: "Status",
      fixed: "left",
      fixWidth: 35,
      sortable: false,
      filterType:"dropdown",
      filterConfig:{
        filterType:"dropdown",
        dataDropDown:EntityEventStatus,
        typeDropDown:"normal"
      },
      Cell: e => getStatus(e.original)
    },
    { Header: "Code", accessor: "Code", fixed: "left", fixWidth: 120 },
    { Header: "Name", accessor: "Name", width: 200 },
    { Header: "Email Addres", accessor: "EmailAddress", width: 250 },
    { Header: "Mobile", accessor: "TelMobile", width: 150 },
    { Header: "Update By", accessor: "LastUpdateBy", width: 150 },
    {
      Header: "Update Time",
      accessor: "LastUpdateTime",
      width: 150,
    },
    {
      Header: "",
      width: 15,
      filterable:false,
      sortable:false,
      Cell: e => <IconButton
        size="small"
        aria-label="info"
        onClick={()=>{setUserID(e.original.ID); setUserPass(e.original)}}
        style={{ marginLeft: "3px" }}>
        <GroupIcon fontSize="small" style={{ color: "#3E5FFA" }}/>
      </IconButton>
    },
    {
      Header: "",
      width: 15,
      filterable:false,
      sortable:false,
      Cell: e => <IconButton
        size="small"
        aria-label="info"
        onClick={()=>{setUserPassID(e.original.ID)}}
        style={{ marginLeft: "3px" }}>
        <LockIcon fontSize="small" style={{ color: "#3E5FFA" }}/>
      </IconButton>
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
    if(userPass !== undefined){
      Axios.get(
        window.apipath + "/v2/GetUserRoleAPI?ID=" + userPass.ID
      ).then(res => {
        setUserRoleData(res.data.datas)})
    }
    return () => setUserPass()
  }, [userPass]);

  useEffect(()=> {
    if(userPassID !== undefined){
      setOpenPassword(true)
    }
  }, [userPassID]);

  useEffect(() => {
    const getUserRoleColumns = (dataSou) => {
      const objSizeCols = [
        { Header: "Code", accessor: "Code", width: 250 },
        { Header: "Name", accessor: "Name", width: 250 }
      ];

      if(dataSou !== undefined && dataSou.length > 0){
        setOpen(true)
      }

      const defaultValue = () => {
        return dataSou.filter(x=> x.User_ID !== null && (x.Status !== 0 && x.Status !== 2 && x.Status !== null))
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
                    var newObjSize = select.filter(x => x.User_ID === null);
                    var oldObjSize = dataSou.filter(x => x.User_ID !== null);
                    oldObjSize.forEach(e => {
                      var oldObj = select.find(x => x.ID === e.ID);
                      if(oldObj === undefined){
                        objUpdate.push({"ID":e.ID, "Status":0})
                      }else{
                        if(e.Status !== 1)
                          objUpdate.push({"ID":e.ID, "Status":1})
                      }
                    });
                    newObjSize.forEach(x=> {
                      objUpdate.push({"ID":null, "Status":1, "User_ID":userID, "Role_ID":x.ID, "Revision":1 })
                    });
                    updateUserRole.current = objUpdate;
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
    
    setRelationComponent(getUserRoleColumns(userRoleData))
  }, [userRoleData])
  
  const PopupObjSize = React.memo(({relationComponent, open}) => {
    return <AmEditorTable 
    open={open} 
    onAccept={(status, rowdata)=> {
      if(!status){
      }
      else{
        UpdateUserRole();
      }
      setOpen(false)
    }}
    titleText={"User Role"} 
    data={{}}
    columns={relationComponent}
  />});

  const PopupPassword = React.memo(({open}) => {
    return <AmEditorTable 
    open={openPassword} 
    onAccept={(status, rowdata)=> {
      if(!status){
      }
      else{
        UpdatePassword();
      }
      setOpenPassword(false);
    }}
    titleText={"Password"} 
    data={{}}
    columns={[{ 
      "field":"Password",
      "component":(data=null, cols, key)=>{
        return <div key={key}>
            <FormInline>
            <label style={{width:"150px",paddingLeft:"20px"}}>Password : </label>
            <AmInput 
              autoComplete="off"
              id="Password"
              placeholder="Password"
              required={true}
              validate={true}
              msgError="Error" 
              regExp={/^[0-9\.]+$/}
              style={{width:"270px",margin:"0px"}}
              type="password"
              value={password}
              onChangeV2={(value)=>{setPassword(value);}}/>
        </FormInline>
        </div>
      }
    }]}
  />});

  const UpdateUserRole = () => {
    let updjson = {
      t: "ams_User_Role",
      pk: "ID",
      datas: updateUserRole.current,
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

  const UpdatePassword = () => {
    var guidstr = guid.raw().toUpperCase()
    var i = 0, strLength = guidstr.length;
    for (i; i < strLength; i++) {
      guidstr = guidstr.replace('-', '');
    }
    var pass = "@@sql_gen_password," + password + "," + guidstr;

    let updjson = {
      t: "ams_User",
      pk: "ID",
      datas: [{"ID":userPassID, password:pass}],
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
      <PopupPassword open={openPassword}/>
      
      <AmDialogs
            typePopup={dialogState.type}
            onAccept={(e) => { setDialogState({ ...dialogState, state: false }) }}
            open={dialogState.state}
            content={dialogState.content} />
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
