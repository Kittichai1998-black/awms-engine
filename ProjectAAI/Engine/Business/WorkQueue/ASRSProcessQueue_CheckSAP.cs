using AMWUtil.Common;
using AMWUtil.Exception;
using AMWUtil.Logger;
using AWMSEngine.ADO.QueueApi;
using AWMSEngine.Engine;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Criteria;
using AWMSModel.Criteria.SP.Request;
using AWMSModel.Criteria.SP.Response;
using AWMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AWMSEngine.Engine.V2.Business.WorkQueue;
using static ProjectAAI.ADO.SAPApi.SAPCriteria;
using static ProjectAAI.ADO.SAPApi.SAPInterfaceADO;
using ProjectAAI.ADO.SAPApi;

namespace ProjectAAI.Engine.Business.WorkQueue
{
    public class ASRSProcessQueue_CheckSAP : IProjectEngine<ASRSProcessQueue.TReq, ASRSProcessQueue.TRes>
    {
        public ASRSProcessQueue.TRes ExecuteEngine(AMWLogger logger, VOCriteria buVO, ASRSProcessQueue.TReq reqVO)
        {
            var staticValue = AWMSEngine.ADO.StaticValue.StaticValueManager.GetInstant();
            this.ValidateReqVO(reqVO, logger);

            ASRSProcessQueue.TRes res = new ASRSProcessQueue.TRes()
            {
                processResults = new List<ASRSProcessQueue.TRes.ProcessQueueResult>(),
                desASRSWarehouseCode = reqVO.desASRSWarehouseCode,
                desASRSAreaCode = reqVO.desASRSAreaCode,
                desASRSLocationCode = reqVO.desASRSLocationCode
            };
            var desASRSWm = staticValue.Warehouses.First(x => x.Code == reqVO.desASRSWarehouseCode);
            List<amt_Document> docs = AWMSEngine.ADO.DocumentADO.GetInstant().ListAndItem(
                reqVO.processQueues.GroupBy(x => x.docID).Select(x => x.Key).ToList()
                , buVO);
            List<SPOutSTOProcessQueueCriteria> tmpStoProcs = new List<SPOutSTOProcessQueueCriteria>();
            List<SPOutSTOProcessQueueCriteria> resStoProcs = new List<SPOutSTOProcessQueueCriteria>();
            var processQueues = reqVO.processQueues.OrderByDescending(x => x.priority).ToList();

            int i = 0;
            foreach (var proc in processQueues)
            {
                ASRSProcessQueue.TRes.ProcessQueueResult processRes = res.processResults.FirstOrDefault(x => x.docID == proc.docID);
                var doc = docs.First(x => x.ID == proc.docID);
                var options = ObjectUtil.QryStrToKeyValues(doc.DocumentItems[i].Options);
                var RSNUM = ObjectUtil.QryStrGetValue(doc.DocumentItems[i].Options, "rsnum");
                if (doc.Ref1 == "R01" || doc.Ref1 == "R02" || doc.Ref1 == "R06")
                {
                    ZSWMRF004_IN_REQ req = new ZSWMRF004_IN_REQ()
                    {
                        ZMODE = doc.Ref1,
                        LGNUM = "W01",
                        LENUM = doc.Ref1 == "R01" ? doc.DocumentItems[i].Code : "",
                        GI_DOC = doc.Code,

                        MATNR = doc.Ref1 == "R02" || doc.Ref1 == "R06" ? doc.DocumentItems[i].Code : "",
                        CHARG = string.IsNullOrEmpty(doc.DocumentItems[i].Batch) ? "" : doc.DocumentItems[i].Batch,
                        BDMNG = doc.DocumentItems[i].Quantity,

                        LGTYP = ObjectUtil.QryStrGetValue(doc.DocumentItems[i].Options, "lgtyp"),
                        LGBER = ObjectUtil.QryStrGetValue(doc.DocumentItems[i].Options, "lgber"),
                        LGPLA = ObjectUtil.QryStrGetValue(doc.DocumentItems[i].Options, "lgpla"),
                        BWLVS = doc.Ref2,
                        BESTQ_UR = ObjectUtil.QryStrGetValue(doc.DocumentItems[i].Options, "bestq_ur"),
                        BESTQ_QI = ObjectUtil.QryStrGetValue(doc.DocumentItems[i].Options, "bestq_qi"),
                        BESTQ_BLK = ObjectUtil.QryStrGetValue(doc.DocumentItems[i].Options, "bestq_blk"),
                    };
                    if (RSNUM != "")
                    {
                        req.RSNUM = long.Parse(RSNUM);
                    }
                    SapResponse<ZSWMRF004_OUT_SAP> resSAP = SendDataToSAP_IN_REQ_R_1_2_6(req, buVO);
                    if (resSAP.status != 1)
                    {
                    }
                }
                else if (doc.Ref1 == "R03" || doc.Ref1 == "R04")
                {

                    ZSWMRF005_IN_REQ req = new ZSWMRF005_IN_REQ()
                    {
                        ZMODE = doc.Ref1,
                        LGNUM = "W01",
                        LENUM = ObjectUtil.QryStrGetValue(doc.DocumentItems[i].Options, "lenum"),
                        GI_DOC = doc.Code,

                        MATNR = doc.DocumentItems[i].Code,
                        CHARG = string.IsNullOrEmpty(doc.DocumentItems[i].Batch) ? "" : doc.DocumentItems[i].Batch,
                        BDMNG = doc.DocumentItems[i].Quantity,

                        LGTYP = ObjectUtil.QryStrGetValue(doc.DocumentItems[i].Options, "lgtyp"),
                        LGBER = ObjectUtil.QryStrGetValue(doc.DocumentItems[i].Options, "lgber"),
                        LGPLA = ObjectUtil.QryStrGetValue(doc.DocumentItems[i].Options, "lgpla"),
                        BWLVS = doc.Ref2,
                        BESTQ_UR = ObjectUtil.QryStrGetValue(doc.DocumentItems[i].Options, "bestq_ur"),
                        BESTQ_QI = ObjectUtil.QryStrGetValue(doc.DocumentItems[i].Options, "bestq_qi"),
                        BESTQ_BLK = ObjectUtil.QryStrGetValue(doc.DocumentItems[i].Options, "bestq_blk"),
                    };
                    if (RSNUM != "")
                    {
                        req.RSNUM = long.Parse(RSNUM);
                    }
                    SapResponse<ZSWMRF005_OUT_SAP> resSAP = SendDataToSAP_IN_REQ_R_3_4(req, buVO);
                    if (resSAP.status != 1)
                    {
                    }
                }
                else if (doc.Ref1 == "R05")
                {
                }

                var souWM = staticValue.Warehouses.First(x => x.ID == doc.Sou_Warehouse_ID);
                if (processRes == null)
                {
                    processRes = new ASRSProcessQueue.TRes.ProcessQueueResult()
                    {
                        docID = proc.docID,
                        docCode = doc.Code,
                        processResultItems = new List<ASRSProcessQueue.TRes.ProcessQueueResult.ProcessQueueResultItem>()
                    };
                    res.processResults.Add(processRes);
                }

                var processResItem = new ASRSProcessQueue.TRes.ProcessQueueResult.ProcessQueueResultItem()
                {
                    docItemID = proc.docItemID,
                    docItemCode = doc.DocumentItems.First(x => x.ID == proc.docItemID).Code,
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
                                    var b = (x.pstoQty - x.pickQty);//เศษที่เหลือจากการหยิบ
                                    x.pickBaseQty = (a <= _condi.baseQty.Value ? a : _condi.baseQty.Value);

                                    var _condiQty = staticValue.ConvertToNewUnitBySKU(x.SKUMasterID, x.pickBaseQty, x.pstoBaseUnitID, x.pstoUnitID);
                                    x.pickQty = (b <= _condiQty.qty ? b : _condiQty.qty);
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
                            condition = _condi,
                            orderBys = proc.orderBys,
                            useExpireDate = proc.useExpireDate,
                            useFullPick = proc.useFullPick,
                            useIncubateDate = proc.useIncubateDate,
                            useShelfLifeDate = proc.useShelfLifeDate,
                            warehouseCode = souWM.Code,
                            not_pstoIDs = tmpStoProcs.Select(x => x.pstoID).ToList()
                        };
                        var _pickStos = AWMSEngine.ADO.StorageObjectADO.GetInstant().ListByProcessQueue(stoProcCri, buVO);
                        this.ValidateWCS(_pickStos, reqVO, buVO, logger);

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
                i++;
            }
            this.SetResponseForUseFullPick(res, tmpStoProcs);
            return res;
        }
        private void SetResponseForUseFullPick(ASRSProcessQueue.TRes res, List<SPOutSTOProcessQueueCriteria> tmpStoProcs)
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
                                });
                        }
                    }
                }
            }
        }

        private void ValidateWCS(List<SPOutSTOProcessQueueCriteria> _pickStos, ASRSProcessQueue.TReq reqVO, VOCriteria buVO, AMWLogger logger)
        {
            var getRsto = AWMSEngine.ADO.DataADO.GetInstant().SelectBy<amt_StorageObject>(new SQLConditionCriteria[] {
                new SQLConditionCriteria("ID", string.Join(",", _pickStos.Select(x => x.rstoID).Distinct().ToArray()), SQLOperatorType.IN)
            }, buVO);

            WCSQueueADO.TReq req = new WCSQueueADO.TReq()
            {
                queueOut = _pickStos.Select(x => new WCSQueueADO.TReq.queueout()
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
                var wcsRes = AWMSEngine.ADO.QueueApi.WCSQueueADO.GetInstant().SendReady(req, buVO);
                if (wcsRes._result.resultcheck == 0)
                {
                    throw new AMWException(logger, AMWExceptionCode.B0001, "Pallet has Problems.");
                }
            }
        }
        private void ValidateReqVO(ASRSProcessQueue.TReq reqVO, AMWLogger logger)
        {
            foreach (var proc in reqVO.processQueues)
            {
                if (!proc.baseQty.HasValue && !proc.percentRandom.HasValue)
                    proc.percentRandom = 100;

                if (string.IsNullOrWhiteSpace(proc.locationCode)
                    && string.IsNullOrWhiteSpace(proc.baseCode)
                    && string.IsNullOrWhiteSpace(proc.skuCode))
                {
                    throw new AMWUtil.Exception.AMWException(logger, AMWExceptionCode.V1001, "locationCode / baseCode / skuCode not Found.");
                }
                if (!proc.baseQty.HasValue && !proc.percentRandom.HasValue)
                {
                    throw new AMWUtil.Exception.AMWException(logger, AMWExceptionCode.V1001, "baseQty / percentRandom not Found.");
                }
                if (!proc.percentRandom.HasValue && proc.baseQty != proc.conditions.Sum(x => x.baseQty))
                {
                    throw new AMWUtil.Exception.AMWException(logger, AMWExceptionCode.V1002,
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
        private SapResponse<ZSWMRF004_OUT_SAP> SendDataToSAP_IN_REQ_R_1_2_6(ZSWMRF004_IN_REQ data, VOCriteria buVO)
        {
            var res = SAPInterfaceADO.GetInstant().ZWMRF004_IN_REQ(data, buVO);
            return res;
        }
        private SapResponse<ZSWMRF005_OUT_SAP> SendDataToSAP_IN_REQ_R_3_4(ZSWMRF005_IN_REQ data, VOCriteria buVO)
        {
            var res = SAPInterfaceADO.GetInstant().ZWMRF005_IN_REQ(data, buVO);
            return res;
        }
    }
}
