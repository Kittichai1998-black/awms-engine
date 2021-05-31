const monitorReceive = [
    {status:"test1", wms_doc:"wms_doc1", customer:"customer", grade:"grade", lot:"Lot", no_pallet:"no_pallet", qty:3500.254, unit:"Unit", waiting_pallet:6844.235, received_pallet:89545.55},
    {status:"test2", wms_doc:"wms_doc2", customer:"customer", grade:"grade", lot:"Lot", no_pallet:"no_pallet", qty:3500.254, unit:"Unit", waiting_pallet:6844, received_pallet:89545},
    {status:"test3", wms_doc:"wms_doc3", customer:"customer", grade:"grade", lot:"Lot", no_pallet:"no_pallet", qty:3500.254, unit:"Unit", waiting_pallet:6844, received_pallet:89545},
    {status:"test4", wms_doc:"wms_doc4", customer:"customer", grade:"grade", lot:"Lot", no_pallet:"no_pallet", qty:3500.254, unit:"Unit", waiting_pallet:6844, received_pallet:89545},
    {status:"test5", wms_doc:"wms_doc5", customer:"customer", grade:"grade", lot:"Lot", no_pallet:"no_pallet", qty:3500.254, unit:"Unit", waiting_pallet:6844, received_pallet:89545},
    {status:"test1", wms_doc:"wms_doc1", customer:"customer", grade:"grade", lot:"Lot", no_pallet:"no_pallet", qty:3500.254, unit:"Unit", waiting_pallet:6844, received_pallet:89545},
    {status:"test2", wms_doc:"wms_doc2", customer:"customer", grade:"grade", lot:"Lot", no_pallet:"no_pallet", qty:3500.254, unit:"Unit", waiting_pallet:6844, received_pallet:89545},
    {status:"test3", wms_doc:"wms_doc3", customer:"customer", grade:"grade", lot:"Lot", no_pallet:"no_pallet", qty:3500.254, unit:"Unit", waiting_pallet:6844, received_pallet:89545},
    {status:"test4", wms_doc:"wms_doc4", customer:"customer", grade:"grade", lot:"Lot", no_pallet:"no_pallet", qty:3500.254, unit:"Unit", waiting_pallet:6844, received_pallet:89545},
    {status:"test5", wms_doc:"wms_doc5", customer:"customer", grade:"grade", lot:"Lot", no_pallet:"no_pallet", qty:3500.254, unit:"Unit", waiting_pallet:6844, received_pallet:89545},
    {status:"test1", wms_doc:"wms_doc1", customer:"customer", grade:"grade", lot:"Lot", no_pallet:"no_pallet", qty:3500.254, unit:"Unit", waiting_pallet:6844, received_pallet:89545},
    {status:"test2", wms_doc:"wms_doc2", customer:"customer", grade:"grade", lot:"Lot", no_pallet:"no_pallet", qty:3500.254, unit:"Unit", waiting_pallet:6844, received_pallet:89545},
    {status:"test3", wms_doc:"wms_doc3", customer:"customer", grade:"grade", lot:"Lot", no_pallet:"no_pallet", qty:3500.254, unit:"Unit", waiting_pallet:6844, received_pallet:89545},
    {status:"test4", wms_doc:"wms_doc4", customer:"customer", grade:"grade", lot:"Lot", no_pallet:"no_pallet", qty:3500.254, unit:"Unit", waiting_pallet:6844, received_pallet:89545},
    {status:"test5", wms_doc:"wms_doc5", customer:"customer", grade:"grade", lot:"Lot", no_pallet:"no_pallet", qty:3500.254, unit:"Unit", waiting_pallet:6844, received_pallet:89545},
    {status:"test1", wms_doc:"wms_doc1", customer:"customer", grade:"grade", lot:"Lot", no_pallet:"no_pallet", qty:3500.254, unit:"Unit", waiting_pallet:6844, received_pallet:89545},
    {status:"test2", wms_doc:"wms_doc2", customer:"customer", grade:"grade", lot:"Lot", no_pallet:"no_pallet", qty:3500.254, unit:"Unit", waiting_pallet:6844, received_pallet:89545},
    {status:"test3", wms_doc:"wms_doc3", customer:"customer", grade:"grade", lot:"Lot", no_pallet:"no_pallet", qty:3500.254, unit:"Unit", waiting_pallet:6844, received_pallet:89545},
    {status:"test4", wms_doc:"wms_doc4", customer:"customer", grade:"grade", lot:"Lot", no_pallet:"no_pallet", qty:3500.254, unit:"Unit", waiting_pallet:6844, received_pallet:89545},
    {status:"test5", wms_doc:"wms_doc5", customer:"customer", grade:"grade", lot:"Lot", no_pallet:"no_pallet", qty:3500.254, unit:"Unit", waiting_pallet:6844, received_pallet:89545},
    {status:"test1", wms_doc:"wms_doc1", customer:"customer", grade:"grade", lot:"Lot", no_pallet:"no_pallet", qty:3500.254, unit:"Unit", waiting_pallet:6844, received_pallet:89545},
    {status:"test2", wms_doc:"wms_doc2", customer:"customer", grade:"grade", lot:"Lot", no_pallet:"no_pallet", qty:3500.254, unit:"Unit", waiting_pallet:6844, received_pallet:89545},
    {status:"test3", wms_doc:"wms_doc3", customer:"customer", grade:"grade", lot:"Lot", no_pallet:"no_pallet", qty:3500.254, unit:"Unit", waiting_pallet:6844, received_pallet:89545},
  ];

  const shuttleResult=[
    {id:1,mode:1,time:"24/06/2021",location:"testlocation",shuttle:"testshuttle",result:"testResult"},
    {id:2,mode:1,time:"24/06/2021",location:"testlocation",shuttle:"testshuttle",result:"testResult"},
    {id:3,mode:1,time:"24/06/2021",location:"testlocation",shuttle:"testshuttle",result:"testResult"},
    {id:4,mode:1,time:"24/06/2021",location:"testlocation",shuttle:"testshuttle",result:"testResult"},
    {id:5,mode:1,time:"24/06/2021",location:"testlocation",shuttle:"testshuttle",result:"testResult"},
    {id:5,mode:1,time:"24/06/2021",location:"testlocation",shuttle:"testshuttle",result:"testResult"},
    {id:7,mode:1,time:"24/06/2021",location:"testlocation",shuttle:"testshuttle",result:"testResult"},
    {id:8,mode:1,time:"24/06/2021",location:"testlocation",shuttle:"testshuttle",result:"testResult"},
    {id:9,mode:1,time:"24/06/2021",location:"testlocation",shuttle:"testshuttle",result:"testResult"},
    {id:10,mode:1,time:"24/06/2021",location:"testlocation",shuttle:"testshuttle",result:"testResult"},
    {id:11,mode:1,time:"24/06/2021",location:"testlocation",shuttle:"testshuttle",result:"testResult"},
    {id:12,mode:1,time:"24/06/2021",location:"testlocation",shuttle:"testshuttle",result:"testResult"},
    {id:13,mode:1,time:"24/06/2021",location:"testlocation",shuttle:"testshuttle",result:"testResult"},
    {id:14,mode:1,time:"24/06/2021",location:"testlocation",shuttle:"testshuttle",result:"testResult"},
  ]

  const DockOutboundDashboard=[
    {dock:"testdock", sku :'testsku',lot:'testlot', grade:'testgrade', pallet:'testpallet'},
    {dock:"testdock", sku :'testsku',lot:'testlot', grade:'testgrade', pallet:'testpallet'},
    {dock:"testdock", sku :'testsku',lot:'testlot', grade:'testgrade', pallet:'testpallet'},
    {dock:"testdock", sku :'testsku',lot:'testlot', grade:'testgrade', pallet:'testpallet'},
    {dock:"testdock", sku :'testsku',lot:'testlot', grade:'testgrade', pallet:'testpallet'},
    {dock:"testdock", sku :'testsku',lot:'testlot', grade:'testgrade', pallet:'testpallet'},
    {dock:"testdock", sku :'testsku',lot:'testlot', grade:'testgrade', pallet:'testpallet'},
  ]

  const ListShuttle=[
    {warehouse:"warehouse",location:"location1",shuttle:"shuttle1",online:"online"},
    {warehouse:"warehouse",location:"location2",shuttle:"shuttle2",online:"online"},
    {warehouse:"warehouse",location:"location3",shuttle:"shuttle3",online:"Offile"},
    {warehouse:"warehouse",location:"location4",shuttle:"shuttle4",online:"online"},
    {warehouse:"warehouse",location:"location5",shuttle:"shuttle5",online:"offline"},
    {warehouse:"warehouse",location:"location6",shuttle:"shuttle6",online:"online"},
  ]

  export default {monitorReceive,shuttleResult,DockOutboundDashboard,ListShuttle}