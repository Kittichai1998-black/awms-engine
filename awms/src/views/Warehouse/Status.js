const EventStatus = [
    {status:'IDEL' , code:10,},
    {status:'RECEIVING' , code:11,},
    {status:'RECEIVED' , code:12,},
    {status:'MOVING' , code:13,},
    {status:'MOVED' , code:14,},
    {status:'REMOVING' , code:21,},
    {status:'REMOVED' , code:22,},
    {status:'REJECTING' , code:23,},
    {status:'REJECTED' , code:24,},
    {status:'IDEL' , code:24,},
    {status:'ISSUING' , code:31,},
    {status:'ISSUED' , code:32,},
    {status:'SHIPPING' , code:33,},
    {status:'SHIPPED' , code:34,},
    {status:'CHANGE_BASE' , code:90,}
]

const DocumentStatus = [
    {status:'Working' , code:1,},
    {status:'Reject' , code:2,},
    {status:'Complete' , code:3,},
]

const Status = [
    {status:'Inactive' , code:0,},
    {status:'Active' , code:1,},
    {status:'Remove' , code:2,},
]

export {EventStatus, DocumentStatus, Status}