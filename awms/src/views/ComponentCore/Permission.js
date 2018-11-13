import {apicall,createQueryString} from './CoreFunction'

const Axios = new apicall()

function GetPermission(){
    

    const UserPer = {queryString:window.apipath + "/api/viw",
    t:"User_Permission",
    q:"[{ 'f': 'Status', c:'=', 'v': 1}]",
    f:"distinct User_ID,Role_ID,Permission_ID,Status",
    g:"",
    s:"[{'f':'Role_ID','od':'asc'}]",
    sk:0,
    l:100,
    all:"",}
    
    let per = []
    let QueryDoc_per = UserPer
    let JSONDoc_per = []
    JSONDoc_per.push({"f": "User_ID", "c":"=", "v":localStorage.User_ID}) 
    QueryDoc_per.q = JSON.stringify(JSONDoc_per)
    Axios.get(createQueryString(QueryDoc_per)).then((res) => {
      res.data.datas.forEach(row => {
        per = row.Permission_ID
       
        if(row.Permission_ID === 1){
            // var PerButtonPush = document.getElementsByClassName("per_button_push")
            // PerButtonPush[0].remove()
            // var PerButtonRemove = document.getElementsByClassName("per_button_remove")
            // PerButtonRemove[0].remove()

            
        }


      })
    })
    } export default GetPermission