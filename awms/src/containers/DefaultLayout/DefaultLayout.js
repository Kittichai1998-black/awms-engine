import React, { Component } from 'react';
import { Route, Switch,Redirect } from 'react-router-dom';
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
  render(){
    return(
      <AppSidebar fixed display="lg">
        <AppSidebarHeader />
        <AppSidebarForm />
        <AppSidebarNav navConfig={navigation} {...this.props}/>
        <AppSidebarFooter />
        <AppSidebarMinimizer />
      </AppSidebar>
    )
  }
}

function checkstatus(){
  if(sessionStorage.getItem("tokendata") !== null){
    return <Redirect from="/" to="/Dashboard" />
  }
  else{
    return <Redirect from="/" to="/login" />
  }
}

class DefaultLayout extends Component {
  render() {
    return (
      <div className="app">
      {/* {checkstatus()} */}
        <AppHeader fixed>
          <DefaultHeader />
        </AppHeader>
        <div className="app-body">
          <main className="main">
            <AppBreadcrumb appRoutes={routes}/>
            <Container fluid>
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
          <DefaultMenu {...this.props}/>
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
