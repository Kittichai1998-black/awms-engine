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

                    if (docs.DocumentType_ID == DocumentTypeID.GOODS_RECEIVED)
                    {
                        var distos = AWMSEngine.ADO.DocumentADO.GetInstant().ListDISTOByDoc(x, buVO);
                        if (distos == null)
                            throw new AMWException(logger, AMWExceptionCode.B0001, "Document Item Not Found");

                        var WorkQueues = distos.Select(grp => grp.WorkQueue_ID).Distinct().ToList();
                        WorkQueues.ForEach(wq => {
                            var queue = AWMSEngine.ADO.WorkQueueADO.GetInstant().Get(wq.Value, buVO);
                            var bsto = AWMSEngine.ADO.DataADO.GetInstant().SelectByID<amt_StorageObject>(queue.StorageObject_ID.Value, buVO);

                            var resSAP = SendDataToSAP_ZWMRF002(queue.StorageObject_Code, docs.ID.Value, buVO);
                            var TANUMs = resSAP.datas.Select(data => data.TANUM).Distinct().First().ToString();
                            if (TANUMs != null)
                            {
                                UpdateBaseSTO(bsto, OptionVOConst.OPT_TANUM, TANUMs, buVO);
                            }
                            else
                            {
                                throw new AMWException(logger, AMWExceptionCode.B0001, "Transfer Order Not Response");
                            } 
                            UpdateStorageObjectReceive(queue, buVO);

                        });

                    }
                    else
                    {
                        var docItems = AWMSEngine.ADO.DocumentADO.GetInstant().ListItemAndDisto(x, buVO);
                        docItems.ForEach(docItem => {
                            var optDocItem = docItem.Options;
                            var options = ObjectUtil.QryStrToDynamic(docItem.Options);

                            var WorkQueues = docItem.DocItemStos.Select(grp => grp.WorkQueue_ID).Distinct().ToList();
                            WorkQueues.ForEach(wq => {
                                var queue = AWMSEngine.ADO.WorkQueueADO.GetInstant().Get(wq.Value, buVO);
                                var bsto = AWMSEngine.ADO.DataADO.GetInstant().SelectByID<amt_StorageObject>(queue.StorageObject_ID.Value, buVO);

                                string BTANRs = null;
                                if (docItem.Ref1 == "R01" || docItem.Ref1 == "R02" || docItem.Ref1 == "R06")
                                {
                                    ZTWMRF004_IN_AWS reqData = new ZTWMRF004_IN_AWS()
                                    {
                                        MODE = docs.Ref1,
                                        LENUM = queue.StorageObject_Code,
                                        LGTYP = options[OptionVOConst.OPT_LGTYP],//SType
                                        LGBER = options[OptionVOConst.OPT_LGBER],//Sec
                                        LGPLA = options[OptionVOConst.OPT_LGPLA],//BIN
                                        BWLVS = docItem.Ref2, //MVT
                                        GI_DOC = docs.Code
                                    };

                                    var resSAP = SendDataToSAP_ZWMRF004(reqData, buVO);
                                    BTANRs = resSAP.datas.Select(data => data.BTANR).Distinct().First().ToString();

                                }

                                else if (docs.Ref1 == "R03" || docs.Ref1 == "R04")
                                {
                                    ZTWMRF005_IN_AWS reqData = new ZTWMRF005_IN_AWS()
                                    {
                                        MODE = docs.Ref1,
                                        LENUM = queue.StorageObject_Code,
                                        LGTYP = options[OptionVOConst.OPT_LGTYP],//SType
                                        //LGBER = options[OptionVOConst.OPT_LGBER],//Sec --
                                        LGPLA = options[OptionVOConst.OPT_LGPLA],//BIN
                                        BWLVS = docItem.Ref2, //MVT
                                        GI_DOC = docs.Code
                                    };
                                    var resSAP = SendDataToSAP_ZWMRF005(reqData, buVO);
                                    BTANRs = resSAP.datas.Select(data => data.BTANR).Distinct().First().ToString();

                                }
                                else if (docs.Ref1 == "R05")
                                {
                                    ZTWMRF006_IN_AWS reqData = new ZTWMRF006_IN_AWS()
                                    {
                                        MODE = docs.Ref1,
                                        LENUM = queue.StorageObject_Code,
                                        LGTYP = options[OptionVOConst.OPT_LGTYP],//SType
                                       // LGBER = options[OptionVOConst.OPT_LGBER],//Sec --
                                        //LGPLA = options[OptionVOConst.OPT_LGPLA],//BIN --
                                        BWLVS = docItem.Ref2, //MVT
                                        GI_DOC = docs.Code
                                    };
                                    var resSAP = SendDataToSAP_ZWMRF006(reqData, buVO);
                                    BTANRs = resSAP.datas.Select(data => data.BTANR).Distinct().First().ToString();
                                }
                                if (BTANRs != null)
                                {
                                    UpdateBaseSTO(bsto, OptionVOConst.OPT_BTANR, BTANRs, buVO);
                                }
                                else
                                {
                                    throw new AMWException(logger, AMWExceptionCode.B0001, "Transfer Order Not Response");
                                }

                                var updDistos = docItem.DocItemStos.Where(grp => grp.WorkQueue_ID == wq).ToList();
                                UpdateStorageObject(updDistos, queue, buVO, logger);
                            });




                        });


                    }

                    var listItem = AWMSEngine.ADO.DocumentADO.GetInstant().ListItem(x, buVO);
                    if (listItem.TrueForAll(y => y.EventStatus == DocumentEventStatus.CLOSING))
                    {
                        AWMSEngine.ADO.DocumentADO.GetInstant().UpdateStatusToChild(x, DocumentEventStatus.CLOSING, null, DocumentEventStatus.CLOSED, buVO);
                    }
                }

            });

            return reqVO;
        }
        private SapResponse<ZSWMRF002_OUT_SU> SendDataToSAP_ZWMRF002(string suCode, long? docID, VOCriteria buVO)
        {
            var res = SAPInterfaceADO.GetInstant().ZWMRF002(suCode, docID, buVO);
            return res;
        }
        private SapResponse<ZTWMRF004_OUT_SAP> SendDataToSAP_ZWMRF004(ZTWMRF004_IN_AWS data, VOCriteria buVO)
        {
            var res = SAPInterfaceADO.GetInstant().ZWMRF004(data, buVO);
            return res;
        }
        private SapResponse<ZTWMRF005_OUT_SAP> SendDataToSAP_ZWMRF005(ZTWMRF005_IN_AWS data, VOCriteria buVO)
        {
            var res = SAPInterfaceADO.GetInstant().ZWMRF005(data, buVO);
            return res;
        }
        private SapResponse<ZTWMRF006_OUT_SAP> SendDataToSAP_ZWMRF006(ZTWMRF006_IN_AWS data, VOCriteria buVO)
        {
            var res = SAPInterfaceADO.GetInstant().ZWMRF006(data, buVO);
            return res;
        }

        private void UpdateBaseSTO(amt_StorageObject bsto, string key, dynamic value, VOCriteria buVO)
        {
            //var bsto = AWMSEngine.ADO.DataADO.GetInstant().SelectByID<amt_StorageObject>(stoID.Value, buVO);

            var opt_done = ObjectUtil.QryStrSetValue(bsto.Options, key, value);

            AWMSEngine.ADO.DataADO.GetInstant().UpdateByID<amt_StorageObject>(bsto.ID.Value, buVO,
                    new KeyValuePair<string, object>[] {
                                            new KeyValuePair<string, object>("Options", opt_done)
                    });
        }

        private void UpdateStorageObject(List<amt_DocumentItemStorageObject> distos, SPworkQueue queue, VOCriteria buVO, AMWLogger logger)
        {
            var bsto = AWMSEngine.ADO.DataADO.GetInstant().SelectByID<amt_StorageObject>(queue.StorageObject_ID, buVO);

            var done_des_event_status = ObjectUtil.QryStrGetValue(bsto.Options, OptionVOConst.OPT_DONE_DES_EVENT_STATUS);
            bool checkSTOReceived = false;
            distos.ForEach(disto =>
            {
                if (done_des_event_status == null || done_des_event_status.Length == 0)
                {
                    if (disto.Sou_StorageObject_ID != disto.Des_StorageObject_ID) //เบิกเเบบไม่เต็ม
                    {
                        AWMSEngine.ADO.StorageObjectADO.GetInstant().UpdateStatusToChild(disto.Des_StorageObject_ID.Value,
                            StorageObjectEventStatus.PICKING, null, StorageObjectEventStatus.PICKED, buVO);

                        //CallSapReceive(disto.Sou_StorageObject_ID, null, buVO, logger);
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

                       // CallSapReceive(disto.Sou_StorageObject_ID, null, buVO, logger);
                    }
                    else
                    {
                        StorageObjectEventStatus eventStatus = (StorageObjectEventStatus)Enum.Parse(typeof(StorageObjectEventStatus), done_des_event_status);
                        AWMSEngine.ADO.StorageObjectADO.GetInstant().UpdateStatusToChild(queue.StorageObject_ID.Value, null, null, eventStatus, buVO);
                    }
                }

                var sou_psto = AWMSEngine.ADO.DataADO.GetInstant().SelectByID<amt_StorageObject>(disto.Sou_StorageObject_ID, buVO);

                if (sou_psto.EventStatus == StorageObjectEventStatus.RECEIVED)
                {
                    checkSTOReceived = true;
                    
                }

            }); 

            if(checkSTOReceived == true)
            {
                var resSAP = SendDataToSAP_ZWMRF002(queue.StorageObject_Code, null, buVO);
                var TANUMs = resSAP.datas.Select(data => data.TANUM).Distinct().First().ToString();
                if (TANUMs != null)
                {
                    var opt_done = ObjectUtil.QryStrSetValue(bsto.Options, OptionVOConst.OPT_TANUM, TANUMs);
                    bsto.Options = opt_done;
                    // UpdateBaseSTO(bsto, OptionVOConst.OPT_TANUM, TANUMs, buVO);
                    // bsto = AWMSEngine.ADO.DataADO.GetInstant().SelectByID<amt_StorageObject>(queue.StorageObject_ID, buVO);
                }
                else
                {
                    throw new AMWException(logger, AMWExceptionCode.B0001, "Transfer Order Not Response");
                }
            }
            RemoveOPTEventSTO(bsto, buVO);
 
        }

        private void UpdateStorageObjectReceive(SPworkQueue queue, VOCriteria buVO)
        {
            var bsto = AWMSEngine.ADO.DataADO.GetInstant().SelectByID<amt_StorageObject>(queue.StorageObject_ID, buVO);

            //up OPT_DONE_DES_EVENT_STATUS
            var done_des_event_status = ObjectUtil.QryStrGetValue(bsto.Options, OptionVOConst.OPT_DONE_DES_EVENT_STATUS);
            if (done_des_event_status == null || done_des_event_status.Length == 0)
            {
                AWMSEngine.ADO.StorageObjectADO.GetInstant().UpdateStatusToChild(queue.StorageObject_ID.Value, StorageObjectEventStatus.RECEIVING, null, StorageObjectEventStatus.RECEIVED, buVO);
            }
            else
            {
                StorageObjectEventStatus eventStatus = (StorageObjectEventStatus)Enum.Parse(typeof(StorageObjectEventStatus), done_des_event_status);
                AWMSEngine.ADO.StorageObjectADO.GetInstant().UpdateStatusToChild(queue.StorageObject_ID.Value, null, null, eventStatus, buVO);
            }

            RemoveOPTEventSTO(bsto, buVO);
        }
        private void RemoveOPTEventSTO(amt_StorageObject bsto, VOCriteria buVO)
        {
            //remove OPT_DONE_DES_EVENT_STATUS
            var listkeyRoot = ObjectUtil.QryStrToKeyValues(bsto.Options);
            var opt_done = "";

            if (listkeyRoot != null && listkeyRoot.Count > 0)
            {
                listkeyRoot.RemoveAll(x => x.Key.Equals(OptionVOConst.OPT_DONE_DES_EVENT_STATUS));
                opt_done = ObjectUtil.ListKeyToQryStr(listkeyRoot);
            }

            AWMSEngine.ADO.DataADO.GetInstant().UpdateByID<amt_StorageObject>(bsto.ID.Value, buVO,
                    new KeyValuePair<string, object>[] {
                        new KeyValuePair<string, object>("Options", opt_done)
                    });
        }
    }
}
