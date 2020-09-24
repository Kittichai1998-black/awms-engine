using AMWUtil.Logger;
using AWMSEngine.Engine; 
using AWMSModel.Constant.EnumConst;
using AWMSEngine.Engine.V2.Business.WorkQueue;
using AWMSModel.Criteria;
using AWMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AMWUtil.Exception;
using AWMSEngine.Common;
using AMWUtil.Common;
using AWMSModel.Criteria.SP.Request;
using AWMSEngine.ADO.StaticValue;
using AWMSModel.Criteria.SP.Response;

namespace ProjectBOSS.Engine.WorkQueue
{
    public class RegisterWorkQueue_CoutingAuto : IProjectEngine<RegisterWorkQueue.TReq, WorkQueueCriteria>
    {
        private ams_AreaMaster _areaASRS;
        private ams_AreaLocationMaster _locationASRS;
        private ams_Warehouse _warehouseASRS;
        private ams_Branch _branchASRS;

        private StaticValueManager StaticValue;
        private void InitDataASRS(RegisterWorkQueue.TReq reqVO, AMWLogger Logger, VOCriteria BuVO)
        {
            this._warehouseASRS = StaticValue.Warehouses.FirstOrDefault(x => x.Code == reqVO.warehouseCode);
            this._branchASRS = StaticValue.Branchs.FirstOrDefault(x => x.ID == _warehouseASRS.Branch_ID);
            this._areaASRS = StaticValue.AreaMasters.FirstOrDefault(x => x.Code == reqVO.areaCode && x.Warehouse_ID == _warehouseASRS.ID);
            this._locationASRS = AWMSEngine.ADO.DataADO.GetInstant().SelectBy<ams_AreaLocationMaster>(
                new KeyValuePair<string, object>[] {
                    new KeyValuePair<string,object>("Code",reqVO.locationCode),
                    new KeyValuePair<string,object>("AreaMaster_ID",_areaASRS.ID.Value),
                    new KeyValuePair<string,object>("Status", EntityStatus.ACTIVE)
                }, BuVO).FirstOrDefault();
        }
        public WorkQueueCriteria ExecuteEngine(AMWLogger Logger, VOCriteria BuVO, RegisterWorkQueue.TReq reqVO)
        {
            if (reqVO.areaCode != "G05")
                return null;
            var register = new RegisterWorkQueue();

            var sto = register.GetSto(reqVO);
            if (sto != null)
            {
                StaticValue = AWMSEngine.ADO.StaticValue.StaticValueManager.GetInstant();

                this.InitDataASRS(reqVO, Logger, BuVO);

                var loc = _locationASRS.ID.Value;

                var percentWei = StaticValue.GetConfigValue<string>(ConfigCommon.PERCENT_WEIGHT_AUTO);

                return null;
            }
            else
            {
                return null;
            }

        }
         
    }
}
