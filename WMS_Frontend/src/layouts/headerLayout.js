import React, {useContext} from 'react';
import { LayoutContext } from '../reducers/context';

import { fade, makeStyles, createMuiTheme, ThemeProvider, useTheme } from '@material-ui/core/styles';
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
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import '../i18n';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import { Redirect } from 'react-router-dom';
import NotifyBox from "./NotifyMessageBox";
import AmDropdownMenu from "../components/AmDropDownMenu";

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
    width: `100%`,
    marginLeft: drawerWidth,
    transition: theme.transitions.create(["margin", "width"], {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen
    }),
    [theme.breakpoints.up('md')]: {
        width: `calc(100% - ${240}px)`,
    },
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
  appLogo:{
    margin:"auto"
  }
}));

const convertLang = l => {
  return l === "EN" ? "English" : "ไทย"
}

const HeaderLayout = (props) => {
  const {notify, sidebar} = useContext(LayoutContext);
  const theme = useTheme();

  const classes = useStyles();
  const [lang, setLang] = React.useState(() => {
    if(localStorage.getItem("Lang")){
      return convertLang(localStorage.getItem("Lang"));
    }
    else{
      localStorage.setItem("Lang", "EN");
      return convertLang(localStorage.getItem("Lang"));
    }
  });
  const { t, i18n } = useTranslation()
  const matches = useMediaQuery(theme.breakpoints.up('md'));

  const changeLang = (l) => {
      if (lang !== l) {
          localStorage.setItem('Lang', l)
          setLang(convertLang(l))
          i18n.changeLanguage(l)
      }
  }
  const handleLogout = event => {
    sessionStorage.clear();
    localStorage.removeItem("User_ID");
    localStorage.removeItem("Token");
    localStorage.removeItem("MenuItems");
    localStorage.removeItem("ExpireTime");
    localStorage.removeItem("ExtendTime");
    localStorage.removeItem("Username");
    window.open("/", "_self")
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

  const customToggleBTN = React.forwardRef(({ children, onClick }, ref) => (
    <div
      ref={ref}
      onClick={(e) => {
          e.preventDefault();
          onClick(e);
      }}
      style={{cursor:"pointer",height:"54px", marginLeft:"10px", userSelect:"none", padding:"15px 0"}}
      >
      {children}
      &nbsp; &#x25bc;
    </div>
  ));

  const renderMenu = (items, id, text) => {
    const reCreateItems = items.map(x=> {return {label:x.label, action:() => x.onClick()}})
    return <AmDropdownMenu customToggle={customToggleBTN} title={text} id={id} datas={[]} item={items.label} items={reCreateItems}/>
  };
  
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
        <IconButton style={{position:"relative"}} aria-label="show 11 new notifications" color="inherit">
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
          style={{position:"relative"}}
          onClick={() => handleLogout()}
        >
          <AccountCircle />
        </IconButton>
        <p>Logout</p>
      </MenuItem>
    </Menu>
  );

  const LogoIn = (<a
        href='/'
        style={{
            display: 'inline-block',
            width: 'auto',
            textDecoration: 'none',
            color: '#FFF'
        }}>
        {!matches ? (
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
        {!matches ? (
            ''
        ) : (
                <div style={divLingLogo}>AMS</div>
            )}

    </a>
    )
    
  return (
    <div>
      {checkstatus()}
      <AppBar position='fixed' className={classNames(classes.appBar, {[classes.appBarShift]: sidebar.sidebarToggle})}>
        <Toolbar>
          <div className={classes.sectionDesktop}>
            {!sidebar.sidebarToggle ? 
            <div
              onClick={(e) => {
                  e.preventDefault();
                  sidebar.setSidebarToggle(true)
              }}
              style={{marginLeft:"-15px",cursor:"pointer",height:"54px", userSelect:"none", padding:"15px"}}>
              <MenuIcon/>
            </div> : null}
            <Typography
                  aria-haspopup='true'
                  variant='subtitle1'
                  color='inherit'
                  className={classes.appLogo}
                >
              {LogoIn}
            </Typography>
          </div>
          <div className={classes.sectionMobile}>
            <div
              onClick={(e) => {
                  e.preventDefault();
                  sidebar.setMobileSidebarToggle(true);
                  console.log("xx")
              }}
              style={{marginLeft:"-15px",cursor:"pointer",height:"54px", userSelect:"none", padding:"15px"}}>
              <MenuIcon/>
            </div>
            <Typography
                  aria-haspopup='true'
                  variant='subtitle1'
                  color='inherit'
                  className={classes.appLogo}
                >
              {LogoIn}
            </Typography>
          </div>
          <div className={classes.grow} />
          <div style={{display:"flex"}}>
            {/* <NotifyBox/> */}
            {renderMenu([{label:"ENGLISH", onClick:()=> changeLang("EN")},{label:"ไทย", onClick:()=> changeLang("TH")}], "lang", <label style={{cursor:"pointer",margin:"0",serSelect:"none"}}>{localStorage.getItem("Lang")}</label>)}
            {renderMenu([{label:"Logout", onClick:()=> handleLogout()}], "user", <label style={{cursor:"pointer",margin:"0",serSelect:"none"}}><AccountCircle />{localStorage.getItem('Username')}</label>)}
          </div>
        </Toolbar>
      </AppBar>
      {renderMobileMenu}
    </div>
  );
}

const theme = createMuiTheme();
export default function ThemeHelper() {
  return (
    <ThemeProvider theme={theme}>
      <HeaderLayout />
    </ThemeProvider>
  );
}


