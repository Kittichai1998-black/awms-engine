/* eslint-disable default-case */
import Collapse from "@material-ui/core/Collapse";
import Divider from "@material-ui/core/Divider";
import ExpandLess from "@material-ui/icons/ExpandLess";
import ExpandMore from "@material-ui/icons/ExpandMore";
import InboxIcon from "@material-ui/icons/Inbox";
import { Link, withRouter } from "react-router-dom";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import ListSubheader from "@material-ui/core/ListSubheader";
import PropTypes from "prop-types";
import purple from "@material-ui/core/colors/purple";
import React, { useReducer, useContext, useState, useEffect } from "react";
import SvgIcon from "@material-ui/core/SvgIcon";
import { useTranslation } from "react-i18next";
import {
  withStyles,
  MuiThemeProvider,
  createMuiTheme
} from "@material-ui/core/styles";

import { LocationContext } from "../reducers/context";
import { menuToggle, initialState } from "../reducers/menuReducer";
import route from "./route";

const theme = createMuiTheme({
  typography: {
    useNextVariants: true
  },
  overrides: {
    MuiTypography: {
      body1: {
        color: "white",
        fontSize: 12
      }
    }
  },
  typography: {
    useNextVariants: true
  }
});

const styles = theme => ({
  root: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: "#263238",
    color: "white",
    paddingBottom: "0px",
    paddingTop: "0px"
  }
});

const Aside = props => {
  const { t, i18n } = useTranslation();
  const [state, dispatch] = useReducer(menuToggle, initialState.menuToggle);
  const { classes } = props;
  const [locat, dispatchLocat] = useContext(LocationContext);
  const [icon, setIcon] = useState(props.icon);
  const [iconChild, setIconChild] = useState(props.iconChild);
  const [colorLink, setColorLink] = useState(props.colorLink);
  const [backgroundColorChild, setBackgroundColorChild] = useState(
    props.backgroundColorChild
  );
  const [backgroundColor, setBackgroundColor] = useState(props.backgroundColor);
  const [routes, setRoutes] = useState([]);

  function onHandleClickToggle(menuID) {
    dispatch({ type: "expand", menuID: menuID });
  }

  function HomeIcon(type) {
    return (
      <SvgIcon>
        <path d={type} />
      </SvgIcon>
    );
  }
  useEffect(() => {
    var data = route(localStorage.getItem("MenuItems"));

    setRoutes(data);
  }, []);

  return (
    <MuiThemeProvider theme={theme}>
      <div>
        <div className={classes.toolbar} />
        <List
          component="nav"
          className={classes.root}
          style={{ backgroundColor: backgroundColor }}
        >
          {routes.map((x, idx) => {
            if (x.child) {
              return (
                <div key={idx}>
                  <ListItem
                    divider
                    button
                    onClick={() => onHandleClickToggle(x.text)}
                  >
                    {icon === true
                      ? x.icon === null
                        ? ""
                        : HomeIcon(x.icon)
                      : null}
                    <ListItemText primary={t(x.text.trim())} />
                    {/* <ListItemText primary={x.text} /> */}
                    {state.menuID === x.text && state.toggle === true ? (
                      <ExpandLess />
                    ) : (
                      <ExpandMore />
                    )}
                  </ListItem>
                  {x.child.map((y, idx2) => {
                    return (
                      <Collapse
                        key={idx2}
                        in={state.menuID === x.text ? state.toggle : false}
                        timeout="auto"
                        unmountOnExit
                      >
                        <List component="div" disablePadding>
                          <ListItem
                            style={{
                              backgroundColor:
                                y.to !== props.history.location.pathname
                                  ? colorLink
                                  : backgroundColorChild
                            }}
                            divider
                            button
                            component={Link}
                            to={y.to}
                          >
                            <span
                              className="cui-user"
                              aria-hidden="true"
                            ></span>
                            {HomeIcon("")}
                            {iconChild === true
                              ? y.iconChild === null
                                ? ""
                                : HomeIcon(y.iconSub)
                              : null}
                            <ListItemText primary={t(y.text.trim())} />
                            {/* <ListItemText primary={y.text} /> */}
                          </ListItem>
                        </List>
                      </Collapse>
                    );
                  })}
                </div>
              );
            } else {
              return (
                <ListItem key={idx} divider button component={Link} to={x.to}>
                  <ListItemText primary={t(x.text.trim())} />
                  {/* <ListItemText primary={x.text} /> */}
                </ListItem>
              );
            }
          })}
        </List>
      </div>
    </MuiThemeProvider>
  );
};

Aside.propTypes = {
  container: PropTypes.object
};

// style={{backgroundColor:"red"}}

export default withRouter(withStyles(styles, { withTheme: true })(Aside));
