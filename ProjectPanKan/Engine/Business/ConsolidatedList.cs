using AWMSEngine.ADO;
using AWMSEngine.Engine;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AWMSModel.Criteria.SP.Request;
using AWMSModel.Criteria.SP.Response;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Entity;
using AWMSModel.Criteria;

namespace ProjectPanKan.Engine.Business
{
    public class ConsolidatedList : BaseEngine<long, ConsolidatedList.TRes>
    {
        public class TRes
        {
            public long docID;
            public List<StorageObjectCriteria> baseList;
        }

        protected override TRes ExecuteEngine(long docID)
        {
            var disto = DocumentADO.GetInstant().ListDISTOByDoc(docID, this.BuVO);
            var desStoIDs = disto.Select(item => item.Des_StorageObject_ID).Distinct().ToList();
            var stos = new List<StorageObjectCriteria>();
            desStoIDs.ForEach(x =>
            {
                var bsto = StorageObjectADO.GetInstant().Get(x.Value, StorageObjectType.PACK, true, true, this.BuVO);
                if(bsto != null)
                    stos.Add(bsto);
            });

            return new TRes()
            {
                docID = docID,
                baseList = stos.Distinct().ToList()
            };
        }
    }
}
