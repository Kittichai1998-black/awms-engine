function getmenu(data){
  const jsonresult = JSON.parse(data === "undefined" ? null : data)
  let json =  { items : jsonresult  };
  if (json === undefined || json.items === null){
    // let result= {
    //   items: [
    //   {
        
    //     name: 'Master Setups',
    //     icon: 'cui-box',
    //     children: [//{id: 1,name: 'Dashboard',url: '/Dashboard',icon: 'cui-chart',},
    //       {id: 1,name: 'SKU',url: '/mst/SKU/manage',icon: 'cui-box',},
    //       {id: 2,name: 'Supplier',url: '/mst/supplier/manage',icon: 'cui-arrow-circle-right',},
    //       {id: 3,name: 'Customer',url: '/mst/customer/manage',icon: 'cui-people',},
    //       {id: 4,name: 'Area',url: '/mst/area/manage',icon: 'cui-home',},
    //       {id: 5,name: 'Area Location',url: '/mst/arealocation/manage',icon: 'cui-layers',},
    //       {id: 6,name: 'Base',url: '/mst/base/manage',icon: 'cui-bug',},
    //       {id: 7,name: 'User',url: '/mst/user/manage',icon: 'cui-home',},
    //       {id: 8,name: 'Branch',url: '/mst/branch/manage',icon: 'cui-box',},
    //       {id: 9,name: 'Warehouse',url: '/mst/warehouse/manage',icon: 'cui-box',},
    //     ],
    //   }, 
    //   {
    //     name: 'Documents',
    //     icon: 'cui-box',
    //     children: [
    //       {id: 10,name: 'Goods Receive',url: '/doc/gr/list',icon: 'cui-bug',},         
    //       {id: 11,name: 'Receive Mapping',url: '/wm/sto/revmap',icon: 'cui-home',},
    //       {id: 12,name: 'Transfer',url: '/wm/sto/transfer',icon: 'cui-box',},  
    //       {id: 13,name: 'Goods Issue',url: '/doc/gi/list',icon: 'cui-home',},        
    //       {id: 14,name: 'Picking',url: '/wm/sto/picking',icon: 'cui-bug',},
    //       {id: 15, name: 'Loading', url: '/doc/ld/list', icon: 'cui-box', },
    //       {id: 16,name: 'Loading Checklist',url: '/wm/sto/loading',icon: 'cui-home',},
    //       {id: 17,name: 'Return Box',url: '/mst/base/rebox',icon: 'cui-home',},             
    //     ],
    //   }, 
    //   {
    //     name: 'Warehoue',
    //     icon: 'cui-home',
    //     children: [
    //       {id: 18,name: 'Storage',url: '/sys/storage',icon: 'cui-layers',},
    //       {id: 19, name: 'Stock ', url: '/doc/stc/manage', icon: 'cui-box', },
    //       {id: 20,name: 'Stock Correction',url: '/wm/sto/correction',icon: 'cui-bug',},
    //     ],
    //   }, 

  //]};
    return {items:[{id: 1,name: 'Dashboard',url: '/Dashboard',icon: 'cui-chart',}]}
  }
  else{
    let items =[]
      jsonresult.forEach((row) => {
    //console.log(row.webPages)
        items.push({       
              name: row.name,
              icon: 'cui-box',
              children: 
                row.webPages.map((res)=> {
                  return  {id: res.pageID,name: res.pageName
                          ,url: '/'+res.pathLV1+'/'+res.pathLV2+'/'+res.pathLV3
                          ,icon: 'cui-home',}
                })
        })   
      });
    return {items}  
  }
}
export default getmenu;