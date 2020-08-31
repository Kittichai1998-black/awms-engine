﻿using AMWUtil.Common;
using AMWUtil.Exception;
using AMWUtil.Logger;
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
    public class GetInfoPallet : BaseEngine<GetInfoPallet.TReq, GetInfoPallet.TRes>
    {
        private StorageObjectADO ADOSto = ADO.StorageObjectADO.GetInstant();
        public class TReq
        {
            public string bstoCode;
        }
        public class TRes
        {
            public StorageObjectCriteria bsto;
        }

        protected override TRes ExecuteEngine(TReq reqVO)
        {
            var res = new TRes();
            StorageObjectCriteria mapsto = new StorageObjectCriteria();


            var checkBaseMaster = AWMSEngine.ADO.DataADO.GetInstant().SelectByCodeActive<ams_BaseMaster>(reqVO.bstoCode, BuVO);
            if (checkBaseMaster == null)
                throw new AMWException(Logger, AMWExceptionCode.V1001, "ไม่มีข้อมูลพาเลท " + reqVO.bstoCode + " ในระบบ");


            mapsto = this.ADOSto.Get(reqVO.bstoCode, null, null, false, true, this.BuVO);
            if (mapsto != null)
            {
                res.bsto = this.ADOSto.Get(mapsto.id.Value, StorageObjectType.BASE, false, true, this.BuVO); ;
            }
            else
            {
                throw new AMWException(Logger, AMWExceptionCode.V1001, "พาเลท " + reqVO.bstoCode + " ยังไม่มีการรับเข้าในระบบ");
            }

            return res;
        }
    }
}