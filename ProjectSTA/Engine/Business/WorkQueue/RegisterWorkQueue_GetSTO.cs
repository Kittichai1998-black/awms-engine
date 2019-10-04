using AMWUtil.Exception;
using AMWUtil.Logger;
using AWMSEngine.Engine;
using AWMSEngine.Engine.V2.Business.WorkQueue;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Criteria;
using AWMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ProjectSTA.Engine.Business.WorkQueue
{
    public class RegisterWorkQueue_GetSTO : IProjectEngine<
        RegisterWorkQueue.TReq,
        StorageObjectCriteria
        >
    {
        private ams_AreaLocationMaster _locationASRS;
        private ams_Warehouse _warehouseASRS;
        private ams_AreaMaster _areaASRS;

        public StorageObjectCriteria ExecuteEngine(AMWLogger logger, VOCriteria buVO, RegisterWorkQueue.TReq reqVO)
        {
            if (reqVO.mappingPallets != null && reqVO.mappingPallets.Count > 0)
                throw new AMWException(logger, AMWExceptionCode.V1001, "Must not have mapping pallet's data");

            //Init Data from ASRS
            this.InitDataASRS(reqVO, logger, buVO);
            var sto = AWMSEngine.ADO.StorageObjectADO.GetInstant().Get(reqVO.baseCode,
              null, null, false, true, buVO);
            if (sto == null)
                throw new AMWException(logger, AMWExceptionCode.V1001, "Storage Object of Base Code: '" + reqVO.baseCode + "' Not Found");
            if (sto.code != reqVO.baseCode)
                throw new AMWException(logger, AMWExceptionCode.V1001, "Base Code: '" + reqVO.baseCode + "' INCORRECT");
            /*
            if (_areaASRS.ID != sto.areaID)
                throw new AMWException(logger, AMWExceptionCode.V1001, "Area don't macth");
            if (_locationASRS.ID != sto.parentID)
                throw new AMWException(logger, AMWExceptionCode.V1001, "Location don't macth");
            */

            sto.lengthM = reqVO.length;
            sto.heightM = reqVO.height;
            sto.widthM = reqVO.width;
            sto.warehouseID = _warehouseASRS.ID.Value;
            sto.areaID = _areaASRS.ID.Value;
            sto.parentID = _locationASRS.ID.Value;
            sto.parentType = StorageObjectType.LOCATION;

            return sto;
        }
        private void InitDataASRS(RegisterWorkQueue.TReq reqVO, AMWLogger logger, VOCriteria buVO)
        {
            var StaticValue = AWMSEngine.ADO.StaticValue.StaticValueManager.GetInstant();

            this._warehouseASRS = StaticValue.Warehouses.FirstOrDefault(x => x.Code == reqVO.warehouseCode);
            if (_warehouseASRS == null)
                throw new AMWException(logger, AMWExceptionCode.V1001, "Warehouse Code '" + reqVO.warehouseCode + "' Not Found");
            this._areaASRS = StaticValue.AreaMasters.FirstOrDefault(x => x.Code == reqVO.areaCode && x.Warehouse_ID == _warehouseASRS.ID);
            if (_areaASRS == null)
                throw new AMWException(logger, AMWExceptionCode.V1001, "Area Code '" + reqVO.areaCode + "' Not Found");
            this._locationASRS = AWMSEngine.ADO.DataADO.GetInstant().SelectBy<ams_AreaLocationMaster>(
                new KeyValuePair<string, object>[] {
                    new KeyValuePair<string,object>("Code",reqVO.locationCode),
                    new KeyValuePair<string,object>("AreaMaster_ID",_areaASRS.ID.Value),
                    new KeyValuePair<string,object>("Status", EntityStatus.ACTIVE)
                }, buVO).FirstOrDefault();
            if (_locationASRS == null)
                throw new AMWException(logger, AMWExceptionCode.V1001, "Location Code '" + reqVO.locationCode + "' Not Found");
        }
    }
}
