import React, { useState, useEffect,useContext  } from "react";
import PropTypes from 'prop-types';
import Date from '../../components/AmDate'
import TextField from '@material-ui/core/TextField';
import moment from 'moment';
import Axios from 'axios';
import { Button } from "@material-ui/core";
import color from "@material-ui/core/colors/yellow";
import AmDialogs from '../../components/AmDialogs';
import AmDate from "../../components/AmDate";
import AmPopup from '../../components/AmPopup'
const columns = [{
    dataField: 'id',
    text: 'Product ID'
  }, {
    dataField: 'name',
    text: 'Product Name'
  }, {
    dataField: 'price',
    text: 'Product Price'
  }];



const xx = [{id:1},{id:2}];

function test(e){
  console.log(e)

}


function xxxx(){
 
  alert("Not found")
 
}
function xxxx1(){
 
  
  window.success("xxxxdddd")
  
}
function xxxx2(){
 
  window.error("xxxxxxxxxxxxxxxxxxxxxx")
  
}
function xxxx3(){
 
  window.warning("xxxxxxxxxxxxxxxxxxxxxx")

 
}

function Authorize() {
  let data = { "username": "admin", "password": "123456", "secretKey": "ABC@123" };
  let config = {
    headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json; charset=utf-8', 'accept': 'application/json' }
  };
  Axios.post(window.apipath + '/api/token/register', data, config)
    .then((res) => {
      console.log(res)
      if (res.data._result !== undefined) {
        if (res.data._result.status === 1) {
          savetoSession("Token", res.data.Token);
            GetMenu(res.data.Token);
        }      
      }    
    })
}

function savetoSession(name, data) {
  localStorage.setItem(name, data);
  sessionStorage.setItem(name, localStorage.getItem([name]));
}

function GetMenu(token) {
  Axios.get(window.apipath + '/api/PageSetup/menu/?token=' + token)
    .then((res) => {
      //  console.log(res)
      localStorage.setItem('MenuItems', JSON.stringify(res.data.webGroups));
    }).then(() => {
      this.setState({ status: true });
    }).catch((error) => {
      console.log(error)
    });
}

function Logout(){
  sessionStorage.clear();
  localStorage.clear();
}



const Test444 = (props) => {
    //const [date, setDate] = useState("");
    const [datetime, setDatetime] = useState("");
    const [time, setTime] = useState("");
    const [date, setDate] = useState("");
    const [text, setText] = useState("");
    const [checkData, setCheckData] = useState(false);
    const [preview, setPreview] = useState(false);

    useEffect(() => {
      

  }, [text])

    function datex(e){
      console.log(e)
      //setDate(e)
    }
    function datex1(e){
      console.log(e)
      //setDate(e)
    }
    function datetimex(e){
      console.log(e)
      //setDatetime(e)
    }
    function timex(e){
      console.log(e)
      //setTime(e)
    }

    // function popuptest(){
    // return <AmDialogs typePopup={"success"} content={"xxrrxffxxx"} ></AmDialogs>
    // }

    const handle = () => {
      setPreview(true)
  };
    return (
        <div>
     
           <Button onClick={(e) => {Authorize()}}>Login</Button> 
           <Button onClick={(e) => {Logout()}}>Logout</Button> 
           <br/><br/>


           <AmDate onChange={(e) => {datex(e)}} TypeDate={"date"} FieldID={"xxx"} defaultValue={true}  ></AmDate>
           <AmDate onChange={(e) => {datex1(e)}} TypeDate={"date"} FieldID={"xxx"} ></AmDate>  
           <AmDate onChange={(e) => {datetimex(e)}} TypeDate={"datetime-local"} FieldID={"xxx"} defaultValue={true} ></AmDate>
           <AmDate onChange={(e) => {datetimex(e)}} TypeDate={"datetime-local"} FieldID={"xxx"} ></AmDate>
           <AmDate onChange={(e) => {timex(e)}} TypeDate={"time"} FieldID={"xxx"}></AmDate>
           
           <br></br>
            <label>{date}</label> <br/><br/>
            <label>{datetime}</label><br/><br/>
            <label>{time}</label><br/><br/>
           <br></br>
            {/* <Button onClick={(e) => {handle()}}>TEST</Button>
            <AmPopup content={"message"} typePopup={"success"} open={preview} closeState={(e) => setPreview(e) }  />
            <AmDialogs typePopup={"error"} content={"xxrrxffxxx"} ></AmDialogs> */}



{/* <AmPopup content={"xxx"} typePopup={"success"} open={preview} closeState={(e) => setPreview(e) }/>  */}
           
           
           
           {/* <Button onClick={(e) => {xxxx()}}>alert</Button> 
           <Button onClick={(e) => {xxxx1()}}>success</Button>
           <Button onClick={(e) => {xxxx2()}}>error</Button>
           <Button onClick={(e) => {xxxx3()}}>warning</Button> */}

          
          {/* <ConsecutiveSnackbars type={"success"} message={"xxxxxx"} ></ConsecutiveSnackbars> */}
          {/* <ConsecutiveSnackbars type={"error"} message={"xxxxxx"}  ></ConsecutiveSnackbars>
          <ConsecutiveSnackbars type={"warning"} message={"xxxxxx"} ></ConsecutiveSnackbars> */}
          
       </div>
    )
}


export default Test444;