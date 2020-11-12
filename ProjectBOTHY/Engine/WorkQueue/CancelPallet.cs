using ADO.WCSAPI;
using ADO.WMSDB;
using AMWUtil.Common;
using AMWUtil.Exception;
using AMWUtil.Logger;
using AWMSEngine.Engine;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Constant.StringConst;
using AWMSModel.Criteria;
using AWMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Linq;

namespace ProjectBOTHY.Engine.Business.Document
{
    public class CancelPallet : BaseEngine<CancelPallet.TReq, StorageObjectCriteria>
    {
        public class TReq
        {
            public long bstosID;
            public string remark;
        }


        protected override StorageObjectCriteria ExecuteEngine(TReq reqVO)
        {

            StorageObjectCriteria sto = ADO.WMSDB.StorageObjectADO.GetInstant().Get(reqVO.bstosID, StorageObjectType.BASE, false, true, this.BuVO);
            var dataSend = new WCSQueueADO.TReqCancel()
            {
                baseCode = sto.code,
                areaCode = StaticValue.AreaMasters.FirstOrDefault(x => x.ID == sto.areaID).Code
               
            };

            var area = ADO.WMSDB.DataADO.GetInstant().SelectBy<ams_AreaMaster>(
              new SQLConditionCriteria[] {
                        new SQLConditionCriteria("AreaMasterType_ID",AreaMasterTypeID.STA_PICK, SQLOperatorType.EQUALS),
                        new SQLConditionCriteria("Status","1",SQLOperatorType.EQUALS)
              }, this.BuVO).FirstOrDefault();

            if (area == null)
                throw new AMWException(this.Logger, AMWExceptionCode.B0001, "ไม่มี Area ในระบบ");

            sto.areaID = area.ID;
            sto.options = AMWUtil.Common.ObjectUtil.QryStrSetValue(sto.options, OptionVOConst.OPT_REMARK, reqVO.remark);
            ADO.WMSDB.StorageObjectADO.GetInstant().PutV2(sto, this.BuVO);
            foreach (var pack in sto.mapstos)
            {
                pack.areaID = area.ID;
                pack.options = AMWUtil.Common.ObjectUtil.QryStrSetValue(pack.options, OptionVOConst.OPT_REMARK, reqVO.remark);
                ADO.WMSDB.StorageObjectADO.GetInstant().PutV2(pack, this.BuVO);
            }


            var wcsRes = ADO.WCSAPI.WCSQueueADO.GetInstant().SendCancel(dataSend, this.BuVO);
            if (wcsRes._result.resultcheck == 0)
                throw new AMWException(this.Logger, AMWExceptionCode.B0001, wcsRes._result.resultmessage);

            return sto;

        }

    }
}
