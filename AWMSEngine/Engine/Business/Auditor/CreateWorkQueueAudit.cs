using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.Engine.Business.Auditor
{
    public class CreateWorkQueueAudit : BaseEngine<CreateWorkQueueAudit.Treq, string>
    {
        public class Treq
        {
            public string code;
            public long? warehouseID;
            public long? areaID;
        }

        protected override string ExecuteEngine(Treq reqVO)
        {
            var getPallet = ADO.StorageObjectADO.GetInstant().Get("Code", 0, 0, false, false, this.BuVO);







            throw new NotImplementedException();
        }
    }
}
