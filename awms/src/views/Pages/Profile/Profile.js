import React, { Component } from 'react';
import { Tooltip, Button, Card, CardBody, CardFooter, Col, Container, Input, InputGroup, InputGroupAddon, InputGroupText, Row } from 'reactstrap';
import guid from 'guid';
import API from "axios";

const createQueryString = (select) => {
  let queryS = select.queryString + (select.t === "" ? "?" : "?t=" + select.t)
    + (select.q === "" ? "" : "&q=" + select.q)
    + (select.f === "" ? "" : "&f=" + select.f)
    + (select.g === "" ? "" : "&g=" + select.g)
    + (select.s === "" ? "" : "&s=" + select.s)
    + (select.sk === "" ? "" : "&sk=" + select.sk)
    + (select.l === 0 ? "" : "&l=" + select.l)
    + (select.all === "" ? "" : "&all=" + select.all)
    + ("&_token=" + sessionStorage.Token)
  return queryS
}

class Profile extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dataprofile: [],
      datacurrent: [],
      status: true,
      statusPass: false,
      uneditcolumn: ["CurPass", "NewPass", "ConfPass","Password","SaltPassword"],
      selectuser: {
        queryString: window.apipath + "/api/mst",
        t: "User",
        q: "",
        f: "ID,Code,Name,Password,SaltPassword,EmailAddress,TelMobile",
        g: "",
        s: "[{'f':'Code','od':'asc'}]",
        sk: 0,
        l: 100,
        all: "",
      }
    }
    this.selectprofile = this.selectprofile.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.updateDataProfile = this.updateDataProfile.bind(this);
    this.ChangePass = this.ChangePass.bind(this);
    this.savetoSession = this.savetoSession.bind(this);
    this.changeProfile = this.changeProfile.bind(this);
    this.Reload = this.Reload.bind(this);
  }

  componentDidMount() {
    //console.log(localStorage.getItem("User_ID"))
    this.selectprofile();
  }
  Reload(){
    //sessionStorage.clear();
    //localStorage.clear();
    window.location.reload();
  }
  savetoSession(name,data){
    localStorage.setItem(name, data);
    sessionStorage.setItem(name, localStorage.getItem([name]));
  }

  selectprofile() {
    const userprofile = this.state.selectuser;
    let areawhere = [];
    if (localStorage.getItem("User_ID")) {
      areawhere.push({ 'f': 'ID', 'c': '=', 'v': parseInt(localStorage.getItem("User_ID")) });
      userprofile.q = JSON.stringify(areawhere);
    }
    //console.log(this.state.selectuser)
    API.get(createQueryString(this.state.selectuser)).then(res => {
      let data = res.data.datas[0];
      this.setState({ dataprofile: data, dataedit: data });
    })
  }
  handleInputChange(event) {
    const target = event.target;
    const value = target.value === null ? "" : target.value;
    const name = target.name;

    this.setState({
      dataprofile: {
        [name]: value
      }
    }, () => this.updateDataProfile(name, value) );
  }

  updateDataProfile(name, value) {
    //console.log(this.state.dataedit);
    const dataedit = this.state.dataedit;
    for (var prop in dataedit) {
      //console.log(prop)
      if (prop === name) {
        dataedit[prop] = value;
      } else {
        dataedit[name] = value;
      }
    }
    this.setState({ dataedit });
  }
  
  handleSubmit(event) {
    console.log("handleSubmit")
    console.log(this.state.dataedit)
    const datainsert = {...this.state.dataedit};
    if (datainsert["CurPass"] && datainsert["NewPass"] && datainsert["ConfPass"]) {
      var NewPass = datainsert["NewPass"];
      var CurPass = datainsert["CurPass"]

      if (datainsert["NewPass"] === datainsert["ConfPass"]) {
        let updateNewPass ={
          "_token": localStorage.getItem("Token"),
          "_apikey": null,
           "CurPass": CurPass,
           "NewPass": NewPass
        };
         console.log(updateNewPass);
         this.ChangePass(updateNewPass);
      } else {
        this.setState({status : false});
        alert('กรุณากรอก "Confirm Password" และ "New Password" ให้ตรงกัน');
      }
    }else{
      this.setState({status : true}, ()=> this.changeProfile());
    }
      
    event.preventDefault();
  }
  async changeProfile(){
    console.log("changeProfile")
    const datainsert = {...this.state.dataedit};
    console.log(datainsert)
    for (let col of this.state.uneditcolumn) {
      delete datainsert[col]
    }
    if(this.state.status){
      let updjson = {
        "_token": localStorage.getItem("Token"),
        "_apikey": null,
        "t": "ams_User",
        "pk": "ID",
        "datas": [datainsert],
        "nr": false
      }
    console.log(updjson)

      await API.put(window.apipath + "/api/mst", updjson).then((res) => {
        if (res.data._result !== undefined) {
          if (res.data._result.status === 1) {
            if(this.state.statusPass){
              this.Reload();
            }else{
              alert("อัพเดทข้อมูลเสร็จเรียบร้อย");
              if(datainsert["Code"] !== localStorage.getItem("Username")){
                this.savetoSession("Username", datainsert["Code"]);
                this.Reload();
              }
            }
          } else if(res.data._result.status === 0) {
            alert("ไม่สามารถแก้ไขข้อมูลได้")
          }
        } else {
          alert("ไม่สามารถแก้ไขข้อมูลได้")
        }
      }).catch((error) => {
        console.log(error)
      });
    }
  }
  async ChangePass(data){
    console.log("ChangePass")
    await API.post(window.apipath + '/api/mst/changePass', data)
    .then((res) => {
      console.log(res)
      if(res.data._result !== undefined)
       {
        if(res.data._result.status === 1){
        this.savetoSession("Token",res.data.token);
        this.savetoSession("ExtendKey",res.data.extendKey);
        this.savetoSession("ExpireTime", res.data.expireTime);
        this.setState({status : true, statusPass : true}, ()=> this.changeProfile());
        //alert("แก้ไข ข้อมูลผู้ใช้สำเร็จ");
        }
        else if(res.data._result.status === 0){
          this.setState({status : false});
          alert(res.data._result.message); //
        }
      }else{
        this.setState({status : false});
        alert("ไม่สามารถแก้ไขรหัสผ่านได้");
      }
    }).catch((error) => {
      console.log(error)
    });
  }
  render() {
    return (
      <div className="app">
        <form onSubmit={this.handleSubmit}>
        <Container>
          <Row>
            <Col md="6">
              <Card className="mx-6">
                <CardBody className="p-4">
                  <p className="text-muted">Edit your profile</p>
                  <InputGroup className="mb-3">
                    <InputGroupAddon addonType="prepend">
                      <InputGroupText id="username">
                        Username
                      </InputGroupText>
                    </InputGroupAddon>
                      <Input type="text" name="Code" value={this.state.dataprofile.Code} onChange={this.handleInputChange}/>
                  </InputGroup>
                  <InputGroup className="mb-3">
                    <InputGroupAddon addonType="prepend">
                      <InputGroupText id="name">
                        Name
                      </InputGroupText>
                    </InputGroupAddon>
                      <Input type="text" name="Name" value={this.state.dataprofile.Name} onChange={this.handleInputChange}/>
                  </InputGroup>
                  <InputGroup className="mb-3">
                    <InputGroupAddon addonType="prepend">
                      <InputGroupText id="email">
                        Email
                      </InputGroupText>
                    </InputGroupAddon>
                      <Input type="text" name="EmailAddress" value={this.state.dataprofile.EmailAddress} onChange={this.handleInputChange}/>
                  </InputGroup>
                  <InputGroup className="mb-3">
                    <InputGroupAddon addonType="prepend">
                      <InputGroupText id="MobileTel">
                        Mobile Tel.
                      </InputGroupText>
                    </InputGroupAddon>
                      <Input type="tel" name="TelMobile" value={this.state.dataprofile.TelMobile} onChange={this.handleInputChange} />
                  </InputGroup>
                  <hr />
                  <InputGroup className="mb-3">
                    <InputGroupAddon addonType="prepend">
                      <InputGroupText id="CurrentPassword">Current Password
                      </InputGroupText>
                    </InputGroupAddon>
                      <Input type="password" maxLength="8" name="CurPass" value={this.state.dataprofile.CurPass} onChange={this.handleInputChange} />
                  </InputGroup>
                  <InputGroup className="mb-3">
                    <InputGroupAddon addonType="prepend">
                      <InputGroupText id="NewPassword" >New Password
                      </InputGroupText>
                    </InputGroupAddon>
                      <Input type="password" maxLength="8" name="NewPass" value={this.state.dataprofile.NewPass} onChange={this.handleInputChange} />
                  </InputGroup>
                  <InputGroup className="mb-4">
                    <InputGroupAddon addonType="prepend">
                      <InputGroupText id="ConfirmPass">Confirm password
                      </InputGroupText>
                    </InputGroupAddon>
                      <Input type="password" maxLength="8" name="ConfPass" value={this.state.dataprofile.ConfPass} onChange={this.handleInputChange} />
                  </InputGroup>
                   <Button color="primary" type="submit" block>Save</Button>
                    {/*<input type="submit" color="primary" value="Save" />*/}
                </CardBody>
              </Card>
            </Col>
          </Row>
          </Container>
          </form>
      </div>
    );
  }
}

export default Profile;
