using AMWUtil.Common;
using AMWUtil.Exception;
using AWMSEngine.Engine.V2.Validation;
using AMSModel.Constant.EnumConst;
using AMSModel.Constant.StringConst;
using AMSModel.Criteria;
using AMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.Engine.V2.Business
{
    public class UpdateStoMoveLocation : BaseEngine<UpdateStoMoveLocation.TDocReq, UpdateStoMoveLocation.TDocRes>
    {
        public class TDocReq
        {
            public string PalletCode;
            public long LocationID;
            public long bstosID;
        }
        public class TDocRes
        {
            public StorageObjectCriteria data;
        }

        protected override TDocRes ExecuteEngine(TDocReq reqVO)
        {
            TDocRes res = new TDocRes();

            var locArea = ADO.WMSDB.DataADO.GetInstant().SelectByID<ams_AreaLocationMaster>(reqVO.LocationID, this.BuVO);
            if(ADO.WMSStaticValue.StaticValueManager.GetInstant().GetAreaMaster(locArea.AreaMaster_ID,null).Code == "SA")
            {
                var checkAreaLoc = ADO.WMSDB.DataADO.GetInstant().SelectBy<amt_StorageObject>(new SQLConditionCriteria[] {
                        new SQLConditionCriteria("AreaLocationMaster_ID",reqVO.LocationID, SQLOperatorType.EQUALS),
                        new SQLConditionCriteria("status",EntityStatus.ACTIVE, SQLOperatorType.EQUALS)
                    }, this.BuVO).FirstOrDefault();
                if (checkAreaLoc != null)
                    throw new AMWException(this.Logger, AMWExceptionCode.V1001, "ไม่มี Location : "+ locArea.Code + " ในระบบ");
            }
            
            var sto = ADO.WMSDB.StorageObjectADO.GetInstant().Get(reqVO.bstosID, StorageObjectType.BASE, false, true, this.BuVO);

            var data = ADO.WMSDB.StorageObjectADO.GetInstant().UpdateLocationToChild(sto, reqVO.LocationID, this.BuVO);
            res.data = data;
            /*if (sto.eventStatus == StorageObjectEventStatus.RECEIVING || sto.eventStatus == StorageObjectEventStatus.RECEIVED)
            {
            }
            else
            {
                throw new AMWException(this.Logger, AMWExceptionCode.V1001, reqVO.PalletCode + " is " + sto.eventStatus.ToString());
            }*/
            return res;
        }
    }
}
