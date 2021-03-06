import React, { useState, useEffect, useContext } from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import styled from "styled-components";
import classNames from "classnames";
import AmButton from "../../../../components/AmButton";
import AmInput from "../../../../components/AmInput";
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
import Axios from "axios";

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
    if (sessionStorage.getItem("Token") !== null) {
      return <Redirect to="/" />;
    }
  };
  const savetoSession = (name, data) => {
    localStorage.setItem(name, data);
    sessionStorage.setItem(name, localStorage.getItem([name]));
  };

  const GetMenu = token => {
    Axios.get(window.apipath + "/v2/ListMenuAPI?token=" + token)
      .then(res => {
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
  const onHandleLogin = () => {
    if (valueForm.username.length === 0 && valueForm.password.length === 0) {
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
              savetoSession("Token", res.data.Token);
              //savetoSession("ClientSecret_SecretKey", res.data.ClientSecret_SecretKey);
              savetoSession("ExtendKey", res.data.ExtendKey);
              savetoSession("User_ID", res.data.User_ID);
              savetoSession("ExpireTime", res.data.ExpireTime);
              savetoSession("Username", valueForm.username);
              GetMenu(res.data.Token);
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
    }
  };
  const onHandleLoginViewReport = () => {
    let config = {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json; charset=utf-8",
        accept: "application/json"
      }
    };
    Axios.post(window.apipath + "/v2/token/register", valueFormView, config)
      .then(res => {
        if (res.data._result !== undefined) {
          if (res.data._result.status === 1) {
            savetoSession("Token", res.data.Token);
            //savetoSession("ClientSecret_SecretKey", res.data.ClientSecret_SecretKey);
            savetoSession("ExtendKey", res.data.ExtendKey);
            savetoSession("User_ID", res.data.User_ID);
            savetoSession("ExpireTime", res.data.ExpireTime);
            savetoSession("Username", valueForm.username);
            GetMenu(res.data.Token);
          } else if (res.data._result.status === 0) {
            setStatus(false);
            // window.error(res.data._result.message)
            if (res.data._result.code === "U0000") {
              setAlertmsg("The username or password is incorrect. Try again.");
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
  };
  return (
    <Grid container className={classes.root}>
      <Grid item xs={12} md={12}>
        <Grid container direction="row" justify="center" alignItems="center">
          <Card className={classes.card}>
            <CardHeader
              classes={{
                root: classes.header,
                title: classes.title
              }}
              title="AMS"
            />
            <CardContent className={classes.content}>
              <Grid
                container
                direction="row"
                justify="flex-start"
                alignItems="center"
                className={classes.subcontent}
              >
                <Grid item xs={5} sm={4}>
                  <Typography
                    variant="subtitle1"
                    className={classNames(classes.inlineTitle, classes.spacing)}
                  >
                    <AccountCircle className={classes.spacing} />
                    Username:
                  </Typography>
                </Grid>
                <Grid item xs={7} sm={8}>
                  <AmInput
                    autoFocus={true}
                    id="username"
                    placeholder="Username"
                    // className={classes.input}
                    // value={valueForm.username}
                    onChange={onHandleChange}
                    onKeyPress={(v, o, ele, event) => {
                      // setValueForm({
                      //     ...valueForm, [ele.id]: v
                      // });
                      valueForm[ele.id] = v;
                      if (event.key === "Enter") {
                        onHandleLogin();
                      }
                    }}
                    style={{ width: "100%" }}
                  />
                </Grid>
              </Grid>
              <Grid
                container
                direction="row"
                justify="flex-start"
                alignItems="center"
              >
                <Grid item xs={5} sm={4}>
                  <Typography
                    variant="subtitle1"
                    className={classNames(classes.inlineTitle, classes.spacing)}
                  >
                    <VPNKey className={classes.spacing} />
                    Password:
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
                        <InputAdornment
                          position="end"
                          style={{ backgroundColor: "transparent" }}
                        >
                          <IconButton
                            className={classes.iconButton}
                            size="small"
                            aria-label="Toggle password visibility"
                            onClick={onHandleClickShowPassword}
                          >
                            {showPassword ? (
                              <VisibilityOff fontSize="small" />
                            ) : (
                              <Visibility fontSize="small" />
                            )}
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                    // value={valueForm.password}
                    onChange={onHandleChange}
                    onKeyPress={(v, o, ele, event) => {
                      // setValueForm({
                      //     ...valueForm, [ele.id]: v
                      // });
                      valueForm[ele.id] = v;
                      if (event.key === "Enter") {
                        onHandleLogin();
                      }
                    }}
                    style={{ width: "100%" }}
                  />
                </Grid>
              </Grid>
            </CardContent>
            <CardActions className={classes.action}>
              <Typography variant="subtitle2" className={classes.alert}>
                {alertmsg}
              </Typography>

              <AmButton styleType="confirm" onClick={onHandleLogin}>
                {"Login"}
              </AmButton>
            </CardActions>
          </Card>
          {redirect()}
        </Grid>

        {window.project === "TAP" ? (
          <div style={{ textAlign: "center", paddingTop: "20px" }}>
            {/* <IconButton className={classes.button} aria-label="description">
              <Description onClick={onHandleLoginViewReport} />
            </IconButton> */}
            <AmButton
              variant="contained"
              color="secondary"
              className={classes.button}
              onClick={onHandleLoginViewReport}
            >
              <Description />
              View Dashboard
            </AmButton>
          </div>
        ) : null}
      </Grid>
    </Grid>
  );
};
Login.propTypes = {
  classes: PropTypes.object.isRequired
};
export default withStyles(styles)(Login);
