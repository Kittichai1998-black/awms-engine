using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using AMWUtil.Common;
using AMWUtil.Exception;
using AMWUtil.Logger;
using AWMSEngine.ADO.StaticValue;
using AWMSEngine.Common;
using AWMSEngine.Engine;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Constant.StringConst;
using AWMSModel.Criteria;
using AWMSModel.Criteria.SP.Request;
using AWMSModel.Entity;
using ProjectTMC.ADO.SCADAApi;
using static ProjectTMC.Model.SCADACriteria;
using static ProjectTMC.ADO.SCADAApi.SCADAInterfaceADO;

namespace ProjectTMC.Engine.Business.WorkQueue
{
    public class DoneQueueClosed : IProjectEngine<List<long>, List<long>>
    {
        public List<long> ExecuteEngine(AMWLogger logger, VOCriteria buVO, List<long> reqVO)
        {
            var docLists = new List<long>();

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
                            buVO.FinalLogDocMessage.Add(new FinalDatabaseLogCriteria.DocumentOptionMessage()
                            {
                                docID = x,
                                msgError = "Document Items Not Found."
                            });
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
                                RemoveOPTDocument(x, docs.Options, buVO);

                                //call to SAP
                                if (docs.DocumentType_ID == DocumentTypeID.GOODS_RECEIVED && docs.MovementType_ID != MovementType.EPL_TRANSFER_WM)
                                {//ดัก empty pallet ไม่ต้องยิงไปZWMRF002

                                    //var tanumlists = new List<string>();
                                    var WorkQueueLists2 = distos.Select(grp => grp.WorkQueue_ID).Distinct().ToList();
                                    WorkQueueLists2.ForEach(wq =>
                                    {
                                        var queue = AWMSEngine.ADO.WorkQueueADO.GetInstant().Get(wq.Value, buVO);
                                        var reqScada = new SCADA_SendConfirm_REQ()
                                        {
                                            PalletCode = queue.StorageObject_Code 
                                        };

                                        //var resSCADA = SendDataToSCADA(reqScada, docs.ID.Value, buVO);
                                    });

                                }
                                else if (docs.DocumentType_ID == DocumentTypeID.GOODS_ISSUED && docs.MovementType_ID != MovementType.EPL_TRANSFER_WM)
                                {
                                    var inReqList = new List<dynamic>();
                                    //var tanumlists = new List<string>();
                                    docs.DocumentItems.ForEach(docItem =>
                                    {
                                        var WorkQueueLists3 = docItem.DocItemStos.Select(grp => grp.WorkQueue_ID).Distinct().ToList();
                                        WorkQueueLists3.ForEach(wq =>
                                        {
                                            var queue = AWMSEngine.ADO.WorkQueueADO.GetInstant().Get(wq.Value, buVO);
                                            var reqScada = new SCADA_SendConfirm_REQ()
                                            {
                                                PalletCode = queue.StorageObject_Code,
                                                PackCode = docItem.Code,
                                                Quantity = docItem.Quantity.Value
                                            };
                                            inReqList.Add(reqScada);
                                        });
                                    });
                                    var resSCADA = SendDataToSCADA(inReqList, docs.ID.Value, buVO);

                                }
                                docLists.Add(x);
                            }
                            else
                            {
                                buVO.FinalLogDocMessage.Add(new FinalDatabaseLogCriteria.DocumentOptionMessage()
                                {
                                    docID = x,
                                    msgError = "Status of all document items didn't 'CLOSING'."
                                });
                            }
                        }
                    }
                    else
                    {
                        buVO.FinalLogDocMessage.Add(new FinalDatabaseLogCriteria.DocumentOptionMessage()
                        {
                            docID = x,
                            msgError = "Status of document didn't 'CLOSING'."
                        });
                    }
                }
                else
                {
                    buVO.FinalLogDocMessage.Add(new FinalDatabaseLogCriteria.DocumentOptionMessage()
                    {
                        docID = x,
                        msgError = "Document Not Found"
                    });
                }
            });

            return docLists;
        }
        private void UpdateOptionDoc(long docID, string old_opt, List<string> tanumlists, VOCriteria buVO)
        {
            var tanum_opt = string.Join(',', tanumlists);
            var opt_done = ObjectUtil.QryStrSetValue(null, OptionVOConst.OPT_TANUM, tanum_opt);
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
        private void RemoveOPTDocument(long docID, string options, VOCriteria buVO)
        {
            //remove 
            var listkeyRoot = ObjectUtil.QryStrToKeyValues(options);
            var opt_done = "";

            if (listkeyRoot != null && listkeyRoot.Count > 0)
            {
                listkeyRoot.RemoveAll(x => x.Key.Equals(OptionVOConst.OPT_ERROR));
                opt_done = ObjectUtil.ListKeyToQryStr(listkeyRoot);
            }

            AWMSEngine.ADO.DataADO.GetInstant().UpdateByID<amt_Document>(docID, buVO,
                    new KeyValuePair<string, object>[] {
                        new KeyValuePair<string, object>("Options", opt_done)
                    });
        }
        private TRes SendDataToSCADA(List<dynamic> req, long? docID, VOCriteria buVO)
        {
            var res = SCADAInterfaceADO.GetInstant().SendToSCADA(req, buVO);
            if (res._result.status == 1) // success
            {

            }
            else
            {
                LogException(docID, res._result.message, buVO);
            }
            return res;

        }
        private void LogException(long? docID, string message, VOCriteria buVO)
        {
            if (docID.HasValue)
            {
                buVO.FinalLogDocMessage.Add(new FinalDatabaseLogCriteria.DocumentOptionMessage()
                {
                    docID = docID.Value,
                    msgError = message
                });
            }

            throw new AMWException(buVO.Logger, AMWExceptionCode.S0001, message);

        }
    }
}
