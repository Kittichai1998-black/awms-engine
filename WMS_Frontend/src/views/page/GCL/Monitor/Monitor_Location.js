import React, { useState, useEffect, useContext } from "react";

import {
    apicall,
    createQueryString
} from "../../../../components/function/CoreFunction";
import AmSearchDocument from "../../../pageComponent/AmSearchDocumentV2/AmSearchDocumentV2";
import AmIconStatus from "../../../../components/AmIconStatus";
import DocView from "../../../pageComponent/DocumentView";
import AmDocumentStatus from "../../../../components/AmDocumentStatus";
import AmRediRectInfo from "../../../../components/AmRedirectInfo";
import IconButton from "@material-ui/core/IconButton";
import ErrorIcon from "@material-ui/icons/Error";
import queryString from "query-string";
import Grid from '@material-ui/core/Grid';
import AmPopup from "../../../../components/AmPopup";
import AmCreateDoc from '../../../.././components/AmImportDocumentExcel'
import { DocumentEventStatus } from "../../../../components/Models/DocumentEventStatus";
import { DataGeneratePopup, DataGenerateStatus } from "../../../pageComponent/AmSearchDocumentV2/SetPopup";
const Axios = new apicall();

//======================================================================
const Monitor_Location = props => {



    
    return (
        <>
           
        </>
    );
};

export default Monitor_Location;
