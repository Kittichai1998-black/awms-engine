import React, {useContext} from 'react';
import { LayoutContext } from '../reducers/context';

import { fade, makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import Badge from '@material-ui/core/Badge';
import MenuItem from '@material-ui/core/MenuItem';
import Menu from '@material-ui/core/Menu';
import MenuIcon from '@material-ui/icons/Menu';
import AccountCircle from '@material-ui/icons/AccountCircle';
import NotificationsIcon from '@material-ui/icons/Notifications';
import MoreIcon from '@material-ui/icons/MoreVert';
import Popper from '@material-ui/core/Popper';
import MenuList from '@material-ui/core/MenuList';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import Grow from '@material-ui/core/Grow';
import Paper from '@material-ui/core/Paper';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import '../i18n';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import { Redirect } from 'react-router-dom';
import NotifyBox from "./NotifyMessageBox";

const drawerWidth = 240;

const divLingLogo = {
  width: '4vw',
  display: 'inline-block',
  height: '2.5vw',
  lineHeight: '2.5vw',
  Float: 'Left',
  marginLeft: '1vw',
  fontSize: '2.2vw'
};

const divLingLogo_phone = {

  width: '4vw',
  display: 'inline-block',
  height: '2.5vw',
  lineHeight: '2.5vw',
  Float: 'Left',
  marginLeft: '1vw',
  fontSize: '0.7rem'

};
const useStyles = makeStyles((theme) => ({
  grow: {
    flexGrow: 1,
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  title: {
    display: 'none',
    [theme.breakpoints.up('sm')]: {
      display: 'block',
    },
  },
  search: {
    position: 'relative',
    borderRadius: theme.shape.borderRadius,
    backgroundColor: fade(theme.palette.common.white, 0.15),
    '&:hover': {
      backgroundColor: fade(theme.palette.common.white, 0.25),
    },
    marginRight: theme.spacing(2),
    marginLeft: 0,
    width: '100%',
    [theme.breakpoints.up('sm')]: {
      marginLeft: theme.spacing(3),
      width: 'auto',
    },
  },
  searchIcon: {
    padding: theme.spacing(0, 2),
    height: '100%',
    position: 'absolute',
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
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
  inputRoot: {
    color: 'inherit',
  },
  inputInput: {
    padding: theme.spacing(1, 1, 1, 0),
    // vertical padding + font size from searchIcon
    paddingLeft: `calc(1em + ${theme.spacing(4)}px)`,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('md')]: {
      width: '20ch',
    },
  },
  sectionDesktop: {
    display: 'none',
    [theme.breakpoints.up('md')]: {
      display: 'flex',
    },
  },
  sectionMobile: {
    display: 'flex',
    [theme.breakpoints.up('md')]: {
      display: 'none',
    },
  },
}));

const convertLang = l => {
  return l === "EN" ? "English" : "ไทย"
}

export default (props) => {
  const {notify, sidebar} = useContext(LayoutContext);

  const classes = useStyles();
  const [open, setOpen] = React.useState(false);
  const [lang, setLang] = React.useState(() => {
    if(localStorage.getItem("Lang")){
      return convertLang(localStorage.getItem("Lang"));
    }
    else{
      localStorage.setItem("Lang", "EN");
      return convertLang(localStorage.getItem("Lang"));
    }
  });
  const accountRef = React.useRef(null);
  const notifyRef = React.useRef(null);
  const langRef = React.useRef(null);
  const [ref, setRef] = React.useState(accountRef)
  const [item, setItem] = React.useState([])
  const { t, i18n } = useTranslation()
  const matches = useMediaQuery('(max-width:400px)');

  const changeLang = (l) => {
      if (lang !== l) {
          localStorage.setItem('Lang', l)
          setLang(convertLang(l))
          i18n.changeLanguage(l)
      }
  }

  const handleListKeyDown = (event) =>{
    if (event.key === 'Tab') {
      event.preventDefault();
      setOpen(false);
    }
  }

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleLogout = event => {
    setOpen(false);
    sessionStorage.clear();
    localStorage.removeItem("User_ID");
    localStorage.removeItem("Token");
    localStorage.removeItem("MenuItems");
    localStorage.removeItem("ExpireTime");
    localStorage.removeItem("ExtendTime");
    localStorage.removeItem("Username");
    //window.open("/login", "_self")
  };

  const handleClose = (event) => {
    //if (accountRef.current && accountRef.current.contains(event.target)) 
      //return;
    setOpen(false);
  };

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

  const renderMenu = (ref, item) => (
      <Popper style={{zIndex:9999}} open={open} anchorEl={ref.current} role={undefined} transition disablePortal>
          {({ TransitionProps, placement }) => (
            <Grow {...TransitionProps} style={{ transformOrigin: placement === 'bottom' ? 'center top' : 'center bottom' }}>
              <Paper>
                <ClickAwayListener onClickAway={handleClose}>
                  <MenuList autoFocusItem={open} id="menu-list-grow" onKeyDown={handleListKeyDown}>
                    {open ? item.map(x => <MenuItem onClick={() => {x.onClick()}}>{x.label}</MenuItem>) : null}
                  </MenuList>
                </ClickAwayListener>
              </Paper>
            </Grow>
          )}
      </Popper>
  );

  const mobileMenuId = 'primary-search-account-menu-mobile';
  const renderMobileMenu = (
    <Menu
      //anchorEl={mobileMoreAnchorEl}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      id={mobileMenuId}
      keepMounted
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      //open={isMobileMenuOpen}
      //onClose={handleMobileMenuClose}
    >
      <MenuItem>
        <IconButton aria-label="show 11 new notifications" color="inherit">
          <Badge badgeContent={notify.notifyCount} color="secondary">
            <NotificationsIcon />
          </Badge>
        </IconButton>
        <p>Notifications</p>
      </MenuItem>
      <MenuItem>
        <IconButton
          aria-label="account of current user"
          aria-controls="primary-search-account-menu"
          aria-haspopup="true"
          color="inherit"
          onClick={() => handleLogout()}
        >
          <AccountCircle />
        </IconButton>
        <p>Logout</p>
      </MenuItem>
    </Menu>
  );

  const LogoIn = () => {
    return (<a
        href='/'
        style={{
            display: 'inline-block',
            width: 'auto',
            textDecoration: 'none',
            color: '#FFF'
        }}>
        {matches ? (
            <img
                src={require('../assets/logo/logo.png')}
                style={{

                    width: '35px',
                    display: 'inline-block'
                }}
                alt=''
            />
        ) : (
                <img
                    src={require('../assets/logo/logo.png')}
                    style={{
                        float: 'left',
                        width: '4vw',
                        display: 'inline-block'
                    }}
                    alt=''
                />
            )}
        {matches ? (
            ''
        ) : (
                <div style={divLingLogo}>AMS</div>
            )}

    </a>
    )
}
  return (
    <div className={classes.grow}>
      {checkstatus()}
      <AppBar position='fixed' className={classNames(classes.appBar, {[classes.appBarShift]: sidebar.sidebarToggle})}>
        <Toolbar>
          {!sidebar.sidebarToggle ? <IconButton
            edge="start"
            className={classes.menuButton}
            color="inherit"
            aria-label="open drawer"
            onClick={()=> sidebar.setSidebarToggle(true)}
          >
            <MenuIcon  />
          </IconButton> : null}
          <Typography
                aria-haspopup='true'
                variant='subtitle1'
                color='inherit'
                className={classes.username}
              >
            {LogoIn()}
          </Typography>
          <div className={classes.grow} />
          <div className={classes.sectionDesktop}>
            <IconButton 
              aria-label="notifications" 
              color="inherit"
              ref={notifyRef}
              onClick={() => {notify.setNotifyState(true)}}
            >
              <Badge badgeContent={notify.notifyCount} color="secondary">
                <NotificationsIcon />
              </Badge>
            </IconButton>
            <IconButton 
              aria-label="notifications" 
              color="inherit"
              ref={langRef}
              onClick={() => {handleToggle(); setRef(langRef); setItem([{label:"ENGLISH", onClick:()=> changeLang("EN")},{label:"ไทย", onClick:()=> changeLang("TH")}])}}
            >
              <Typography
                aria-haspopup='true'
                variant='subtitle1'
                color='inherit'
                className={classes.lang}
              >
                {localStorage.getItem("Lang")}
                <ArrowDropDownIcon />
              </Typography>
            </IconButton>
            <IconButton
              edge="end"
              ref={accountRef}
              aria-controls={open ? 'menu-list-grow' : undefined}
              aria-label="account of current user"
              aria-haspopup="true"
              onClick={() => {
                handleToggle(); setRef(accountRef); setItem([{label:"Logout", onClick:()=> handleLogout()}])
              }}
              color="inherit"
            >
                <AccountCircle />
              <Typography
                aria-haspopup='true'
                variant='subtitle1'
                color='inherit'
                className={classes.username}
              >
                {localStorage.getItem('Username')}
                <ArrowDropDownIcon />
              </Typography>
            </IconButton>
          </div>
          <div className={classes.sectionMobile}>
            <IconButton
              aria-label="show more"
              aria-controls={mobileMenuId}
              aria-haspopup="true"
              //onClick={handleMobileMenuOpen}
              color="inherit"
            >
              <MoreIcon />
            </IconButton>
          </div>
        </Toolbar>
      </AppBar>
      {renderMobileMenu}
      {renderMenu(ref, item)}
      <NotifyBox btnRef={notifyRef}/>
    </div>
  );
}


