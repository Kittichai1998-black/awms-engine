using AWMSEngine.ADO;
using AWMSEngine.Engine;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AWMSModel.Criteria.SP.Request;
using AWMSModel.Criteria.SP.Response;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Entity;

namespace ProjectPanKan.Engine.Business
{
    public class DocumentItemListAndLocationList : BaseEngine<long, DocumentItemListAndLocationList.TRes>
    {
        public class TRes
        {
            public long docID;
            public List<DocItemList> docItemLists;
            public List<LocationList> locationLists;

            public class DocItemList
            {
                public long docItemID;
                public string code;
                public string name;
                public string unit;
                public decimal? pickQty;
                public decimal? allQty;
            }
            public class LocationList
            {
                public string locCode;
                public string areaCode;
                public string baseCode;
            }
        }

        protected override TRes ExecuteEngine(long docID)
        {
            var docItems = DocumentADO.GetInstant().ListItemAndDisto(docID, BuVO);
            var proRes = new List<SPOutSTOProcessQueueCriteria>();
            docItems.ForEach(docItem =>
            {
                var orderBys = new List<SPInSTOProcessQueueCriteria.OrderByProcess>(){
                    new SPInSTOProcessQueueCriteria.OrderByProcess()
                    {
                        fieldName = "psto.createtime",
                        orderByType = SQLOrderByType.DESC
                    }};

                SPInSTOProcessQueueCriteria stoProcCri = null;
                var baseCode = AMWUtil.Common.ObjectUtil.QryStrGetValue(docItem.Options, "palletcode");
                if (string.IsNullOrWhiteSpace(baseCode))
                {
                    var condition = new SPInSTOProcessQueueCriteria.ConditionProcess()
                    {
                        baseQty = docItem.BaseQuantity - docItem.DocItemStos.Sum(x => x.BaseQuantity),
                        options = docItem.Options
                    };
                    stoProcCri = new SPInSTOProcessQueueCriteria()
                    {
                        skuCode = docItem.Code,
                        eventStatuses = new List<StorageObjectEventStatus> { StorageObjectEventStatus.RECEIVED },
                        useFullPick = false,
                        warehouseCode = "662",
                        condition = condition,
                        orderBys = orderBys,
                        not_pstoIDs = new List<long>()
                    };
                }
                else
                {
                    var condition = new SPInSTOProcessQueueCriteria.ConditionProcess();
                    stoProcCri = new SPInSTOProcessQueueCriteria()
                    {
                        baseCode = baseCode,
                        eventStatuses = new List<StorageObjectEventStatus> { StorageObjectEventStatus.RECEIVED },
                        useFullPick = false,
                        warehouseCode = "662",
                        condition = condition,
                        orderBys = orderBys,
                        not_pstoIDs = new List<long>()
                    };
                }

                var _pickStos = StorageObjectADO.GetInstant().ListByProcessQueue(stoProcCri, this.BuVO);
                proRes.AddRange(_pickStos);
            });


            var resDocItem = new List<TRes.DocItemList>();
            docItems.ForEach(x =>
            {
                var pack = DataADO.GetInstant().SelectByID<ams_PackMaster>(x.PackMaster_ID, BuVO);
                var unit = DataADO.GetInstant().SelectByID<ams_UnitType>(x.UnitType_ID, BuVO);
                resDocItem.Add(new TRes.DocItemList
                {
                    docItemID = x.ID.Value,
                    code = x.Code,
                    name = pack.Name,
                    unit = unit.Name,
                    pickQty = x.DocItemStos.Sum(y => y.BaseQuantity),
                    allQty = x.BaseQuantity
                });
            });

            var resLoc = new List<TRes.LocationList>();
            proRes.ForEach(x => resLoc.Add(new TRes.LocationList
            {
                baseCode = string.IsNullOrWhiteSpace(x.bstoCode) ? x.pstoCode : x.bstoCode,
                locCode = x.locationCode,
                areaCode = x.areaCode
            }));

            var res = new TRes()
            {
                docID = docID,
                docItemLists = resDocItem,
                locationLists = resLoc
            };

            return res;
        }
    }
}
