import React, { Component } from 'react';
import { Route, Switch, Redirect } from 'react-router-dom';
import { Container } from 'reactstrap';
import { Page404 } from '../../views/Pages';

import {
  //AppAside,
  AppBreadcrumb,
  AppFooter,
  AppHeader,
  AppSidebar,
  AppSidebarFooter,
  AppSidebarForm,
  AppSidebarHeader,
  AppSidebarMinimizer,
  AppSidebarNav,
} from '@coreui/react';
// sidebar nav config
import navigation from '../../_nav';
// routes config
import routes from '../../routes';
//import DefaultAside from './DefaultAside';
import DefaultFooter from './DefaultFooter';
import DefaultHeader from './DefaultHeader';

class DefaultMenu extends Component{
  componentDidMount(){
    var elems = document.querySelectorAll(".cui-layers");
    [].forEach.call(elems, function(el) {
        el.remove(".cui-layers");
    });
  }
  render(){
    return (
      <AppSidebar fixed display="lg"  >
        <AppSidebarHeader />
        <AppSidebarForm />
        <AppSidebarNav navConfig={navigation(localStorage.getItem("MenuItems"))} {...this.props}/>
        <AppSidebarFooter />
        <AppSidebarMinimizer />
      </AppSidebar>
    )
  }
}


function checkstatus(){
  const d1 = new Date(localStorage.ExpireTime);
  const d2 = new Date();
  if(d1 > d2){
    sessionStorage.setItem("Token", localStorage.getItem("Token"));
    sessionStorage.setItem("ClientSecret_SecretKey", localStorage.getItem("ClientSecret_SecretKey"));
    sessionStorage.setItem("ExtendKey", localStorage.getItem("ExtendKey"));
    sessionStorage.setItem("User_ID", localStorage.getItem("User_ID"));
    sessionStorage.setItem("ExpireTime", localStorage.getItem("ExpireTime"));
  }
  else{
    localStorage.clear();
    sessionStorage.clear();
  }

  if(sessionStorage.getItem("Token") === null || sessionStorage.getItem("Token") === undefined){
    return <Redirect from="/" to="/login" />
  }
}

class DefaultLayout extends Component {
  /* componentWillUnmount(){
    localStorage.clear();
    sessionStorage.clear();
  } */
  constructor(props){
    super(props)
    this.state = {
      menubar:null
    }
  }



  componentDidMount(){
    
    this.setState({menubar:<DefaultMenu {...this.props}/>})
  }
  
  render() {
    return (
      <div className="app" >
        {checkstatus()}
        <AppHeader fixed style={{ background: "#c8ced3" }} >      
          <DefaultHeader />
        </AppHeader>
        <div className="app-body" >
          <main className="main">
            <AppBreadcrumb appRoutes={routes} />
            <Container fluid >
              <Switch>
                {routes.map((route, idx) => {
                    return route.component ? (<Route key={idx} path={route.path} exact={route.exact} name={route.name} render={props => (
                        <route.component {...props} />
                      )} />)
                      : (null);
                  },
                )}
                <Redirect to="/404"/>
              </Switch>
            </Container>
          </main>
          {this.state.menubar}
          {/*<AppAside fixed hidden>
            <DefaultAside />
          </AppAside> */}
        </div>
        {/* <AppFooter>
          <DefaultFooter />
        </AppFooter> */}
      </div>
    );
  }
}



export default DefaultLayout;
