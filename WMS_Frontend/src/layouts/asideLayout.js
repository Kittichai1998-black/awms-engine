/* eslint-disable default-case */
import Collapse from '@material-ui/core/Collapse';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';
import { Link, withRouter } from 'react-router-dom';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import PropTypes from 'prop-types';
import React, { useContext, useState, useEffect } from 'react';
import SvgIcon from '@material-ui/core/SvgIcon';
import { useTranslation } from 'react-i18next';
import {
  withStyles,
  MuiThemeProvider,
  createMuiTheme
} from '@material-ui/core/styles';

import { LayoutContext } from '../reducers/context';
import route from './route';

const theme = createMuiTheme({
  typography: {
    useNextVariants: true
  },
  overrides: {
    MuiTypography: {
      body1: {
        color: 'white',
        fontSize: 12
      }
    }
  }
});

const styles = theme => ({
  root: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#263238',
    color: 'white',
    paddingBottom: '0px',
    paddingTop: '0px'
  }
});

const Aside = props => {
  const { t, i18n } = useTranslation();
  const { sidebar } = useContext(LayoutContext)
  const { classes } = props;
  const [routes, setRoutes] = useState([]);

  function onHandleClickToggle(menuID) {
    sidebar.setMenuToggle({ type: 'expand', menuID: menuID });
  }

  function HomeIcon(type) {
    return (
      <SvgIcon>
        <path d={type} />
      </SvgIcon>
    );
  }
  useEffect(() => {
    var data = route(localStorage.getItem('MenuItems'));

    setRoutes(data);
  }, [localStorage.getItem('MenuItems')]);

  return (
    <MuiThemeProvider theme={theme}>
      <div>
        <div className={classes.toolbar} />
        <List
          component='nav'
          className={classes.root}
          style={{ backgroundColor: props.backgroundColor }}
        >
          {routes.map((x, idx) => {
            if (x.child) {
              return (
                <div key={idx}>
                  <ListItem
                    divider
                    button
                    onClick={() => { onHandleClickToggle(x.text) }}
                  >
                    {props.icon === true
                      ? x.icon === null
                        ? ''
                        : HomeIcon(x.icon)
                      : null}
                    <ListItemText primary={t(x.text)} />
                    {sidebar.menuToggle.menuID === x.text && sidebar.menuToggle.toggle === true ? (
                      <ExpandLess />
                    ) : (
                        <ExpandMore />
                      )}
                  </ListItem>
                  {x.child.filter(x=> x.visible).map((y, idx2) => {
                    return (
                      <Collapse
                        key={idx2}
                        in={sidebar.menuToggle.menuID === x.text ? sidebar.menuToggle.toggle : false}
                        timeout='auto'
                        unmountOnExit
                      >
                        <List component='div' disablePadding>
                          <ListItem
                            style={{
                              backgroundColor:
                                y.to !== props.history.location.pathname
                                  ? props.colorLink
                                  : props.backgroundColorChild
                            }}
                            divider
                            button
                            component={Link}
                            to={y.to}
                            onClick={() => sidebar.setMobileSidebarToggle(false)}
                          >
                            <span
                              className='cui-user'
                              aria-hidden='true'
                            ></span>
                            {HomeIcon('')}
                            {props.iconChild === true
                              ? y.iconChild === null
                                ? ''
                                : HomeIcon(y.iconSub)
                              : null}
                            <ListItemText primary={t(y.text)} />
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
                  <ListItemText primary={t(x.text)} />
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
