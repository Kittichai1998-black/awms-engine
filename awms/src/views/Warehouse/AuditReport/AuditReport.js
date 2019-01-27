import React, { Component } from 'react';
import "react-table/react-table.css";
import { TableGen } from '../MasterData/TableSetup';
import { AutoSelect, apicall, createQueryString, Clone } from '../ComponentCore'
import DatePicker from 'react-datepicker';
import moment from 'moment';
import {
  Input, Button, CardBody, Card, Row, Col,
  Modal, ModalHeader, ModalBody, ModalFooter
} from 'reactstrap';
import ReactTable from 'react-table';
import { GetPermission, CheckWebPermission, CheckViewCreatePermission } from '../../ComponentCore/Permission';
import { error } from 'util';
import _ from "lodash";

const Axios = new apicall()


class AuditReport extends Component {
  constructor(props) {
    super(props);
    this.state = {
      Document: {
        queryString: window.apipath + "/api/trx",
        t: "Document",
        q: "[{ 'f': 'DocumentType_ID', c:'=', 'v': 1002},{ 'f': 'Status', c:'=', 'v': 3}]",
        f: "ID,Code",
        g: "",
        s: "[{'f':'ID','od':'asc'}]",
        sk: "",
        l: "",
        all: "",
      },
     
    }


  }


  render() {    
    return (
      <div>
        
         
      </div>
    )
  }
}

export default AuditReport;