import React, { useState, useEffect, useContext } from "react";
import MasterData from "../../../pageComponent/MasterData";
import {
    createQueryString
} from "../../../../components/function/CoreFunction";
import AmEntityStatus from "../../../../components/AmEntityStatus";
import AmButton from "../../../../components/AmButton";
import AmDate from "../../../../components/AmDate";
import styled from 'styled-components'
import { apicall } from "../../../../components/function/CoreFunction2";
import AmDialogs from "../../../../components/AmDialogs"
import moment from "moment";
import "moment/locale/pt-br";
import Axios1 from "axios";
const Axios = new apicall();


const User = props => {
    const RoleQuery = {
        queryString: window.apipath + "/v2/SelectDataMstAPI/",
        t: "Role",
        q: '[{ "f": "Status", "c":"<", "v": 2}]',
        f: "ID,Code,Name",
        g: "",
        s: "[{'f':'ID','od':'asc'}]",
        sk: 0,
        l: 100,
        all: ""
    };
    const [dataUser, setDataUser] = useState([]);
    useEffect(() => {
        Axios.get(createQueryString(RoleQuery)).then(res => {
            setDataUser(res.data.datas);
        });
    }, []);

    const EntityEventStatus = [
        { label: "INACTIVE", value: 0 },
        { label: "ACTIVE", value: 1 }
    ];
    const iniCols = [
        {
            Header: "",
            accessor: "Status",
            fixed: "left",
            width: 35,
            sortable: false,
            Cell: e => getStatus(e.original)
        },
        { Header: "Code", accessor: "Code", fixed: "left", width: 120 },
        { Header: "Name", accessor: "Name", width: 200 },
        { Header: "Email Addres", accessor: "EmailAddress", width: 250 },
        { Header: "Mobile", accessor: "TelMobile", width: 150 },
        { Header: "Update By", accessor: "LastUpdateBy", width: 150 },
        {
            Header: "Update Time",
            accessor: "LastUpdateTime",
            width: 150,
            type: "datetime",
            dateFormat: "DD/MM/YYYY hh:mm"
        }
    ];
    const columns = [
        {
            field: "Code",
            type: "input",
            name: "Username",
            placeholder: "Username",
            required: true
        },
        {
            field: "Name",
            type: "input",
            name: "Name",
            placeholder: "Name",
            required: true
        },
        {
            field: "password",
            type: "password",
            name: "Password",
            placeholder: "Password",
            required: true
        },
        {
            field: "EmailAddress",
            type: "input",
            name: "Email Address",
            placeholder: "Email Address",
            validate: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
        },
        {
            field: "TelMobile",
            type: "input",
            name: "Mobile",
            placeholder: "Mobiles",
            validate: /^[0-9\.]+$/
        }
    ];
    const columnsEditPassWord = [
        {
            field: "password",
            type: "password",
            name: "Password",
            placeholder: "Password",
            required: true
        }
    ];
    const columnsEdit = [
        {
            field: "Code",
            type: "input",
            name: "Username",
            placeholder: "Username",
            validate: /^.+$/
        },
        {
            field: "Name",
            type: "input",
            name: "Name",
            placeholder: "Name",
            validate: /^.+$/
        },
        {
            field: "EmailAddress",
            type: "input",
            name: "Email Address",
            placeholder: "Email Address",
            validate: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
        },
        {
            field: "TelMobile",
            type: "input",
            name: "Mobile",
            placeholder: "Mobiles",
            validate: /^[0-9\.]+$/
        },
        {
            field: "Status",
            type: "status",
            typeDropdow: "normal",
            name: "Status",
            dataDropDow: EntityEventStatus,
            placeholder: "Status"
        }
    ];
    const primarySearch = [
        {
            field: "Code",
            type: "input",
            name: "Username",
            placeholder: "Username"
        },
        {
            field: "Name",
            type: "input",
            name: "Name"
        }
    ];
    const columnsFilter = [
        {
            field: "Code",
            type: "input",
            name: "Username",
            placeholder: "Username"
        },
        {
            field: "Name",
            type: "input",
            name: "Name"
        },
        {
            field: "EmailAddress",
            type: "input",
            name: "Email Address",
            placeholder: "Email Address"
        },
        {
            field: "TelMobile",
            type: "input",
            name: "Mobile",
            placeholder: "Mobiles"
        },
        {
            field: "Status",
            type: "status",
            typeDropdow: "normal",
            name: "Status",
            dataDropDow: EntityEventStatus,
            placeholder: "Status"
        },
        {
            field: "LastUpdateBy",
            type: "input",
            name: "Update By",
            placeholder: "Update By"
        },
        {
            field: "LastUpdateTime",
            type: "dateFrom",
            name: "Update From",
            placeholder: "Update Time From"
        },
        {
            field: "LastUpdateTime",
            type: "dateTo",
            name: "Update To",
            placeholder: "Update Time To"
        }
    ];

    const getStatus = value => {
        if (value.Status === "0" || value.Status === 0) {
            return <AmEntityStatus key={0} statusCode={0} />;
        } else if (value.Status === "1" || value.Status === 1) {
            return <AmEntityStatus key={1} statusCode={1} />;
        } else if (value.Status === "2" || value.Status === 2) {
            return <AmEntityStatus key={2} statusCode={2} />;
        } else {
            return null;
        }
    };
    return (
        <div>
            <MasterData
                columnsFilterPrimary={primarySearch}
                columnsFilter={columnsFilter}
                tableQuery={"User"}
                table={"ams_User"}
                dataAdd={columns}
                iniCols={iniCols}
                dataEdit={columnsEdit}
                customUser={true}
                dataUser={dataUser}
                columnsEditPassWord={columnsEditPassWord}
            />
        </div>
    );
};

export default User;
