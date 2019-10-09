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
using AWMSEngine.ADO.StaticValue;
using AWMSEngine.ADO;
using System.Globalization;

namespace ProjectAAI.Engine.Business.WorkQueue
{
    public class ASRSProcessQueue_CheckSAP : IProjectEngine<ASRSProcessQueue.TReq, ASRSProcessQueue.TRes>
    {

        public ASRSProcessQueue.TRes ExecuteEngine(AMWLogger logger, VOCriteria buVO, ASRSProcessQueue.TReq reqVO)
        {
            List<amt_Document> docs = AWMSEngine.ADO.DocumentADO.GetInstant().ListAndItem(
               reqVO.processQueues.GroupBy(x => x.docID).Select(x => x.Key).ToList()
               , buVO);
            CheckDocumentFromSAP(buVO, reqVO, docs);
            CheckStoFromSAP(buVO, reqVO);

            return null;
        }
        private void CheckDocumentFromSAP(VOCriteria buVO, ASRSProcessQueue.TReq reqVO, List<amt_Document> docs)
        {
            var processQueues = reqVO.processQueues.OrderByDescending(x => x.priority).ToList();

            int i = 0;
            foreach (var proc in processQueues)
            {
                var doc = docs.First(x => x.ID == proc.docID);
                var docItem = doc.DocumentItems[i];
                var statusSapRes = false;
                ZSWMRF003_IN_REQ req_ZWMRF003 = new ZSWMRF003_IN_REQ()
                {
                    LGNUM = "W01",
                    ZMODE = doc.Ref1
                };

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
                            //res_ZWMRF003_r1.datas.ForEach(x =>
                            //{
                            //    statusSapRes = true;
                            //    var options = ObjectUtil.QryStrSetValue(null,
                            //        new KeyValuePair<string, object>(OptionVOConst.OPT_LENUM, int.Parse(x.LENUM)),
                            //        new KeyValuePair<string, object>(OptionVOConst.OPT_LGTYP, x.LGTYP),
                            //        new KeyValuePair<string, object>(OptionVOConst.OPT_LGBER, x.LGBER),
                            //        new KeyValuePair<string, object>(OptionVOConst.OPT_LGPLA, x.LGPLA),
                            //        new KeyValuePair<string, object>(OptionVOConst.OPT_BESTQ_UR, x.BESTQ_UR),
                            //        new KeyValuePair<string, object>(OptionVOConst.OPT_BESTQ_QI, x.BESTQ_QI),
                            //        new KeyValuePair<string, object>(OptionVOConst.OPT_BESTQ_BLK, x.BESTQ_BLK),
                            //        new KeyValuePair<string, object>(OptionVOConst.OPT_BASECODE, int.Parse(x.LENUM))
                            //    );
                            //    docItem.Code = int.Parse(x.LENUM).ToString();
                            //    docItem.RefID = int.Parse(x.LENUM).ToString();
                            //    docItem.Ref2 = x.BWLVS;
                            //    docItem.Options = options;
                            //});

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
            }
        }
        private void CheckStoFromSAP(VOCriteria buVO, ASRSProcessQueue.TReq reqVO)
        {
            //var warehouse = StaticValueManager.GetInstant().Warehouses.First(x => x.ID == doc.Sou_Warehouse_ID);
            var searchList = reqVO.processQueues.Select(x => new SPInSTOProcessQueueCriteria()
            {
                baseCode = x.baseCode,
                eventStatuses = new List<StorageObjectEventStatus>() { StorageObjectEventStatus.HOLD, StorageObjectEventStatus.QC, StorageObjectEventStatus.RECEIVED },
                locationCode = x.locationCode,
                not_pstoIDs = null,
                orderBys = x.orderBys,
                skuCode = x.skuCode,
                useExpireDate = x.useExpireDate,
                useFullPick = x.useFullPick,
                useIncubateDate = x.useIncubateDate,
                useShelfLifeDate = x.useShelfLifeDate,
                warehouseCode = "W01",// by docObj
                condition = new SPInSTOProcessQueueCriteria.ConditionProcess()
                {
                    baseQty = null,
                    batch = x.conditions.First().batch,
                    lot = x.conditions.First().lot,
                    options = x.conditions.First().options,
                    orderNo = x.conditions.First().orderNo
                }
            });

            List<SPOutSTOProcessQueueCriteria> suList = new List<SPOutSTOProcessQueueCriteria>();
            foreach (var search in searchList)
            {
                search.not_pstoIDs = new List<long>();
                var su = AWMSEngine.ADO.StorageObjectADO.GetInstant().ListByProcessQueue(search, buVO);
                suList.AddRange(su);
            }

            //1 Z01
            //var pList = suList.GroupBy(x => new { x.rstoID, x.pstoID, x.rstoCode, x.pstoCode, x.pstoBatch, x.pstoEventStatus }).Select(x => x.Key);
            var suCodeList = suList.GroupBy(x => new { x.rstoCode }).Select(x => x.Key).Select(x => x.rstoCode).ToArray();
            var sapRes = SAPInterfaceADO.GetInstant().ZWMRF001V2(suCodeList, buVO);//send su
            StorageObjectEventStatus doneEStatus = StorageObjectEventStatus.RECEIVED;
            if (sapRes.status == 1)
            {
                var i = 0;
                sapRes.datas.OUT_SU.ForEach(x =>
                {
                    //var bsto = AWMSEngine.ADO.StorageObjectADO.GetInstant().Get(su.bstoID, StorageObjectType.BASE, false, false, buVO);
                    var psto = StorageObjectADO.GetInstant().Get(suList[i].pstoID, StorageObjectType.PACK, false, false, buVO);

                    DateTime? productDate = x.HSDAT == "00000000" ? (DateTime?)null : DateTime.ParseExact(x.HSDAT, "yyyyMMdd", CultureInfo.InvariantCulture); //"20190527" Date of Manufacture
                    DateTime? expiryDate = x.VFDAT == "00000000" ? (DateTime?)null : DateTime.ParseExact(x.VFDAT, "yyyyMMdd", CultureInfo.InvariantCulture); //"20190527" Shelf Life 
                    DateTime? incubatedate = productDate == null ? (DateTime?)null : x.WEBAZ != 0 ? productDate.Value.AddDays(Convert.ToDouble(x.WEBAZ) - 1) : (DateTime?)null;
                    DateTime? fvdt1 = x.FVDT1 == "00000000" ? (DateTime?)null : DateTime.ParseExact(x.FVDT1, "yyyyMMdd", CultureInfo.InvariantCulture);

                    var shld = expiryDate == null ? null : DateTimeUtil.ToISOUTCString(expiryDate.Value);
                    var incb = incubatedate == null ? null : DateTimeUtil.ToISOUTCString(incubatedate.Value);
                    var approveddate = fvdt1 == null ? null : DateTimeUtil.ToISOUTCString(fvdt1.Value);

                    if (x.BESTQ == "S")
                    {
                        doneEStatus = StorageObjectEventStatus.HOLD;
                    }
                    else if (x.BESTQ == "Q")
                    {
                        doneEStatus = StorageObjectEventStatus.QC;
                    }
                    var options = ObjectUtil.QryStrSetValue(null,
                           // new KeyValuePair<string, object>(OptionVOConst.OPT_LGTYP, pack.LGTYP),
                           new KeyValuePair<string, object>(OptionVOConst.OPT_BESTQ, x.BESTQ), //Stock Category 
                           new KeyValuePair<string, object>(OptionVOConst.OPT_DONE_DES_EVENT_STATUS, doneEStatus.GetValueInt()),
                           new KeyValuePair<string, object>(OptionVOConst.OPT_WEBAZ, x.WEBAZ), //Incubated Time
                           new KeyValuePair<string, object>(OptionVOConst.OPT_HSDAT, x.HSDAT), //Date of Manufacture
                           new KeyValuePair<string, object>(OptionVOConst.OPT_SHLD, shld), //Shelf Life Date
                           new KeyValuePair<string, object>(OptionVOConst.OPT_VBELN, x.VBELN), //sales order 
                           new KeyValuePair<string, object>(OptionVOConst.OPT_INCBD, incb), //Incubated Date
                           new KeyValuePair<string, object>(OptionVOConst.OPT_FVDT1, approveddate) //approved date 
                           );
                    psto.ref1 = fvdt1 == null ? null : "y"; //ถ้ามีค่า approved date ให้ใส่เป็น y ถ้าไม่มีใส่ null
                    psto.options = options;
                    //psto.ref2 = x.LGTYP;
                    //psto.qty = x.VERME;
                    //psto.baseQty = x.VERME;

                    //AWMSEngine.ADO.StorageObjectADO.GetInstant().PutV2(bsto, buVO);
                    StorageObjectADO.GetInstant().PutV2(psto, buVO);
                    i++;
                });
            }

            //1 Z07
            /*
             var matCodeList = suList.GroupBy(x => new { x.pstoCode, x.pstoBatch, x.pstoEventStatus })
                .Select(x => new { pstoCode = x.Key.pstoCode, pstoBatch = x.Key.pstoBatch, pstoEventStatus = x.Key.pstoEventStatus, rstoIDs = x.Select(y => y.rstoID).ToArray() })
                .ToList();

            foreach (var matCode in matCodeList)
            {
                var sapRes = ADO.SAPApi.SAPInterfaceADO.GetInstant().ZWMRF007(matCode.pstoCode,matCode.pstoBatch, buVO);//send su
                 if (sapRes.status == 1)
                 {
                     matCode.rstoIDs//where in root id (STO) //ID or ParentStorageObjectID and Mat,Batch
                sapRes.datas.ForEach(x => { x. })//check su --suCodeList
                 }

            }
            */
        }
    }
}
