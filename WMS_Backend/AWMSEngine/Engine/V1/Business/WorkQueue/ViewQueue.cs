using AWMSModel.Constant.EnumConst;
using AWMSModel.Criteria;
using AWMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Data.SqlClient;

namespace AWMSEngine.Engine.Business.WorkQueue
{
    public class ViewQueue : BaseEngine<ViewQueue.TReq, List<amt_WorkQueue>>
    {
        public class TReq
        {
            public IOType iotypp;
            public string palletCode;
        }

        protected override List<amt_WorkQueue> ExecuteEngine(TReq reqVO)
        {
            var ListQueue = new List<amt_WorkQueue>();
            if (reqVO.palletCode == String.Empty)
            {
                ListQueue = ADO.DataADO.GetInstant().SelectBy<amt_WorkQueue>(new KeyValuePair<string, object>[]{
                    new KeyValuePair<string,object>("IOType",reqVO.iotypp)
                }, this.BuVO).ToList();
            }
            else
            {
                ListQueue = ADO.DataADO.GetInstant().SelectBy<amt_WorkQueue>(new KeyValuePair<string, object>[]{
                    new KeyValuePair<string,object>("IOType",reqVO.iotypp),
                    new KeyValuePair<string,object>("StorageObject_Code",reqVO.palletCode)
                }, this.BuVO).ToList();
            }

            return ListQueue;
        }
    }
}
