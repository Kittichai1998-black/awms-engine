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
    public class MappingPalletToLocation : BaseEngine<MappingPalletToLocation.TReq, MappingPalletToLocation.TRes>
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

            var location = ADO.WMSDB.DataADO.GetInstant().SelectByCodeActive<ams_AreaLocationMaster>(reqVO.locationCode, this.BuVO);
            if (location == null)
                throw new AMWException(this.Logger, AMWExceptionCode.V1001, "ไม่พบ Location นี้ในระบบ");

            //var stoLoc = ADO.WMSDB.DataADO.GetInstant().SelectBy<amt_StorageObject>(new SQLConditionCriteria[]{
            //    new SQLConditionCriteria("AreaLocationMaster_ID", location.ID, SQLOperatorType.EQUALS),
            //    new SQLConditionCriteria("AreaMaster_ID", area.ID, SQLOperatorType.EQUALS),
            //    new SQLConditionCriteria("Status", new int[]{ 0,1 }, SQLOperatorType.IN),
            //}, this.BuVO);

            var stoPallet = ADO.WMSDB.DataADO.GetInstant().SelectBy<amt_StorageObject>(new SQLConditionCriteria[]{
                new SQLConditionCriteria("Code", reqVO.baseCode, SQLOperatorType.EQUALS),
                new SQLConditionCriteria("Status", new int[]{ 0,1 }, SQLOperatorType.IN),
                new SQLConditionCriteria("ObjectType", StorageObjectType.BASE, SQLOperatorType.EQUALS),
            }, this.BuVO).FirstOrDefault();
            
            if (stoPallet != null)
            {
                var areaSto = this.StaticValue.AreaMasters.FirstOrDefault(x => x.ID == stoPallet.AreaMaster_ID);
                if (areaSto.AreaMasterType_ID != AreaMasterTypeID.STO_STAGING)
                    throw new AMWException(this.Logger, AMWExceptionCode.B0001, "ไม่สามารถย้ายสินค้าในคลังสินค้าได้");

                if(stoPallet.AreaLocationMaster_ID != location.ID)
                {
                    var baseSto = ADO.WMSDB.StorageObjectADO.GetInstant().Get(stoPallet.ID.Value, StorageObjectType.BASE, false, true, BuVO);
                    ADO.WMSDB.StorageObjectADO.GetInstant().UpdateLocationToChild(baseSto, location.ID.Value, BuVO);
                }
                result.recievedStatus = true;
            }
            else
            {
                var findItems = ADO.WMSDB.DataADO.GetInstant().SelectBy<amt_DocumentItem>(new SQLConditionCriteria[]
                {
                    new SQLConditionCriteria("BaseCode", reqVO.baseCode, SQLOperatorType.EQUALS),
                    new SQLConditionCriteria("EventStatus", DocumentEventStatus.NEW, SQLOperatorType.EQUALS),
                    new SQLConditionCriteria("DocumentType_ID", DocumentTypeID.PUTAWAY, SQLOperatorType.EQUALS)
                }, BuVO);

                if(findItems.Count == 0)
                    throw new AMWException(this.Logger, AMWExceptionCode.B0001, "ไม่พบเอกสารรับเข้า");
                else
                {
                    if(findItems.Select(x=> x.Document_ID).Count() > 1)
                        throw new AMWException(this.Logger, AMWExceptionCode.B0001, "พบเอกสารมากกว่า 1 เอกสาร");

                    var scanMap = new ScanMapStoNoDoc();

                    var createPalletData = new ScanMapStoNoDoc.TReq()
                    {
                        rootID = null,
                        scanCode = reqVO.baseCode,
                        warehouseID = warehouse.ID,
                        areaID = area.ID,
                        mode = VirtualMapSTOModeType.REGISTER,
                        action = VirtualMapSTOActionType.ADD,
                        amount = 1,
                        locationCode = location.Code,
                        batch = "",
                        isRoot = true,
                        lot = "",
                        options = "",
                        orderNo = "",
                        productDate = null,
                        unitCode = ""
                    };

                    var res = scanMap.Execute(this.Logger, this.BuVO, createPalletData);
                    result.recievedStatus = true;
                }
            }
            return result;
        }
    }
}
