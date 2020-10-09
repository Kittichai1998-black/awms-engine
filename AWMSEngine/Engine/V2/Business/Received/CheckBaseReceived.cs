using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AMWUtil.Exception;
using AMWUtil.Logger;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Criteria;
using AWMSModel.Entity;

namespace AWMSEngine.Engine.V2.Business.Received
{
    public class CheckBaseReceived : BaseEngine<CheckBaseReceived.TReq, List<CheckBaseReceived.TRes>>
    {
        public class TReq
        {
            public long areaID;
        }
        public class TRes
        { 
            public long areaID;
            public long areaLocationID;
            public string areaCode;
            public string areaLocationCode;
            public StorageObjectCriteria bsto;
        }
        protected override List<TRes> ExecuteEngine(TReq reqVO)
        {
            if (reqVO.areaID == 0)
            {
                throw new AMWException(this.Logger, AMWExceptionCode.V3001, "Not received value for AreaID");
            }
            List<TRes> stoRes = new List<TRes>();
            var areaCode = this.StaticValue.AreaMasters.Find(y => y.ID == reqVO.areaID).Code;
            var areaLocationMastersItems = ADO.WMSDB.DataADO.GetInstant().SelectBy<ams_AreaLocationMaster>(
                  new SQLConditionCriteria[] {
                        new SQLConditionCriteria("AreaMaster_ID",reqVO.areaID, SQLOperatorType.EQUALS),
                        new SQLConditionCriteria("Status", 1, SQLOperatorType.EQUALS, SQLConditionType.AND)
                  },
                  new SQLOrderByCriteria[] { }, null, null, this.BuVO);
            if(areaLocationMastersItems != null && areaLocationMastersItems.Count() > 0)
            {
                foreach (var location in areaLocationMastersItems)
                {
                    var res = new TRes();
                    res.areaID = reqVO.areaID;
                    res.areaCode = areaCode;
                    res.areaLocationID = location.ID.Value;
                    res.areaLocationCode = location.Code;

                    var stoLocationItems = AWMSEngine.ADO.WMSDB.DataADO.GetInstant().SelectBy<amt_StorageObject>(
                      new SQLConditionCriteria[] {
                            new SQLConditionCriteria("AreaLocationMaster_ID",location.ID.Value, SQLOperatorType.EQUALS),
                            new SQLConditionCriteria("ObjectType", StorageObjectType.BASE, SQLOperatorType.EQUALS, SQLConditionType.AND),
                            new SQLConditionCriteria("EventStatus", StorageObjectEventStatus.NEW, SQLOperatorType.EQUALS)
                            //new SQLConditionCriteria("Status",E, SQLOperatorType.EQUALS, SQLConditionType.AND)
                      }, this.BuVO).FirstOrDefault();

                    if(stoLocationItems != null)
                    {
                        res.bsto = ADO.WMSDB.StorageObjectADO.GetInstant().Get(stoLocationItems.ID.Value, StorageObjectType.BASE, false, true, this.BuVO);
                    }
                    else
                    {
                        res.bsto = null;
                    }
                    stoRes.Add(res);
                }
            }
            else
            {
                throw new AMWException(this.Logger, AMWExceptionCode.V3001, "Gate of Area: " + areaCode + " Not Found");

            }
            return stoRes;
        }
    }
}
