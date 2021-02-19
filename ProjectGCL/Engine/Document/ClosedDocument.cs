using AMWUtil.Common;
using AMWUtil.Exception;
using AMSModel.Constant.EnumConst;
using AMSModel.Constant.StringConst;
using AMSModel.Criteria;
using AMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using AWMSEngine.Engine;
using AWMSModel.Constant.EnumConst;
using AMWUtil.Logger;

namespace ProjectGCL.Engine.Document
{
    public class ClosedDocument : IProjectEngine<List<long>, List<long>>
    {
        protected override List<long> ExecuteEngine(AMWLogger logger, VOCriteria buVO, List<long> reqVO)
        {

            List<long> res = null;
            if (res == null)
            {
                var docLists = new List<long>();

                reqVO.ForEach(x =>
                {
                    var docs = ADO.WMSDB.DocumentADO.GetInstant().GetDocumentAndDocItems(x, buVO);

                    if (docs != null)
                    {
                        try
                        {
                            //update StorageObjects
                            if (docs.EventStatus == DocumentEventStatus.CLOSING)
                            {

                                var distos = ADO.WMSDB.DocumentADO.GetInstant().ListDISTOByDoc(x, buVO);

                                if (distos == null || distos.Count == 0)
                                {
                                    buVO.FinalLogDocMessage.Add(new FinalDatabaseLogCriteria.DocumentOptionMessage()
                                    {
                                        docID = x,
                                        msgError = "Document Items of Storage Object Not Found."
                                    });
                                }
                                else
                                {
                                    if (docs.DocumentType_ID == DocumentTypeID.PUTAWAY)
                                    {
                                        //update last pallet
                                        var count = 0;
                                        var optionsLastpallet = AMWUtil.Common.ObjectUtil.QryStrGetValue(docs.Options, GCLOptionVOConst.OPT_LAST_PALLET);

                                        distos.ForEach(disto =>
                                        {
                                           
                                            var stosPack = ADO.WMSDB.StorageObjectADO.GetInstant().Get(disto.Des_StorageObject_ID.Value, StorageObjectType.PACK, false, false, buVO);
                                           
                                            if (stosPack != null)
                                            { 
                                                //update last pallet storageObject

                                                if(count == (distos.Count - 1))
                                                {
                                                    if( optionsLastpallet != "")
                                                    {
                                                        var convertBase = ADO.WMSStaticValue.StaticValueManager.GetInstant().ConvertToBaseUnitBySKU(stosPack.skuID.Value, Int32.Parse(optionsLastpallet), stosPack.unitID);

                                                        disto.Quantity = Int32.Parse(optionsLastpallet);
                                                        disto.BaseQuantity = convertBase.newQty;
                                                        ADO.WMSDB.DistoADO.GetInstant().Insert(disto, buVO);

                                                        stosPack.qty = Int32.Parse(optionsLastpallet);
                                                        stosPack.baseQty = convertBase.newQty;
                                                    }

                                                }

                                                stosPack.IsStock = true;
                                                ADO.WMSDB.StorageObjectADO.GetInstant().PutV2(stosPack, buVO);
                                                updatePallet(stosPack.parentID.Value, stosPack.parentType.Value);
                                                count++;
                                            }
                                        });
                                    }
                                    else if (docs.DocumentType_ID == DocumentTypeID.PICKING)
                                    {
                                        var sumdisto = distos.GroupBy(x => x.DocumentItem_ID).Select(y => new { sumQty = y.ToList().Sum(z => z.Quantity), docItemID = y.Key }).ToList();
                                        var errorlist = new List<string>();
                                        sumdisto.ForEach(x =>
                                        {
                                            var docitem = docs.DocumentItems.Find(u => u.ID == x.docItemID);
                                            if (docitem.Quantity > x.sumQty)
                                            {
                                                var diff_qty = docitem.Quantity - x.sumQty;
                                                var unit = ADO.WMSStaticValue.StaticValueManager.GetInstant().UnitTypes.Find(sel => sel.ID == docitem.UnitType_ID);
                                                errorlist.Add("Item Code: " + docitem.Code + " ขาดเป็นจำนวน " + diff_qty.ToString() + " " + unit.Code);
                                            }
                                        });

                                        if (errorlist != null && errorlist.Count > 0)
                                        {
                                            var message = "เอกสารมีการเบิกไม่ครบตามจำนวนที่ระบุในเอกสาร เนื่องจากของในคลังมีไม่ครบ - " + string.Join(',', errorlist);
                                            BuVO.FinalLogDocMessage.Add(new FinalDatabaseLogCriteria.DocumentOptionMessage()
                                            {
                                                docID = x,
                                                msgWarning = message
                                            });

                                        }
                                    }
                                    else if (docs.DocumentType_ID == DocumentTypeID.PHYSICAL_COUNT)
                                    {
                                        
                                        //update auditing, counting => sto Received เลย
                                        distos.ForEach(disto =>
                                        {
                                            var stosPack = ADO.WMSDB.StorageObjectADO.GetInstant().Get(disto.Des_StorageObject_ID.Value, StorageObjectType.PACK, false, false, BuVO);
                                            if (stosPack != null)
                                            {
                                                if (stosPack.eventStatus == StorageObjectEventStatus.PACK_COUNTED)
                                                {
                                                    ADO.WMSDB.StorageObjectADO.GetInstant().UpdateStatus(stosPack.id.Value, null, null, StorageObjectEventStatus.PACK_RECEIVED, buVO);
                                                }
                                            }
                                        });
                                    }


                                    void updatePallet(long parent_id, StorageObjectType parent_type)
                                    {
                                        if (parent_type != StorageObjectType.LOCATION)
                                        {
                                            var sto = ADO.WMSDB.StorageObjectADO.GetInstant().Get(parent_id, StorageObjectType.BASE, false, true, buVO);
                                            var stoLists = new List<StorageObjectCriteria>();
                                            if (sto != null)
                                                stoLists = sto.ToTreeList();

                                            var all_pack = stoLists.FindAll(x => x.parentID == parent_id && x.parentType == parent_type);
                                            if (stoLists.Count() > 0 && all_pack.TrueForAll(x => x.IsStock == true))
                                            {
                                                var parentUpdate = stoLists.Find(x => x.id == parent_id);
                                                parentUpdate.IsStock = true;
                                                ADO.WMSDB.StorageObjectADO.GetInstant().PutV2(parentUpdate, buVO);
                                                if (parentUpdate.parentID.HasValue)
                                                    updatePallet(parentUpdate.parentID.Value, parentUpdate.parentType.Value);
                                            }

                                        }
                                    }
                                    //update Closed Document
                                    var listItem = ADO.WMSDB.DocumentADO.GetInstant().ListItem(x, buVO);

                                    if (listItem.TrueForAll(y => y.EventStatus == DocumentEventStatus.CLOSING))
                                    {
                                        listItem.ForEach(paItem =>
                                        {
                                            paItem.EventStatus = DocumentEventStatus.CLOSED;
                                            ADO.WMSDB.DocumentADO.GetInstant().UpdateItemEventStatus(paItem.ID.Value, DocumentEventStatus.CLOSED, buVO);
                                        });
                                        ADO.WMSDB.DocumentADO.GetInstant().UpdateEventStatus(x, DocumentEventStatus.CLOSED, buVO);

                                        //AWMSEngine.ADO.DocumentADO.GetInstant().UpdateStatusToChild(x, DocumentEventStatus.CLOSING, null, DocumentEventStatus.CLOSED, this.BuVO);
                                        if (docs.ParentDocument_ID != null)
                                        {
                                            var getParentDoc = ADO.WMSDB.DocumentADO.GetInstant().GetDocumentAndDocItems(docs.ParentDocument_ID.Value, buVO);
                                            if (getParentDoc != null)
                                            {
                                                if (docs.DocumentType_ID == DocumentTypeID.PICKING)
                                                {
                                                    var sumdocitems = listItem.GroupBy(x => x.ParentDocumentItem_ID).Select(y => new { sumQty = y.ToList().Sum(z => z.Quantity), parentdocItemID = y.Key }).ToList();

                                                    var errorlist = new List<string>();
                                                    sumdocitems.ForEach(xx =>
                                                    {
                                                        var docitem = getParentDoc.DocumentItems.Find(u => u.ID == xx.parentdocItemID);
                                                        if (docitem.Quantity > xx.sumQty)
                                                        {
                                                            var diff_qty = docitem.Quantity - xx.sumQty;
                                                            var unit = ADO.WMSStaticValue.StaticValueManager.GetInstant().UnitTypes.Find(sel => sel.ID == docitem.UnitType_ID);
                                                            errorlist.Add("Item Code: " + docitem.Code + " ขาดเป็นจำนวน " + diff_qty.ToString() + " " + unit.Code);
                                                        }
                                                    });
                                                    if (errorlist != null && errorlist.Count > 0)
                                                    {
                                                        var message = "เอกสารมีการเบิกไม่ครบตามจำนวนที่ระบุในเอกสาร เนื่องจากของในคลังมีไม่ครบ - " + string.Join(',', errorlist);
                                                        buVO.FinalLogDocMessage.Add(new FinalDatabaseLogCriteria.DocumentOptionMessage()
                                                        {
                                                            docID = x,
                                                            msgWarning = message
                                                        });

                                                    }
                                                    else
                                                    {
                                                        if (getParentDoc.DocumentItems.TrueForAll(z => z.EventStatus == DocumentEventStatus.CLOSING))
                                                        {
                                                            getParentDoc.DocumentItems.ForEach(grItem =>
                                                            {
                                                                var childDocItems = ADO.WMSDB.DataADO.GetInstant().SelectBy<amt_DocumentItem>(new SQLConditionCriteria[] {
                                                                new SQLConditionCriteria("ParentDocumentItem_ID",grItem.ID.Value, SQLOperatorType.EQUALS),
                                                                new SQLConditionCriteria("Status", EntityStatus.REMOVE, SQLOperatorType.NOTEQUALS),
                                                                 }, buVO);
                                                                if (childDocItems != null && childDocItems.TrueForAll(i => i.EventStatus == DocumentEventStatus.CLOSED))
                                                                {
                                                                    grItem.EventStatus = DocumentEventStatus.CLOSED;
                                                                    ADO.WMSDB.DocumentADO.GetInstant().UpdateItemEventStatus(grItem.ID.Value, DocumentEventStatus.CLOSED, buVO);
                                                                }
                                                            });
                                                            if (getParentDoc.DocumentItems.TrueForAll(z => z.EventStatus == DocumentEventStatus.CLOSED))
                                                            {
                                                                ADO.WMSDB.DocumentADO.GetInstant().UpdateEventStatus(getParentDoc.ID.Value, DocumentEventStatus.CLOSED, buVO);
                                                            }
                                                        }
                                                    }
                                                }
                                                else
                                                {
                                                    if (getParentDoc.DocumentItems.TrueForAll(z => z.EventStatus == DocumentEventStatus.CLOSING))
                                                    {
                                                        getParentDoc.DocumentItems.ForEach(grItem =>
                                                        {
                                                            var childDocItems = ADO.WMSDB.DataADO.GetInstant().SelectBy<amt_DocumentItem>(new SQLConditionCriteria[] {
                                                                new SQLConditionCriteria("ParentDocumentItem_ID",grItem.ID.Value, SQLOperatorType.EQUALS),
                                                                new SQLConditionCriteria("Status", EntityStatus.REMOVE, SQLOperatorType.NOTEQUALS),
                                                                 }, buVO);
                                                            if (childDocItems != null && childDocItems.TrueForAll(i => i.EventStatus == DocumentEventStatus.CLOSED))
                                                            {
                                                                grItem.EventStatus = DocumentEventStatus.CLOSED;
                                                                ADO.WMSDB.DocumentADO.GetInstant().UpdateItemEventStatus(grItem.ID.Value, DocumentEventStatus.CLOSED, buVO);
                                                            }
                                                        });
                                                        if (getParentDoc.DocumentItems.TrueForAll(z => z.EventStatus == DocumentEventStatus.CLOSED))
                                                        {
                                                            ADO.WMSDB.DocumentADO.GetInstant().UpdateEventStatus(getParentDoc.ID.Value, DocumentEventStatus.CLOSED, buVO);
                                                        }
                                                    }
                                                }
                                            }
                                        }

                                        RemoveOPTDocument(x, docs.Options, buVO);
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
                        catch (Exception ex)
                        {
                            buVO.FinalLogDocMessage.Add(new FinalDatabaseLogCriteria.DocumentOptionMessage()
                            {
                                docID = x,
                                msgError = ex.Message
                            });
                            logger.LogError(ex.Message);
                        }
                    }
                    else
                    {
                        throw new AMWException(buVO.Logger, AMWExceptionCode.S0001, "Document Not Found");
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

            ADO.WMSDB.DataADO.GetInstant().UpdateByID<amt_Document>(docID, buVO,
                    new KeyValuePair<string, object>[] {
                        new KeyValuePair<string, object>("Options", opt_done)
                    });
        }
      
    }
}
