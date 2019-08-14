import React, {useReducer,useContext,useState} from 'react';
import PropTypes from 'prop-types';
import ListSubheader from '@material-ui/core/ListSubheader';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Divider from '@material-ui/core/Divider';
import Collapse from '@material-ui/core/Collapse';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';
import { withStyles, MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import {Link, withRouter } from 'react-router-dom';
import { menuToggle, initialState } from '../reducers/menuReducer';
import route from '../layouts/route';
import InboxIcon from '@material-ui/icons/Inbox';
import SvgIcon from '@material-ui/core/SvgIcon';
import purple from '@material-ui/core/colors/purple';
import { LocationContext } from '../reducers/context';

const theme = createMuiTheme({
  overrides: {
   
    MuiTypography: {
      body1:{
        color:"white",
        fontSize:12
      }
    },

  },
  typography: {
    useNextVariants: true,
  },
});

const styles = theme => ({
  root: {
    width: '100%',
    maxWidth: 360,
    //backgroundColor: theme.palette.background.paper,
    backgroundColor:"#263238",
    color:"white"
   
  },
 
});


const AmMenuTree = (props) => {
  const [state, dispatch] = useReducer(menuToggle, initialState.menuToggle )
  const { classes } = props;
  const [locat, dispatchLocat] = useContext(LocationContext);
  const [amDataSrc, setAmDataSrc] = useState(props.amDataSrc);
  const [amIcon, setAmIcon] = useState(props.amIcon);
  const [amIconChild, setAmIconChild] = useState(props.amIconChild);
  const [amStyles, setAmStyles] = useState(props.styles);


console.log(amStyles)

  function onHandleClickToggle(menuID){
    dispatch({"type":"expand", "menuID":menuID});
  }

  function HomeIcon(type) {
    return (
      <SvgIcon >
        <path d={type}/>
      </SvgIcon>
    );
  }

 
  return (
    <MuiThemeProvider theme={theme}>
    <div >
      <div className={classes.toolbar} />
      <List component="nav" className={classes.root} style={{paddingBottom:'0px',paddingTop:'0px'}}>
      {console.log(route)}
        {amDataSrc.map((x, idx) => {
            console.log(route)
          if(x.child){
            return <div key={idx}>
              <ListItem divider button onClick={() => onHandleClickToggle(x.text)} >
              {amIcon === true?(x.icon ===null?"": HomeIcon(x.icon)):null}
                <ListItemText primary={x.text}/>                 
                {state.menuID === x.text && state.toggle === true ? <ExpandLess /> : <ExpandMore />}
              </ListItem >
              {x.child.map((y, idx2) => {
                return <Collapse key={idx2} in={state.menuID === x.text ? state.toggle : false} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding >
                    <ListItem  style={amStyles} divider button component={y.component} to={y.to}>
                    <span class="cui-user" aria-hidden="true"></span>
                    { HomeIcon("")}
                    { amIconChild === true? (y.iconChild ===null?"": HomeIcon(y.iconSub)):null}
                      <ListItemText primary={y.text} />                      
                      </ListItem>
                  </List>
                </Collapse>
              })}
            </div>
          }
          else{
            return <ListItem key={idx} divider button component={x.component} to={x.to}>
              <ListItemText primary={x.text}/>
            </ListItem>
          }
        })}
      </List>
    </div>
    </MuiThemeProvider>
  );
  
};

AmMenuTree.propTypes = {
  container: PropTypes.object,
};

// style={{backgroundColor:"red"}} 

export default withRouter((withStyles(styles, { withTheme: true })(AmMenuTree)));