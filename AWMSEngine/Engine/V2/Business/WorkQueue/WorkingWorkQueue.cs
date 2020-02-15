using AMWUtil.Common;
using AMWUtil.Exception;
using AWMSEngine.ADO;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Criteria;
using AWMSModel.Criteria.SP.Request;
using AWMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.Engine.V2.Business.WorkQueue
{
    public class WorkingStageQueue : BaseQueue<WorkingStageQueue.TReq, WorkQueueCriteria>
    {
        public class TReq
        {
            public long? queueID;
            public string baseCode;
            public string warehouseCode;
            public string areaCode;
            public string locationCode;
            public DateTime actualTime;
        }
        protected override WorkQueueCriteria ExecuteEngine(TReq reqVO)
        {
            this.initMasterData(reqVO);
            var queueTrx = this.UpdateWorkQueueWork(reqVO);
            if (queueTrx.StorageObject_Code != reqVO.baseCode)
                throw new AMWException(this.Logger, AMWExceptionCode.V1001, "Base Code '" + reqVO.baseCode + "' doesn't match with in Work Queue '" + queueTrx.StorageObject_Code + "'");

            var baseInfo = this.UpdateStorageObject(reqVO, queueTrx);

            var res = base.GenerateResponse(baseInfo, queueTrx);
            return res;
        }

        private ams_Warehouse wm;
        private ams_AreaMaster am;
        private ams_AreaLocationMaster lm;

        private void initMasterData(TReq reqVO)
        {
            wm = this.StaticValue.Warehouses.FirstOrDefault(x => x.Code == reqVO.warehouseCode);
            if (wm == null)
                throw new AMWException(this.Logger, AMWExceptionCode.V1001, "Warehouse Code '" + reqVO.warehouseCode + "' Not Found");

            am = this.StaticValue.AreaMasters.FirstOrDefault(x => x.Code == reqVO.areaCode && x.Warehouse_ID == wm.ID);
            if (am == null)
                throw new AMWException(this.Logger, AMWExceptionCode.V1001, "Area Code '" + reqVO.areaCode + "' Not Found");

            lm = ADO.DataADO.GetInstant().SelectBy<ams_AreaLocationMaster>(
                new KeyValuePair<string, object>[] {
                    new KeyValuePair<string,object>("Code",reqVO.locationCode),
                    new KeyValuePair<string,object>("AreaMaster_ID",am.ID.Value),
                    new KeyValuePair<string,object>("Status", EntityStatus.ACTIVE)
                }, this.BuVO).FirstOrDefault();

            if (lm == null)
                throw new AMWException(this.Logger, AMWExceptionCode.V1001, "Location Code '" + reqVO.locationCode + "'  Not Found");
        }

        private SPworkQueue UpdateWorkQueueWork(TReq reqVO)
        {
            var queueTrx = ADO.WorkQueueADO.GetInstant().Get(reqVO.queueID.Value, this.BuVO);

            if (queueTrx.EventStatus == WorkQueueEventStatus.WORKED ||
                queueTrx.EventStatus == WorkQueueEventStatus.WORKING ||
                queueTrx.EventStatus == WorkQueueEventStatus.NEW)
            {
                queueTrx.AreaLocationMaster_ID = lm.ID;
                queueTrx.AreaMaster_ID = am.ID.Value;
                queueTrx.Warehouse_ID = am.Warehouse_ID.Value;

                queueTrx.ActualTime = reqVO.actualTime;
                queueTrx.EndTime = reqVO.actualTime;

                if (queueTrx.Des_Warehouse_ID == queueTrx.Warehouse_ID &&
                    queueTrx.Des_AreaMaster_ID == queueTrx.AreaMaster_ID &&
                    (queueTrx.Des_AreaLocationMaster_ID ?? queueTrx.AreaLocationMaster_ID) == queueTrx.AreaLocationMaster_ID)
                {
                    queueTrx.EventStatus = WorkQueueEventStatus.WORKED;
                    UpdateDocumentItemStorageObject(reqVO, queueTrx);
                }
                else
                {
                    queueTrx.EventStatus = WorkQueueEventStatus.WORKING;
                }
                WorkQueueADO.GetInstant().PUT(queueTrx, this.BuVO);
            }
            else
            {
                throw new AMWException(this.Logger, AMWExceptionCode.V2002, "Queue status not Working");
            }

            return queueTrx;
        }

        private StorageObjectCriteria UpdateStorageObject(TReq reqVO, SPworkQueue queueTrx)
        {
            var baseInfo = ADO.StorageObjectADO.GetInstant().Get(queueTrx.StorageObject_ID.Value, StorageObjectType.BASE, false, true, this.BuVO);

            ADO.StorageObjectADO.GetInstant().UpdateLocationToChild(baseInfo, this.lm.ID.Value, this.BuVO);
            return baseInfo;
        }
        private void UpdateDocumentItemStorageObject(TReq reqVO, SPworkQueue queueTrx)
        {
            var stos = ADO.StorageObjectADO.GetInstant().Get(reqVO.baseCode, wm.ID.Value, null, false, true, this.BuVO);
            var docItems = ADO.DocumentADO.GetInstant().ListItemByWorkQueue(reqVO.queueID.Value, this.BuVO).ToList();
            var docs = ADO.DocumentADO.GetInstant().List(docItems.Select(x => x.Document_ID).Distinct().ToList(), this.BuVO).FirstOrDefault();
            if (queueTrx.IOType == IOType.OUTPUT && docs.DocumentType_ID != DocumentTypeID.AUDIT)
            {
                var stoList = stos.ToTreeList().Where(x => x.type == StorageObjectType.PACK).ToList();
                var listDisto = new List<amt_DocumentItemStorageObject>();
                docItems.ForEach(x => { listDisto.AddRange(x.DocItemStos); });
                var sumDisto = listDisto.GroupBy(x => x.Sou_StorageObject_ID).Select(x => new { stoID = x.Key, sumBaseQty = x.Sum(y => y.BaseQuantity), sumQty = x.Sum(y => y.Quantity) }).ToList();

                docItems.ForEach(docItem =>
                {
                    if (docItem.Quantity == null)
                    {
                        stoList.ForEach(sto =>
                        {
                            var distos = docItem.DocItemStos.FindAll(x => x.Sou_StorageObject_ID == sto.id);
                            distos.ToList().ForEach(disto =>
                            {
                                disto = UpdateDistoFull(sto, disto);
                            });
                        });
                    }
                    else
                    {
                        var qtyIssue = docItem.Quantity;//1500
                        var baseqtyIssue = docItem.BaseQuantity;
                        decimal? sumDiSTOQty = sumDisto.Sum(x => x.sumQty);
                        decimal? sumDiSTOBaseQty = sumDisto.Sum(x => x.sumBaseQty);
                        stoList.ForEach(sto =>
                        {
                            var distos = docItem.DocItemStos.FindAll(x => x.Sou_StorageObject_ID == sto.id).ToList();

                            distos.ForEach(disto =>
                            {
                                if (disto.Quantity == null)
                                {
                                    var remainQty = qtyIssue - sumDiSTOQty;
                                    var remainBaseQty = baseqtyIssue - sumDiSTOBaseQty;
                                    //จำนวนที่ต้องการเบิก - ผลรวมของจำนวนที่ถูกเบิกเเล้วในdisto = จำนวนที่ยังต้องเบิกเพิ่ม  

                                    //1) 1500 - 0 = 1500  sto1 เบิกเต็ม สถานะเปลี่ยนเป็น picking  , disto_sou = disto_des
                                    if (remainQty >= sto.qty) //1500 > 1000
                                    { //ถ้า จำนวนที่ยังต้องเบิกเพิ่ม >= จำนวนของ sto  ให้ตัดเต็ม 
                                        disto = UpdateDistoFull(sto, disto);
                                    }
                                    else
                                    {
                                        var issuedSto = new StorageObjectCriteria();
                                        issuedSto = sto.Clone();
                                        //500 < 1000
                                        //จำนวนที่ยังต้องเบิกเพิ่ม น้อยกว่า จำนวนของที่ stoมีอยู่ 
                                        //ให้หักqty ออกจากstoเดิม ส่วนที่เหลือเป็น Received 
                                        var updSto = new StorageObjectCriteria();
                                        updSto = sto;
                                        updSto.baseQty -= remainQty.Value;  //1000 - 500 = เหลือของ 500
                                        updSto.qty -= remainBaseQty.Value;

                                        if (updSto.baseQty == 0)
                                        {
                                            disto = UpdateDistoFull(sto, disto);
                                        }
                                        else
                                        {
                                            disto.Quantity = remainQty.Value;
                                            disto.BaseQuantity = remainBaseQty.Value;
                                            ADO.DocumentADO.GetInstant().UpdateMappingSTO(disto.ID.Value, null, remainQty.Value, remainBaseQty.Value, EntityStatus.INACTIVE, this.BuVO);
                                        }
                                    }
                                }

                            });

                        });
                    }

                });

            }
        }

        private amt_DocumentItemStorageObject UpdateDistoFull(StorageObjectCriteria sto, amt_DocumentItemStorageObject disto)
        {
            disto.Quantity = sto.qty;
            disto.BaseQuantity = sto.baseQty;
            ADO.DocumentADO.GetInstant().UpdateMappingSTO(disto.ID.Value, null, disto.Quantity, disto.BaseQuantity, EntityStatus.INACTIVE, this.BuVO);

            return disto;
        }
    }
}
