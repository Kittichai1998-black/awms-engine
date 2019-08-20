import React, {useContext} from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import { HeaderContext } from '../reducers/context';
import Aside from './asideLayout';
import Hidden from '@material-ui/core/Hidden';
import Drawer from '@material-ui/core/Drawer';
import classNames from 'classnames';

const styles = theme => ({
  // grow: {
  //   flexGrow: 1,
  // },
  // root: {
  //   display: 'flex',
  //   index:999,
  // },
  // menuButton: {
  //   marginRight: 20,
  //   [theme.breakpoints.up('sm')]: {
  //     display: 'none',
  //   },
  // },
  // toolbar: theme.mixins.toolbar,
});




const Header = (props) => {
  const [state, dispatch] = useContext(HeaderContext);
  const { classes } = props;
  return (
    <div >
      {/* <AppBar position="absolute">
        <Toolbar className={classes.toolbar}>
          <IconButton  className={classes.menuButton}  color="inherit" aria-label="Menu" onClick={() => {dispatch({"type":"open"});}}>
            <MenuIcon/>
          </IconButton>
         
           <IconButton
              color="inherit"
              //aria-label="Open drawer"
              onClick={() => {dispatch({"type":"open"});}}
            
            >
              <MenuIcon />
            </IconButton>
          
        
          <Typography variant="h6" color="inherit" className={classes.grow}>
            AWMS 
          </Typography>
          
          <Button color="inherit" >Login</Button>
        </Toolbar>
      </AppBar> */}
    </div>
  );
}

Header.propTypes = {
  theme: PropTypes.object.isRequired,
  classes: PropTypes.object.isRequired,
}

export default withStyles(styles, { withTheme: true })(Header);


