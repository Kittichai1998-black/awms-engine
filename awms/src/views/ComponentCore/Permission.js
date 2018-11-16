import {apicall,createQueryString} from './CoreFunction'

const Axios = new apicall()

function GetPermission(perID){
    const UserPer = {queryString:window.apipath + "/api/viw",
    t:"User_Permission",
    q:"[{ 'f': 'Status', c:'=', 'v': 1}]",
    f:"distinct User_ID,Role_ID,Permission_ID,Status",
    g:"",
    s:"[{'f':'Role_ID','od':'asc'}]",
    sk:0,
    l:100,
    all:"",}
     var x ="111"
    let per = []
    let QueryDoc_per = UserPer
    let JSONDoc_per = []
    JSONDoc_per.push({"f": "User_ID", "c":"=", "v":localStorage.User_ID}) 
    QueryDoc_per.q = JSON.stringify(JSONDoc_per)
    Axios.get(createQueryString(QueryDoc_per)).then((res) => {
      res.data.datas.forEach(row => {
        per.push(row.Permission_ID)
      })
      perID(per)
    })
    } export default GetPermission