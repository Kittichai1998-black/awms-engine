using AMWUtil.Common;
using AWMSModel.Criteria;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.Engine.Business
{
    public class VirtualMapStorageObjectPutDatabase : 
        BaseEngine<VRMapSTO.TReqModle, StorageObjectCriteria>
    {
        public class TReqModle
        {
            public List<KeyValuePair<string, string>> options;
        }
        protected override StorageObjectCriteria ExecuteEngine(VRMapSTO.TReqModle reqVO)
        {
            StorageObjectCriteria mapsto = ObjectUtil.DynamicToModel<StorageObjectCriteria>(this.RequestParam.mapsto);
            return null;
        }

    }
}
