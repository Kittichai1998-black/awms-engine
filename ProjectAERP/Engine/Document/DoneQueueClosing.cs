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
using AWMSEngine.Engine.V2.Business.Document;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Constant.StringConst;
using AWMSModel.Criteria;
using AWMSModel.Criteria.SP.Request;
using AWMSModel.Entity;
using ProjectAERP.ADO.ERPApi;

namespace ProjectAERP.Engine.Document
{
    public class DoneQueueClosing : IProjectEngine<List<long>, List<long>>
    {
        public List<long> ExecuteEngine(AMWLogger logger, VOCriteria buVO, List<long> reqVO)
        {
            List<long> res = new List<long>();

            var docLists = new List<long>();
            reqVO.ForEach(x =>
            {
                var docs = AWMSEngine.ADO.DocumentADO.GetInstant().Get(x, buVO);
                if (docs != null)
                {
                    try
                    {
                        if (docs.EventStatus == DocumentEventStatus.WORKED)
                        {
                            var listItem = AWMSEngine.ADO.DocumentADO.GetInstant().ListItem(x, buVO);
                            if (listItem.TrueForAll(y => y.EventStatus == DocumentEventStatus.WORKED))
                            {
                                AWMSEngine.ADO.DocumentADO.GetInstant().UpdateStatusToChild(x, DocumentEventStatus.WORKED, null, DocumentEventStatus.CLOSING, buVO);
                                RemoveOPTDocument(x, docs.Options, buVO);

                                docLists.Add(x);

                            }
                            else
                            {
                                buVO.FinalLogDocMessage.Add(new FinalDatabaseLogCriteria.DocumentOptionMessage()
                                {
                                    docID = x,
                                    msgError = "Status of all document items didn't 'WORKED'."
                                });
                            }
                        }
                        else
                        {
                            buVO.FinalLogDocMessage.Add(new FinalDatabaseLogCriteria.DocumentOptionMessage()
                            {
                                docID = x,
                                msgError = "Status of document didn't 'WORKED'."
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

            foreach (var docID in docLists)
            {
                var docs = AWMSEngine.ADO.DocumentADO.GetInstant().Get(docID, buVO);
                if (docs.DocumentProcessType_ID != DocumentProcessTypeID.STO_MANUALTRANSFER_WM)
                {
                   if(docs.DocumentProcessType_ID == DocumentProcessTypeID.FG_PHYSICAL_COUNT_WM)
                    {
                        //Counting
                        this.SendToERPCounting(docs, buVO);
                    }
                    else
                    {

                        var disto = AWMSEngine.ADO.DocumentADO.GetInstant().ListDISTOByDoc(docID, buVO);
                        var qtyDisto = disto.Sum(x => x.BaseQuantity);
                        var listItem = AWMSEngine.ADO.DocumentADO.GetInstant().ListItem(docID, buVO);
                        var qtylistItem = listItem.Sum(x => x.BaseQuantity);
                        //if (qtyDisto == qtylistItem)
                        //{
                            if(docs.DocumentType_ID == DocumentTypeID.GOODS_RECEIVED)
                            {
                                this.SendToERP_IN(docs, buVO);
                                res = new List<long>() ;
                            }
                            else
                            {
                                this.SendToERP_OUT(docs, buVO);
                                res = new List<long>();
                        }
                            
                        //}
                    }
                }
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
        private void SendToERP_IN(amt_Document docs, VOCriteria buVO)
        {
            var StaticValue = AWMSEngine.ADO.StaticValue.StaticValueManager.GetInstant();
            var wh_order_h_dats = new List<WHInboundReturnToERP.header>();
            

            var SouWH = docs.Des_Warehouse_ID == null ? null : StaticValue.Warehouses.First(x => x.ID == docs.Sou_Warehouse_ID).Code;
            var DesWH = docs.Des_Warehouse_ID == null ? null : StaticValue.Warehouses.First(x => x.ID == docs.Des_Warehouse_ID).Code;

            var docItems = AWMSEngine.ADO.DataADO.GetInstant().SelectBy<amt_DocumentItem>(
                new SQLConditionCriteria[] {
                        new SQLConditionCriteria("Document_ID",docs.ID, SQLOperatorType.EQUALS),
                        new SQLConditionCriteria("Status",EntityStatus.ACTIVE, SQLOperatorType.EQUALS)
                }, buVO);

            var groupDocItems = docItems.GroupBy(docItem =>
            {
                var wh_orderLine = Int32.Parse(ObjectUtil.QryStrGetValue(docItem.Options, OptionVOConst.OPT_WH_ORDERLINE));
                var wh_Sequence = Int32.Parse(ObjectUtil.QryStrGetValue(docItem.Options, OptionVOConst.OPT_WH_SEQUENCE));
                var wh_seq_order = Int32.Parse(ObjectUtil.QryStrGetValue(docItem.Options, OptionVOConst.OPT_WH_SEQ_ORDER));
                return new { wh_orderLine, wh_Sequence, wh_seq_order};
            }).Select(x => new { x.Key.wh_Sequence, x.Key.wh_seq_order, x.Key.wh_orderLine, items = x.ToList() }).ToList();


            foreach (var item_h in groupDocItems)
            {
                var wh_order_d_dats = new List<WHInboundReturnToERP.items>();
                foreach (var item in item_h.items)
                {                  
                        wh_order_d_dats.Add(new WHInboundReturnToERP.items()
                        {
                            Advice = ObjectUtil.QryStrGetValue(item.Options, OptionVOConst.OPT_ADVICE),
                            Advice_line = Int32.Parse(ObjectUtil.QryStrGetValue(item.Options, OptionVOConst.OPT_ADVICE_LINE)),
                            item = item.Code,
                            Advised_qty = (double)item.Quantity.Value,
                            Location = ObjectUtil.QryStrGetValue(item.Options, OptionVOConst.OPT_LOCATION),
                            Lot = item.Lot,
                            inventory_unit = ObjectUtil.QryStrGetValue(item.Options, OptionVOConst.OPT_INVENTORY_UNIT),
                            item_group = ObjectUtil.QryStrGetValue(item.Options, OptionVOConst.OPT_ITEM_GROUP),
                            Receipt = ObjectUtil.QryStrGetValue(item.Options, OptionVOConst.OPT_RECEIPT),
                            Receipt_line = Int32.Parse(ObjectUtil.QryStrGetValue(item.Options, OptionVOConst.OPT_RECEIPT_LINE)),
                            Serial = item.RefID,
                            update_r = 3,
                            warehouse_t = ObjectUtil.QryStrGetValue(item.Options, OptionVOConst.OPT_WAREHOUSE_T),
                            warehouse_f = ObjectUtil.QryStrGetValue(item.Options, OptionVOConst.OPT_WAREHOUSE_F),
                            proj_line = ObjectUtil.QryStrGetValue(item.Options, OptionVOConst.OPT_PROJ_LINE)
                        });
                }
                wh_order_h_dats.Add(new WHInboundReturnToERP.header()
                {
                    wh_orderLine = item_h.wh_orderLine,
                    wh_Sequence = item_h.wh_Sequence,
                    wh_seq_order = item_h.wh_seq_order,
                    wh_order_d = wh_order_d_dats
                });
            }

            var dataSend = new WHInboundReturnToERP()
            {
                amw_refId = docs.Code,
                wh_origin = Int32.Parse(ObjectUtil.QryStrGetValue(docs.Options, OptionVOConst.OPT_ORINGIN)),
                company = Int32.Parse(ObjectUtil.QryStrGetValue(docs.Options, OptionVOConst.OPT_COMPANY)),
                wh_order = docs.Ref1,
                wh_seqord = Int32.Parse(ObjectUtil.QryStrGetValue(docs.Options, OptionVOConst.OPT_WH_SEQORD)),
                wh_set = Int32.Parse(ObjectUtil.QryStrGetValue(docs.Options, OptionVOConst.OPT_WH_SET)),
                wh_order_h = wh_order_h_dats

            };

            //SendERP
            try
            {
                var res = ERPInterfaceADO.GetInstant().SendToERP(dataSend, "ERP_CLOSING_IN", buVO);
                if (res.status != "Received")
                {
                    buVO.FinalLogDocMessage.Add(new FinalDatabaseLogCriteria.DocumentOptionMessage()
                    {
                        docID = docs.ID.Value,
                        msgError = res.message,

                    });

                    buVO.Logger.LogError(res.message);
                }
                else
                {
                    this.RemoveOPTDocument(docs.ID.Value, docs.Options, buVO);
                }
            }
            catch(Exception ex)
            {
                buVO.FinalLogDocMessage.Add(new FinalDatabaseLogCriteria.DocumentOptionMessage()
                {
                    docID = docs.ID.Value,
                    msgError = ex.Message,

                });
                buVO.Logger.LogError(ex.Message);
            }
          
        }

        private void SendToERP_OUT(amt_Document docs, VOCriteria buVO)
        {
            var StaticValue = AWMSEngine.ADO.StaticValue.StaticValueManager.GetInstant();
            var wh_order_h_dats = new List<WHInboundReturnToERP.header>();


            var SouWH = docs.Des_Warehouse_ID == null ? null : StaticValue.Warehouses.First(x => x.ID == docs.Sou_Warehouse_ID).Code;
            var DesWH = docs.Des_Warehouse_ID == null ? null : StaticValue.Warehouses.First(x => x.ID == docs.Des_Warehouse_ID).Code;

            var docItems = AWMSEngine.ADO.DataADO.GetInstant().SelectBy<amt_DocumentItem>(
                new SQLConditionCriteria[] {
                        new SQLConditionCriteria("Document_ID",docs.ID, SQLOperatorType.EQUALS),
                        new SQLConditionCriteria("Status",EntityStatus.ACTIVE, SQLOperatorType.EQUALS)
                }, buVO);

            var groupDocItems = docItems.GroupBy(docItem =>
            {
                var wh_orderLine = Int32.Parse(ObjectUtil.QryStrGetValue(docItem.Options, OptionVOConst.OPT_WH_ORDERLINE));
                var wh_Sequence = Int32.Parse(ObjectUtil.QryStrGetValue(docItem.Options, OptionVOConst.OPT_WH_SEQUENCE));
                var wh_seq_order = Int32.Parse(ObjectUtil.QryStrGetValue(docItem.Options, OptionVOConst.OPT_WH_SEQ_ORDER));
                return new { wh_orderLine, wh_Sequence, wh_seq_order };
            }).Select(x => new { x.Key.wh_Sequence, x.Key.wh_seq_order, x.Key.wh_orderLine, items = x.ToList() }).ToList();


            foreach (var item_h in groupDocItems)
            {
                var wh_order_d_dats = new List<WHInboundReturnToERP.items>();
                foreach (var item in item_h.items)
                {
                    wh_order_d_dats.Add(new WHInboundReturnToERP.items()
                    {
                        Advice = ObjectUtil.QryStrGetValue(item.Options, OptionVOConst.OPT_ADVICE),
                        Advice_line = Int32.Parse(ObjectUtil.QryStrGetValue(item.Options, OptionVOConst.OPT_ADVICE_LINE)),
                        item = item.Code,
                        Advised_qty = (double)item.Quantity.Value,
                        Location = ObjectUtil.QryStrGetValue(item.Options, OptionVOConst.OPT_LOCATION),
                        Lot = item.Lot,
                        inventory_unit = ObjectUtil.QryStrGetValue(item.Options, OptionVOConst.OPT_INVENTORY_UNIT),
                        item_group = ObjectUtil.QryStrGetValue(item.Options, OptionVOConst.OPT_ITEM_GROUP),
                        Receipt = ObjectUtil.QryStrGetValue(item.Options, OptionVOConst.OPT_RECEIPT),
                        Receipt_line = Int32.Parse(ObjectUtil.QryStrGetValue(item.Options, OptionVOConst.OPT_RECEIPT_LINE)),
                        Serial = item.RefID,
                        update_r = 3,
                        warehouse_t = ObjectUtil.QryStrGetValue(item.Options, OptionVOConst.OPT_WAREHOUSE_T),
                        warehouse_f = ObjectUtil.QryStrGetValue(item.Options, OptionVOConst.OPT_WAREHOUSE_F),
                        proj_line = ObjectUtil.QryStrGetValue(item.Options, OptionVOConst.OPT_PROJ_LINE)
                    });
                }
                wh_order_h_dats.Add(new WHInboundReturnToERP.header()
                {
                    wh_orderLine = item_h.wh_orderLine,
                    wh_Sequence = item_h.wh_Sequence,
                    wh_seq_order = item_h.wh_seq_order,
                    wh_order_d = wh_order_d_dats
                });
            }

            var dataSend = new WHInboundReturnToERP()
            {
                amw_refId = docs.Code,
                wh_origin = Int32.Parse(ObjectUtil.QryStrGetValue(docs.Options, OptionVOConst.OPT_ORINGIN)),
                company = Int32.Parse(ObjectUtil.QryStrGetValue(docs.Options, OptionVOConst.OPT_COMPANY)),
                wh_order = docs.Ref1,
                wh_seqord = Int32.Parse(ObjectUtil.QryStrGetValue(docs.Options, OptionVOConst.OPT_WH_SEQORD)),
                wh_set = Int32.Parse(ObjectUtil.QryStrGetValue(docs.Options, OptionVOConst.OPT_WH_SET)),
                wh_order_h = wh_order_h_dats

            };

            //SendERP
            try
            {
                var res = ERPInterfaceADO.GetInstant().SendToERP(dataSend, "ERP_CLOSING_OUT", buVO);
                if (res.status != "Received")
                {
                    buVO.FinalLogDocMessage.Add(new FinalDatabaseLogCriteria.DocumentOptionMessage()
                    {
                        docID = docs.ID.Value,
                        msgError = res.message,

                    });
                    AMWUtil.Common.ObjectUtil.QryStrSetValue(docs.Options, OptionVOConst.OPT_WH_SEQORD, buVO.FinalLogDocMessage[0].msgError);
                    buVO.Logger.LogError(res.message);
                }
                else
                {
                    this.RemoveOPTDocument(docs.ID.Value, docs.Options, buVO);
                }
            }
            catch (Exception ex)
            {
                buVO.FinalLogDocMessage.Add(new FinalDatabaseLogCriteria.DocumentOptionMessage()
                {
                    docID = docs.ID.Value,
                    msgError = ex.Message,

                });
                buVO.Logger.LogError(ex.Message);
            }

        }
        private void SendToERPCounting(amt_Document docs, VOCriteria buVO)
        {
            var StaticValue = AWMSEngine.ADO.StaticValue.StaticValueManager.GetInstant();
            var dataSend = new ERPWHCounting();

            //var count_order_h = new List<WHInboundReturnToERP.header>();

            var count_order_h = new List<ERPWHCounting.header>(); 

            var docItems = AWMSEngine.ADO.DataADO.GetInstant().SelectBy<amt_DocumentItem>(
                new SQLConditionCriteria[] {
                        new SQLConditionCriteria("Document_ID",docs.ID, SQLOperatorType.EQUALS),
                        new SQLConditionCriteria("Status",EntityStatus.ACTIVE, SQLOperatorType.EQUALS)
                }, buVO);

            
            foreach (var docItem in docItems)
            {
                var advice = ObjectUtil.QryStrGetValue(docItem.Options, OptionVOConst.OPT_ADVICE);
                var sto = AWMSEngine.ADO.DataADO.GetInstant().SelectBy<amt_StorageObject>(
                    new SQLConditionCriteria[] {
                        new SQLConditionCriteria("Code",docItem.Code, SQLOperatorType.EQUALS),
                        new SQLConditionCriteria("ObjectType",StorageObjectType.PACK, SQLOperatorType.EQUALS),
                        new SQLConditionCriteria("EventStatus","12,13,14", SQLOperatorType.IN),
                        new SQLConditionCriteria("refID",docItem.RefID, SQLOperatorType.EQUALS),
                        new SQLConditionCriteria("Lot",docItem.Lot, SQLOperatorType.EQUALS),
                        new SQLConditionCriteria("Status",EntityStatus.ACTIVE, SQLOperatorType.EQUALS)
                    }, buVO);
                var sumInv  = sto.Sum(x => x.BaseQuantity);

                count_order_h.Add(new ERPWHCounting.header()
                    {
                        Item = docItem.Code,
                        Lot = docItem.Lot,
                        Seq_Serial = Int32.Parse(ObjectUtil.QryStrGetValue(docItem.Options, OptionVOConst.OPT_SEQ_SERIAL)),
                        Loc = ObjectUtil.QryStrGetValue(docItem.Options, OptionVOConst.OPT_LOC),
                        serial = docItem.RefID,
                        wh_line = Int32.Parse(ObjectUtil.QryStrGetValue(docItem.Options, OptionVOConst.OPT_WH_LINE)),
                        inv_counted = (double)sumInv , 
                        stock_inv = Int32.Parse(ObjectUtil.QryStrGetValue(docItem.Options, OptionVOConst.OPT_STOCK_INV)), //
                        proj = docItem.Ref1
                        
                    });

                   
        
            }
                  dataSend = new ERPWHCounting()
                    {
                        amw_refId = docs.Code,
                        count_num = Int32.Parse(ObjectUtil.QryStrGetValue(docs.Options, OptionVOConst.OPT_COUNT_NUM)),
                        warehouse = StaticValue.Warehouses.First(x => x.ID == docs.Des_Warehouse_ID).Code,
                        company = Int32.Parse(ObjectUtil.QryStrGetValue(docs.Options, OptionVOConst.OPT_COMPANY)),
                        count_order = docs.Ref1,              
                        
                        count_order_h = count_order_h
                 };



            //SendERP
            try
            {
                var res = ERPInterfaceCountingADO.GetInstant().SendToERPCounting(dataSend, "ERP_CLOSING_COUNTING", buVO);

                if (res.status == "Success")
                {
                    new ClosedDocument().Execute(buVO.Logger, buVO, new List<long> { docs.ID.Value });
                }
                else
                {
                    buVO.FinalLogDocMessage.Add(new FinalDatabaseLogCriteria.DocumentOptionMessage()
                    {
                        docID = docs.ID.Value,
                        msgError = res.message,

                    });
                    buVO.Logger.LogError(res.message);
                }
            }
            catch(Exception ex)
            {
                buVO.FinalLogDocMessage.Add(new FinalDatabaseLogCriteria.DocumentOptionMessage()
                {
                    docID = docs.ID.Value,
                    msgError = ex.Message,

                });
                buVO.Logger.LogError(ex.Message);
            }

        }
        
    }
}
