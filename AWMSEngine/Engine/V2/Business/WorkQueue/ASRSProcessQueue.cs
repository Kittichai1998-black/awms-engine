using AMWUtil.Common;
using AMWUtil.Exception;
using AWMSEngine.ADO.QueueApi;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Criteria.SP.Request;
using AWMSModel.Criteria.SP.Response;
using AWMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.Engine.V2.Business.WorkQueue
{
    public class ASRSProcessQueue : BaseEngine<ASRSProcessQueue.TReq, ASRSProcessQueue.TRes>
    {
        public class TReq
        {
            public string desASRSAreaCode;
            public string desASRSLocationCode;
            public List<ProcessQueueCriteria> processQueues;
            public class ProcessQueueCriteria
            {
                public long docID;
                public long docItemID;

                public string locationCode;
                public string baseCode;
                public string skuCode;

                public int priority;

                public bool useShelfLifeDate;
                public bool useExpireDate;
                public bool useIncubateDate;
                public bool useFullPallet;

                public decimal? baseQty;
                public int? percentRandom;


                public List<SPInSTOProcessQueueCriteria.ConditionProcess> conditions;
                public List<StorageObjectEventStatus> eventStatuses;
                public List<SPInSTOProcessQueueCriteria.OrderByProcess> orderBys;
            }
        }
        public class TRes
        {
            public string desASRSAreaCode;
            public string desASRSLocationCode;
            public List<ProcessQueueResult> processResults;
            public class ProcessQueueResult
            {
                public long docID;
                public string docCode;
                public List<ProcessQueueResultItem> processResultItems;
                public class ProcessQueueResultItem
                {
                    public long docItemID;
                    public string docItemCode;
                    public decimal? baseQty;
                    public decimal? percentRandom;
                    public List<SPOutSTOProcessQueueCriteria> pickStos;
                }
            }
        }

        protected override TRes ExecuteEngine(TReq reqVO)
        {
            this.ValidateReqVO(reqVO);

            TRes res = new TRes()
            {
                processResults = new List<TRes.ProcessQueueResult>(),
                desASRSAreaCode = reqVO.desASRSAreaCode,
                desASRSLocationCode = reqVO.desASRSLocationCode
            };
            List<amt_Document> docs = ADO.DocumentADO.GetInstant().ListAndItem(
                reqVO.processQueues.GroupBy(x => x.docID).Select(x=>x.Key).ToList()
                , this.BuVO);
            List<SPOutSTOProcessQueueCriteria> tmpStoProcs = new List<SPOutSTOProcessQueueCriteria>();
            var processQueues = reqVO.processQueues.OrderByDescending(x => x.priority).ToList();
            foreach (var proc in processQueues)
            {
                TRes.ProcessQueueResult processRes = res.processResults.FirstOrDefault(x => x.docID == proc.docID);
                var doc = docs.First(x => x.ID == proc.docID);
                if (processRes == null)
                {
                    processRes = new TRes.ProcessQueueResult()
                    {
                        docID = proc.docID,
                        docCode = doc.Code,
                        processResultItems = new List<TRes.ProcessQueueResult.ProcessQueueResultItem>()
                    };
                    res.processResults.Add(processRes);
                }

                var processResItem = new TRes.ProcessQueueResult.ProcessQueueResultItem()
                {
                    docItemID = proc.docItemID,
                    baseQty = proc.baseQty,
                    percentRandom = proc.percentRandom,
                    pickStos = new List<SPOutSTOProcessQueueCriteria>()
                };
                processRes.processResultItems.Add(processResItem);

                res.processResults.Add(processRes);
                foreach (var condi in proc.conditions)
                {
                    var desASRSWm = this.StaticValue.Warehouses.First(x => x.ID == doc.Sou_Warehouse_ID.Value);
                    List<SPOutSTOProcessQueueCriteria> pickStos = processResItem.pickStos;
                    var _condi = condi.Clone();
                    if (_condi.baseQty.HasValue)//ตรวจพาเลทที่เคย query มาแล้วจากใน TEMP
                    {
                        var _pickStos = tmpStoProcs.Where(x =>
                            x.isWCSReady &&
                            x.pickBaseQty < x.pstoBaseQty &&
                            (string.IsNullOrWhiteSpace(desASRSWm.Code) || x.warehouseCode == desASRSWm.Code) &&
                            (string.IsNullOrWhiteSpace(proc.locationCode) || x.locationCode == proc.locationCode) &&
                            (string.IsNullOrWhiteSpace(proc.baseCode) || x.bstoCode == proc.baseCode) &&
                            (string.IsNullOrWhiteSpace(proc.skuCode) || x.pstoCode == proc.skuCode) &&
                            (string.IsNullOrWhiteSpace(_condi.batch) || x.pstoCode == proc.skuCode) &&
                            (string.IsNullOrWhiteSpace(_condi.lot) || x.pstoCode == proc.skuCode) &&
                            (string.IsNullOrWhiteSpace(_condi.orderNo) || x.pstoCode == proc.skuCode) &&
                            (string.IsNullOrWhiteSpace(_condi.options) || x.pstoOptions.QryStrContainsKeyValue(_condi.options)) &&
                            (!proc.useExpireDate || (x.pstoExpiryDate.HasValue && x.pstoExpiryDate.Value > DateTime.Today)) &&
                            (!proc.useShelfLifeDate || (x.pstoOptions.QryStrContainsKey("shelflifedate") && x.pstoOptions.QryStrGetValue("shelflifedate").GetDate().Value >= DateTime.Today)) &&
                            (!proc.useExpireDate || (x.pstoOptions.QryStrContainsKey("incubatedate") && x.pstoOptions.QryStrGetValue("incubatedate").GetDate().Value < DateTime.Today))
                        ).ToList().Clone();

                        if (_pickStos.Count > 0)
                        {
                            _pickStos.ForEach(x =>
                            {
                                if (_condi.baseQty.Value > 0)
                                {
                                    var a = (x.pstoBaseQty - x.pickBaseQty);//เศษที่เหลือจากการหยิบ
                                    x.pickBaseQty = (a <= _condi.baseQty.Value ? a : _condi.baseQty.Value);
                                    _condi.baseQty -= x.pickBaseQty;
                                    tmpStoProcs.First(y => y.pstoID == x.pstoID).pickBaseQty += x.pickBaseQty;//เพิ่มรายการที่หยิบเข้า TEMP
                                }
                                else
                                    x.pickBaseQty = 0;
                            });
                            _pickStos.RemoveAll(x => x.pickBaseQty == 0);//ลบสินค้าที่ไม่ได้หยิบ
                            pickStos.AddRange(_pickStos);//เพิ่มลงรายการที่จะหยิบ
                        }
                    }


                    if (!_condi.baseQty.HasValue || (_condi.baseQty.HasValue && _condi.baseQty.Value > 0))//query ใหม่จาก DB
                    {
                        SPInSTOProcessQueueCriteria stoProcCri = new SPInSTOProcessQueueCriteria()
                        {
                            locationCode = proc.locationCode,
                            baseCode = proc.baseCode,
                            skuCode = proc.skuCode,
                            eventStatuses = proc.eventStatuses,
                            condition = _condi,
                            orderBys = proc.orderBys,
                            useExpireDate = proc.useExpireDate,
                            usePickFull = proc.useFullPallet,
                            useIncubateDate = proc.useIncubateDate,
                            useShelfLifeDate = proc.useShelfLifeDate,
                            warehouseCode = desASRSWm.Code,
                            not_pstoIDs = tmpStoProcs.Select(x => x.pstoID).ToList()
                        };
                        var _pickStos = ADO.StorageObjectADO.GetInstant().ListByProcessQueue(stoProcCri, this.BuVO);
                        //this.ValidateWCS(_pickStos, desASRSWm, reqVO);

                        if (proc.baseQty.HasValue)
                            tmpStoProcs.AddRange(_pickStos);
                        else if (proc.percentRandom.HasValue)
                        {
                            _pickStos = _pickStos.RandomList(proc.percentRandom.Value);
                            tmpStoProcs.AddRange(_pickStos);
                        }
                        pickStos.AddRange(_pickStos);
                    }

                }
            }

            return res;
        }
        private void ValidateWCS(List<SPOutSTOProcessQueueCriteria> _pickStos, ams_Warehouse desASRSWm, TReq reqVO)
        {
            WCSQueueApi.TReq req = new WCSQueueApi.TReq()
            {
                queueOut = _pickStos.Select(x => new WCSQueueApi.TReq.queueout()
                {
                    queueID = null,
                    desWarehouseCode = desASRSWm.Code,
                    desAreaCode = reqVO.desASRSAreaCode,
                    desLocationCode = reqVO.desASRSLocationCode,
                    priority = 0,
                    baseInfo = new WCSQueueApi.TReq.queueout.baseinfo()
                    {
                        baseCode = x.rstoCode,
                        packInfos = null
                    }
                }).ToList()
            };
            var wcsRes = ADO.QueueApi.WCSQueueApi.GetInstant().SendReady(req, this.BuVO);
            if(wcsRes._result.resultcheck == 0)
            {
                throw new AMWException(this.Logger, AMWExceptionCode.B0001, wcsRes._result.resultmessage);
            }
        }
        private void ValidateReqVO(TReq reqVO)
        {
            foreach(var proc in reqVO.processQueues)
            {
                if (string.IsNullOrWhiteSpace(proc.locationCode)
                    && string.IsNullOrWhiteSpace(proc.baseCode)
                    && string.IsNullOrWhiteSpace(proc.skuCode))
                {
                    throw new AMWUtil.Exception.AMWException(this.Logger, AMWExceptionCode.V1001, "locationCode / baseCode / skuCode not Found.");
                }
                if (!proc.baseQty.HasValue && !proc.percentRandom.HasValue)
                {
                    throw new AMWUtil.Exception.AMWException(this.Logger, AMWExceptionCode.V1001, "baseQty / percentRandom not Found.");
                }
                if (proc.baseQty != proc.conditions.Sum(x => x.baseQty))
                {
                    throw new AMWUtil.Exception.AMWException(this.Logger, AMWExceptionCode.V1002,
                        "Qty("
                        + proc.baseQty
                        + ") Item "
                        + string.Format("{0}{1}{2}", proc.locationCode, proc.baseCode, proc.skuCode) + " "
                        + " not Equals Summary Qty("
                        + proc.conditions.Sum(x => x.baseQty)
                        + ") Codition");
                }
            }
        }

    }
}
