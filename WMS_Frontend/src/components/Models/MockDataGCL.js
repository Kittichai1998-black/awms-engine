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
    {head:"head1",title:"title",detail1:"shuttle1",detail1:"online",detail3:"online",bg_color:1},
    {head:"head2",title:"title",detail1:"shuttle1",detail1:"online",detail3:"online",bg_color:2},
    {head:"head3",title:"title",detail1:"shuttle1",detail1:"online",detail3:"online",bg_color:2},
    {head:"head4",title:"title",detail1:"shuttle1",detail1:"online",detail3:"online",bg_color:3},
    {head:"head5",title:"title",detail1:"shuttle1",detail1:"online",detail3:"online",bg_color:1},
    {head:"head6",title:"title",detail1:"shuttle1",detail1:"online",detail3:"online",bg_color:3},
    {head:"head7",title:"title",detail1:"shuttle1",detail1:"online",detail3:"online",bg_color:1},
    {head:"head8",title:"title",detail1:"shuttle1",detail1:"online",detail3:"online",bg_color:2},
    {head:"head9",title:"title",detail1:"shuttle1",detail1:"online",detail3:"online",bg_color:3},
    {head:"head10",title:"title",detail1:"shuttle1",detail1:"online",detail3:"online",bg_color:3},,
  ]

  const ListShuttle=[
    {warehouse:"warehouse",location:"location1",shuttle:"shuttle1",online:"online"},
    {warehouse:"warehouse",location:"location2",shuttle:"shuttle2",online:"online"},
    {warehouse:"warehouse",location:"location3",shuttle:"shuttle3",online:"Offile"},
    {warehouse:"warehouse",location:"location4",shuttle:"shuttle4",online:"online"},
    {warehouse:"warehouse",location:"location5",shuttle:"shuttle5",online:"offline"},
    {warehouse:"warehouse",location:"location6",shuttle:"shuttle6",online:"online"},
  ]

  const ViewStorageUsed=[
    {location:"testL1",bank_min:3,bank_max:10, pallets:"-,43,234,345,-,344,-,-,-,4"},
    {location:"testL1",bank_min:3,bank_max:10, pallets:"2343,-,234,345,-,344,45,-,7,-"},
    {location:"testL1",bank_min:3,bank_max:10, pallets:"-,43,234,345,-,-,-,-,-,-"},
    {location:"testL1",bank_min:3,bank_max:10, pallets:"2343,43,234,345,-,344,-,8,-,-"},
    {location:"testL1",bank_min:3,bank_max:10, pallets:"2343,-,234,345,-,344,-,-,-,4"},
    {location:"testL1",bank_min:3,bank_max:10, pallets:"2343,43,234,345,-,344,-,-,-,4"},
    {location:"testL1",bank_min:3,bank_max:10, pallets:"-,43,234,345,-,344,-,-,-,4"},
  ]

  export default {monitorReceive,shuttleResult,DockOutboundDashboard,ListShuttle,ViewStorageUsed}