import React, { lazy, Suspense, useState, useEffect, useContext } from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import styled from "styled-components";
import classNames from "classnames";
// import AmButton from "../../../../components/AmButton";

// import AmInput from "../../../../components/AmInput";
import Card from "@material-ui/core/Card";
import CardActions from "@material-ui/core/CardActions";
import CardContent from "@material-ui/core/CardContent";
import CardHeader from "@material-ui/core/CardHeader";
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";
import AccountCircle from "@material-ui/icons/AccountCircle";
import Description from "@material-ui/icons/Description";
import DeleteIcon from "@material-ui/icons/Delete";
import VPNKey from "@material-ui/icons/VpnKey";
import { indigo, grey, red } from "@material-ui/core/colors";
import Visibility from "@material-ui/icons/Visibility";
import VisibilityOff from "@material-ui/icons/VisibilityOff";
import IconButton from "@material-ui/core/IconButton";
import InputAdornment from "@material-ui/core/InputAdornment";
import { Route, Redirect } from "react-router-dom";
import DefaultLayout from "../../../../layouts/defaultLayout";
import { createQueryString } from '../../../../components/function/CoreFunction';
import queryString from "query-string";
import _ from "lodash";
import Axios from "axios";
import { defaultProps } from "react-select/lib/Select";
const AmButton = React.lazy(() => import('../../../../components/AmButton'));
const AmInput = React.lazy(() => import('../../../../components/AmInput'));
const styles = theme => ({
    root: {
        flexGrow: 1,
        display: "flex",
        top: "0 !important",
        left: "0 !important",
        position: "fixed",
        boxOrient: "horizontal",
        padding: "0",
        margin: "0",
        width: "100%",
        height: "100%",
        verticalAlign: "middle !important",
        backgroundColor: grey[100],
        alignItems: "center",
        justifyContent: "center"
    },
    card: {
        minWidth: 400,
        width: "auto",
        maxWidth: 450
    },
    action: {
        margin: theme.spacing(),
        float: "right"
    },
    header: {
        backgroundColor: indigo[500],
        borderBottom: "solid 2px #ffffff75",
        height: "20px"
    },
    title: {
        color: grey[50]
    },
    content: {
        margin: theme.spacing(2)
    },
    subcontent: {
        marginBottom: 10
    },
    inlineTitle: {
        display: "flex",
        fontWeight: "bold",
        alignItems: "center",
        verticalAlign: "middle"
    },
    spacing: {
        marginRight: "5px"
    },
    input: {
        display: "flex",
        width: "100%"
    },
    iconButton: {
        padding: 4
    },
    alert: {
        color: red[800],
        textAlign: "right"
    }
});

const Login = props => {
    const { classes } = props;
    const [showPassword, setShowPassword] = useState(false);
    const [valueForm, setValueForm] = useState({
        username: "",
        password: "",
        secretKey: "ABC@123"
    });
    const [valueFormView, setValueFormView] = useState({
        username: "report",
        password: "123456",
        secretKey: "ABC@123"
    });
    const [alertmsg, setAlertmsg] = useState("");
    const [status, setStatus] = useState(false);

    const [loginCount, setLoginCount] = useState(0);
    const [currentUser, setCurrentUser] = useState([]);

    const onHandleClickShowPassword = () => {
        setShowPassword(!showPassword);
    };
    const onHandleChange = (value, obj, ele, event) => {
        setValueForm({
            ...valueForm,
            [ele.id]: value
        });
    };
    // useEffect(() => { console.log(valueForm) }, [valueForm])

    const redirect = () => {
        if(loginCount === props.loginCount){
            if (sessionStorage.getItem("Token") !== null && localStorage.getItem("MenuItems") !== null) {
                return <Redirect to="/" />;
            }
        }
    };

    const savetoSession = (name, data) => {
        localStorage.setItem(name, data);
        sessionStorage.setItem(name, localStorage.getItem([name]));
    };

    const GetMenu = token => {
        window.loading.onLoading();
        Axios.get(window.apipath + "/v2/ListMenuAPI?token=" + token)
            .then(res => {
                window.loading.onLoaded();

                const receiveIndex=res.data.webGroups.findIndex(v=>v.Name=="Receive")
                const issueIndex=res.data.webGroups.findIndex(v=>v.Name=="Issue")
                const wareHouseIndex=res.data.webGroups.findIndex(v=>v.Name=="WareHouse")
                if(receiveIndex>=0)res.data.webGroups[receiveIndex].WebPages.push(
                    {GroupID: 2, Icon: "List_open",PathLV1: "receive",PathLV2: "monitorreceive",PathLV3: null,Visible: true,pageDesc: null,pageName: "Monitor Receive",pageSeq:8, subIcon: null},
                    {GroupID: 2, Icon: "List_open",PathLV1: "receive",PathLV2: "scanreceivegatemapping",PathLV3: null,Visible: true,pageDesc: null,pageName: "Scan Receive Gate Mapping",pageSeq:9, subIcon: null}
                )
                if(issueIndex>=0)res.data.webGroups[issueIndex].WebPages.push(
                    {GroupID: 3, Icon: "List_open",PathLV1: "issue",PathLV2: "pickingmonitor",PathLV3: null,Visible: true,pageDesc: null,pageName: "Picking Monitor",pageSeq:8, subIcon: null},
                )
                if(wareHouseIndex>=0)res.data.webGroups[wareHouseIndex].WebPages.push(
                    {GroupID: 10, Icon: "List_open",PathLV1: "warehouse",PathLV2: "scanshuttlecheckin",PathLV3: null,Visible: true,pageDesc: null,pageName: "Scan Shuttle Check-In",pageSeq:11, subIcon: null},
                )

                localStorage.setItem("MenuItems", JSON.stringify(res.data.webGroups));
            })
            .then(() => {
                setStatus(true);
                redirect();
            })
            .catch(error => {
                console.log(error);
            });
    };
    const GetStaticValue = (tableNames, apiName = "SelectDataMstAPI") => {
        tableNames.forEach(tableName => {
            let newApi = {
                queryString: window.apipath + "/v2/" + apiName + "/",
                t: tableName,
                q: '[{ "f": "Status", "c":"=", "v": 1}]',
                f: "*",
                g: "",
                s: "[{'f':'ID','od':'asc'}]",
                sk: 0,
                l: 100,
                all: "",
            }

            window.loading.onLoading();
            Axios.get(createQueryString(newApi) + "&apikey=FREE01")
                .then(res => {
                    window.loading.onLoaded();
                    let curStatic = JSON.parse(localStorage.getItem("StaticValue")) || [];
                    let newStatic = [{ table: tableName, data: res.data.datas }];
                    let mergeStatic = _.uniqBy([...curStatic, ...newStatic], "table");
                    localStorage.setItem("StaticValue", JSON.stringify(mergeStatic));
                })
                .catch(error => {
                    console.log(error);
                });
        });
    }
    const onHandleLogin = (checkUser = false) => {
        if(currentUser.find(x=> x === valueForm.username) !== undefined)
            setAlertmsg(`${valueForm.username} was Login Already.`);
        else if (valueForm.username.length === 0 && valueForm.password.length === 0) {
            setAlertmsg("Please input your username and password.");
        } else if (valueForm.username.length === 0) {
            setAlertmsg("Please input your username.");
        } else if (valueForm.password.length === 0) {
            setAlertmsg("Please input your password.");
        } else {
            let config = {
                headers: {
                    "Access-Control-Allow-Origin": "*",
                    "Content-Type": "application/json; charset=utf-8",
                    accept: "application/json"
                }
            };
            Axios.post(window.apipath + "/v2/token/register", valueForm, config)
                .then(res => {
                    if (res.data._result !== undefined) {
                        if (res.data._result.status === 1) {
                            var split_token = res.data.Token.split(".");
                            var desc_token = atob(split_token[1]);
                            var json_dec = JSON.parse(desc_token)
                            if(!checkUser){
                                savetoSession("Token", res.data.Token);
                                savetoSession("ExtendTime", json_dec.extend);
                                savetoSession("User_ID", json_dec.uid);
                                savetoSession("ExpireTime", json_dec.exp);
                                savetoSession("Username", json_dec.ucode);
                                savetoSession("User_ProductOwner", json_dec.pos);
                                GetMenu(res.data.Token);
                                setCurrentUser([...currentUser, json_dec.ucode])
                                setLoginCount(loginCount+1)
                            }
                            else{
                                setCurrentUser([...currentUser, json_dec.ucode])
                                setLoginCount(loginCount+1)
                            }
                            // let reqSelect = ["SKUMasterType", "AreaMaster", "Warehouse"];
                            // GetStaticValue(reqSelect);
                        } else if (res.data._result.status === 0) {
                            setStatus(false);
                            // window.error(res.data._result.message)
                            if (res.data._result.code === "U0000") {
                                setAlertmsg(
                                    "The username or password is incorrect. Try again."
                                );
                            } else {
                                setAlertmsg(res.data._result.message);
                            }
                        }
                    } else {
                        setStatus(false);
                        setAlertmsg("You can't log in to AMS.");
                    }
                })
                .catch(error => {
                    console.log(error);
                });
                
            setValueForm({
                ...valueForm,
                "username":"",
                "password":"",
            });
        }
    };

    const alternateLogin = (value, obj, ele, event) => {
        if(loginCount === 0)
            onHandleLogin();
        else
            onHandleLogin(true);
    };


    return (
        <>
        <div style={{position:"fixed", zIndex:10}}>{currentUser.map(x=> {return <div>{x}</div>})}</div>
        <Grid container className={classes.root}>
            <Grid item xs={12} md={12}>
                <Grid container direction="row" justify="center" alignItems="center">
                    <Card className={classes.card}>
                        <Suspense fallback={null}>
                            
                            <CardHeader classes={{root: classes.header, title: classes.title}}title="AMS"/>
                            <CardContent className={classes.content}>
                                <Grid container direction="row" justify="flex-start" alignItems="center" className={classes.subcontent}>
                                    <Grid item xs={5} sm={4}>
                                        <Typography variant="subtitle1" className={classNames(classes.inlineTitle, classes.spacing)}>
                                            <AccountCircle className={classes.spacing} />Username:
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={7} sm={8}>
                                        <AmInput
                                            autoFocus={true}
                                            id="username"
                                            placeholder="Username"
                                            onChangeV2={onHandleChange}
                                            value={valueForm.username}
                                            onKeyPress={(v, o, ele, event) => {
                                                if (event.key === "Enter") {
                                                    onHandleLogin();
                                                }
                                            }}
                                            style={{ width: "100%" }}/>
                                    </Grid>
                                </Grid>
                                <Grid container direction="row" justify="flex-start" alignItems="center">
                                    <Grid item xs={5} sm={4}>
                                        <Typography variant="subtitle1" className={classNames(classes.inlineTitle, classes.spacing)}>
                                            <VPNKey className={classes.spacing} />Password:
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={7} sm={8}>
                                        <AmInput
                                            id="password"
                                            placeholder="Password"
                                            type={showPassword ? "text" : "password"}
                                            // className={classes.input}
                                            InputProps={{
                                                endAdornment: (
                                                    <InputAdornment position="end" style={{ backgroundColor: "transparent" }}>
                                                        <IconButton
                                                            className={classes.iconButton}
                                                            size="small"
                                                            aria-label="Toggle password visibility"
                                                            onClick={onHandleClickShowPassword}>
                                                            {showPassword ? (<VisibilityOff fontSize="small" />) : (<Visibility fontSize="small" />)}
                                                        </IconButton>
                                                    </InputAdornment>
                                                )
                                            }}
                                            value={valueForm.password}
                                            onChangeV2={onHandleChange}
                                            onKeyPress={(v, o, ele, event) => {
                                                if (event.key === "Enter") {
                                                    onHandleLogin();
                                                }
                                            }} style={{ width: "100%" }}/>
                                    </Grid>
                                </Grid>
                            </CardContent>
                            <CardActions className={classes.action}>
                                <Typography variant="subtitle2" className={classes.alert}>
                                    {alertmsg}
                                </Typography>
                                <AmButton styleType="confirm" onClick={props.alternateLogin ? alternateLogin : onHandleLogin}>
                                    {"Login"}
                                </AmButton>
                            </CardActions>
                        </Suspense>
                    </Card>
                    {redirect()}
                </Grid>
            </Grid>
        </Grid>
    </>
    );
};

Login.propTypes = {
    classes: PropTypes.object.isRequired
};

Login.defaultProps = {
    loginCount:1,
    alternateLogin:false
}


export default withStyles(styles)(Login);
