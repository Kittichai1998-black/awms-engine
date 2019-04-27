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
            public int areaID;
        }
        public class TRes
        { 
            public int areaID;
            public int areaLocationID;
            public string areaCode;
            public string areaLocationCode;
            public StorageObjectCriteria bsto;
        }
        protected override List<TRes> ExecuteEngine(TReq reqVO)
        {
            if (reqVO.areaID == 0)
            {
                throw new AMWException(this.Logger, AMWExceptionCode.V3001, "ไม่ได้รับค่า Area ID");
            }
            List<TRes> stoRes = new List<TRes>();
            var areaCode = this.StaticValue.AreaMasters.Find(y => y.ID == reqVO.areaID).Code;
            var areaLocationMastersItems = ADO.DataADO.GetInstant().SelectBy<ams_AreaLocationMaster>(
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
                    res.areaLocationID = (int)location.ID;
                    res.areaLocationCode = location.Code;

                    var stoLocationItems = AWMSEngine.ADO.DataADO.GetInstant().SelectBy<amt_StorageObject>(
                      new SQLConditionCriteria[] {
                            new SQLConditionCriteria("AreaLocationMaster_ID",(int)location.ID, SQLOperatorType.EQUALS),
                            new SQLConditionCriteria("ObjectType", StorageObjectType.BASE, SQLOperatorType.EQUALS, SQLConditionType.AND),
                            new SQLConditionCriteria("EventStatus", 10, SQLOperatorType.EQUALS, SQLConditionType.AND),
                            new SQLConditionCriteria("Status", EntityStatus.REMOVE, SQLOperatorType.LESS, SQLConditionType.AND)
                      }, this.BuVO).FirstOrDefault();

                    if(stoLocationItems != null)
                    {
                        res.bsto = ADO.StorageObjectADO.GetInstant().Get((long)stoLocationItems.ID, StorageObjectType.BASE, false, true, this.BuVO);
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
                throw new AMWException(this.Logger, AMWExceptionCode.V3001, "ไม่พบข้อมูล Gate ใน Area: " + areaCode);

            }
            return stoRes;
        }
    }
}
