using AMWUtil.Common;
using AMWUtil.Exception;
using AWMSEngine.ADO.QueueApi;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Constant.StringConst;
using AWMSModel.Criteria;
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
            public string desASRSWarehouseCode;
            public string desASRSAreaCode;
            public string desASRSLocationCode;
            public List<ProcessQueueCriteria> processQueues;
            public bool lockNotExistsRandom = false;

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
                public bool useFullPick;

                public decimal? baseQty;
                public int? percentRandom;


                public List<SPInSTOProcessQueueCriteria.ConditionProcess> conditions;
                public List<StorageObjectEventStatus> eventStatuses;
                public List<AuditStatus> auditStatuses;
                public List<SPInSTOProcessQueueCriteria.OrderByProcess> orderBys;
            }
        }
        public class TRes
        {
            public string desASRSWarehouseCode;
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
                    public int priority;
                    public decimal? baseQty;
                    public decimal? percentRandom;
                    public List<SPOutSTOProcessQueueCriteria> pickStos;
                    public List<SPOutSTOProcessQueueCriteria> lockStos;
                }
            }
        }

        protected override TRes ExecuteEngine(TReq reqVO)
        {
            TRes res = null;
            if (res == null)
            {
                this.ValidateReqVO(reqVO);

                TRes response = new TRes()
                {
                    processResults = new List<TRes.ProcessQueueResult>(),
                    desASRSWarehouseCode = reqVO.desASRSWarehouseCode,
                    desASRSAreaCode = reqVO.desASRSAreaCode,
                    desASRSLocationCode = reqVO.desASRSLocationCode
                };
                var desASRSWm = this.StaticValue.Warehouses.First(x => x.Code == reqVO.desASRSWarehouseCode);
                List<amt_Document> docs = ADO.DocumentADO.GetInstant().ListAndItem(
                    reqVO.processQueues.GroupBy(x => x.docID).Select(x => x.Key).ToList()
                    , this.BuVO);
                List<SPOutSTOProcessQueueCriteria> tmpStoProcs = new List<SPOutSTOProcessQueueCriteria>();
                List<SPOutSTOProcessQueueCriteria> resStoProcs = new List<SPOutSTOProcessQueueCriteria>();
                var processQueues = reqVO.processQueues.OrderByDescending(x => x.priority).ToList();

                foreach (var proc in processQueues)
                {
                    TRes.ProcessQueueResult processRes = response.processResults.FirstOrDefault(x => x.docID == proc.docID);
                    var doc = docs.First(x => x.ID == proc.docID);
                    var souWM = this.StaticValue.Warehouses.First(x => x.ID == doc.Sou_Warehouse_ID);
                    if (processRes == null)
                    {
                        processRes = new TRes.ProcessQueueResult()
                        {
                            docID = proc.docID,
                            docCode = doc.Code,
                            processResultItems = new List<TRes.ProcessQueueResult.ProcessQueueResultItem>()
                        };
                        response.processResults.Add(processRes);
                    }

                    var docItem = doc.DocumentItems.First(x => x.ID == proc.docItemID);

                    var processResItem = new TRes.ProcessQueueResult.ProcessQueueResultItem()
                    {
                        docItemID = proc.docItemID,
                        docItemCode = docItem.Code,
                        baseQty = proc.baseQty,
                        priority = proc.priority,
                        percentRandom = proc.percentRandom,
                        pickStos = new List<SPOutSTOProcessQueueCriteria>(),
                        lockStos = new List<SPOutSTOProcessQueueCriteria>()
                    };
                    processRes.processResultItems.Add(processResItem);

                    //res.processResults.Add(processRes);
                    foreach (var condi in proc.conditions)
                    {

                        List<SPOutSTOProcessQueueCriteria> pickStos = processResItem.pickStos;
                        List<SPOutSTOProcessQueueCriteria> lockStos = processResItem.lockStos;
                        var _condi = condi.Clone();
                        if (_condi.baseQty.HasValue)//ตรวจพาเลทที่เคย query มาแล้วจากใน TEMP
                        {
                            var _pickStos = tmpStoProcs.Where(x =>
                                x.isWCSReady &&
                                x.pickBaseQty < x.pstoBaseQty &&
                                (!doc.Sou_Warehouse_ID.HasValue || x.warehouseID == doc.Sou_Warehouse_ID) &&
                                (string.IsNullOrWhiteSpace(proc.locationCode) || x.locationCode == proc.locationCode) &&
                                (string.IsNullOrWhiteSpace(proc.baseCode) || x.bstoCode == proc.baseCode) &&
                                (string.IsNullOrWhiteSpace(proc.skuCode) || x.pstoCode == proc.skuCode) &&
                                (string.IsNullOrWhiteSpace(_condi.batch) || x.pstoBatch == _condi.batch) &&
                                (string.IsNullOrWhiteSpace(_condi.lot) || x.pstoLot == _condi.lot) &&                               
                                (string.IsNullOrWhiteSpace(_condi.orderNo) || x.pstoOrderNo == _condi.orderNo) &&
                                (string.IsNullOrWhiteSpace(_condi.options) || x.pstoOptions.QryStrContainsKeyValue(_condi.options)) &&
                                (!proc.useExpireDate || (x.pstoExpiryDate.HasValue && x.pstoExpiryDate.Value > DateTime.Today)) &&
                                (!proc.useShelfLifeDate || (x.pstoOptions.QryStrContainsKey(OptionVOConst.OPT_SHLD) && x.pstoOptions.QryStrGetValue(OptionVOConst.OPT_SHLD).GetDate().Value >= DateTime.Today)) &&
                                (!proc.useIncubateDate || (x.pstoOptions.QryStrContainsKey(OptionVOConst.OPT_INCBD) && x.pstoOptions.QryStrGetValue(OptionVOConst.OPT_INCBD).GetDate().Value < DateTime.Today))
                            ).ToList().Clone();

                            if (_pickStos.Count > 0)
                            {
                                _pickStos.ForEach(x =>
                                {
                                    if (_condi.baseQty.Value > 0)
                                    {
                                        var a = (x.pstoBaseQty - x.pickBaseQty);//เศษที่เหลือจากการหยิบ
                                        var b = (x.pstoQty - x.pickQty);//เศษที่เหลือจากการหยิบ
                                        x.pickBaseQty = (a <= _condi.baseQty.Value ? a : _condi.baseQty.Value);

                                        var _condiQty = this.StaticValue.ConvertToNewUnitBySKU(x.SKUMasterID, x.pickBaseQty, x.pstoBaseUnitID, x.pstoUnitID);
                                        x.pickQty = (b <= _condiQty.newQty ? b : _condiQty.newQty);
                                        _condi.baseQty -= x.pickBaseQty;

                                        var _tmp = tmpStoProcs.First(y => y.pstoID == x.pstoID);
                                        _tmp.pickBaseQty += x.pickBaseQty;//เพิ่มรายการที่หยิบเข้า TEMP
                                        _tmp.pickQty += x.pickQty;//เพิ่มรายการที่หยิบเข้า TEMP
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
                                auditStatuses = proc.auditStatuses,
                                condition = _condi,
                                orderBys = proc.orderBys,
                                useExpireDate = proc.useExpireDate,
                                useFullPick = proc.useFullPick,
                                useIncubateDate = proc.useIncubateDate,
                                useShelfLifeDate = proc.useShelfLifeDate,
                                warehouseCode = souWM.Code,
                                refID = docItem.RefID,
                                not_pstoIDs = tmpStoProcs.Select(x => x.pstoID).ToList(),
                                forCustomerID = doc.For_Customer_ID,
                                desCustomerID = doc.Des_Customer_ID
                            };
                            var _pickStos = ADO.StorageObjectADO.GetInstant().ListByProcessQueue(stoProcCri, this.BuVO);
                            this.ValidateWCS(_pickStos, reqVO);

                            if (proc.baseQty.HasValue)
                                tmpStoProcs.AddRange(_pickStos.Clone());
                            else if (proc.percentRandom.HasValue)
                            {
                                var _tmpPickStos = _pickStos.RandomList(proc.percentRandom.Value);
                                if (reqVO.lockNotExistsRandom)
                                    lockStos.AddRange(_pickStos.Where(x => !_tmpPickStos.Any(y => y.rstoID == x.rstoID)));
                                _pickStos = _tmpPickStos;
                                tmpStoProcs.AddRange(_pickStos.Clone());
                            }
                            pickStos.AddRange(_pickStos);
                        }

                    }
                }

                this.SetResponseForUseFullPick(response, tmpStoProcs);
                res = response;
            }
            return res;


        }
        private void SetResponseForUseFullPick(TRes res, List<SPOutSTOProcessQueueCriteria> tmpStoProcs)
        {
            foreach (var proc in res.processResults)
            {
                foreach (var procItem in proc.processResultItems)
                {
                    foreach (var pickSto in procItem.pickStos)
                    {
                        if (pickSto.useFullPick)
                        {
                            tmpStoProcs
                                .FindAll(x => x.rstoID == pickSto.rstoID && x.pickBaseQty < x.pstoBaseQty)
                                .ForEach(x =>
                                {
                                    var addPickBaseQty = x.pstoBaseQty - x.pickBaseQty;
                                    pickSto.pickBaseQty += addPickBaseQty;
                                    x.pickBaseQty = x.pstoBaseQty;

                                    var addPickQty = x.pstoQty - x.pickQty;
                                    pickSto.pickQty += addPickQty;
                                    x.pickQty = x.pstoQty;

                                });
                        }
                    }
                }
            }
        }

        private void ValidateWCS(List<SPOutSTOProcessQueueCriteria> _pickStos, TReq reqVO)
        {
            var getRsto = ADO.DataADO.GetInstant().SelectBy<amt_StorageObject>(new SQLConditionCriteria[] {
                new SQLConditionCriteria("ID", string.Join(",", _pickStos.Select(x => x.rstoID).Distinct().ToArray()), SQLOperatorType.IN)
            }, this.BuVO);


            WCSQueueADO.TReq req = new WCSQueueADO.TReq()
            {
                queueOut = _pickStos
                .Where(x => this.StaticValue.GetAreaMasterGroupType(x.areaID) == AreaMasterGroupType.STORAGE_AUTO)
                .Select(x => new WCSQueueADO.TReq.queueout()
                {
                    queueID = null,
                    desWarehouseCode = reqVO.desASRSWarehouseCode,
                    desAreaCode = reqVO.desASRSAreaCode,
                    desLocationCode = reqVO.desASRSLocationCode,
                    priority = 0,
                    baseInfo = new WCSQueueADO.TReq.queueout.baseinfo()
                    {
                        eventStatus = getRsto.FirstOrDefault(y => y.ID == x.rstoID).EventStatus,
                        baseCode = x.rstoCode,
                        packInfos = null
                    }
                }).ToList()
            };
            if (req.queueOut.Count > 0)
            {
                var wcsRes = ADO.QueueApi.WCSQueueADO.GetInstant().SendReady(req, this.BuVO);
                if (wcsRes._result.resultcheck == 0)
                {
                    throw new AMWException(this.Logger, AMWExceptionCode.B0001, "Pallet has Problems.");
                }
            }
        }
        private void ValidateReqVO(TReq reqVO)
        {
            foreach (var proc in reqVO.processQueues)
            {
                if (!proc.baseQty.HasValue && !proc.percentRandom.HasValue)
                    proc.percentRandom = 100;

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
                if (!proc.percentRandom.HasValue && proc.baseQty != proc.conditions.Sum(x => x.baseQty))
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
