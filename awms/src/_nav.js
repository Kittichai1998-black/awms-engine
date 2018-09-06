function getmenu(){
  let json =  { items : JSON.parse(sessionStorage.getItem("MenuItems")) };
  if (json === undefined || json.items === null){
    let result= {items: [{name: 'Dashboard',url: '/Dashboard',icon: 'icon-speedometer',}]};
    return result;
  }
  else{
    return json;
  }
}
export default getmenu();
