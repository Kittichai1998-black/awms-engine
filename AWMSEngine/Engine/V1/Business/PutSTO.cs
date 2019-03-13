using AWMSModel.Constant.EnumConst;
using AWMSModel.Criteria;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.Engine.Business
{
    public class PutSTO : BaseEngine<PutSTO.TReqModel, dynamic>
    {
        public class TReqModel
        {
            public int? id;
            public StorageObjectType type;
            public int? parentID;
            public StorageObjectType? parentType;
            public string code;
        }

        protected override dynamic ExecuteEngine(TReqModel reqVO)
        {
            return null;
        }

    }
}
