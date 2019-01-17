import React, { Component } from 'react';
import { Button, Card, CardBody, CardGroup, Col, Container, Input, InputGroup, InputGroupAddon, InputGroupText, Row } from 'reactstrap';
import Axios from 'axios';
import {Redirect, Link, Route} from 'react-router-dom';
import DefaultLayout from '../../../containers/DefaultLayout'

class Login extends Component {
  constructor(props){
    super(props);
    this.state={
      data : "",
      status : false,
      username :"",
      password:"",
      secretkey:"",
    }

    this.HandleClick = this.HandleClick.bind(this);
    this.handleUsernameChange = this.handleUsernameChange.bind(this);
    this.handlePasswordChange = this.handlePasswordChange.bind(this);
    this.Authorize = this.Authorize.bind(this);
    this.redirect = this.redirect.bind(this);
    this.savetoSession = this.savetoSession.bind(this);
    this.GetMenu = this.GetMenu.bind(this);
  }

  handleUsernameChange(event){
    this.setState({username: event.target.value})
    event.preventDefault();
  }
  handlePasswordChange(event){
    this.setState({password: event.target.value})
    this.setState({secretkey: ""})
    event.preventDefault();
  }

  HandleClick(){
    if(this.state.username !== "" && this.state.password !== "" )
    {
      this.Authorize();
    }
  }

  Authorize(){
    let data = {"username":this.state.username, "password":this.state.password, "secretKey":"ABC@123"};
    let config = {
      headers: { 'Access-Control-Allow-Origin':'*','Content-Type': 'application/json; charset=utf-8' ,'accept': 'application/json'}
    };
    Axios.post(window.apipath + '/api/token/register', data, config)
     .then((res) => {
       if(res.data._result !== undefined)
       {
        if(res.data._result.status === 1){
          this.savetoSession("Token",res.data.Token);
          this.savetoSession("ClientSecret_SecretKey",res.data.ClientSecret_SecretKey);
          this.savetoSession("ExtendKey",res.data.ExtendKey);
          this.savetoSession("User_ID",res.data.User_ID);
          this.savetoSession("ExpireTime", res.data.ExpireTime);
          this.savetoSession("Username", this.state.username);
          this.GetMenu(res.data.Token);
        }
        else if(res.data._result.status === 0){
          this.setState({status : false});
          alert("ไม่สามารถเข้าสู่ระบบได้")
        }
       }
       else{
        this.setState({status : false});
        alert("ไม่สามารถเข้าสู่ระบบได้")
       }
     }).catch((error) => {
       console.log(error)
     });
  }

  async GetMenu(token){
    await Axios.get(window.apipath + '/api/PageSetup/menu/?token=' + token)
     .then((res) => {
      //  console.log(res)
       localStorage.setItem('MenuItems',JSON.stringify(res.data.webGroups));
     }).then(() => {
      this.setState({status : true});
     }).catch((error) => {
       console.log(error)
     });
  }

  savetoSession(name,data){
    localStorage.setItem(name, data);
    sessionStorage.setItem(name, localStorage.getItem([name]));
  }

  redirect(){
    if(sessionStorage.getItem("Token") !== null){
     return <div><Route path="/" Component={DefaultLayout}/>
     <Redirect to="/"/></div>
    }
  }

  render() {
    return (
      <div className="app flex-row align-items-center">
        <Container>
          <Row className="justify-content-center">
            <Col md="6">
              <CardGroup>
                <Card className="p-4">
                  <CardBody>
                    <h1>Login</h1>
                    <InputGroup className="mb-3">
                      <InputGroupAddon addonType="prepend">
                        <InputGroupText>
                          <i className="icon-user"></i>&nbsp;&nbsp;Username
                        </InputGroupText>
                      </InputGroupAddon>
                      <Input type="text" placeholder="Username" onChange={this.handleUsernameChange}/>
                    </InputGroup>
                    <InputGroup className="mb-4">
                      <InputGroupAddon addonType="prepend">
                        <InputGroupText>
                          <i className="icon-lock"></i>&nbsp;&nbsp;Password
                        </InputGroupText>
                      </InputGroupAddon>
                      <Input type="password" placeholder="Password" onChange={this.handlePasswordChange} onKeyPress={e =>{
                        if(e.key === "Enter"){
                          this.Authorize()
                        }
                      }}/>
                    </InputGroup>
                    <Row>
                      <Col xs="12">
                        <Button color="primary" className="float-right" style={{width: '130px'}} onClick={this.Authorize} type="submit">Login</Button>
                      </Col>
                      {/* <Col xs="6" className="text-right">
                        <Button color="link" className="px-0">Forgot password?</Button>
                      </Col> */}
                    </Row>
                  </CardBody>
                </Card>
              </CardGroup>
            </Col>
          </Row>
        </Container>
        {this.redirect()}
      </div>
    );
  }
}

export default Login;
