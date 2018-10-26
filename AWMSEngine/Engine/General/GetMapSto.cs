using AMWUtil.Exception;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Criteria;
using AWMSModel.Criteria.SP.Request;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.Engine.General
{
    public class GetMapSto : BaseEngine<GetMapSto.TReq, GetMapSto.TRes>
    {
        public class TReq
        {
            public long? id;
            public StorageObjectType type;

            public string code;

            public int? warehouseID;
            public int? areaID;

            public bool isToRoot;
            public bool isToChild;
        }
        public class TRes
        {
            public StorageObjectCriteria mapsto;
        }
        protected override TRes ExecuteEngine(TReq reqVO)
        {
            StorageObjectCriteria res = null;
            if (reqVO.id.HasValue)
            {
                if (!string.IsNullOrWhiteSpace(reqVO.code))
                    throw new AMWException(this.Logger, AMWExceptionCode.V1001, "กรุณาส่ง เลือกส่งระหว่าง ID กับ Code");
                res = ADO.StorageObjectADO.GetInstant().Get(reqVO.id.Value, reqVO.type, reqVO.isToRoot, reqVO.isToChild, this.BuVO);
                if (res.warehouseID != (reqVO.warehouseID ?? res.warehouseID) || res.areaID != (reqVO.areaID ?? res.areaID))
                    res = null;
            }
            else if(!string.IsNullOrWhiteSpace(reqVO.code))
            {
                res = ADO.StorageObjectADO.GetInstant().Get(reqVO.code, reqVO.warehouseID, reqVO.areaID, reqVO.isToRoot, reqVO.isToChild, this.BuVO);
            }
            else
            {
                throw new AMWException(this.Logger, AMWExceptionCode.V1001, "กรุณาส่ง เลือกส่งระหว่าง ID กับ Code");
            }

            return new TRes { mapsto = res };
        }
    }
}
