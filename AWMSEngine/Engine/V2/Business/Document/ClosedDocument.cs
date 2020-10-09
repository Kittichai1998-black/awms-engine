using AMWUtil.Common;
using AMWUtil.Exception;
using AWMSEngine.ADO.StaticValue;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Constant.StringConst;
using AWMSModel.Criteria;
using AWMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Linq;

namespace AWMSEngine.Engine.V2.Business.Document
{
    public class ClosedDocument : BaseEngine<List<long>, List<long>>
    {
        public class TUpdateSTO
        {
            public long? id;
            public StorageObjectEventStatus done_eventsto;
        }
        protected override List<long> ExecuteEngine(List<long> reqVO)
        {
            List<long> res = null;
            if (res == null)
            {
                var docLists = new List<long>();

                reqVO.ForEach(x =>
                {
                    var docs = ADO.DocumentADO.GetInstant().Get(x, this.BuVO);
                    if (docs != null)
                    {
                        try
                        {
                            //update StorageObjects
                            if (docs.EventStatus == DocumentEventStatus.CLOSING)
                            {
                                var distos = AWMSEngine.ADO.DocumentADO.GetInstant().ListDISTOByDoc(x, this.BuVO);
                                if (distos == null || distos.Count == 0)
                                {
                                    this.BuVO.FinalLogDocMessage.Add(new FinalDatabaseLogCriteria.DocumentOptionMessage()
                                    {
                                        docID = x,
                                        msgError = "Document Items of Storage Object Not Found."
                                    });
                                }
                                else
                                {
                                    if (docs.DocumentType_ID == DocumentTypeID.PUTAWAY || docs.DocumentType_ID == DocumentTypeID.PHYSICAL_COUNT || docs.DocumentType_ID == DocumentTypeID.AUDIT)
                                    {
                                        distos.ForEach(disto =>
                                        {
                                            var stosPack = ADO.StorageObjectADO.GetInstant().Get(disto.Sou_StorageObject_ID, StorageObjectType.PACK, false, false, BuVO);
                                            stosPack.IsStock = true;
                                            ADO.StorageObjectADO.GetInstant().PutV2(stosPack, this.BuVO);
                                            updatePallet(stosPack.parentID.Value, stosPack.parentType.Value);
                                        });
                                    }
                                     
                                    void updatePallet(long parent_id, StorageObjectType parent_type)
                                    {
                                        if (parent_type != StorageObjectType.LOCATION)
                                        {
                                            var sto = ADO.StorageObjectADO.GetInstant().Get(parent_id, StorageObjectType.BASE, false, true, BuVO);
                                            var stoLists = new List<StorageObjectCriteria>();
                                            if (sto != null)
                                                stoLists = sto.ToTreeList();

                                            var all_pack = stoLists.FindAll(x => x.parentID == parent_id && x.parentType == parent_type);
                                            if (stoLists.Count() > 0 && all_pack.TrueForAll(x => x.IsStock == true)) 
                                            {
                                                var parentUpdate = stoLists.Find(x => x.id == parent_id);
                                                parentUpdate.IsStock = true;
                                                ADO.StorageObjectADO.GetInstant().PutV2(parentUpdate, this.BuVO);
                                                if (parentUpdate.parentID.HasValue)
                                                    updatePallet(parentUpdate.parentID.Value, parentUpdate.parentType.Value);
                                            }

                                        }
                                    }
                                    //update Closed Document
                                    var listItem = AWMSEngine.ADO.DocumentADO.GetInstant().ListItem(x, this.BuVO);
                                    if (listItem.TrueForAll(y => y.EventStatus == DocumentEventStatus.CLOSING))
                                    {
                                        AWMSEngine.ADO.DocumentADO.GetInstant().UpdateStatusToChild(x, DocumentEventStatus.CLOSING, null, DocumentEventStatus.CLOSED, this.BuVO);
                                        if (docs.ParentDocument_ID != null)
                                        {
                                            var getParentDoc = ADO.DocumentADO.GetInstant().GetDocumentAndDocItems(docs.ParentDocument_ID.Value, this.BuVO);
                                            if (getParentDoc.DocumentItems.TrueForAll(z => z.EventStatus == DocumentEventStatus.CLOSING))
                                            {
                                                ADO.DocumentADO.GetInstant().UpdateStatusToChild(docs.ParentDocument_ID.Value, DocumentEventStatus.CLOSING, null, DocumentEventStatus.CLOSED, this.BuVO);
                                            }
                                        }

                                        RemoveOPTDocument(x, docs.Options, this.BuVO);
                                        docLists.Add(x);
                                    }
                                    else
                                    {
                                        this.BuVO.FinalLogDocMessage.Add(new FinalDatabaseLogCriteria.DocumentOptionMessage()
                                        {
                                            docID = x,
                                            msgError = "Status of all document items didn't 'CLOSING'."
                                        });
                                    }
                                }
                            }
                            else
                            {
                                this.BuVO.FinalLogDocMessage.Add(new FinalDatabaseLogCriteria.DocumentOptionMessage()
                                {
                                    docID = x,
                                    msgError = "Status of document didn't 'CLOSING'."
                                });
                            }
                        }
                        catch (Exception ex)
                        {
                            this.BuVO.FinalLogDocMessage.Add(new FinalDatabaseLogCriteria.DocumentOptionMessage()
                            {
                                docID = x,
                                msgError = ex.Message
                            });
                            this.Logger.LogError(ex.Message);
                        }
                    }
                    else
                    {
                        throw new AMWException(this.BuVO.Logger, AMWExceptionCode.S0001, "Document Not Found");
                    }
                });

                res = docLists;
            }

            return res;
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
    }
}