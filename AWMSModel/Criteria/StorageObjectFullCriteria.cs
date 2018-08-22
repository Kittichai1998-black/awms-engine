using AWMSModel.Constant.EnumConst;
using AWMSModel.Criteria.SP.Response;
using System;
using System.Collections.Generic;
using System.Text;
using System.Linq;
using AMWUtil.Common;
using AWMSModel.Entity;

namespace AWMSModel.Criteria
{
    public class StorageObjectFullCriteria : SPOutSTOSearchCriteria
    {
        public List<StorageObjectFullCriteria> StorageObjectChilds;

        public static List<StorageObjectFullCriteria> Generate(List<StorageObjectFullCriteria> stos, long? parentID = null)
        {
            List<StorageObjectFullCriteria> stoRoots = new List<StorageObjectFullCriteria>();
            var r = stos
                .Where(x => x.ParentStorageObject_ID == parentID)
                .ToList();
            stoRoots.AddRange(r);

            stoRoots.ForEach(x =>
            {
                x.StorageObjectChilds = Generate(stos, x.ID);
            });

            return stoRoots;
        }
        
    }
}
