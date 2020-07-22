import React, { useState, useEffect,useContext  } from "react";
import PropTypes from 'prop-types';
import Table from 'react-bootstrap-table-next';
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';
import TextField from '@material-ui/core/TextField';
import moment from 'moment';
import Aside from '../../layouts/asideLayout';
import AmMenuTree from "../ComponentCore/AmMenuTree";
import Test2 from '../page/test2'
import Test3 from '../page/test3'
import {Link} from 'react-router-dom'
import TimeInput from 'material-ui-time-picker'
import { Input } from 'reactstrap';
import AmPopup from '../ComponentCore/AmPopup'
import Date from '../ComponentCore/AmDate'
import Button from '@material-ui/core/Button';

const Test1 = (props) => {
    const [data, setData] = useState();
    const [preview, setPreview] = useState(true);

    

    return (
        <div>

{/* <AmPopup content={"xxx"} typePopup={"warning"} open={preview} closeState={(e) => setPreview(e) }/> */}



       </div>
    )
}


export default Test1;