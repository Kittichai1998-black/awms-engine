using AWMSModel.Criteria.SP.Request;
using AWMSModel.Criteria.SP.Response;
using AWMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.Engine.Business.Auditor
{
    public class CreateWorkQueueAudit : BaseEngine<CreateWorkQueueAudit.TReq, CreateWorkQueueAudit.TRes>
    {
        public class TReq
        {
            public long docID;
            public string palletCode;
            public string locationCode;
            public string refID;
            public int pickOrderType;//0=FIFO,1=LIFO
            public string orderBy;//ชื่อ Field สำหรับ order by
            public string ref2;
            public string batch;
            public string orderNo;
            public int priority;
        }

        public class TRes
        {
            public ViewDocument document;
            public class ViewDocument : amv_Document
            {
                public List<amv_DocumentItem> documentItems;
            }
            public List<SPOutSTORootCanUseCriteria> bstos;
        }

        protected override TRes ExecuteEngine(TReq reqVO)
        {
            if (reqVO.palletCode != "")
            {
                var res = ADO.StorageObjectADO.GetInstant().Get(reqVO.palletCode, (long?)null, (long?)null, false, false, this.BuVO);
                var getLocation = ADO.DataADO.GetInstant().SelectByID<ams_AreaLocationMaster>(res.parentID, this.BuVO);

                var xx = SPworkQueue.Generate(new amt_WorkQueue(){
                    
                });
            }
            else if(reqVO.locationCode != "")
            {

            }







            return null;
        }
    }
}
