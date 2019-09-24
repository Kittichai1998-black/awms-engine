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
                        //update StorageObjects
                        if (docs.EventStatus == DocumentEventStatus.CLOSING)
                        {
                            var distos = AWMSEngine.ADO.DocumentADO.GetInstant().ListDISTOByDoc(x, buVO);
                            if (distos == null)
                                throw new AMWException(logger, AMWExceptionCode.B0001, "Document Item Not Found");
                        

                            var WorkQueues = distos.Select(grp => grp.WorkQueue_ID).Distinct().ToList();
                            WorkQueues.ForEach(wq =>
                            {
                                var queue = AWMSEngine.ADO.WorkQueueADO.GetInstant().Get(wq.Value, buVO);

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

                            //update Closed Document
                            var listItem = AWMSEngine.ADO.DocumentADO.GetInstant().ListItem(x, buVO);
                            if (listItem.TrueForAll(y => y.EventStatus == DocumentEventStatus.CLOSING))
                            {
                                AWMSEngine.ADO.DocumentADO.GetInstant().UpdateStatusToChild(x, DocumentEventStatus.CLOSING, null, DocumentEventStatus.CLOSED, buVO);
                            }

                            //call to SAP
                            WorkQueues.ForEach(wq =>
                            {
                                var queue = AWMSEngine.ADO.WorkQueueADO.GetInstant().Get(wq.Value, buVO);
                                //var bsto = AWMSEngine.ADO.DataADO.GetInstant().SelectByID<amt_StorageObject>(queue.StorageObject_ID.Value, buVO);
                                var stoPackList = AWMSEngine.ADO.StorageObjectADO.GetInstant().Get(queue.StorageObject_ID.Value, StorageObjectType.BASE, false, true, buVO).ToTreeList();

                                if (docs.DocumentType_ID == DocumentTypeID.GOODS_RECEIVED)
                                {
                                    var resSAP = SendDataToSAP_ZWMRF002(queue.StorageObject_Code, docs.ID.Value, buVO);
                                    
                                    long? TANUMs = resSAP.datas.Select(data => data.TANUM).First();
                                    if (TANUMs != null && TANUMs != 0)
                                    {
                                        UpdateBaseSTO(queue.StorageObject_ID.Value, OptionVOConst.OPT_TANUM, TANUMs, buVO);
                                    }
                                   
                                }
                                else if (docs.DocumentType_ID == DocumentTypeID.GOODS_ISSUED)
                                {

                                    //call sap 
                                    long? TANUMs = null;
                                    if (docs.Ref1 == "R01" || docs.Ref1 == "R02" || docs.Ref1 == "R06")
                                    {
                                        IN_AWS reqData = new IN_AWS()
                                        {
                                            ZMODE = docs.Ref1,
                                            LGNUM = "W01", 
                                            LENUM = queue.StorageObject_Code,
                                            GI_DOC = docs.Code
                                        };

                                        var resSAP = SendDataToSAP_ZWMRF004(reqData, docs.ID.Value, buVO);
                                        TANUMs = resSAP.datas.Select(data => data.TANUM).First();
                                        if (TANUMs != null && TANUMs != 0)
                                        {
                                            UpdateBaseSTO(queue.StorageObject_ID.Value, OptionVOConst.OPT_BTANR, TANUMs, buVO);
                                        }
                                    }

                                    else if (docs.Ref1 == "R03" || docs.Ref1 == "R04")
                                    {
                                        IN_AWS reqData = new IN_AWS()
                                        {
                                            ZMODE = docs.Ref1,
                                            LGNUM = "W01",
                                            LENUM = queue.StorageObject_Code,
                                            GI_DOC = docs.Code
                                        };
                                        var resSAP = SendDataToSAP_ZWMRF005(reqData, docs.ID.Value, buVO);
                                        /*resSAP.datas.ForEach(xx => {
                                            //var chkMat = stoPackList.Find(pk => pk.code == xx.MATNR.TrimStart(new char[] { '0' }) 
                                            //   && pk.batch == xx.CHARG.TrimStart(new char[] { '0' }));
                                            //var chkMat_opt = chkMat.options;
                                            //var sunum = xx.LENUM.TrimStart(new char[] { '0' });
                                            //var stoPack = AWMSEngine.ADO.StorageObjectADO.GetInstant().Get(sunum, null,null, false, true, buVO).ToTreeList();

                                            UpdateBaseSTO(chkMat.id.Value, OptionVOConst.OPT_BTANR, TANUMs, buVO);
                                        });*/
                                    }
                                    else if (docs.Ref1 == "R05")
                                    {
                                        IN_AWS reqData = new IN_AWS()
                                        {
                                            ZMODE = docs.Ref1,
                                            LGNUM = "W01",
                                            LENUM = queue.StorageObject_Code,
                                            GI_DOC = docs.Code
                                        };
                                        var resSAP = SendDataToSAP_ZWMRF006(reqData, docs.ID.Value, buVO);
                                        //อัพเดท sto options
                                       
                                    }
                                    

                                //receive sou pallet
                                var distoList = AWMSEngine.ADO.DataADO.GetInstant().SelectBy<amt_DocumentItemStorageObject>(
                                        new SQLConditionCriteria[] { new SQLConditionCriteria("WorkQueue_ID", wq.Value, SQLOperatorType.EQUALS) }, buVO);
                                    bool checkSTOReceived = false;
                                    distoList.ForEach(di =>
                                    {
                                        var sou_psto = AWMSEngine.ADO.DataADO.GetInstant().SelectByID<amt_StorageObject>(di.Sou_StorageObject_ID, buVO);
                                        if (sou_psto.EventStatus == StorageObjectEventStatus.RECEIVED)
                                        {
                                            checkSTOReceived = true;
                                        }
                                    });
                                    if (checkSTOReceived == true)
                                    {
                                        //var bstos = AWMSEngine.ADO.DataADO.GetInstant().SelectByID<amt_StorageObject>(queue.StorageObject_ID.Value, buVO);

                                        var resSAP = SendDataToSAP_ZWMRF002(queue.StorageObject_Code, null, buVO);
                                        long? TANUM_Received = resSAP.datas.Select(data => data.TANUM).Distinct().First();
                                        if (TANUM_Received != null && TANUM_Received != 0)
                                        {
                                            UpdateBaseSTO(queue.StorageObject_ID.Value, OptionVOConst.OPT_TANUM, TANUM_Received, buVO);
                                        }
                                         
                                    }

                                }
                            });
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
        private SapResponse<ZSWMRF002_OUT_SU> SendDataToSAP_ZWMRF002(string suCode, long? docID, VOCriteria buVO)
        {
            var res = SAPInterfaceADO.GetInstant().ZWMRF002(suCode, buVO);
            if (res.datas != null)
            {
                if (res.datas.Any(x => !string.IsNullOrEmpty(x.ERR_MSG)))
                {
                    LogException(docID, res.datas.Find(x => !string.IsNullOrEmpty(x.ERR_MSG)).ERR_MSG, buVO);
                }
            }
            else
            {
                LogException(docID, res.message, buVO);
            }

            return res;
        }
        private SapResponse<OUT_SAP> SendDataToSAP_ZWMRF004(IN_AWS data, long? docID, VOCriteria buVO)
        {
            //var res = SAPInterfaceADO.GetInstant().ZWMRF004(data, buVO);
            //if (res.datas != null)
            //{
            //    if (res.datas.Any(x => !string.IsNullOrEmpty(x.ERR_MSG)))
            //    {
            //        LogException(docID, res.datas.Find(x => !string.IsNullOrEmpty(x.ERR_MSG)).ERR_MSG, buVO);
            //    }
            //}
            //else
            //{
            //    LogException(docID, res.message, buVO);
            //}

            return null;
        }
        private SapResponse<OUT_SU_BAL> SendDataToSAP_ZWMRF005(IN_AWS data, long? docID, VOCriteria buVO)
        {
            //var res = SAPInterfaceADO.GetInstant().ZWMRF005(data, buVO);
            //if (res.datas != null)
            //{
            //    /*if (res.datas.Any(x => !string.IsNullOrEmpty(x.ERR_MSG)))
            //    {
            //        LogException(docID, res.datas.Find(x => !string.IsNullOrEmpty(x.ERR_MSG)).ERR_MSG, buVO);
            //    }*/
            //}
            //else
            //{
            //    LogException(docID, res.message, buVO);
            //}

            return null;
        }
        private SapResponse<OUT_SU_BAL> SendDataToSAP_ZWMRF006(IN_AWS data, long? docID, VOCriteria buVO)
        {
            //var res = SAPInterfaceADO.GetInstant().ZWMRF006(data, buVO);
            //if (res.datas != null)
            //{
            //    /*if (res.datas.Any(x => !string.IsNullOrEmpty(x.ERR_MSG)))
            //    {
            //        LogException(docID, res.datas.Find(x => !string.IsNullOrEmpty(x.ERR_MSG)).ERR_MSG, buVO);
            //    }*/
            //}
            //else
            //{
            //    LogException(docID, res.message, buVO);
            //}

            return null;
        }
        
        private void UpdateBaseSTO(long bstoID, string key, dynamic value, VOCriteria buVO)
        {
            //var bsto = AWMSEngine.ADO.DataADO.GetInstant().SelectByID<amt_StorageObject>(stoID.Value, buVO);
            var stoPackList = AWMSEngine.ADO.StorageObjectADO.GetInstant().Get(bstoID, StorageObjectType.BASE, false, true, buVO).ToTreeList();
            //var stoPackList = chkStos.ToTreeList().Where(y => y.type == StorageObjectType.PACK).ToList();

            stoPackList.ForEach(pack => {
                var opt_done = ObjectUtil.QryStrSetValue(pack.options, key, value);

                AWMSEngine.ADO.DataADO.GetInstant().UpdateByID<amt_StorageObject>(pack.id.Value, buVO,
                        new KeyValuePair<string, object>[] {
                                            new KeyValuePair<string, object>("Options", opt_done)
                        });
            });
            
        }
        private void UpdatePackSTO(SapResponse<OUT_SU_BAL> resSap, long bstoID, VOCriteria buVO)
        {
            var chkStos = AWMSEngine.ADO.StorageObjectADO.GetInstant().Get(bstoID, StorageObjectType.BASE, false, true, buVO);
            var stoPackList = chkStos.ToTreeList().Where(x => x.type == StorageObjectType.PACK).ToList();

            resSap.datas.ForEach(pack =>
            {
                var packTemp = stoPackList.Find(y => y.code == pack.MATNR && y.batch == pack.CHARG);
                packTemp.qty = pack.BALNC;

                var stoIDUpdated = AWMSEngine.ADO.StorageObjectADO.GetInstant().PutV2(packTemp, buVO);

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
