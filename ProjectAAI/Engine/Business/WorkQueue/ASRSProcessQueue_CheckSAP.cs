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
using AWMSModel.Constant.StringConst;

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

                //check sap and update docItem
                ZSWMRF003_IN_REQ req_ZWMRF003 = new ZSWMRF003_IN_REQ()
                {
                    LGNUM = "W01",
                    ZMODE = doc.Ref1
                };
                var docItem = doc.DocumentItems[i];
                var statusSapRes = false;
                switch (doc.Ref1)
                {
                    case "R01":
                        req_ZWMRF003.LENUM = docItem.Code ?? docItem.RefID;
                        req_ZWMRF003.LGTYP = ObjectUtil.QryStrGetValue(docItem.Options, "lgtyp");
                        req_ZWMRF003.LGBER = ObjectUtil.QryStrGetValue(docItem.Options, "lgber");
                        req_ZWMRF003.LGPLA = ObjectUtil.QryStrGetValue(docItem.Options, "lgpla");
                        var res_ZWMRF003_r1 = SAPInterfaceADO.GetInstant().ZWMRF003(req_ZWMRF003, buVO);

                        if (res_ZWMRF003_r1.status == 1 && res_ZWMRF003_r1.datas.Count != 0)
                        {
                            statusSapRes = true;
                            docItem.Code = int.Parse(res_ZWMRF003_r1.datas[0].LENUM).ToString();
                            docItem.RefID = int.Parse(res_ZWMRF003_r1.datas[0].LENUM).ToString();
                            docItem.Ref2 = res_ZWMRF003_r1.datas[0].BWLVS;
                            docItem.Options = "lenum=" + int.Parse(res_ZWMRF003_r1.datas[0].LENUM).ToString() +
                                "&lgtyp=" + res_ZWMRF003_r1.datas[0].LGTYP +
                                "&lgber=" + res_ZWMRF003_r1.datas[0].LGBER +
                                "&lgpla=" + res_ZWMRF003_r1.datas[0].LGPLA +
                                "&bestq_ur=" + res_ZWMRF003_r1.datas[0].BESTQ_UR +
                                "&bestq_qi=" + res_ZWMRF003_r1.datas[0].BESTQ_QI +
                                "&bestq_blk=" + res_ZWMRF003_r1.datas[0].BESTQ_BLK +
                                "&basecode=" + int.Parse(res_ZWMRF003_r1.datas[0].LENUM).ToString();
                        }
                        break;
                    case "R02":
                        req_ZWMRF003.RSNUM = long.Parse(docItem.RefID);
                        var res_ZWMRF003_r2 = SAPInterfaceADO.GetInstant().ZWMRF003(req_ZWMRF003, buVO);
                        if (res_ZWMRF003_r2.status == 1 && res_ZWMRF003_r2.datas.Count != 0)
                        {
                            statusSapRes = true;
                            docItem.Code = res_ZWMRF003_r2.datas[i].MATNR;
                            docItem.Quantity = res_ZWMRF003_r2.datas[i].BDMNG;
                            docItem.BaseQuantity = res_ZWMRF003_r2.datas[i].BDMNG;
                            docItem.RefID = res_ZWMRF003_r2.datas[i].RSNUM.ToString();
                            docItem.Ref2 = res_ZWMRF003_r2.datas[i].BWLVS;
                            docItem.Options = "bestq_ur=" + res_ZWMRF003_r2.datas[i].BESTQ_UR +
                                "&bestq_qi=" + res_ZWMRF003_r2.datas[i].BESTQ_QI +
                                "&bestq_blk=" + res_ZWMRF003_r2.datas[i].BESTQ_BLK +
                                "&rsnum=" + res_ZWMRF003_r2.datas[i].RSNUM +
                                "&lgtyp=" + res_ZWMRF003_r2.datas[i].LGTYP +
                                "&lgpla=" + res_ZWMRF003_r2.datas[i].LGPLA;
                        }
                        break;
                    case "R03":
                        req_ZWMRF003.RSNUM = long.Parse(docItem.RefID);
                        req_ZWMRF003.MATNR = docItem.Code;
                        req_ZWMRF003.LENUM = ObjectUtil.QryStrGetValue(docItem.Options, "lenum");
                        req_ZWMRF003.BESTQ_UR = ObjectUtil.QryStrGetValue(docItem.Options, "bestq_ur");
                        req_ZWMRF003.BESTQ_QI = ObjectUtil.QryStrGetValue(docItem.Options, "bestq_qi");
                        req_ZWMRF003.BESTQ_BLK = ObjectUtil.QryStrGetValue(docItem.Options, "bestq_blk");
                        var res_ZWMRF003_r3 = SAPInterfaceADO.GetInstant().ZWMRF003(req_ZWMRF003, buVO);
                        if (res_ZWMRF003_r3.status == 1 && res_ZWMRF003_r3.datas.Count != 0)
                        {
                            statusSapRes = true;
                            docItem.Code = res_ZWMRF003_r3.datas[0].MATNR;
                            docItem.Quantity = res_ZWMRF003_r3.datas[0].BDMNG;
                            docItem.BaseQuantity = res_ZWMRF003_r3.datas[0].BDMNG;
                            docItem.RefID = res_ZWMRF003_r3.datas[0].RSNUM.ToString();
                            docItem.Ref2 = res_ZWMRF003_r3.datas[0].BWLVS;
                            docItem.Options = "bestq_ur=" + res_ZWMRF003_r3.datas[0].BESTQ_UR +
                                "&bestq_qi=" + res_ZWMRF003_r3.datas[0].BESTQ_QI +
                                "&bestq_blk=" + res_ZWMRF003_r3.datas[0].BESTQ_BLK +
                                "&lgtyp=" + res_ZWMRF003_r3.datas[0].LGTYP +
                                "&lgpla=" + res_ZWMRF003_r3.datas[0].LGPLA +
                                "&lenum=" + (!String.IsNullOrEmpty(res_ZWMRF003_r3.datas[0].LENUM) ? int.Parse(res_ZWMRF003_r3.datas[0].LENUM).ToString() : "") +
                                "&rsnum=" + res_ZWMRF003_r3.datas[0].RSNUM;
                        }
                        break;
                    case "R04":
                        req_ZWMRF003.RSNUM = long.Parse(docItem.RefID);
                        req_ZWMRF003.LENUM = ObjectUtil.QryStrGetValue(docItem.Options, "lenum");
                        req_ZWMRF003.BESTQ_UR = ObjectUtil.QryStrGetValue(docItem.Options, "bestq_ur");
                        req_ZWMRF003.BESTQ_QI = ObjectUtil.QryStrGetValue(docItem.Options, "bestq_qi");
                        req_ZWMRF003.BESTQ_BLK = ObjectUtil.QryStrGetValue(docItem.Options, "bestq_blk");
                        var res_ZWMRF003_r4 = SAPInterfaceADO.GetInstant().ZWMRF003(req_ZWMRF003, buVO);
                        if (res_ZWMRF003_r4.status == 1 && res_ZWMRF003_r4.datas.Count != 0)
                        {
                            statusSapRes = true;
                            docItem.Code = res_ZWMRF003_r4.datas[i].MATNR;
                            docItem.Quantity = res_ZWMRF003_r4.datas[i].BDMNG;
                            docItem.BaseQuantity = res_ZWMRF003_r4.datas[i].BDMNG;
                            docItem.RefID = res_ZWMRF003_r4.datas[i].RSNUM.ToString();
                            docItem.Ref2 = res_ZWMRF003_r4.datas[i].BWLVS;
                            docItem.Options = "bestq_ur=" + res_ZWMRF003_r4.datas[i].BESTQ_UR +
                                "&bestq_qi=" + res_ZWMRF003_r4.datas[i].BESTQ_QI +
                                "&bestq_blk=" + res_ZWMRF003_r4.datas[i].BESTQ_BLK +
                                "&lgtyp=" + res_ZWMRF003_r4.datas[i].LGTYP +
                                "&lgpla=" + res_ZWMRF003_r4.datas[i].LGPLA +
                                "&lenum=" + (!String.IsNullOrEmpty(res_ZWMRF003_r4.datas[i].LENUM) ? int.Parse(res_ZWMRF003_r4.datas[i].LENUM).ToString() : "") +
                                "&basecode=" + (!String.IsNullOrEmpty(res_ZWMRF003_r4.datas[i].LENUM) ? int.Parse(res_ZWMRF003_r4.datas[i].LENUM).ToString() : "") +
                                "&rsnum=" + res_ZWMRF003_r4.datas[i].RSNUM;
                        }
                        break;
                    case "R05":
                        req_ZWMRF003.VBELN_VL = docItem.RefID;
                        req_ZWMRF003.POSNR = long.Parse(ObjectUtil.QryStrGetValue(docItem.Options, "posnr"));
                        req_ZWMRF003.MATNR = docItem.Code.PadLeft(18, '0');
                        req_ZWMRF003.CHARG = docItem.Batch;
                        var res_ZWMRF003_r5 = SAPInterfaceADO.GetInstant().ZWMRF003(req_ZWMRF003, buVO);
                        if (res_ZWMRF003_r5.status == 1 && res_ZWMRF003_r5.datas.Count != 0)
                        {
                            statusSapRes = true;
                            docItem.Code = int.Parse(res_ZWMRF003_r5.datas[0].MATNR).ToString();
                            docItem.Quantity = res_ZWMRF003_r5.datas[0].BDMNG;
                            docItem.BaseQuantity = res_ZWMRF003_r5.datas[0].BDMNG;
                            docItem.Batch = res_ZWMRF003_r5.datas[0].CHARG;
                            docItem.RefID = res_ZWMRF003_r5.datas[0].VBELN_VL;
                            docItem.Ref2 = res_ZWMRF003_r5.datas[0].BWLVS;
                            docItem.Options = "bestq_ur=" + res_ZWMRF003_r5.datas[0].BESTQ_UR +
                                "&bestq_qi=" + res_ZWMRF003_r5.datas[0].BESTQ_QI +
                                "&bestq_blk=" + res_ZWMRF003_r5.datas[0].BESTQ_BLK +
                                "&lgtyp=" + res_ZWMRF003_r5.datas[0].LGTYP +
                                "&vbeln_vl=" + res_ZWMRF003_r5.datas[0].VBELN_VL +
                                "&posnr=" + res_ZWMRF003_r5.datas[0].POSNR +
                                "&vbeln=" + res_ZWMRF003_r5.datas[0].VBELN;
                        }
                        break;
                    case "R06":
                        req_ZWMRF003.MATNR = docItem.Code;
                        req_ZWMRF003.CHARG = docItem.Batch;
                        req_ZWMRF003.LGTYP = ObjectUtil.QryStrGetValue(docItem.Options, "lgtyp");
                        req_ZWMRF003.LGBER = ObjectUtil.QryStrGetValue(docItem.Options, "lgber");
                        req_ZWMRF003.LGPLA = ObjectUtil.QryStrGetValue(docItem.Options, "lgpla");
                        req_ZWMRF003.BESTQ_UR = ObjectUtil.QryStrGetValue(docItem.Options, "bestq_ur");
                        req_ZWMRF003.BESTQ_QI = ObjectUtil.QryStrGetValue(docItem.Options, "bestq_qi");
                        req_ZWMRF003.BESTQ_BLK = ObjectUtil.QryStrGetValue(docItem.Options, "bestq_blk");
                        var res_ZWMRF003_r6 = SAPInterfaceADO.GetInstant().ZWMRF003(req_ZWMRF003, buVO);
                        if (res_ZWMRF003_r6.status == 1 && res_ZWMRF003_r6.datas.Count != 0)
                        {
                            statusSapRes = true;
                            docItem.RefID = res_ZWMRF003_r6.datas[0].MATNR;
                            docItem.Code = res_ZWMRF003_r6.datas[0].MATNR;
                            docItem.Batch = res_ZWMRF003_r6.datas[0].CHARG;
                            docItem.Ref2 = res_ZWMRF003_r6.datas[0].BWLVS;
                            docItem.Options = "bestq_ur=" + res_ZWMRF003_r6.datas[0].BESTQ_UR +
                                "&bestq_qi=" + res_ZWMRF003_r6.datas[0].BESTQ_QI +
                                "&bestq_blk=" + res_ZWMRF003_r6.datas[0].BESTQ_BLK +
                                "&lgtyp=" + res_ZWMRF003_r6.datas[0].LGTYP +
                                "&lgber=" + res_ZWMRF003_r6.datas[0].LGBER +
                                "&lgpla=" + res_ZWMRF003_r6.datas[0].LGPLA;
                        }
                        break;
                }
                if (statusSapRes)
                    AWMSEngine.ADO.DocumentADO.GetInstant().PutItem(docItem, buVO);

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
                    //doc.DocumentItems.First(x=>x.ID==proc.docItemID).Code
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
                            (string.IsNullOrWhiteSpace(_condi.batch) || x.pstoCode == proc.skuCode) &&
                            (string.IsNullOrWhiteSpace(_condi.lot) || x.pstoCode == proc.skuCode) &&
                            (string.IsNullOrWhiteSpace(_condi.orderNo) || x.pstoCode == proc.skuCode) &&
                            (string.IsNullOrWhiteSpace(_condi.options) || x.pstoOptions.QryStrContainsKeyValue(_condi.options)) &&
                            (!proc.useExpireDate || (x.pstoExpiryDate.HasValue && x.pstoExpiryDate.Value > DateTime.Today)) &&
                            (!proc.useShelfLifeDate || (x.pstoOptions.QryStrContainsKey(OptionVOConst.OPT_SHLD) && x.pstoOptions.QryStrGetValue(OptionVOConst.OPT_SHLD).GetDate().Value >= DateTime.Today)) &&
                            (!proc.useExpireDate || (x.pstoOptions.QryStrContainsKey(OptionVOConst.OPT_INCBD) && x.pstoOptions.QryStrGetValue(OptionVOConst.OPT_INCBD).GetDate().Value < DateTime.Today))
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
            foreach (var item in res.processResults[0].processResultItems)
            {
                foreach (var pickSto in item.pickStos)
                {
                    var res_req_ZWMRF001 = SAPInterfaceADO.GetInstant().ZWMRF001(pickSto.bstoCode, buVO);
                    if (res_req_ZWMRF001.status == 1 && res_req_ZWMRF001.datas.Count != 0)
                    {
                        var bsto = AWMSEngine.ADO.StorageObjectADO.GetInstant().Get(pickSto.bstoID, StorageObjectType.BASE, false, false, buVO);
                        bsto.ref2 = res_req_ZWMRF001.datas[0].LGTYP;
                        AWMSEngine.ADO.StorageObjectADO.GetInstant().PutV2(bsto, buVO);

                        var psto = AWMSEngine.ADO.StorageObjectADO.GetInstant().Get(pickSto.pstoID, StorageObjectType.PACK, false, false, buVO);
                        psto.ref2 = res_req_ZWMRF001.datas[0].LGTYP;
                        AWMSEngine.ADO.StorageObjectADO.GetInstant().PutV2(psto, buVO);
                    }
                }
            };
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
        private SapResponse<ZSWMRF001_OUT_SU> SendDataToSAP_IN_SU(string data, VOCriteria buVO)
        {
            var res = SAPInterfaceADO.GetInstant().ZWMRF001(data, buVO);
            return res;
        }
    }
}
