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

namespace AWMSEngine.Engine.Business.Issued
{
    public class ClosedGIDocument : BaseEngine<ClosedGIDocument.TDocReq, SAPInterfaceReturnvaluesDOPick>
    {
        public class TDocReq
        {
            public long[] docIDs;
            
        }
        public class TDocRes
        {
            public SAPInterfaceReturnvaluesDOPick dataSAP;
        }

        protected override SAPInterfaceReturnvaluesDOPick ExecuteEngine(TDocReq reqVO)
        {
           
            foreach (var num in reqVO.docIDs)
            {
                var doc = ADO.DataADO.GetInstant().SelectByID<amv_Document>(num, this.BuVO);


                var docItem = ADO.DataADO.GetInstant().SelectBy<amv_DocumentItem>(new KeyValuePair<string, object>[] {
                    new KeyValuePair<string, object> ("Document_ID",num)
                }, this.BuVO);

                var relation = ADO.DocumentADO.GetInstant().ListLinkDocument(doc.ID.Value, this.BuVO);
                if (relation.Count == 0)
                {
                    var group = new List<SAPInterfaceReturnvaluesDOPick>();
                    foreach (var dataDocItem in docItem)
                    {
                        var itemData = new List<SAPInterfaceReturnvaluesDOPick.items>();
                        itemData.Add(new SAPInterfaceReturnvaluesDOPick.items()
                        {
                            DELIV_NUMB = doc.RefID,
                            DELIV_ITEM = dataDocItem.Options == null ? (decimal?)null : decimal.Parse(ObjectUtil.QryStrGetValue(dataDocItem.Options, "DocItem")),
                            MATERIAL = dataDocItem.Code,
                            PLANT = doc.SouBranch,
                            STGE_LOC = doc.SouWarehouse,
                            BATCH = dataDocItem.Batch,
                            DLV_QTY = dataDocItem.Quantity.ToString(),
                            SALES_UNIT = dataDocItem.UnitType_Code,

                        });
                        var data = new SAPInterfaceReturnvaluesDOPick()
                        {
                            ITEM_DATA = itemData
                        };

                        group.Add(data);
                    }

                    //send to SAP
                    var typeApi1 = "";

                    var resultAPI1 = ADO.SAPApi.SAPInterfaceADO.GetInstant().MMI0001_FG_GOODS_RECEIPT(group, this.BuVO);
                    resultAPI1.@return.ForEach(x =>
                    {
                        typeApi1 = x.type;
                    });


                    if (typeApi1 == "E")
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
                        var groupBySGI = new List<SAPInterfaceReturnvaluesDOPick>();
                        //start groupDoc
                        var rootIssue = relation
                            .GroupBy(x => new { RefID = x.RefID})
                            .Select(x => new {
                                RefIDs = x.Key.RefID,
                                IDs = x.Select(y => y.ID).ToList()
                            })
                        .ToList();
                        //start groupDoc

                        foreach (var root in rootIssue)
                        {
                            List<amv_DocumentItem> rootDocItems = new List<amv_DocumentItem>();
                            root.IDs.ForEach(x =>
                            { 
                                rootDocItems = ADO.DataADO.GetInstant().SelectBy<amv_DocumentItem>(new KeyValuePair<string, object>[] {
                                new KeyValuePair<string, object> ("Document_ID",x.Value)
                                 }, this.BuVO);
                            });

                            var postData = new SAPInterfaceReturnvaluesDOPick()
                            {
                                ITEM_DATA = new List<SAPInterfaceReturnvaluesDOPick.items>()
                            };

                            foreach (var dataList in rootDocItems)
                            {
                                postData.ITEM_DATA.Add(new SAPInterfaceReturnvaluesDOPick.items()
                                {
                                    DELIV_NUMB = doc.RefID,                                   
                                    DELIV_ITEM = dataList.Options == null ? (decimal?)null : long.Parse(ObjectUtil.QryStrGetValue(dataList.Options, "DocItem")),
                                    MATERIAL = dataList.Code,
                                    PLANT = doc.SouBranch,
                                    STGE_LOC = doc.SouWarehouse,
                                    BATCH = dataList.Batch,                                   
                                    DLV_QTY = dataList.Quantity.ToString(),
                                    SALES_UNIT = dataList.UnitType_Code,
                                });
                            }
                            groupBySGI.Add(postData);
                        }

                        //send to SAP
                        var typeApi1 = "";

                        var resultAPI1 = ADO.SAPApi.SAPInterfaceADO.GetInstant().MMI0001_FG_GOODS_RECEIPT(groupBySGI, this.BuVO);
                        resultAPI1.@return.ForEach(x =>
                        {
                            typeApi1 = x.type;
                        });


                        if (typeApi1 == "E")
                        {
                            relation.ForEach(x =>
                                {
                                    ADO.DocumentADO.GetInstant().UpdateStatusToChild(x.ID.Value,
                                    null, null,
                                    DocumentEventStatus.CLOSED,
                                    this.BuVO);

                                    ADO.DataADO.GetInstant().UpdateByID<amt_Document>(x.SuperID, this.BuVO,
                                    new KeyValuePair<string, object>[]
                                    {
                                        new KeyValuePair<string, object>("EventStatus",DocumentEventStatus.CLOSED)
                                    });
                                });

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