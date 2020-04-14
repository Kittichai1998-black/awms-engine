import React, { useState, useEffect, useContext } from "react";
import PropTypes from "prop-types"
import { withStyles } from "@material-ui/core/styles";
import {
  apicall,
  createQueryString,
  IsEmptyObject
} from "../../../components/function/CoreFunction2";
import queryString from "query-string";
import {AmTable} from "../../../components/table";
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import { WaveContext } from './WaveContext';
var Axios = new apicall();




const AmWaveDetail = (props) => {
    const { wave } = useContext(WaveContext)

    return <>
        <AmTable columns={props.detailColumns} data={[]} sortable={false} />
         

        
    </>
}

export default AmWaveDetail;