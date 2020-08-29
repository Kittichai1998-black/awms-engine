﻿using AMWUtil.Common;
using AMWUtil.Exception;
using AWMSEngine.ADO.StaticValue;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Constant.StringConst;
using AWMSModel.Criteria;
using AWMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.Engine.V2.Business.Picking
{
    public class PickingChecker: BaseEngine<PickingChecker.TReq, GetSTOPicking.TRes>
    {
        public class TReq
        {
            public long bstoID;
            public string bstoCode;
            public long docID;
            public long distoID;
            public long docItemID;
            public long pstoID;
            public decimal pickQty;
            public decimal pickBaseQty;
        }
     
        protected override GetSTOPicking.TRes ExecuteEngine(TReq reqVO)
        {
            
            var doc = ADO.DocumentADO.GetInstant().Get(reqVO.docID, this.BuVO);
            doc.DocumentItems = ADO.DocumentADO.GetInstant().ListItemAndDisto(reqVO.docID, this.BuVO);

            var pstos = ADO.StorageObjectADO.GetInstant().Get(reqVO.pstoID, StorageObjectType.PACK, false, false, this.BuVO);

            var docitem = doc.DocumentItems.Find(y => y.ID == reqVO.docItemID); 
            var disto = docitem.DocItemStos.Find(z => z.ID == reqVO.distoID);

            if(pstos.baseQty >= reqVO.pickBaseQty)
            {
                if (disto.BaseQuantity == null)
                {
                    disto.BaseQuantity = reqVO.pickBaseQty;
                    ManageSTO(pstos, disto);

                }
                else
                {
                    ManageSTO(pstos, disto);
                }
            }
            else
            {
                throw new AMWException(Logger, AMWExceptionCode.B0001, "จำนวนสินค้าไม่พอสำหรับการเบิก");
            }

            updatePallet(pstos.parentID.Value, StorageObjectType.BASE);

            void ManageSTO(StorageObjectCriteria sto, amt_DocumentItemStorageObject disto)
            {
                var updSto = new StorageObjectCriteria();
                updSto = sto;
                updSto.baseQty -= disto.BaseQuantity.Value;
                var qtyConvert = StaticValue.ConvertToBaseUnitBySKU(sto.skuID.Value, updSto.baseQty, updSto.unitID);
                updSto.qty = qtyConvert.newQty;


                //update new sto pick
                var issuedSto = new StorageObjectCriteria();
                issuedSto = sto.Clone();
                issuedSto.id = null;
                issuedSto.baseQty = disto.BaseQuantity.Value;
                var qtyConvert_issued = StaticValue.ConvertToBaseUnitBySKU(issuedSto.skuID.Value, issuedSto.baseQty, issuedSto.unitID);
                issuedSto.qty = qtyConvert_issued.newQty;
                issuedSto.parentID = null;
                issuedSto.mapstos = null;
                var done_des_event_status = ObjectUtil.QryStrGetValue(issuedSto.options, OptionVOConst.OPT_DONE_DES_EVENT_STATUS);
                if (done_des_event_status == null || done_des_event_status.Length == 0)
                {
                    issuedSto.eventStatus = StorageObjectEventStatus.PICKED;
                }
                else
                {
                    StorageObjectEventStatus eventStatus = EnumUtil.GetValueEnum<StorageObjectEventStatus>(done_des_event_status);
                    issuedSto.eventStatus = eventStatus;
                }

                var stoIDIssued = ADO.StorageObjectADO.GetInstant().PutV2(issuedSto, this.BuVO);
                ADO.DistoADO.GetInstant().Update(disto.ID.Value, stoIDIssued, issuedSto.qty, issuedSto.baseQty, EntityStatus.ACTIVE, this.BuVO);
                //update status ให้เป็น Done เมื่อไม่มี Des_WaveSeq_ID
                if (disto.Des_WaveSeq_ID == null)
                {
                    ADO.DistoADO.GetInstant().Update(disto.ID.Value, EntityStatus.DONE, this.BuVO);
                }

                if (updSto.baseQty == 0)
                {
                    updSto.eventStatus = StorageObjectEventStatus.REMOVED;
                    ADO.StorageObjectADO.GetInstant().PutV2(updSto, this.BuVO);
                }
                else
                {
                    var distoAll = ADO.DataADO.GetInstant().SelectBy<amt_DocumentItemStorageObject>(new SQLConditionCriteria[]
                                                   {
                                                        new SQLConditionCriteria("Sou_StorageObject_ID", sto.id.Value, SQLOperatorType.EQUALS),
                                                        new SQLConditionCriteria("Status", EntityStatus.REMOVE, SQLOperatorType.NOTEQUALS),
                                                   }, this.BuVO);
                    if (distoAll.TrueForAll(x => x.Status == EntityStatus.DONE))
                    {
                        var upd_done_sou_event_status = ObjectUtil.QryStrGetValue(updSto.options, OptionVOConst.OPT_DONE_SOU_EVENT_STATUS);
                        if (upd_done_sou_event_status == null || upd_done_sou_event_status.Length == 0)
                        {
                            updSto.eventStatus = StorageObjectEventStatus.RECEIVED;
                        }
                        else
                        {
                            StorageObjectEventStatus eventStatus = EnumUtil.GetValueEnum<StorageObjectEventStatus>(upd_done_sou_event_status);
                            updSto.eventStatus = eventStatus;
                            RemoveOPTEventSTO(updSto.id.Value, updSto.options, OptionVOConst.OPT_DONE_SOU_EVENT_STATUS, this.BuVO);
                        }
                    }
                    ADO.StorageObjectADO.GetInstant().PutV2(updSto, this.BuVO);
                }

            }

            void updatePallet(long parent_id, StorageObjectType parent_type)
            {
                // ถ้าไม่มี status pack 1 => ถ้ามันมี 3 พาเลทจบงาน ไม่มีลบพาเลท

                if (parent_type != StorageObjectType.LOCATION)
                {
                    var sto = ADO.StorageObjectADO.GetInstant().Get(parent_id, StorageObjectType.BASE, false, true, BuVO);
                    var stoLists = new List<StorageObjectCriteria>();
                    if (sto != null)
                        stoLists = sto.ToTreeList();

                    var all_pack = stoLists.FindAll(x => x.parentID == parent_id && x.parentType == parent_type);
                    if (stoLists.Count() > 0 && all_pack.TrueForAll(x => {
                        var status = StaticValueManager.GetInstant().GetStatusInConfigByEventStatus<StorageObjectEventStatus>(x.eventStatus);
                        return status != EntityStatus.ACTIVE;
                    })) //ต้องไม่ใช่1ทั้งหมด
                    {
                        var parentUpdate = stoLists.Find(x => x.id == parent_id);

                        if (all_pack.TrueForAll(x => {
                            var status = StaticValueManager.GetInstant().GetStatusInConfigByEventStatus<StorageObjectEventStatus>(x.eventStatus);
                            return status == EntityStatus.DONE;
                        }))
                        {
                            ADO.StorageObjectADO.GetInstant().UpdateStatus(parentUpdate.id.Value, null, null, StorageObjectEventStatus.REMOVE, this.BuVO);
                            if (parentUpdate.parentID.HasValue)
                                updatePallet(parentUpdate.parentID.Value, parentUpdate.parentType.Value);
                        }

                    }

                }
            }



            //ถ้ายังมีของให้pick
            GetSTOPicking.TRes res = new GetSTOPicking.TRes();
            res = new GetSTOPicking().Execute(this.Logger, this.BuVO, new GetSTOPicking.TReq() { bstoCode = reqVO.bstoCode });
            if (res == null)
            {//disto ปิดหมด 

                res = new GetSTOPicking.TRes()
                {
                    docIDs = new List<long>() { reqVO.docID }
                };
            }
            else
            {
                res.docIDs = new List<long>() { reqVO.docID };
            }
            return res;
        }
        private void RemoveOPTEventSTO(long bsto_id, string bsto_options, string opt, VOCriteria buVO)
        {
            //remove OPT_DONE_DES_EVENT_STATUS
            var listkeyRoot = ObjectUtil.QryStrToKeyValues(bsto_options);
            var opt_done = "";

            if (listkeyRoot != null && listkeyRoot.Count > 0)
            {
                listkeyRoot.RemoveAll(x => x.Key.Equals(opt));
                opt_done = ObjectUtil.ListKeyToQryStr(listkeyRoot);
            }

            AWMSEngine.ADO.DataADO.GetInstant().UpdateByID<amt_StorageObject>(bsto_id, buVO,
                    new KeyValuePair<string, object>[] {
                        new KeyValuePair<string, object>("Options", opt_done)
                    });
        }
    }
}
