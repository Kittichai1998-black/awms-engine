using AMWUtil.Exception;
using AWMSModel.Criteria;
using AWMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.Engine.V2.Business.Received
{
    public class RecieveEmptyPallet : BaseEngine<RecieveEmptyPallet.TReq, RecieveEmptyPallet.TRes>
    {
        public class TReq
        {
            public string baseCode;
            public string warehouseCode;
            public string areaCode;
            public string locationCode;
        }

        public class TRes
        {
            public bool recievedStatus;
        }
        protected override TRes ExecuteEngine(TReq reqVO)
        {
            var result = new TRes();
            var warehouse = this.StaticValue.Warehouses.FirstOrDefault(x => x.Code == reqVO.warehouseCode);
            if (warehouse == null)
                throw new AMWException(this.Logger, AMWExceptionCode.V1001, "ไม่พบ Area นี้ในระบบ");
            var area = this.StaticValue.AreaMasters.FirstOrDefault(x => x.Code == reqVO.areaCode);
            if(area == null)
                throw new AMWException(this.Logger, AMWExceptionCode.V1001, "ไม่พบ Area นี้ในระบบ");

            var location = ADO.DataADO.GetInstant().SelectByCodeActive<ams_AreaLocationMaster>(reqVO.locationCode, this.BuVO).ID;
            if (location == null)
                throw new AMWException(this.Logger, AMWExceptionCode.V1001, "ไม่พบ Location นี้ในระบบ");

            var sto = ADO.DataADO.GetInstant().SelectBy<amt_StorageObject>(new SQLConditionCriteria[]{
                new SQLConditionCriteria("AreaLocationMaster_ID", location, AWMSModel.Constant.EnumConst.SQLOperatorType.EQUALS),
                new SQLConditionCriteria("Status", 1, AWMSModel.Constant.EnumConst.SQLOperatorType.EQUALS)
            }, this.BuVO);
            if(sto.Count > 0)
            {
                result.recievedStatus = false;
            }
            var createEmptyPalletSTO = new ScanMapStoNoDoc();

            //var createData = ScanMapStoNoDoc

            var res = createEmptyPalletSTO.Execute(this.Logger, this.BuVO, null);


            return result;
        }
    }
}
