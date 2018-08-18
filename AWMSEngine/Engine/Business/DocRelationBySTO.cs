using AMWUtil.Common;
using AMWUtil.Exception;
using AWMSEngine.ADO;
using AWMSEngine.ADO.StaticValue;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Constant.StringConst;
using AWMSModel.Criteria;
using AWMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.Engine.Business
{
    public class DocRelationBySTO : BaseEngine<StorageObjectCriteria, DocRelationBySTO.TRes>
    {
        public class TRes
        {
            public List<amt_Document> documents;
        }
        protected override TRes ExecuteEngine(StorageObjectCriteria reqVO)
        {
            List<long> stoIDs = ListSTOIDs(reqVO);
            

            TRes res = new TRes();
            res.documents = ADO.DocumentADO.GetInstant().ListBySTO(stoIDs, this.BuVO);

            return res;
        }

        private List<long> ListSTOIDs(StorageObjectCriteria stomap)
        {
            List<long> res = new List<long>();
            long id = stomap.id ?? 0;
            res.Add(id);
            foreach(StorageObjectCriteria sto in stomap.mapstos)
            {
                var ids = ListSTOIDs(sto);
                res.AddRange(ids);
            }
            return res;
        }
    }
}
