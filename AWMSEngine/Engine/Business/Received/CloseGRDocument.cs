using AMWUtil.Common;
using AMWUtil.Exception;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Constant.StringConst;
using AWMSModel.Criteria;
using AWMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.Engine.Business.Received
{
    public class CloseGRDocument : BaseEngine<CloseGRDocument.TDocReq, SAPInterfaceReturnvalues>
    {
        public class TDocReq
        {
            public long[] docIDs;
        }
        public class TDocRes
        {
            public SAPInterfaceReturnvalues dataSAP;
        }
   
        protected override SAPInterfaceReturnvalues ExecuteEngine(TDocReq reqVO)
        {
            
           
            foreach (var docId in reqVO.docIDs)
            {
                var doc = ADO.DataADO.GetInstant().SelectByID<amv_Document>(docId, this.BuVO);
                


                var docItem = ADO.DocumentADO.GetInstant().ListItemAndStoInDoc(docId, this.BuVO);


                var relation =   ADO.DocumentADO.GetInstant().ListParentLink(doc.ID.Value,this.BuVO);
                if (relation.Count == 0)
                {
                    var group = new List<SAPInterfaceReturnvalues>();
                    foreach (var dataDocItem in docItem)
                    {
                        var itemData = new List<SAPInterfaceReturnvalues.items>();
                        itemData.Add(new SAPInterfaceReturnvalues.items()
                        {
                            MATERIAL = dataDocItem.Code,
                            PLANT = doc.SouBranch,
                            STGE_LOC = doc.SouWarehouse,
                            BATCH = dataDocItem.Batch,
                            MOVE_TYPE = doc.Ref2,
                            ENTRY_QNT = dataDocItem.DocItemStos.Sum(x => x.Quantity),
                            ENTRY_UOM = this.StaticValue.UnitTypes.First(x => x.ID == dataDocItem.UnitType_ID.Value).Code,
                            MOVE_STLOC = doc.DesWarehouse,
                        });
                        var data = new SAPInterfaceReturnvalues()
                        {
                            GOODSMVT_HEADER = new SAPInterfaceReturnvalues.header()
                            {
                                PSTNG_DATE = doc.ActionTime.Value.ToString("yyyyMMdd"),
                                DOC_DATE = doc.DocumentDate.ToString("yyyyMMdd"),
                                REF_DOC_NO = doc.ID.ToString(),
                                HEADER_TXT = "ASRS RECEIVED",
                                GOODSMVT_CODE = "04"

                            },

                            GOODSMVT_ITEM = itemData

                        };

                        group.Add(data);
                    }
                    
                    //send to SAP
                    var typeApi1 = "";
                    var typeApi2 = "";
                    var typeApi3 = "";
                    var resultAPI1 = ADO.SAPApi.SAPInterfaceADO.GetInstant().MMI0001_FG_GOODS_RECEIPT(group, this.BuVO);
                    resultAPI1.@return.ForEach(x =>
                    {
                        typeApi1 = x.type;
                    });
                    var resultAPI2 = ADO.SAPApi.SAPInterfaceADO.GetInstant().MMI0002_PACKAGE_GOODS_RECEIPT(group, this.BuVO);
                    resultAPI1.@return.ForEach(x =>
                    {
                        typeApi2 = x.type;
                    });
                    var resultAPI3 = ADO.SAPApi.SAPInterfaceADO.GetInstant().MMI0003_CUSTOMER_RETURN(group, this.BuVO);
                    resultAPI1.@return.ForEach(x =>
                    {
                        typeApi3 = x.type;
                    });

                    if (typeApi1 == "S" || typeApi2 == "S" || typeApi3 == "S")
                    {
                      
                                ADO.DocumentADO.GetInstant().UpdateStatusToChild(doc.ID.Value,
                                null, null,
                                DocumentEventStatus.CLOSED,
                                this.BuVO);
                    }
                    else
                    {
                        throw new AMWException(this.Logger, AMWExceptionCode.V1002, "ไม่สามารถ Close เอกสารได้ เนื่องจากไม่สามารถส่งข้อมูลไป SAP ได้");
                    }
                    //send to SAP
                }
                else
                {
                    var flag = relation.TrueForAll(check => check.EventStatus == DocumentEventStatus.CLOSING || check.EventStatus == DocumentEventStatus.CLOSED);
                    if (flag)
                    {
                        var groupBySGR = new List<SAPInterfaceReturnvalues>();
                        //start groupDoc
                        var rootReceives = relation
                            .GroupBy(x => new { ActionTime = x.ActionTime, DocumentDate = x.DocumentDate,Super = x.Code})
                            .Select(x => new {
                                ActionTimes = x.Key.ActionTime,
                                DocumentDates = x.Key.DocumentDate,
                                Supers = x.Key.Super,
                                SuperIDs = x.Select(y1 => y1.ID.Value).ToList(),
                                IDs = x.Select(y => y.ID).ToList()
                        })
                        .ToList();
                        //end groupDoc
                        
                        foreach (var root in rootReceives)
                        {
                            
                            List<amt_DocumentItem> rootDocItems = new List<amt_DocumentItem>();
                            root.IDs.ForEach(x =>
                            {
                                var diList = ADO.DocumentADO.GetInstant().ListItem(x.Value, this.BuVO);
                                rootDocItems.AddRange(diList);
                                
                            });

    
                            var postData = new SAPInterfaceReturnvalues()
                            {
                                GOODSMVT_HEADER = new SAPInterfaceReturnvalues.header()
                                {
                                    PSTNG_DATE = root.ActionTimes.Value.ToString("yyyyMMdd"),
                                    DOC_DATE = root.DocumentDates.ToString("yyyyMMdd"),
                                    REF_DOC_NO = root.Supers,
                                    HEADER_TXT = "ASRS RECEIVED",
                                    GOODSMVT_CODE = "04"

                                },
                                GOODSMVT_ITEM = new List<SAPInterfaceReturnvalues.items>()
                            };

                            foreach (var dataList in rootDocItems)
                            {
                              var unitType =  this.StaticValue.UnitTypes.First(x => x.ID == dataList.UnitType_ID).Name;
                                postData.GOODSMVT_ITEM.Add(new SAPInterfaceReturnvalues.items()
                                {
                                    MATERIAL = dataList.Code,
                                    PLANT = doc.SouBranch,
                                    STGE_LOC = doc.SouWarehouse,
                                    BATCH = dataList.Batch,
                                    MOVE_TYPE = doc.Ref2,
                                    ENTRY_QNT = dataList.Quantity.Value,
                                    ENTRY_UOM = unitType,
                                    MOVE_STLOC = doc.DesWarehouse,
                                });
                            }
                            groupBySGR.Add(postData);
                        }

                        //send to SAP
                        var typeApi1 = "";
                        var typeApi2 = "";
                        var typeApi3 = "";
                         var resultAPI1 =   ADO.SAPApi.SAPInterfaceADO.GetInstant().MMI0001_FG_GOODS_RECEIPT(groupBySGR, this.BuVO);
                            resultAPI1.@return.ForEach(x =>
                            {
                               typeApi1 = x.type;
                            });
                        var resultAPI2 = ADO.SAPApi.SAPInterfaceADO.GetInstant().MMI0002_PACKAGE_GOODS_RECEIPT(groupBySGR, this.BuVO);
                            resultAPI1.@return.ForEach(x =>
                            {
                                typeApi2 = x.type;
                            });
                        var resultAPI3 = ADO.SAPApi.SAPInterfaceADO.GetInstant().MMI0003_CUSTOMER_RETURN(groupBySGR, this.BuVO);
                            resultAPI1.@return.ForEach(x =>
                            {
                                typeApi3 = x.type;
                            });

                        if(typeApi1 == "S" || typeApi2 == "S" || typeApi3 == "S")
                        {
                            foreach (var root in rootReceives)
                            {
                                root.IDs.ForEach(x =>
                                {
                                    ADO.DocumentADO.GetInstant().UpdateStatusToChild(x.Value,
                                    null, null,
                                    DocumentEventStatus.CLOSED,
                                    this.BuVO);

                                });
                                root.SuperIDs.ForEach(y =>
                                {
                                    ADO.DataADO.GetInstant().UpdateByID<amt_Document>(y, this.BuVO,
                                    new KeyValuePair<string, object>[]
                                    {
                                        new KeyValuePair<string, object>("EventStatus",DocumentEventStatus.CLOSED)
                                    });
                                });
                                
                            }
                        }
                        else
                        {
                            throw new AMWException(this.Logger, AMWExceptionCode.V1002, "ไม่สามารถ Close เอกสารได้ เนื่องจากไม่สามารถส่งข้อมูลไป SAP ได้");
                        }
                        //send to SAP
                    }
                }

            }
            return null;
        }

    }
}