import {apicall,createQueryString} from './CoreFunction'

const Axios = new apicall()

async function GetPermission(perID){
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
    JSONDoc_per.push({"f": "User_ID", "c":"=", "v":parseInt(localStorage.getItem("User_ID"))}) 
    QueryDoc_per.q = JSON.stringify(JSONDoc_per)
    const userPerSel = await Axios.get(createQueryString(QueryDoc_per))
    // console.log(userPerSel)
    userPerSel.data.datas.forEach(row => {
      per.push(row.Permission_ID)
    })
    
    return per
}

  function Nodisplay(perID,perView,props){
    // console.log("Nodisplay")
    // console.log(perID)
    // console.log(perView)
    // console.log(props)
      const view =perID.find((res)=>{
        return res === perView
      })
      console.log(view)
      if(!view){
        props.push("/403")
        console.log("ccc")
      }
  }
  async function CheckWebPermission(wpCode){
    const WebPer = {queryString:window.apipath + "/api/mst",
    t:"WebPage",
    q:"[{ 'f': 'Status', c:'=', 'v': 1}]",
    f:"ID,Permission_ID,Code,Status",
    g:"",
    s:"[{'f':'ID','od':'asc'}]",
    sk:0,
    l:100,
    all:"",}

    let webpermiss = {};
    let areawhere = [];
      areawhere.push({ 'f': 'Code', 'c': '=', 'v': wpCode });
      WebPer.q = JSON.stringify(areawhere);
    //console.log(this.state.selectuser)
    await Axios.get(createQueryString(WebPer)).then(res => {
      if (res.data._result !== undefined) {
        if (res.data._result.status === 1) {
          webpermiss = res.data.datas;
        }
      } 
    })
    return webpermiss;
  }
export {GetPermission,Nodisplay,CheckWebPermission}