import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { useState, useContext, useRef, useEffect } from 'react';

import {
    withStyles,
    MuiThemeProvider,
    createMuiTheme
} from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import CssBaseline from '@material-ui/core/CssBaseline';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import List from '@material-ui/core/List';
import AccountCircle from '@material-ui/icons/AccountCircle';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import { NavLink, Route, Switch, Redirect, withRouter } from 'react-router-dom';
import routeLink from './routeLink';
import AmMenuBar from './asideLayout';
import { HeaderContext } from '../reducers/context';
import MenuList from '@material-ui/core/MenuList';
import MenuItem from '@material-ui/core/MenuItem';
import Grow from '@material-ui/core/Grow';
import Paper from '@material-ui/core/Paper';
import Popper from '@material-ui/core/Popper';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import PermIdentity from '@material-ui/icons/PermIdentity';
import Exit from '@material-ui/icons/ExitToApp';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import Breadcrumbs from '@material-ui/core/Breadcrumbs';
import Link from '@material-ui/core/Link';
import NavigateNextIcon from '@material-ui/icons/NavigateNext';
import route from './route';
import SvgIcon from '@material-ui/core/SvgIcon';
import iconMenuTree from '../components/AmIconMenu';
import { NONAME } from 'dns';
import { useTranslation } from 'react-i18next';
import '../i18n';

const theme = createMuiTheme({
    overrides: {
        MuiDrawer: {
            subhepaperAnchorDockedLeftading: {
                borderRight: '0px'
            }
        }
    },
    typography: {
        useNextVariants: true
    },
    typography: {
        useNextVariants: true
    }
});

const drawerWidth = 240;

const styles = theme => ({
    root: {
        display: 'flex'
    },
    appBar: {
        transition: theme.transitions.create(["margin", "width"], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen
        })
    },
    appBarShift: {
        width: `calc(100% - ${drawerWidth}px)`,
        marginLeft: drawerWidth,
        transition: theme.transitions.create(["margin", "width"], {
            easing: theme.transitions.easing.easeOut,
            duration: theme.transitions.duration.enteringScreen
        })
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
        flexShrink: 0
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
        width: `calc(100% - ${drawerWidth}px)`,
        flexGrow: 1,
        padding: theme.spacing(3),
        transition: theme.transitions.create('margin', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen
        }),
        marginLeft: -drawerWidth
    },
    contentShift: {
        transition: theme.transitions.create("margin", {
            easing: theme.transitions.easing.easeOut,
            duration: theme.transitions.duration.enteringScreen
        }),
        marginLeft: 0
    },
    menuItem: {
        "&:focus": {
            backgroundColor: theme.palette.primary.main,
            '& $primary, & $icon': {
                color: theme.palette.common.white
            }
        }
    },
    primary: {},
    listItemText: {
        padding: "0px 10px",
        textAlign: "left"
    },
    icon: {
        marginRight: 0
    },
    username: {
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-end",
        marginRight: 10,
        "&:hover": {
            cursor: "pointer"
        }
    }
});

const useMenuBar = (status) => {
    
}

const checkstatus = () => {
    const d1 = new Date(localStorage.ExpireTime);
    const d2 = new Date();
    if (d1 > d2) {
        sessionStorage.setItem('Token', localStorage.getItem('Token'));
        sessionStorage.setItem(
            'ClientSecret_SecretKey',
            localStorage.getItem('ClientSecret_SecretKey')
        );
        sessionStorage.setItem('ExtendKey', localStorage.getItem('ExtendKey'));
        sessionStorage.setItem('User_ID', localStorage.getItem('User_ID'));
        sessionStorage.setItem('ExpireTime', localStorage.getItem('ExpireTime'));
        sessionStorage.setItem('Username', localStorage.getItem('Username'));
    } else {
        localStorage.clear();
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
const convertLang = l => {
    return l === "EN" ? "English" : "ไทย"
}

const Default = props => {
    const [state, dispatch] = useContext(HeaderContext);
    const { classes, theme } = props;
    const [open, setOpen] = useState(true);
    const [openMenuHeader, setOpenMenuHeader] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);
    const [routes, setRoutes] = useState([]);
    const [openLangHeader, setOpenLangHeader] = useState(false)
    const [lang, setLang] = useState(() => {
        return localStorage.getItem("Lang") ? convertLang(localStorage.getItem("Lang")) : localStorage.setItem("Lang", "EN"), convertLang(localStorage.getItem("Lang"))
    })
    const { t, i18n } = useTranslation()



    // const openMenuHeader = Boolean(anchorEl);
    const handleDrawerOpen = () => {
        setOpen(true);
    };

    const handleDrawerClose = () => {
        setOpen(false);
    };
    const handleClose = event => {
        // setAnchorEl(null);
        if (anchorEl.contains(event.target)) {
            return;
        }
        setOpenMenuHeader(false);
        setOpenLangHeader(false)
    };

    const handleMenuToggle = () => {
        setOpenMenuHeader(!openMenuHeader);
        setOpenLangHeader(false)
    };
    const handleLangToggle = () => {
        setOpenLangHeader(!openLangHeader);
        setOpenMenuHeader(false);
    };
    const handleLogout = event => {
        handleClose(event);
        sessionStorage.clear();
        localStorage.clear();
        i18n.changeLanguage("EN")
    };

    const divLingLogo = {
        width: '4vw',
        display: 'inline-block',
        height: '2.5vw',
        lineHeight: '2.5vw',
        Float: 'Left',
        marginLeft: '1vw',
        fontSize: '2.2vw'
    };
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
        let icon_s = '';
        if (json === undefined || json.items === null) {
        } else {
            jsonresult.forEach(row => {
             
                if (
                    Path[1] === row.Name
                        .replace(' ', '')
                        .replace(' ', '')
                        .toLowerCase()
                ) {
                    row.WebPages.map(res => {
                      
                        if (res.PathLV2 === Path[2]) {
                           name = t(res.pageName.trim());
                             //name = res.pageName;
                            icon_s = iconMenuTree[res.Icon];
                        } else if (Path[2] === "inbound" && res.PathLV2.match("inbound")) {
                            name = t(res.pageName.trim());
                            // name = "Inbound Progress";
                            icon_s = iconMenuTree["ReceiveingSub"];
                        } else if (Path[2] === "outbound" && res.PathLV2.match("outbound")) {
                            name = t(res.pageName.trim());
                            // name = "Outbound Progress";
                            icon_s = iconMenuTree["IssuingSub"];
                        } else if (Path[2] === "detail") {
                            name = t((Path[2].charAt(0).toUpperCase() + Path[2].slice(1)).trim())
                            // name = Path[2].charAt(0).toUpperCase() + Path[2].slice(1);
                            icon_s = iconMenuTree["Report"];
                        }
                    });
                }
            });
            return (
                <span key="0">
                    <span style={{ float: "left", lineHeight: "29px" }}>{name}</span>
                </span>
            );
        }
    };
    const Home_Link = () => {
        if (Path[1] === "") {
        } else {
            return (
                <div style={{ float: "left", lineHeight: "29px",fontSize:"1rem" }}>
                    {/* <Link key="0" color="inherit" href="/">Home</Link> */}
                    <Link key="0" color="inherit" href="/">{t("Home")}</Link>
                </div>
            );
        }
    };
    const Route_1 = () => {
        if (Path[1] === "") {
        } else {
            return routes.map((x, idx) => {
               
                if (x.text.toString().toLowerCase() === Path[1]) {
                    return <div
                        key={idx}
                        style={{
                            float: "left",
                            lineHeight: "29px",
                            marginLeft: "5px"
                        }}
                    >
                        <Typography color="textPrimary" style={{ fontSize:"1rem" }}>
                            {t(x.text)}
                            {/* {x.text} */}
                        </Typography>
                    </div>
                }
            });
        }
    };

    const changeLang = (l) => {
        if (lang !== l) {
            localStorage.setItem('Lang', l)
            setLang(convertLang(l))
            i18n.changeLanguage(l)
        }
        setOpenLangHeader(false)
    }

    return (
        <MuiThemeProvider theme={theme}>
            <div className={classes.root}>
                {checkstatus()}
                <CssBaseline />
                <AppBar
                    position='fixed'
                    className={classNames(classes.appBar, {
                        [classes.appBarShift]: open
                    })}
                >
                    <Toolbar
                        disableGutters={!open}
                        classes={{
                            gutters: classes.gutters
                        }}
                    >
                        <IconButton
                            color='inherit'
                            aria-label='Open drawer'
                            onClick={handleDrawerOpen}
                            className={classNames(classes.menuButton, open && classes.hide)}
                        >
                            <MenuIcon />
                        </IconButton>
                        <Typography
                            variant='h6'
                            color='inherit'
                            noWrap
                            className={classes.grow}
                        >
                            <a
                                href='/'
                                style={{
                                    display: 'inline-block',
                                    width: 'auto',
                                    textDecoration: 'none',
                                    color: '#FFF'
                                }}
                            >
                                <img
                                    src={require('../assets/logo/logo.png')}
                                    style={{
                                        float: 'left',
                                        width: '4vw',
                                        display: 'inline-block'
                                    }}
                                    alt=''
                                />
                                <div style={divLingLogo}>AMS</div>
                            </a>
                        </Typography>
                        {/* แสดงชื่อ Username และ Menu=> Profile, Logout */}
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'center' }}>
                                {/* <IconButton
                  buttonRef={node => {
                    
                    setAnchorEl(node);
                  }}
                  aria-owns={openLangHeader ? 'lang-appbar' : undefined}
                  aria-haspopup='true'
                  onClick={handleLangToggle}
                  color='inherit'
                  className={classes.accountButton}
                >
                  <AccountCircle />
                </IconButton> */}
                                <Typography
                                    aria-owns={openLangHeader ? 'lang-appbar' : undefined}
                                    aria-haspopup='true'
                                    variant='subtitle2'
                                    color='inherit'
                                    className={classes.username}
                                    onClick={handleLangToggle}
                                >
                                    {lang}
                                    <ArrowDropDownIcon />
                                </Typography>

                                <IconButton
                                    buttonRef={node => {
                                        setAnchorEl(node);
                                    }}
                                    aria-owns={openMenuHeader ? 'menu-appbar' : undefined}
                                    aria-haspopup='true'
                                    onClick={handleMenuToggle}
                                    color='inherit'
                                    className={classes.accountButton}
                                >
                                    <AccountCircle />
                                </IconButton>

                                <Typography
                                    aria-owns={openMenuHeader ? 'menu-appbar' : undefined}
                                    aria-haspopup='true'
                                    variant='subtitle1'
                                    color='inherit'
                                    className={classes.username}
                                    onClick={handleMenuToggle}
                                >
                                    {localStorage.getItem('Username')}
                                    <ArrowDropDownIcon />
                                </Typography>
                            </div>

                            <Popper
                                open={openLangHeader}
                                // anchorEl={anchorEl}
                                transition
                                disablePortal
                            >
                                {({ TransitionProps, placement }) => {
                                    return (
                                        <Grow
                                            {...TransitionProps}
                                            id='lang-appbar'
                                            style={{
                                                transformOrigin:
                                                    placement === 'bottom' ? 'center top' : 'center bottom'
                                            }}
                                        >
                                            <Paper>
                                                <ClickAwayListener onClickAway={handleClose}>
                                                    <MenuList>
                                                        {/* <MenuItem className={classes.menuItem} onClick={handleClose} >
                            <ListItemIcon className={classes.icon}>
                              <PermIdentity />
                            </ListItemIcon>
                            <ListItemText classes={{ primary: classes.primary, root: classes.listItemText }} inset primary="Profile" />
                          </MenuItem> */}
                                                        <MenuItem
                                                            className={classes.menuItem}
                                                            onClick={() => changeLang("EN")}
                                                        >
                                                            {/* <ListItemIcon className={classes.icon}>
                                <Exit />
                              </ListItemIcon> */}
                                                            <ListItemText
                                                                classes={{
                                                                    primary: classes.primary,
                                                                    root: classes.listItemText
                                                                }}
                                                                inset
                                                                primary='English'
                                                            />
                                                        </MenuItem>
                                                        <MenuItem
                                                            className={classes.menuItem}
                                                            onClick={() => changeLang("TH")}
                                                        >
                                                            {/* <ListItemIcon className={classes.icon}>
                                <Exit />
                              </ListItemIcon> */}
                                                            <ListItemText
                                                                classes={{
                                                                    primary: classes.primary,
                                                                    root: classes.listItemText
                                                                }}
                                                                inset
                                                                primary='ไทย'
                                                            />
                                                        </MenuItem>
                                                    </MenuList>
                                                </ClickAwayListener>
                                            </Paper>
                                        </Grow>
                                    )
                                }}
                            </Popper>

                            <Popper
                                open={openMenuHeader}
                                anchorEl={anchorEl}
                                transition
                                disablePortal
                            >
                                {({ TransitionProps, placement }) => (
                                    <Grow
                                        {...TransitionProps}
                                        id='menu-appbar'
                                        style={{
                                            transformOrigin:
                                                placement === 'bottom' ? 'center top' : 'center bottom'
                                        }}
                                    >
                                        <Paper>
                                            <ClickAwayListener onClickAway={handleClose}>
                                                <MenuList>
                                                    {/* <MenuItem className={classes.menuItem} onClick={handleClose} >
                            <ListItemIcon className={classes.icon}>
                              <PermIdentity />
                            </ListItemIcon>
                            <ListItemText classes={{ primary: classes.primary, root: classes.listItemText }} inset primary="Profile" />
                          </MenuItem> */}
                                                    <MenuItem
                                                        className={classes.menuItem}
                                                        onClick={handleLogout}
                                                    >
                                                        <ListItemIcon className={classes.icon}>
                                                            <Exit />
                                                        </ListItemIcon>
                                                        <ListItemText
                                                            classes={{
                                                                primary: classes.primary,
                                                                root: classes.listItemText
                                                            }}
                                                            inset
                                                            primary={t('Log Out')}
                                                        />
                                                    </MenuItem>
                                                </MenuList>
                                            </ClickAwayListener>
                                        </Paper>
                                    </Grow>
                                )}
                            </Popper>
                        </div>
                        {/*--end แสดงชื่อ Username และ Menu=> Profile, Logout --*/}
                    </Toolbar>
                </AppBar>
                <Drawer
                    className={classes.drawer}
                    variant='persistent'
                    anchor='left'
                    open={open}
                    classes={{
                        paper: classes.drawerPaper
                    }}
                >
                    <div className={classes.drawerHeader}>
                        <IconButton onClick={handleDrawerClose} style={{ color: 'white' }}>
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
                <main
                    className={classNames(classes.content, {
                        [classes.contentShift]: open
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
                            <Typography color="textPrimary" style={{ fontSize:"1rem" }}>{NavicateBarN()}</Typography>
                        </Breadcrumbs>
                    </Paper>

                    <Switch>
                   
                        {routeLink.map((x, idx) => (
                           
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
                </main>
            </div>
        </MuiThemeProvider>
    );
};

Default.propTypes = {
    classes: PropTypes.object.isRequired,
    theme: PropTypes.object.isRequired
};

export default withStyles(styles, { withTheme: true })(Default);
