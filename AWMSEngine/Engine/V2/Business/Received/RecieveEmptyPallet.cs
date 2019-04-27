using AMWUtil.Exception;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Criteria;
using AWMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.Engine.V2.Business.Received
{
    public class MapEmptyPallet : BaseEngine<MapEmptyPallet.TReq, MapEmptyPallet.TRes>
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
                throw new AMWException(this.Logger, AMWExceptionCode.V1001, "ไม่พบ Warehouse นี้ในระบบ");
            var area = this.StaticValue.AreaMasters.FirstOrDefault(x => x.Code == reqVO.areaCode);
            if(area == null)
                throw new AMWException(this.Logger, AMWExceptionCode.V1001, "ไม่พบ Area นี้ในระบบ");

            var location = ADO.DataADO.GetInstant().SelectByCodeActive<ams_AreaLocationMaster>(reqVO.locationCode, this.BuVO);
            if (location == null)
                throw new AMWException(this.Logger, AMWExceptionCode.V1001, "ไม่พบ Location นี้ในระบบ");

            var stoLoc = ADO.DataADO.GetInstant().SelectBy<amt_StorageObject>(new SQLConditionCriteria[]{
                new SQLConditionCriteria("AreaLocationMaster_ID", location.ID, SQLOperatorType.EQUALS),
                new SQLConditionCriteria("Status", 0, SQLOperatorType.EQUALS)
            }, this.BuVO);
            var stoPallet = ADO.DataADO.GetInstant().SelectBy<amt_StorageObject>(new SQLConditionCriteria[]{
                new SQLConditionCriteria("Code", reqVO.baseCode, SQLOperatorType.EQUALS),
                new SQLConditionCriteria("Status", new int[]{ 0,1 }, SQLOperatorType.IN)
            }, this.BuVO);
            
            if (stoPallet.Count > 0)
            {
                throw new AMWException(this.Logger, AMWExceptionCode.V1002, "มี Pallet นี้อยู่ในระบบ ไม่สามารถกำกับได้");
            }
            if (stoLoc.Count > 0)
            {
                throw new AMWException(this.Logger, AMWExceptionCode.V1002, "Location มี Pallet อยู่แล้ว ไม่สามารถกำกับได้");
            }
            var createEmptyPalletSTO = new ScanMapStoNoDoc();

            var createPalletData = new ScanMapStoNoDoc.TReq()
            {
                rootID = null,
                scanCode = reqVO.baseCode,
                warehouseID = warehouse.ID,
                areaID = area.ID,
                mode = VirtualMapSTOModeType.REGISTER,
                action = VirtualMapSTOActionType.ADD,
                amount = 1,
                locationCode=location.Code,
                batch = "",isRoot = true,lot = "",options = "",orderNo = "",productDate = null,unitCode = ""
            };

            var res = createEmptyPalletSTO.Execute(this.Logger, this.BuVO, createPalletData);
            result.recievedStatus = true;

            return result;
        }
    }
}
