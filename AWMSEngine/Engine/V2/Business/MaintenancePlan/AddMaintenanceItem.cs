using AWMSModel.Constant.EnumConst;
using AWMSModel.Criteria;
using AWMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.Engine.V2.Business.MaintenancePlan
{
    public class AddMaintenanceItem : BaseEngine<AddMaintenanceItem.TReq, amt_MaintenanceResult>
    {
        public class TReq
        {
            public int MaintenanceResult_ID;
            public string ServiceResult;
            public string ServiceBy;
            public MaintenancePlanEventStatus EventStatus;
        }
        protected override amt_MaintenanceResult ExecuteEngine(TReq reqVO)
        {
            ADO.DataADO.GetInstant().Insert<amt_MaintenanceResultItem>(BuVO, new amt_MaintenanceResultItem()
            {
                MaintenanceResult_ID = reqVO.MaintenanceResult_ID,
                ServiceResult = reqVO.ServiceResult,
                ServiceBy = reqVO.ServiceBy,
                EventStatus = reqVO.EventStatus,
                Status = reqVO.EventStatus == MaintenancePlanEventStatus.CLOSED ? EntityStatus.DONE : EntityStatus.ACTIVE,
            });

            if (reqVO.EventStatus == MaintenancePlanEventStatus.CLOSED)
            {
                UpdateStatus(reqVO.MaintenanceResult_ID, MaintenancePlanEventStatus.CLOSED, EntityStatus.DONE);
            }
            else
            {
                UpdateStatus(reqVO.MaintenanceResult_ID, MaintenancePlanEventStatus.WORKING, EntityStatus.ACTIVE);
            }

            return new GetMaintenanceDetail().Execute(this.Logger, this.BuVO, new GetMaintenanceDetail.TReq()
            {
                maintenanceID = reqVO.MaintenanceResult_ID
            });
        }

        private void UpdateStatus(int id, MaintenancePlanEventStatus eventStatus, EntityStatus status)
        {
            ADO.DataADO.GetInstant().UpdateBy<amt_MaintenanceResult>(new SQLConditionCriteria[]{
                    new SQLConditionCriteria(){field = "ID", operatorType = SQLOperatorType.EQUALS, value = id},
                    new SQLConditionCriteria(){field = "Status", operatorType = SQLOperatorType.NOTEQUALS, value = EntityStatus.REMOVE}
                }, new KeyValuePair<string, object>[] {
                    new KeyValuePair<string, object>("EventStatus", eventStatus),
                    new KeyValuePair<string, object>("Status", status)
                }, this.BuVO);

            ADO.DataADO.GetInstant().UpdateBy<amt_MaintenanceResultItem>(new SQLConditionCriteria[]{
                    new SQLConditionCriteria(){field = "MaintenanceResult_ID", operatorType = SQLOperatorType.EQUALS, value = id},
                    new SQLConditionCriteria(){field = "Status", operatorType = SQLOperatorType.NOTEQUALS, value = EntityStatus.REMOVE}
                }, new KeyValuePair<string, object>[] {
                    new KeyValuePair<string, object>("EventStatus", eventStatus),
                    new KeyValuePair<string, object>("Status", status)
                }, this.BuVO);
        }
    }
}
