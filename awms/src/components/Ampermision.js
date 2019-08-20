import { apicall, createQueryString } from '../components/function/CoreFunction2'

const Axios = new apicall()

async function GetPermission(perID) {
    const UserPer = {
        queryString: window.apipath + "/api/viw",
        t: "User_Permission",
        q: "",
        f: "distinct User_ID,Role_ID,Permission_ID,PerCode,Status",
        g: "",
        s: "[{'f':'Role_ID','od':'asc'}]",
        sk: 0,
        l: 1000,
        all: "",
    }
    var x = "111"
    let per = []
    let JSONDoc_per = [];
    //JSONDoc_per = [{ 'f': 'Status', 'c':'=', 'v': 1}]
    JSONDoc_per.push({ 'f': 'User_ID', 'c': '=', 'v': parseInt(localStorage.getItem("User_ID")) });
    UserPer["q"] = JSON.stringify(JSONDoc_per)
    await Axios.get(createQueryString(UserPer)).then(res => {
        if (res.data._result !== undefined) {
            if (res.data._result.status === 1) {
                if (res.data.datas.length > 0) {
                    per = res.data.datas
                }
            }
        }
    })

    return per
}

function Nodisplay(perID, perView, props) {
    const view = perID.find((res) => {
        return res === perView
    })
    console.log(view)
    if (!view) {
        //props.push("/404")
    }
}
async function CheckWebPermission(wpCode, dataGetPer, props) {
    //console.log(dataGetPer)
    let per = []
    if (dataGetPer.length > 0) {
        dataGetPer.forEach(row => {
            per.push(row.Permission_ID)
        })
    }
    const WebPer = {
        queryString: window.apipath + "/api/mst",
        t: "WebPage",
        q: "",
        f: "ID,Permission_ID,Code,Status",
        g: "",
        s: "[{'f':'ID','od':'asc'}]",
        sk: 0,
        l: 100,
        all: "",
    }

    //let webpermiss = {};
    let webPermissionID = "";
    let areawhere = [];
    areawhere = [{ 'f': 'Status', 'c': '=', 'v': 1 }]
    areawhere.push({ 'f': 'Code', 'c': '=', 'v': wpCode });
    WebPer.q = JSON.stringify(areawhere);
    //console.log(this.state.selectuser)
    await Axios.get(createQueryString(WebPer)).then(res => {
        if (res.data._result !== undefined) {
            if (res.data._result.status === 1) {
                if (res.data.datas.length > 0) {
                    res.data.datas.forEach(row => {
                        webPermissionID = row.Permission_ID;
                        console.log(webPermissionID)
                    })
                    Nodisplay(per, webPermissionID, props)
                } else {
                    //props.push("/403")
                }
            } else {
                //props.push("/403")
            }
        }
    })
}

function CheckViewCreatePermission(pagePerCode, dataGetPer) {
    let check = false;
    dataGetPer.forEach(row1 => {
        if (pagePerCode === row1.PerCode) {
            check = true
        }
    })
    return check;
}

export { GetPermission, Nodisplay, CheckWebPermission, CheckViewCreatePermission }