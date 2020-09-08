import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { useState, useContext, useRef, useEffect, useLayoutEffect } from 'react';
import Axios from "axios";
import { createMuiTheme, ThemeProvider, useTheme, makeStyles } from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import CssBaseline from '@material-ui/core/CssBaseline';
import List from '@material-ui/core/List';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import {  Route, Switch, Redirect } from 'react-router-dom';
import routeLink from './routeLink';
import AmMenuBar from './asideLayout';
import Paper from '@material-ui/core/Paper';
import Breadcrumbs from '@material-ui/core/Breadcrumbs';
import Link from '@material-ui/core/Link';
import NavigateNextIcon from '@material-ui/icons/NavigateNext';
import route from './route';
import { useTranslation } from 'react-i18next';
import moment from "moment";
import '../i18n';
import useMediaQuery from '@material-ui/core/useMediaQuery';

import { LayoutContext } from '../reducers/context';

import Header from "./headerLayout";

const drawerWidth = 240;

const useStyles = makeStyles((theme) => ({
    root: {
        // [theme.breakpoints.down('sm')]: {
        //     aa: theme.palette.secondary.main
        // },
        display: 'flex'
    },
    menuButton: {
        marginLeft: 5,
        marginRight: 15,
        padding: 8
    },
    accountButton: {
        // marginLeft: 5,
        marginRight: 5,
        padding: 8
    },
    gutters: {
        paddingRight: 0
    },
    grow: {
        flexGrow: 1
    },
    hide: {
        display: 'none'
    },
    drawer: {
        width: drawerWidth,
        flexShrink: 0,
        visibility: "visible"
    },
    drawerPaper: {
        backgroundColor: '#263238',
        width: drawerWidth
    },
    drawerHeader: {
        display: "flex",
        alignItems: "center",
        padding: "0 8px",
        ...theme.mixins.toolbar,
        justifyContent: 'flex-end'
    },
    content: {
        width: '100%',
        flexGrow: 3,
        padding: theme.spacing(1),
        transition: theme.transitions.create('margin', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen
        }),
        position:"absolute",
        [theme.breakpoints.up('md')]: {
            marginLeft: -drawerWidth,
            growFlex:1,
            position:"static",
        },
    },
    contentShift: {
        width: `calc(100% - ${240}px)`,
        transition: theme.transitions.create("margin", {
            easing: theme.transitions.easing.easeOut,
            duration: theme.transitions.duration.enteringScreen
        }),
        marginLeft: 0
    },
    primary: {},
    listItemText: {
        padding: "0px 10px",
        textAlign: "left"
    },
    icon: {
        marginRight: 0
    },
    sectionDesktop: {
        display: 'none',
        overflowX:'Hidden',
        [theme.breakpoints.up('md')]: {
            display: 'flex'
        },
    },
    sectionMobile: {
        display: 'flex',
        position:"relative",
        [theme.breakpoints.up('md')]: {
            display: 'none',
        },
    },
    divfull: {
        top: '0 !important',
        left: '0 !important',
        position: 'fixed',
        boxOrient: 'horizontal',
        display: 'flex',
        padding: '0',
        margin: '0',
        width: '100%',
        height: '100%',
        textAlign: 'center',
        verticalAlign: 'middle !important',
        backgroundColor: 'rgba(0,0,0,.85)',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: '99999'
    },
}));

const checkstatus = () => {
    const d1 = new Date(localStorage.ExpireTime);
    const d2 = new Date();
    if (d1 > d2) {
        sessionStorage.setItem('Token', localStorage.getItem('Token'));
        // sessionStorage.setItem(
        //     'ClientSecret_SecretKey',
        //     localStorage.getItem('ClientSecret_SecretKey')
        // );
        sessionStorage.setItem('ExtendTime', localStorage.getItem('ExtendTime'));
        sessionStorage.setItem('User_ID', localStorage.getItem('User_ID'));
        sessionStorage.setItem('ExpireTime', localStorage.getItem('ExpireTime'));
        sessionStorage.setItem('Username', localStorage.getItem('Username'));
    } else {
        localStorage.removeItem("User_ID");
        localStorage.removeItem("Token");
        localStorage.removeItem("MenuItems");
        localStorage.removeItem("ExpireTime");
        localStorage.removeItem("ExtendTime");
        localStorage.removeItem("Username");
        sessionStorage.clear();
        return <Redirect from='/' to='/login' />;
    }

    if (
        sessionStorage.getItem('Token') === null ||
        sessionStorage.getItem('Token') === undefined
    ) {
        return <Redirect from='/' to='/login' />;
        // window.location.replace("/login");
    }
};

function useInterval(callback, delay) {
    const savedCallback = useRef();

    // Remember the latest function.
    useEffect(() => {
        savedCallback.current = callback;
    }, [callback]);

    // Set up the interval.
    useEffect(() => {
        function tick() {
            savedCallback.current();
        }
        if (delay !== null) {
            let id = setInterval(tick, delay);
            return () => clearInterval(id);
        }
    }, [delay]);
}

const MenuListDesktop = React.memo(({classes, theme, sidebar}) => {
    return <Drawer
        className={classes.drawer}
        variant='persistent'
        anchor='left'
        open={sidebar.sidebarToggle}
        classes={{
            paper: classes.drawerPaper
        }}
    >
        <div className={classes.drawerHeader}>
            <IconButton onClick={() => sidebar.setSidebarToggle(false)} style={{ color: 'white' }}>
                {theme.direction === 'ltr' ? (
                    <ChevronLeftIcon />
                ) : (
                        <ChevronRightIcon />
                    )}
            </IconButton>
        </div>
        <Divider />
        <List style={{ paddingTop: '0px', paddingBottom: '0px' }}>
            <AmMenuBar
                icon={true}
                iconChild={true}
                colorLink={'#37474F'}
                backgroundColorChild={'#78909C'}
            />
        </List>
    </Drawer>
});

const MenuListMoblie = React.memo(({classes, theme, sidebar}) => {
    return <Drawer
        className={classes.drawer}
        variant='persistent'
        anchor='left'
        open={sidebar.mobileSidebarToggle}
        classes={{
            paper: classes.drawerPaper
        }}
        style={{zIndex:100000}}
    >
        <div className={classes.drawerHeader}>
            <IconButton onClick={() => sidebar.setMobileSidebarToggle(false)} style={{ color: 'white' }}>
                {theme.direction === 'ltr' ? (
                    <ChevronLeftIcon />
                ) : (
                        <ChevronRightIcon />
                    )}
            </IconButton>
        </div>
        <Divider />
        <List style={{ paddingTop: '0px', paddingBottom: '0px' }}>
            <AmMenuBar
                icon={true}
                iconChild={true}
                colorLink={'#37474F'}
                backgroundColorChild={'#78909C'}
            />
        </List>
    </Drawer>
});

const MainContainer = React.memo(({route, path}) => {
    return <Switch>
        {route.map((x, idx) => (
            <Route
                key={idx}
                path={x.path}
                exact={x.exact}
                name={x.name}
                render={rprops => {
                    return <x.compoment {...rprops} />;
                }}
            />
        ))}
        <Redirect to="/404" />
    </Switch>
});

const theme2 = createMuiTheme();
const Default = props => {
    const classes = useStyles();
    const theme = useTheme();
    const [routes, setRoutes] = useState([]);
    const { t, i18n } = useTranslation()

    const matches = useMediaQuery(theme.breakpoints.up('md'));
    const refContainer = useRef();

    const {sidebar} = useContext(LayoutContext);

    function useWindowSize(ref) {
        const [size, setSize] = useState([0, 0]);
        useLayoutEffect(() => {
            function updateSize() {
                if (ref !== undefined)
                    setSize([ref.current.offsetWidth, window.innerHeight - 120]);
            }
            window.addEventListener('resize', updateSize);
            updateSize();
            return () => window.removeEventListener('resize', updateSize);
        }, []);
        return size;
    }

    useInterval(() => {
        var now = moment();
        var exp = moment(localStorage.getItem("ExpireTime"));
        var duration = moment.duration(exp.diff(now));
        // console.log(duration)
        var durDays = duration.days();
        var durHours = duration.hours();
        var durMin = duration.minutes();

        if (durDays === 0 && durHours === 0 && durMin <= 10) {
            var token = { token: localStorage.getItem("Token") }
            Axios.put(window.apipath + "/v2/token/extend", token).then(res => {
                if (res.data._result.status === 1) {
                    var split_token = res.data.Token.split(".");
                    var desc_token = atob(split_token[1]);
                    var json_dec = JSON.parse(desc_token)
                    savetoSession("ExtendTime", json_dec.extend);
                    savetoSession("ExpireTime", json_dec.exp);
 
                } else if (res.data._result.status === 0) {
                    alert(res.data._result.message)
                }
            });
        }

    }, 10000);
    const savetoSession = (name, data) => {
        localStorage.setItem(name, data);
        sessionStorage.setItem(name, localStorage.getItem([name]));
    };

    const size = useWindowSize(refContainer)
    
    let Path = window.location.pathname.split('/');
    useEffect(() => {
        var data = route(localStorage.getItem('MenuItems'));

        setRoutes(data);
    }, []);

    const NavicateBarN = () => {

        const jsonresult = JSON.parse(
            localStorage.getItem('MenuItems') === 'undefined'
                ? null
                : localStorage.getItem('MenuItems')
        );
        let json = { items: jsonresult };
        let Path = window.location.pathname.split('/');
        let name = '';
        if (json === undefined || json.items === null) {
        } else {
            jsonresult.forEach(row => {
                if (Path[1] === row.Name.replace(' ', '').replace(' ', '').toLowerCase() || Path[1] === "dashboard") {
                    row.WebPages.forEach((res) => {
                        if (Path[1]===res.PathLV1 && res.PathLV2=== Path[2]) { 
                            name = t(res.pageName.trim());
                            //name = res.pageName;
                        } else if (Path[2] === "inbound" && res.PathLV2.match("inbound")) {
                            name = t(res.pageName.trim());
                            // name = "Inbound Progress";
                        } else if (Path[2] === "outbound" && res.PathLV2.match("outbound")) {
                            name = t(res.pageName.trim());
                            // name = "Outbound Progress";
                        } else if (Path[2] === "detail") {
                            name = t((Path[2].charAt(0).toUpperCase() + Path[2].slice(1)).trim())
                            // name = Path[2].charAt(0).toUpperCase() + Path[2].slice(1);
                        }
                    });
                }
            });
            return (
                <span key="0">
                    <span
                        style={
                            matches ? (
                                { lineHeight: "29px", fontSize: '0.8rem' }
                            ) : (
                                    { lineHeight: "29px", fontSize: '1rem' }
                                )
                        }>{name}</span>
                </span>
            );
        }
    };
    const Home_Link = () => {
        if (Path[1] === "") {
        } else {
            return (
                <div
                    style={
                        matches ? (
                            { float: "left", lineHeight: "29px", fontSize: '0.8rem' }
                        ) : (
                                { float: "left", lineHeight: "29px", fontSize: '1rem' }
                            )
                    }
                >
                    <Link key="0" color="inherit" href="/">{t("Home")}</Link>
                </div>
            );
        }
    };
    const Route_1 = () => {
        if (Path[1] === "") {
        } else {
            if (Path[1] === "dashboard" && window.project === "STGT") {
                return <Typography color="textPrimary" style={matches ? ({ fontSize: '0.8rem' }) : ({ fontSize: '1rem' })}>
                    {t('Monitor')}
                </Typography>
            }
            return routes.map((x, idx) => {
                if (x.text.toString().toLowerCase() === Path[1]) {
                    return <div key={idx} style={{ float: "left", lineHeight: "29px", marginLeft: "5px" }}>
                        <Typography color="textPrimary" style={matches ? ({ fontSize: '0.8rem' }) : ({ fontSize: '1rem' })}>
                            {t(x.text)}
                        </Typography>

                    </div>
                }
                else {
                    /* return <div key={idx}></div>*/
                }
            });
        }
    };

    return (
        <ThemeProvider theme={theme2}>
            <div className={classes.root}>
                {checkstatus()}
                <CssBaseline />
                <Header/>
                <div className={classes.sectionDesktop}>
                    <MenuListDesktop classes={classes} theme={theme} sidebar={sidebar}/>
                </div>

                <div className={classes.sectionMobile}>
                    <MenuListMoblie classes={classes} theme={theme} sidebar={sidebar}/>
                    {sidebar.mobileSidebarToggle ? 
                    <div onClick={() => sidebar.setMobileSidebarToggle(false)} className={[classes.divfull]}></div> 
                    : null}
                </div>

                <main className={classNames(classes.content, {
                        [classes.contentShift]: (matches ? sidebar.sidebarToggle : matches)
                    })}
                >
                    <div className={classes.drawerHeader} />
                        <Paper
                            elevation={0}
                            className={classes.paper}
                            style={{ background: "none" }}
                        >
                            <Breadcrumbs
                                separator={<NavigateNextIcon fontSize="small" />}
                                aria-label="Breadcrumb"
                            >
                                {Home_Link()}
                                {Route_1()}
                                {NavicateBarN()}
                            </Breadcrumbs>
                        </Paper>
                        <div ref={refContainer} style={{width:"100%", height:size[1] }}>
                            <MainContainer route={routeLink} path={window.location.pathname}/>
                        </div> 
                </main>

            </div>
        </ThemeProvider>
    );
};

Default.propTypes = {
    classes: PropTypes.object.isRequired,
    theme: PropTypes.object.isRequired
};

export default Default;
