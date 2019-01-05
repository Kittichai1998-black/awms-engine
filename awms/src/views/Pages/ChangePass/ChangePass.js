import React, { Component } from 'react';
import { Tooltip, Button, Card, CardBody, CardFooter, Col, Container, Input, InputGroup, InputGroupAddon, InputGroupText, Row } from 'reactstrap';
import { apicall, createQueryString } from '../../ComponentCore/CoreFunction'

const API = new apicall();

class TooltipItem extends React.Component {
  constructor(props) {
    super(props);

    this.toggle = this.toggle.bind(this);
    this.state = {
      tooltipOpen: false
    };
  }

  toggle() {
    this.setState({
      tooltipOpen: !this.state.tooltipOpen
    });
  }

  render() {
    return (
      <span>
        <Tooltip placement={this.props.placement} isOpen={this.state.tooltipOpen} target={this.props.id} toggle={this.toggle}>
          {this.props.text}
        </Tooltip>
      </span>
    );
  }
}
class ChangePass extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dataprofile: [],
      dataedit:{
        CurPass: "",
        NewPass: "",
        ConfPass: ""
      },
      status: true,
      statusPass: false,
    }
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.updateDataProfile = this.updateDataProfile.bind(this);
    this.ChangePass = this.ChangePass.bind(this);
    this.savetoSession = this.savetoSession.bind(this);
    this.Reset = this.Reset.bind(this);
  }

  componentDidMount() {
    document.title = "Change Password - AWMS"
  }
  
  Reset(){
    this.setState({
      dataprofile: {
        CurPass: "",
        NewPass: "",
        ConfPass: ""
      }
    })
  }
  
  savetoSession(name,data){
    localStorage.setItem(name, data);
    sessionStorage.setItem(name, localStorage.getItem([name]));
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
    const dataedit = this.state.dataedit;
    if(dataedit != undefined){
      for (var prop in dataedit) {
        if (prop === name) {
          dataedit[prop] = value;
        } else {
          dataedit[name] = value;
        }
      }
    }else{
      dataedit[name] = value;
    }
    this.setState({ dataedit });
  }
  
  handleSubmit(event) {
    //console.log("handleSubmit")
    //console.log(this.state.dataedit)
    const datainsert = {...this.state.dataedit};
    if (datainsert["CurPass"] && datainsert["NewPass"] && datainsert["ConfPass"]) {
      var NewPass = datainsert["NewPass"];
      var CurPass = datainsert["CurPass"]

      if (datainsert["NewPass"] === datainsert["ConfPass"]) {
        let updateNewPass ={
           "CurPass": CurPass,
           "NewPass": NewPass
        };
         this.ChangePass(updateNewPass);
      } else {
        this.setState({status : false});
        alert('กรุณากรอก "Confirm Password" และ "New Password" ให้ตรงกัน');
      }
    }
      
    event.preventDefault();
  }
  
  async ChangePass(data){
    //console.log("ChangePass")
    await API.post(window.apipath + '/api/mst/changePass', data)
    .then((res) => {
      //console.log(res)
      if(res.data._result !== undefined)
       {
        if(res.data._result.status === 1){
        this.savetoSession("Token",res.data.token);
        this.savetoSession("ExtendKey",res.data.extendKey);
        this.savetoSession("ExpireTime", res.data.expireTime);
        window.success("เปลี่ยนรหัสผ่านสำเร็จ");
        this.Reset();
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
          <Col lg="6" md="8" sm="12">
            <Card className="mx-6">
              <CardBody className="p-4">
                <p className="text-muted">Change your password</p>
                <InputGroup className="mb-3">
                  <InputGroupAddon addonType="prepend">
                    <InputGroupText id="CurrentPassword">Current Password
                    </InputGroupText>
                  </InputGroupAddon>
                    <Input type="password" minLength="6" name="CurPass" value={this.state.dataprofile.CurPass} onChange={this.handleInputChange} />
                </InputGroup>
                <InputGroup className="mb-3">
                  <InputGroupAddon addonType="prepend">
                    <InputGroupText id="NewPassword" >New Password
                    </InputGroupText>
                  </InputGroupAddon>
                    <Input type="password" minLength="6" name="NewPass" value={this.state.dataprofile.NewPass} onChange={this.handleInputChange} />
                </InputGroup>
                <InputGroup className="mb-4">
                  <InputGroupAddon addonType="prepend">
                    <InputGroupText id="ConfirmPass">Confirm password
                    </InputGroupText>
                  </InputGroupAddon>
                    <Input type="password" minLength="6" name="ConfPass" value={this.state.dataprofile.ConfPass} onChange={this.handleInputChange} />
                </InputGroup>
                 <Button color="success" type="submit" block>Save</Button>
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

export default ChangePass;
