using AMWUtil.Common;
using AMWUtil.Exception;
using AWMSEngine.Engine;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Constant.StringConst;
using AWMSModel.Criteria;
using AWMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ProjectSTA.Engine.Business
{
    public class UpdateQCStatus : BaseEngine<UpdateQCStatus.TReq, UpdateQCStatus.TRes>
    {
        public class TReq
        {
            public string skuCode;
            public string orderNo;
            public int cartonNoFirst;
            public int cartonNoLast;
            public StorageObjectEventStatus eventStatus;
            public string remark;
        }
        public class TRes
        {
            public List<TData> datas;
            public class TData
            {
                public string bascCode;
                public string skuCode;
                public string orderNo;
                public string cartonNo;
                public decimal baseQty;
                public string baseUnitCode;
                public StorageObjectEventStatus eventStatus;
                public DateTime receiveTime;
            }

        }
        protected override TRes ExecuteEngine(TReq reqVO)
        {
            if(reqVO.eventStatus != StorageObjectEventStatus.QC && reqVO.eventStatus != StorageObjectEventStatus.RECEIVED)
            {
                throw new AMWException(this.Logger, AMWExceptionCode.V1002, "EventStatus not change to '"+reqVO.eventStatus+"'.");
            }
            var pstos = AWMSEngine.ADO.DataADO.GetInstant().SelectBy<amt_StorageObject>(
                new SQLConditionCriteria[]
                {
                    new SQLConditionCriteria("Code",reqVO.skuCode, SQLOperatorType.EQUALS),
                    new SQLConditionCriteria("OrderNo",reqVO.orderNo, SQLOperatorType.EQUALS),
                    new SQLConditionCriteria("ObjectType",StorageObjectType.PACK, SQLOperatorType.EQUALS),
                    new SQLConditionCriteria("EventStatus", "12,98", SQLOperatorType.IN),
                    new SQLConditionCriteria("Status", EntityStatus.ACTIVE, SQLOperatorType.EQUALS)
                }, this.BuVO);
            var bstos = AWMSEngine.ADO.DataADO.GetInstant().SelectBy<amt_StorageObject>(
                new SQLConditionCriteria[]
                {
                    new SQLConditionCriteria("ID",string.Join(',', pstos.Select(x=>x.ParentStorageObject_ID).ToArray()), SQLOperatorType.IN),
                    //new SQLConditionCriteria("ObjectType",StorageObjectType.BASE, SQLOperatorType.EQUALS),
                    new SQLConditionCriteria("Status", EntityStatus.ACTIVE, SQLOperatorType.EQUALS)
                }, this.BuVO);

            List<long> bstoIDRemoves = new List<long>();
            bstos.ForEach(x =>
            {
                if (pstos.FindAll(y => y.ParentStorageObject_ID == x.ID).TrueForAll(y =>
                                    {
                                        var rangNumInts = RangeNumUtil.ExplodeRangeNumToIntArray(
                                                                        y.Options.QryStrGetValue(OptionVOConst.OPT_CARTON_NO)).ToList();
                                        bool a = reqVO.cartonNoFirst <= rangNumInts.Min() && reqVO.cartonNoLast >= rangNumInts.Max();
                                        return a;
                                    }
                ))
                {
                    AWMSEngine.ADO.StorageObjectADO.GetInstant()
                    .UpdateStatusToChild(x.ID.Value, null, EntityStatus.ACTIVE, reqVO.eventStatus, this.BuVO);
                    //x.Options = ObjectUtil.QryStrSetValue(x.Options, OptionVOConst.OPT_REMARK, reqVO.remark);
                    //AWMSEngine.ADO.DataADO.GetInstant().UpdateByID<amt_StorageObject>(x.ID.Value, this.BuVO, new KeyValuePair<string, object>("options", x.Options));

                }
                else
                {
                    bstoIDRemoves.Add(x.ID.Value);
                }
            });
            bstoIDRemoves.ForEach(x => pstos.RemoveAll(y => y.ParentStorageObject_ID == x));

            pstos.ForEach(x =>
            {
                x.Options = ObjectUtil.QryStrSetValue(x.Options, OptionVOConst.OPT_REMARK, reqVO.remark);
                AWMSEngine.ADO.DataADO.GetInstant().UpdateByID<amt_StorageObject>(x.ID.Value, this.BuVO, new KeyValuePair<string, object>("options", x.Options));
            });

            TRes res = new TRes();
            res.datas = new List<TRes.TData>();
            pstos.ForEach(x => {
                res.datas.Add(new TRes.TData()
                {
                    bascCode = bstos.First(y => y.ID == x.ParentStorageObject_ID).Code,
                    baseQty = x.BaseQuantity,
                    baseUnitCode = AWMSEngine.ADO.StaticValue.StaticValueManager.GetInstant().UnitTypes.First(y=>y.ID== x.BaseUnitType_ID).Code,
                    cartonNo = AMWUtil.Common.ObjectUtil.QryStrGetValue(x.Options, OptionVOConst.OPT_CARTON_NO),
                    eventStatus = reqVO.eventStatus,
                    orderNo = x.OrderNo,
                    receiveTime = x.CreateTime,
                    skuCode = x.Code
                });
            });

            return res;
        }

    }
}
 