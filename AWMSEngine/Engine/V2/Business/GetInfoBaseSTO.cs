using AMWUtil.Common;
using AMWUtil.Exception;
using AMSModel.Constant.EnumConst;
using AMSModel.Criteria;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using ADO.WMSDB;
using AMSModel.Entity;
using ADO.WMSStaticValue;

namespace AWMSEngine.Engine.V2.Business
{
    public class GetInfoBaseSTO : BaseEngine<GetInfoBaseSTO.TReq, GetInfoBaseSTO.TRes>
    {

        public class TReq
        {
            public string bstoCode;
        }
        public class TRes
        {
            public StorageObjectCriteria bsto;
            public string areaCode;
            public string areaName;
            public string areaLocCode;
            public string areaLocName;
        }

        protected override TRes ExecuteEngine(TReq reqVO)
        {
            var res = new TRes();

            var getSto = StorageObjectADO.GetInstant().Get(reqVO.bstoCode.ToUpper(), null, null, false, true, BuVO);
            if (getSto == null)
                throw new AMWException(Logger, AMWExceptionCode.V1001, "ไม่มีข้อมูลพาเลท " + reqVO.bstoCode.ToUpper() + " ในระบบ");


            res.bsto = getSto;

            var area = StaticValueManager.GetInstant().AreaMasters.Find(x => x.ID == getSto.areaID);
            if (area == null)
                throw new AMWException(Logger, AMWExceptionCode.V1001, "ไม่พบข้อมูล Area");

            res.areaCode = area.Code;
            res.areaName = area.Name;

            if (getSto.parentType == StorageObjectType.LOCATION)
            {
                var areaLocation = DataADO.GetInstant().SelectByID<ams_AreaLocationMaster>(getSto.parentID, this.BuVO);
                if (areaLocation == null)
                    throw new AMWException(Logger, AMWExceptionCode.V1001, "ไม่พบข้อมูล Area Location");

                res.areaLocCode = areaLocation.Code;
                res.areaLocName = areaLocation.Name;
            }


            return res;
        }

    }
}
