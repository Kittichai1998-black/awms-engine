function getmenu(){
  let json =  { items : JSON.parse(sessionStorage.getItem("MenuItems")) };
  if (json === undefined || json.items === null){
    let result= {
      items: [{id: 1,name: 'Dashboard',url: '/Dashboard',icon: 'cui-chart',},
      {id: 2,name: 'SKU',url: '/mst/SKU/manage',icon: 'cui-box',},
      {id: 3,name: 'Supplier',url: '/mst/supplier/manage',icon: 'cui-arrow-circle-right',},
      {id: 4,name: 'Dealer',url: '/mst/dealer/manage',icon: 'cui-people',},
      {id: 5,name: 'Area',url: '/mst/area/manage',icon: 'cui-home',},
      {id: 6,name: 'Base',url: '/mst/Base/manage',icon: 'cui-bug',},
    ]};
    
    return result;
  }
  else{
    return json;
  }
}
export default getmenu();

