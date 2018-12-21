import React, { Component } from 'react';
import { Tooltip, Button, Card, CardBody, CardFooter, Col, Container, Input, InputGroup, InputGroupAddon, InputGroupText, Row } from 'reactstrap';

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
 
  }

  componentDidMount() {
    console.log(localStorage.getItem("User_ID"))
  }


  render() {
    return (
      <div className="app">
        <Container>
          <Row>
            <Col md="6">
              <Card className="mx-6">
                <CardBody className="p-4">
                  <p className="text-muted">Change your password</p>
                  <InputGroup className="mb-3">
                    <InputGroupAddon addonType="prepend">
                      <InputGroupText id="username">
                        <i className="icon-user"></i>
                      </InputGroupText>
                      <TooltipItem text={"Username"} placement={"left"} id={"username"} />
                    </InputGroupAddon>
                    <Input type="text" placeholder="Username" />
                  </InputGroup>
                  <InputGroup className="mb-3">
                    <InputGroupAddon addonType="prepend">
                      <InputGroupText id="CurrentPassword">
                        <i className="icon-lock"></i>
                      </InputGroupText>
                      <TooltipItem text={"Current Password"} placement={"left"} id={"CurrentPassword"} />
                    </InputGroupAddon>
                    <Input type="password" placeholder="Current Password" />
                  </InputGroup>
                  <InputGroup className="mb-3">
                    <InputGroupAddon addonType="prepend">
                      <InputGroupText id="NewPassword">
                        <i className="icon-lock"></i>
                      </InputGroupText>
                      <TooltipItem text={"New Password"} placement={"left"} id={"NewPassword"} />
                    </InputGroupAddon>
                    <Input type="password" placeholder="New Password" />
                  </InputGroup>
                  <InputGroup className="mb-4">
                    <InputGroupAddon addonType="prepend">
                      <InputGroupText id="ConfirmPass">
                        <i className="icon-lock"></i>
                      </InputGroupText>
                      <TooltipItem text={"Confirm Password"} placement={"left"} id={"ConfirmPass"} />
                    </InputGroupAddon>
                    <Input type="password" placeholder="Confirm password" />
                  </InputGroup>
                  <Button color="success" block>Change password</Button>
                </CardBody>                
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    );
  }
}

export default ChangePass;
