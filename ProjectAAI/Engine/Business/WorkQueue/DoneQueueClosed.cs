using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AMWUtil.Common;
using AMWUtil.Exception;
using AMWUtil.Logger;
using AWMSEngine.ADO.StaticValue;
using AWMSEngine.Common;
using AWMSEngine.Engine;
using AWMSEngine.Engine.Business.Received;
using AWMSEngine.Engine.V2.Business.WorkQueue;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Constant.StringConst;
using AWMSModel.Criteria;
using AWMSModel.Criteria.SP.Request;
using AWMSModel.Entity;
using ProjectAAI.ADO.SAPApi;
using static ProjectAAI.ADO.SAPApi.SAPCriteria;
using static ProjectAAI.ADO.SAPApi.SAPInterfaceADO;

namespace ProjectAAI.Engine.Business.WorkQueue
{
    public class DoneQueueClosed : IProjectEngine<List<long>, List<long>>
    {
        public List<long> ExecuteEngine(AMWLogger logger, VOCriteria buVO, List<long> reqVO)
        {
             
            reqVO.ForEach(x =>
                {
                    var docs = AWMSEngine.ADO.DocumentADO.GetInstant().Get(x, buVO);
                    if (docs != null)
                    {
                        if (docs.EventStatus == DocumentEventStatus.CLOSING)
                        {
                            var documentItems = AWMSEngine.ADO.DocumentADO.GetInstant().ListItemAndDisto(x, buVO);
                            if (documentItems == null || documentItems.Count == 0)
                            {
                                throw new AMWException(logger, AMWExceptionCode.B0001, "Document Item Not Found");
                            }
                            else
                            {
                                if (documentItems.TrueForAll(y => y.EventStatus == DocumentEventStatus.CLOSING))
                                {
                                    docs.DocumentItems = documentItems;

                                    var distos = AWMSEngine.ADO.DocumentADO.GetInstant().ListDISTOByDoc(x, buVO);

                                    var WorkQueueLists = distos.Select(grp => grp.WorkQueue_ID).Distinct().ToList();
                                    WorkQueueLists.ForEach(wq =>
                                    {
                                        var queue = AWMSEngine.ADO.WorkQueueADO.GetInstant().Get(wq.Value, buVO);
                                        //update StorageObjects

                                        if (docs.DocumentType_ID == DocumentTypeID.GOODS_RECEIVED)
                                        {
                                            UpdateStorageObjectReceived(queue, buVO);
                                        }
                                        else if (docs.DocumentType_ID == DocumentTypeID.GOODS_ISSUED)
                                        {
                                            var updDistos = distos.Where(grp => grp.WorkQueue_ID == wq).ToList();
                                            UpdateStorageObjectIssued(updDistos, queue, buVO, logger);
                                        }
                                    });

                                    //Update Status Document To Closed
                                    AWMSEngine.ADO.DocumentADO.GetInstant().UpdateStatusToChild(x, DocumentEventStatus.CLOSING, null, DocumentEventStatus.CLOSED, buVO);

                                    //call to SAP
                                    if (docs.DocumentType_ID == DocumentTypeID.GOODS_RECEIVED && docs.MovementType_ID != MovementType.EPL_TRANSFER_WM)
                                    {//ดัก empty pallet ไม่ต้องยิงไปZWMRF002

                                        var tanumlists = new List<string> ();
                                        var WorkQueueLists2 = distos.Select(grp => grp.WorkQueue_ID).Distinct().ToList();
                                        WorkQueueLists2.ForEach(wq =>
                                        {
                                                var queue = AWMSEngine.ADO.WorkQueueADO.GetInstant().Get(wq.Value, buVO);
                                                var resSAP = SendDataToSAP_ZWMRF002(queue.StorageObject_Code, docs.ID.Value, buVO);
                                                tanumlists.AddRange(resSAP.datas.OUT_SU.Select(sap => sap.TANUM.ToString()));
                                                 
                                                long? TANUMs = resSAP.datas.OUT_SU.Select(data => data.TANUM).First();
                                                if (TANUMs != null)
                                                {
                                                    UpdateBaseSTO(queue.StorageObject_ID.Value, OptionVOConst.OPT_TANUM, TANUMs, buVO);
                                                }
                                        });
                                        UpdateOptionDoc(docs.ID.Value, docs.Options, tanumlists, buVO);

                                    }
                                    else if (docs.DocumentType_ID == DocumentTypeID.GOODS_ISSUED && docs.MovementType_ID != MovementType.EPL_TRANSFER_WM)
                                    {
                                        var tanumlists = new List<string>();
                                        docs.DocumentItems.ForEach(docItem =>
                                        {
                                            var WorkQueueLists3 = docItem.DocItemStos.Select(grp => grp.WorkQueue_ID).Distinct().ToList();
                                            WorkQueueLists3.ForEach(wq =>
                                            {
                                                var queue = AWMSEngine.ADO.WorkQueueADO.GetInstant().Get(wq.Value, buVO);
                                                if (docs.Ref1 == "R01" || docs.Ref1 == "R02" || docs.Ref1 == "R06")
                                                {
                                                    IN_AWS inAws = new IN_AWS()
                                                    {
                                                        ZMODE = docs.Ref1,
                                                        LGNUM = "W01",
                                                        LENUM = queue.StorageObject_Code,
                                                        GI_DOC = docs.Code
                                                    };
                                                    IN_REQ inReq = new IN_REQ() {
                                                        ZMODE = docs.Ref1,
                                                        LGNUM = "W01",
                                                        LENUM = docs.Ref1 == "R01" ? docItem.Code : "",
                                                        RSNUM = docs.Ref1 == "R02" ? long.Parse(docItem.RefID) : null as long?,
                                                        MATNR = docs.Ref1 == "R02" || docs.Ref1 == "R06" ? docItem.Code : "",
                                                        CHARG = string.IsNullOrWhiteSpace(docItem.Batch) ? "" : docItem.Batch,
                                                        BDMNG = docs.Ref1 == "R02" ? docItem.Quantity : null,
                                                        MEINS = docItem.UnitType_ID.HasValue ? StaticValueManager.GetInstant().UnitTypes.FirstOrDefault(unit => unit.ID == docItem.UnitType_ID.Value).Code : "",
                                                        LGTYP = ObjectUtil.QryStrGetValue(docItem.Options, OptionVOConst.OPT_LGTYP),
                                                        LGPLA = ObjectUtil.QryStrGetValue(docItem.Options, OptionVOConst.OPT_LGPLA),
                                                        LGBER = ObjectUtil.QryStrGetValue(docItem.Options, OptionVOConst.OPT_LGBER),
                                                        BWLVS = docs.Ref2,
                                                        BESTQ_UR = ObjectUtil.QryStrGetValue(docItem.Options, OptionVOConst.OPT_BESTQ_UR),
                                                        BESTQ_QI = ObjectUtil.QryStrGetValue(docItem.Options, OptionVOConst.OPT_BESTQ_QI),
                                                        BESTQ_BLK = ObjectUtil.QryStrGetValue(docItem.Options, OptionVOConst.OPT_BESTQ_BLK),
                                                        GI_DOC = docs.Code
                                                    };
                                                     
                                                    var resSAP = SendDataToSAP_ZWMRF004(inAws, inReq, docs.ID.Value, buVO);
                                                    var tanumlist = resSAP.datas.OUT_SAP.Select(sap => sap.TANUM.ToString());
                                                    tanumlists.AddRange(tanumlist);
                                                    UpdateOptionDocItem(docItem.ID.Value, docItem.Options, new List<string>(tanumlist), buVO);
                                                }
                                                else if (docs.Ref1 == "R03" || docs.Ref1 == "R04")
                                                {
                                                    IN_AWS inAws = new IN_AWS()
                                                    {
                                                        ZMODE = docs.Ref1,
                                                        LGNUM = "W01",
                                                        LENUM = queue.StorageObject_Code,
                                                        GI_DOC = docs.Code
                                                    };
                                                    ZSWMRF005_IN_REQ inReq = new ZSWMRF005_IN_REQ()
                                                    {
                                                        ZMODE = docs.Ref1,
                                                        LGNUM = "W01", 
                                                        LENUM = ObjectUtil.QryStrGetValue(docItem.Options, OptionVOConst.OPT_LENUM),
                                                        RSNUM = docs.Ref1 == "R03" ? long.Parse(docItem.RefID) : null as long?,
                                                        MATNR = docItem.Code,
                                                        CHARG = docItem.Batch,
                                                        BDMNG = docItem.Quantity,
                                                        MEINS = docItem.UnitType_ID.HasValue ? StaticValueManager.GetInstant().UnitTypes.FirstOrDefault(unit => unit.ID == docItem.UnitType_ID.Value).Code : "",
                                                        LGTYP = ObjectUtil.QryStrGetValue(docItem.Options, OptionVOConst.OPT_LGTYP),
                                                        LGPLA = ObjectUtil.QryStrGetValue(docItem.Options, OptionVOConst.OPT_LGPLA),
                                                        BWLVS = docs.Ref2,
                                                        BESTQ_UR = ObjectUtil.QryStrGetValue(docItem.Options, OptionVOConst.OPT_BESTQ_UR),
                                                        BESTQ_QI = ObjectUtil.QryStrGetValue(docItem.Options, OptionVOConst.OPT_BESTQ_QI),
                                                        BESTQ_BLK = ObjectUtil.QryStrGetValue(docItem.Options, OptionVOConst.OPT_BESTQ_BLK),
                                                        LGBER = ObjectUtil.QryStrGetValue(docItem.Options, OptionVOConst.OPT_LGBER), 
                                                        VBELN_VL = ObjectUtil.QryStrGetValue(docItem.Options, OptionVOConst.OPT_VBELN_VL), 
                                                        VBELN = ObjectUtil.QryStrGetValue(docItem.Options, OptionVOConst.OPT_VBELN), 
                                                        GI_DOC = docs.Code
                                                    };
                                                    var resSAP = SendDataToSAP_ZWMRF005(inAws, inReq, docs.ID.Value, buVO);
                                                    var tanumlist = resSAP.datas.OUT_SAP.Select(sap => sap.TANUM.ToString());
                                                    tanumlists.AddRange(tanumlist);
                                                    UpdateOptionDocItem(docItem.ID.Value, docItem.Options, new List<string>(tanumlist), buVO);
                                                }
                                                else if (docs.Ref1 == "R05")
                                                {
                                                    IN_AWS inAws = new IN_AWS()
                                                    {
                                                        ZMODE = docs.Ref1,
                                                        LGNUM = "W01",
                                                        LENUM = queue.StorageObject_Code,
                                                        GI_DOC = docs.Code
                                                    };
                                                    ZSWMRF006_IN_REQ inReq = new ZSWMRF006_IN_REQ() {
                                                        ZMODE = docs.Ref1,
                                                        LGNUM = "W01",
                                                        LENUM = ObjectUtil.QryStrGetValue(docItem.Options, OptionVOConst.OPT_LENUM),
                                                        RSNUM = docs.Ref1 == "R03" ? long.Parse(docItem.RefID) : null as long?,
                                                        MATNR = docItem.Code,
                                                        CHARG = string.IsNullOrWhiteSpace(docItem.Batch) ? null : docItem.Batch,
                                                        BDMNG = docItem.Quantity,
                                                        MEINS = docItem.UnitType_ID.HasValue ? StaticValueManager.GetInstant().UnitTypes.FirstOrDefault(unit => unit.ID == docItem.UnitType_ID.Value).Code : "",
                                                        LGTYP = ObjectUtil.QryStrGetValue(docItem.Options, OptionVOConst.OPT_LGTYP),
                                                        LGPLA = ObjectUtil.QryStrGetValue(docItem.Options, OptionVOConst.OPT_LGPLA),
                                                        LGBER = ObjectUtil.QryStrGetValue(docItem.Options, OptionVOConst.OPT_LGBER),
                                                        BWLVS = docs.Ref2,
                                                        BESTQ_UR = ObjectUtil.QryStrGetValue(docItem.Options, OptionVOConst.OPT_BESTQ_UR),
                                                        BESTQ_QI = ObjectUtil.QryStrGetValue(docItem.Options, OptionVOConst.OPT_BESTQ_QI),
                                                        BESTQ_BLK = ObjectUtil.QryStrGetValue(docItem.Options, OptionVOConst.OPT_BESTQ_BLK),
                                                        POSNR = long.Parse(ObjectUtil.QryStrGetValue(docItem.Options, OptionVOConst.OPT_POSNR)),
                                                        VBELN_VL = ObjectUtil.QryStrGetValue(docItem.Options, OptionVOConst.OPT_VBELN_VL),
                                                        VBELN = ObjectUtil.QryStrGetValue(docItem.Options, OptionVOConst.OPT_VBELN),
                                                        GI_DOC = docs.Code
                                                    };
                                                    var resSAP = SendDataToSAP_ZWMRF006(inAws, inReq, docs.ID.Value, buVO);
                                                    var tanumlist = resSAP.datas.OUT_SAP.Select(sap => sap.TANUM.ToString());
                                                    tanumlists.AddRange(tanumlist);
                                                    UpdateOptionDocItem(docItem.ID.Value, docItem.Options, new List<string>(tanumlist), buVO);
                                                }

                                                docItem.DocItemStos.ForEach(disto => {
                                                    var sou_psto = AWMSEngine.ADO.DataADO.GetInstant().SelectByID<amt_StorageObject>(disto.Sou_StorageObject_ID, buVO);
                                                    if (sou_psto.EventStatus == StorageObjectEventStatus.RECEIVED)
                                                    {
                                                        var resSAP = SendDataToSAP_ZWMRF002(queue.StorageObject_Code, null, buVO);

                                                        long? TANUMs = resSAP.datas.OUT_SU.Select(data => data.TANUM).First();
                                                        if (TANUMs != null && TANUMs != 0)
                                                        {
                                                            UpdateBaseSTO(queue.StorageObject_ID.Value, OptionVOConst.OPT_TANUM, TANUMs, buVO);
                                                        }
                                                    }
                                                });
                                            });
                                        });
                                        UpdateOptionDoc(docs.ID.Value, docs.Options, tanumlists, buVO);
                                    }
                                }
                            }
                        }
                    }
                });

            return reqVO;
        }
 
        private void LogException(long? docID, string message, VOCriteria buVO)
        {
            if (docID.HasValue)
            {
                buVO.FinalLogDocMessage.Add(new FinalDatabaseLogCriteria.DocumentOptionMessage() {
                    docID = docID.Value,
                    msgError = message
                });
            }
            else
            {
                buVO.FinalLogDocMessage.Add(new FinalDatabaseLogCriteria.DocumentOptionMessage()
                {
                    msgError = message
                });
            }
            throw new AMWException(buVO.Logger, AMWExceptionCode.S0001, message);

        }
        private SapResponseMulti2 SendDataToSAP_ZWMRF002(string suCode, long? docID, VOCriteria buVO)
        {
            var res = SAPInterfaceADO.GetInstant().ZWMRF002(suCode, buVO);

            if (res.datas.OUT_SU != null)
            {
                if (res.datas.OUT_SU.Any(x => !string.IsNullOrWhiteSpace(x.ERR_MSG)))
                {
                    LogException(docID, res.datas.OUT_SU.Find(x => !string.IsNullOrWhiteSpace(x.ERR_MSG)).ERR_MSG, buVO);
                }
            }
            else
            {
                LogException(docID, res.message, buVO);
            }
             
            return res;
        }
        private SapResponseMulti SendDataToSAP_ZWMRF004(IN_AWS inAws, IN_REQ inReq, long? docID, VOCriteria buVO)
        {
            var res = SAPInterfaceADO.GetInstant().ZWMRF004(inAws, inReq, buVO);
            if (res.datas.OUT_SAP != null)
            {
               if (res.datas.OUT_SAP.Any(x => !string.IsNullOrWhiteSpace(x.ERR_MSG)))
                {
                    var messageLists = res.datas.OUT_SAP.Where(sap => !string.IsNullOrWhiteSpace(sap.ERR_MSG)).Select(sel=> new { ERR_MSG = sel.LENUM +"-"+sel.ERR_MSG });
                    var message = string.Join(',', messageLists);
                    LogException(docID, message, buVO);
                }
            }
            else
            {
                LogException(docID, res.message, buVO);
            }

            return res;
        }
        private SapResponseMulti SendDataToSAP_ZWMRF005(IN_AWS inAws, ZSWMRF005_IN_REQ inReq, long? docID, VOCriteria buVO)
        {
            var res = SAPInterfaceADO.GetInstant().ZWMRF005(inAws, inReq, buVO);
            if (res.datas.OUT_SAP != null)
            {
                if (res.datas.OUT_SAP.Any(x => !string.IsNullOrWhiteSpace(x.ERR_MSG)))
                {
                    var messageLists = res.datas.OUT_SAP.Where(sap => !string.IsNullOrWhiteSpace(sap.ERR_MSG)).Select(sel => new { ERR_MSG = sel.LENUM + "-" + sel.ERR_MSG });
                    var message = string.Join(',', messageLists);
                    LogException(docID, message, buVO);
                }
            }
            else
            {
                LogException(docID, res.message, buVO);
            }

            return res;
        }
        private SapResponseMulti SendDataToSAP_ZWMRF006(IN_AWS inAws, ZSWMRF006_IN_REQ inReq, long? docID, VOCriteria buVO)
        {
            var res = SAPInterfaceADO.GetInstant().ZWMRF006(inAws, inReq, buVO);
            if (res.datas.OUT_SAP != null)
            {
                if (res.datas.OUT_SAP.Any(x => !string.IsNullOrWhiteSpace(x.ERR_MSG)))
                {
                    var messageLists = res.datas.OUT_SAP.Where(sap => !string.IsNullOrWhiteSpace(sap.ERR_MSG)).Select(sel => new { ERR_MSG = sel.LENUM + "-" + sel.ERR_MSG });
                    var message = string.Join(',', messageLists);
                    LogException(docID, message, buVO);
                }
            }
            else
            {
                LogException(docID, res.message, buVO);
            }

            return res;
        }
        private void UpdateOptionDoc(long docID, string old_opt, List<string> tanumlists, VOCriteria buVO)
        {
            var tanum_opt = string.Join(',', tanumlists);
            var opt_done = ObjectUtil.QryStrSetValue(old_opt, OptionVOConst.OPT_TANUM, tanum_opt);
            AWMSEngine.ADO.DataADO.GetInstant().UpdateByID<amt_Document>(docID, buVO,
                        new KeyValuePair<string, object>[] {
                            new KeyValuePair<string, object>("Options", opt_done)
                        });
        }
        private void UpdateOptionDocItem(long docItemID, string old_opt, List<string> tanumlists, VOCriteria buVO)
        {
            var tanum_opt = string.Join(',', tanumlists);
            var opt_done = ObjectUtil.QryStrSetValue(old_opt, OptionVOConst.OPT_TANUM, tanum_opt);
            AWMSEngine.ADO.DataADO.GetInstant().UpdateByID<amt_DocumentItem>(docItemID, buVO,
                        new KeyValuePair<string, object>[] {
                            new KeyValuePair<string, object>("Options", opt_done)
                        });
        }
        private void UpdateBaseSTO(long bstoID, string key, dynamic value, VOCriteria buVO)
        {
            //var bsto = AWMSEngine.ADO.DataADO.GetInstant().SelectByID<amt_StorageObject>(stoID.Value, buVO);
            var stoPackList = AWMSEngine.ADO.StorageObjectADO.GetInstant().Get(bstoID, StorageObjectType.BASE, false, true, buVO).ToTreeList();
            //var stoPackList = stoPackList.Where(y => y.type == StorageObjectType.PACK).ToList();

            stoPackList.ForEach(pack => {
                var opt_done = ObjectUtil.QryStrSetValue(pack.options, key, value);

                AWMSEngine.ADO.DataADO.GetInstant().UpdateByID<amt_StorageObject>(pack.id.Value, buVO,
                        new KeyValuePair<string, object>[] {
                                            new KeyValuePair<string, object>("Options", opt_done),
                                            new KeyValuePair<string, object>("Ref2", "R00")
                        });
            });
            
        }
         
        private void UpdateStorageObjectIssued(List<amt_DocumentItemStorageObject> distos, SPworkQueue queue, VOCriteria buVO, AMWLogger logger)
        {
            var bsto = AWMSEngine.ADO.DataADO.GetInstant().SelectByID<amt_StorageObject>(queue.StorageObject_ID, buVO);

            var done_des_event_status = ObjectUtil.QryStrGetValue(bsto.Options, OptionVOConst.OPT_DONE_DES_EVENT_STATUS);
            //bool checkSTOReceived = false;
            distos.ForEach(disto =>
            {
                if (done_des_event_status == null || done_des_event_status.Length == 0)
                {
                    if (disto.Sou_StorageObject_ID != disto.Des_StorageObject_ID) //เบิกเเบบไม่เต็ม
                    {
                        AWMSEngine.ADO.StorageObjectADO.GetInstant().UpdateStatusToChild(disto.Des_StorageObject_ID.Value,
                            StorageObjectEventStatus.PICKING, null, StorageObjectEventStatus.PICKED, buVO);
                    }
                    else
                    {
                        AWMSEngine.ADO.StorageObjectADO.GetInstant().UpdateStatusToChild(queue.StorageObject_ID.Value,
                            StorageObjectEventStatus.PICKING, null, StorageObjectEventStatus.PICKED, buVO);
                    }
                }
                else
                {
                    if (disto.Sou_StorageObject_ID != disto.Des_StorageObject_ID) //เบิกเเบบไม่เต็ม
                    {
                        StorageObjectEventStatus eventStatus = (StorageObjectEventStatus)Enum.Parse(typeof(StorageObjectEventStatus), done_des_event_status);
                        AWMSEngine.ADO.StorageObjectADO.GetInstant().UpdateStatusToChild(disto.Des_StorageObject_ID.Value, null, null, eventStatus, buVO);
                    }
                    else
                    {
                        StorageObjectEventStatus eventStatus = (StorageObjectEventStatus)Enum.Parse(typeof(StorageObjectEventStatus), done_des_event_status);
                        AWMSEngine.ADO.StorageObjectADO.GetInstant().UpdateStatusToChild(queue.StorageObject_ID.Value, null, null, eventStatus, buVO);
                    }
                    RemoveOPTEventSTO(bsto.ID.Value, bsto.Options, buVO);
                }
            }); 
        }

        private void UpdateStorageObjectReceived(SPworkQueue queue, VOCriteria buVO)
        {
            var stosList = AWMSEngine.ADO.StorageObjectADO.GetInstant().Get(queue.StorageObject_ID.Value, StorageObjectType.BASE, false, true, buVO).ToTreeList();
            stosList.ForEach(sto => {
                //up OPT_DONE_DES_EVENT_STATUS
                var done_des_event_status = ObjectUtil.QryStrGetValue(sto.options, OptionVOConst.OPT_DONE_DES_EVENT_STATUS);
                if (done_des_event_status == null || done_des_event_status.Length == 0)
                {

                    AWMSEngine.ADO.StorageObjectADO.GetInstant().UpdateStatus(sto.id.Value, StorageObjectEventStatus.RECEIVING, null, StorageObjectEventStatus.RECEIVED, buVO);
                }
                else
                {
                    StorageObjectEventStatus eventStatus = (StorageObjectEventStatus)Enum.Parse(typeof(StorageObjectEventStatus), done_des_event_status);
                    AWMSEngine.ADO.StorageObjectADO.GetInstant().UpdateStatus(sto.id.Value, null, null, eventStatus, buVO);
                    RemoveOPTEventSTO(sto.id.Value, sto.options, buVO);
                }
            });
        }
        private void RemoveOPTEventSTO(long bsto_id, string bsto_options, VOCriteria buVO)
        {
            //remove OPT_DONE_DES_EVENT_STATUS
            var listkeyRoot = ObjectUtil.QryStrToKeyValues(bsto_options);
            var opt_done = "";

            if (listkeyRoot != null && listkeyRoot.Count > 0)
            {
                listkeyRoot.RemoveAll(x => x.Key.Equals(OptionVOConst.OPT_DONE_DES_EVENT_STATUS));
                opt_done = ObjectUtil.ListKeyToQryStr(listkeyRoot);
            }

            AWMSEngine.ADO.DataADO.GetInstant().UpdateByID<amt_StorageObject>(bsto_id, buVO,
                    new KeyValuePair<string, object>[] {
                        new KeyValuePair<string, object>("Options", opt_done)
                    });
        }
        
    }
}
