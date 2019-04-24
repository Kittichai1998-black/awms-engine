using AMWUtil.Common;
using AMWUtil.Exception;
using AWMSModel.Criteria;
using AWMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ProjectSTA.Engine.Business.Received
{
    public class ScanMapPalletReceive : AWMSEngine.Engine.BaseEngine<ScanMapPalletReceive.TReq, ScanMapPalletReceive.TRes>
    {
        public class TReq
        {
            public int? areaID;
            public string scanCode;
            
        }
        public class TRes
        {
            public int? areaID;
            public int? areaLocationID;
            public StorageObjectCriteria mapsto;
        }
        protected override TRes ExecuteEngine(TReq reqVO)
        {
            TRes res = new TRes();

            string scanCode = reqVO.scanCode == null ? null : reqVO.scanCode;
            string orderNo = scanCode.Substring(0, 7);
            string skuCode = scanCode.Substring(7, 14);
            string cartonNo = scanCode.Substring(22, 4);

           var areaLocationMastersItems = AWMSEngine.ADO.DataADO.GetInstant().SelectBy<ams_AreaLocationMaster>("AreaMaster_ID", reqVO.areaID, this.BuVO);
           
            foreach(var loc in areaLocationMastersItems)
            {
                var stoItems = AWMSEngine.ADO.DataADO.GetInstant().SelectBy<amt_StorageObject>("AreaLocationMaster_ID", loc.ID, this.BuVO);
                 
            }
           /* var stoItems = AWMSEngine.ADO.DataADO.GetInstant().SelectBy<amt_StorageObject>(
               new SQLConditionCriteria[] {
                    new SQLConditionCriteria("AreaLocationMaster_ID",string.Join(',',areaLocationMastersItems.Select(x=>x.ID.Value).ToArray()), SQLOperatorType.IN),
                    new SQLConditionCriteria("Status", EntityStatus.ACTIVE, SQLOperatorType.LESS, SQLConditionType.AND)
               },
               new SQLOrderByCriteria[] { }, null, null, this.BuVO);

            if (stoItems != null)
            {
                //stoItems.Select
            }
            else
            {

            }*/
            return null;
        }
    }
}
