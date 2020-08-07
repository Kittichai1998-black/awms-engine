using AMWUtil.Common;
using AMWUtil.Exception;
using AWMSEngine.ADO;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Criteria;
using AWMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;

namespace AWMSEngine.Engine.V2.Business.Document
{
    public class MappingDistoAndDocumentItem : BaseEngine<MappingDistoAndDocumentItem.TReq, MappingDistoAndDocumentItem.TRes>
    {
        public class TReq
        {
            public long baseID;
            public DocumentProcessTypeID docProcessType;
        }

        public class TRes
        {
            public StorageObjectCriteria sto;
            public long? GR_ID;
            public string GR_Code;
            public long? PA_ID;
            public string PA_Code;
        }

        protected override TRes ExecuteEngine(TReq reqVO)
        {
            var chkCreatePA = StaticValue.Configs.Find(x => x.DataKey == "USE_AUTO_CREATE_GR").DataValue;
            var chkCreateGR = StaticValue.Configs.Find(x => x.DataKey == "USE_AUTO_CREATE_PA").DataValue;

            var psto = StorageObjectADO.GetInstant().Get(reqVO.baseID, StorageObjectType.PACK, false, false, this.BuVO);
            if (psto == null)
                throw new AMWException(this.Logger, AMWExceptionCode.V0_STO_NOT_FOUND);

            

            return null;
        }
    }
}
