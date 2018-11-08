import idel from '../../img/idel.png';
import receiving from '../../img/receiving.png';
import received from '../../img/received.png';
import moving from '../../img/moving.png';
import moved from '../../img/moved.png';
import picking from '../../img/picking.png';
import picked from '../../img/picked.png';
import considating from '../../img/consolidating.png';
import considated from '../../img/consolidated.png';
import removing from '../../img/removing.png';
import removed from '../../img/removed.png';
import rejecting from '../../img/rejecting.png';
import rejected from '../../img/rejected.png';
import adjucting from '../../img/adjusting.png';
import adjucted from '../../img/adjusted.png';
import issuing from '../../img/issuing.png';
import issued from '../../img/issued.png';
import shipping from '../../img/shipping.png';
import shipped from '../../img/shipped.png';

const EventStatus = [
  { status: 'IDEL', code: 10, pathImg: idel, width: '30px' },
  { status: 'RECEIVING', code: 11, pathImg: receiving, width: '30px' },
  { status: 'RECEIVED', code: 12, pathImg: received, width: '30px' },
  { status: 'MOVING', code: 13, pathImg: moving, width: '30px' },
  { status: 'MOVED', code: 14, pathImg: moved, width: '30px' },
  { status: 'PICKING', code: 15, pathImg: picking, width: '30px' },
  { status: 'PICKED', code: 16, pathImg: picked, width: '30px' },
  { status: 'CONSOLIDATING', code: 17, pathImg: considating, width: '30px' },
  { status: 'CONSOLIDATED', code: 18, pathImg: considated, width: '30px' },
  { status: 'REMOVING', code: 21, pathImg: removing, width: '30px' },
  { status: 'REMOVED', code: 22, pathImg: removed, width: '30px' },
  { status: 'REJECTING', code: 23, pathImg: rejecting, width: '30px' },
  { status: 'REJECTED', code: 24, pathImg: rejected, width: '30px' },
  { status: 'ADJUSTING', code: 25, pathImg: adjucting, width: '30px' },
  { status: 'ADJUSTED', code: 26, pathImg: adjucted, width: '30px' },
  { status: 'ISSUING', code: 31, pathImg: issuing, width: '30px' }, 
  { status: 'ISSUED', code: 32, pathImg: issued, width: '30px' },
  { status: 'SHIPPING', code: 33, pathImg: shipping, width: '30px' },
  { status: 'SHIPPED', code: 34, pathImg: shipped, width: '30px' },
  { status: 'CHANGE_BASE', code: 90}
]




const DocumentEventStatus = [
    {status:'IDEL' , code:10,},
    {status:'WORKING' , code:11,},
    {status:'WORKED' , code:12,},
    {status:'REMOVING' , code:21,},
    {status:'REMOVED' , code:22,},
    {status:'REJECTING' , code:23,},
    {status:'REJECTED' , code:24,},
    {status:'CLOSING' , code:31,},
    {status:'CLOSED' , code:32,}
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
    {status:'Done', code:3,},
]




export {EventStatus, DocumentStatus, Status, DocumentEventStatus}
