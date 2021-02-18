import React, { Component } from "react";
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import AmDropdownNMenu from '../../components/AmDropDownMenu';

export default (props) => {
    const items = [
        {label:"Test1", action:(data) => console.log(data)},
        {label:"Test2", action:(data) => alert("Test2")},
        {label:"Test3", action:(data) => alert("Test3")},
        {label:"Test4", action:(data) => alert("Test4")},
        {label:"Test5", action:(data) => alert("Test5")}
    ];
    const datas = [{id:1, value:'1'},{id:2, value:'2'},{id:3, value:'3'},{id:4, value:'4'},{id:5, value:'5'},{id:6, value:'6'}]

    return <AmDropdownNMenu items={items} datas={datas} title="Action"/>
}