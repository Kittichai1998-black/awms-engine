using ADO.WCSDB;
using ADO.WCSStaticValue;
using AMSModel.Constant.EnumConst;
using AMSModel.Criteria;
using AMSModel.Entity;
using AMWUtil.Common;
using AMWUtil.Logger;
using AWCSWebApp.GCLModel.Criteria;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace AWCSWebApp.Controllers
{
    [Route("v2")]
    [ApiController]
    public class PublicApiController : BaseController
    {
        [HttpPost("receive_order")]
        public dynamic receive_order(string qrCode)
        {
            var mapReq = this.ExecBlock<AMWRequestCreateGRDocList>("receive_order", x =>
            {
                try
                {
                    string[] qrDatas = qrCode.Split("|").Select(x => x.Trim()).ToArray();
                    string doc_wms = qrDatas[0];
                    string customer = qrDatas[1];
                    string grade = qrDatas[2];
                    string sku = qrDatas[3];
                    string lot = qrDatas[4];
                    int start_pallet = int.Parse(qrDatas[5]);
                    int end_pallet = int.Parse(qrDatas[6]);
                    string warehouse = qrDatas[7];
                    decimal qty = decimal.Parse(qrDatas[8]);
                    string unit = qrDatas[9];
                    decimal qty_per_pallet = decimal.Parse(qrDatas[10]);
                    string storage_status = qrDatas[11];
                    string discharge = qrDatas[11];
                    List<string> list_pallet = new List<string>();
                    for (int i = start_pallet; i <= end_pallet; i++)
                        list_pallet.Add($"{lot} {grade} {qty_per_pallet} {i:000}");

                    AMWRequestCreateGRDocList req = new AMWRequestCreateGRDocList()
                    {
                        RECORD = new List<AMWRequestCreateGRDocList.RECORD_LIST>()
                        {
                            new AMWRequestCreateGRDocList.RECORD_LIST()
                            {
                                LINE = new AMWRequestCreateGRDocList.LINELIST()
                                {
                                    api_ref = "WC1-"+ObjectUtil.GenUniqID(),
                                    sku = sku,
                                    grade=grade,
                                    lot=lot,
                                    customer = customer,
                                    discharge=discharge,
                                    warehouse=warehouse,
                                    doc_wms=doc_wms,
                                    qty_per_pallet=qty_per_pallet,
                                    qty=qty,
                                    start_pallet=start_pallet,
                                    end_pallet=end_pallet,
                                    unit=unit,
                                    status = storage_status,
                                    List_Pallet = list_pallet

                                }
                            }
                        }
                    };
                    return req;
                }
                catch
                {
                    throw new Exception($"QRCode Format ไม่ถูกต้อง '{qrCode}'!");
                }
            });

            if (mapReq._result.status == 1)
            {
                var res = receive_order(mapReq.datas);
                return res;
            }
            else
            {
                return mapReq;
            }

        }

        [HttpPost("receive_order")]
        public dynamic receive_order(AMWRequestCreateGRDocList req)
        {
            var res =
                this.ExecBlock<AMWRequestCreateGRDocList>(
                    "receive_order",
                    (buVO) => {
                        req.RECORD.ForEach(record =>
                        {
                            var wh = StaticValueManager.GetInstant().GetWarehouse(record.LINE.warehouse);
                            if (wh == null)
                                throw new Exception($"รหัสคลังสินค้า '{record.LINE.warehouse}' ไม่ถูกต้อง!");
                            record.LINE.List_Pallet.ForEach(pallet =>
                            {
                                var buWork = new act_BuWork()
                                {
                                    ID = null,
                                    IOType = IOType.INBOUND,
                                    SkuCode = record.LINE.sku,
                                    SkuGrade = record.LINE.grade,
                                    SkuLot = record.LINE.lot,
                                    SkuQty = record.LINE.qty_per_pallet,
                                    SkuUnit = record.LINE.unit,
                                    Des_Warehouse_ID = wh.ID.Value,
                                    LabelData = pallet,
                                    Des_Area_ID = null,
                                    Des_Location_ID = null,
                                    TrxRef = record.LINE.api_ref,
                                    DocRef = record.LINE.doc_wms,
                                    Status = EntityStatus.INACTIVE
                                };
                                buWork.ID = ADO.WCSDB.DataADO.GetInstant().Insert<act_BuWork>(buWork, buVO);
                            });
                        });

                        return null;
                    });
            return res;
        }




        [HttpPost("issue_order")]
        public dynamic issue_order(string qrCode)
        {
            var mapReq = this.ExecBlock<AMWRequestCreateGIDocList>("receive_order", x =>
            {
                try
                {
                    string[] qrDatas = qrCode.Split("|").Select(x => x.Trim()).ToArray();
                    string doc_wms = qrDatas[0];
                    string customer = qrDatas[1];
                    string grade = qrDatas[2];
                    string sku = qrDatas[3];
                    string lot = qrDatas[4];
                    string warehouse = qrDatas[5];
                    string staging = qrDatas[6];
                    decimal qty = decimal.Parse(qrDatas[7]);
                    string unit = qrDatas[8];
                    string storage_status = qrDatas[9];

                    AMWRequestCreateGIDocList req = new AMWRequestCreateGIDocList()
                    {
                        RECORD = new List<AMWRequestCreateGIDocList.RECORD_LIST>()
                        {
                            new AMWRequestCreateGIDocList.RECORD_LIST()
                            {
                                LINE = new AMWRequestCreateGIDocList.LINELIST()
                                {
                                    api_ref = "WC2-"+ObjectUtil.GenUniqID(),
                                    sku = sku,
                                    grade=grade,
                                    lot=lot,
                                    customer = customer,
                                    warehouse=warehouse,
                                    staging = staging,
                                    doc_wms=doc_wms,
                                    qty=qty,
                                    unit=unit,
                                    status = storage_status

                                }
                            }
                        }
                    };
                    return req;
                }
                catch
                {
                    throw new Exception($"QRCode Format ไม่ถูกต้อง '{qrCode}'!");
                }
            });

            if (mapReq._result.status == 1)
            {
                var res = issue_order(mapReq.datas);
                return res;
            }
            else
            {
                return mapReq;
            }

        }

        [HttpPost("issue_order")]
        public dynamic issue_order(AMWRequestCreateGIDocList req)
        {
            List<act_BuWork> buWorks = new List<act_BuWork>();
            var res =
                this.ExecBlock<AMWRequestCreateGIDocList>(
                    "receive_order",
                    (buVO) => {
                        req.RECORD.ForEach(record =>
                        {
                            var wh = StaticValueManager.GetInstant().GetWarehouse(record.LINE.warehouse);
                            if (wh == null)
                                throw new Exception($"รหัสคลังสินค้า '{record.LINE.warehouse}' ไม่ถูกต้อง!");

                            string stagingNo = record.LINE.staging.Split(",").FirstOrDefault();
                            string dockNo = record.LINE.Dock_no.Split(",").FirstOrDefault();
                            if (string.IsNullOrWhiteSpace(stagingNo))
                            {
                                stagingNo = Regex.Replace(dockNo, "^[A-Za-z ]+", "");
                            }
                            var area = StaticValueManager.GetInstant().GetArea(stagingNo);

                            var buWork = new act_BuWork()
                            {
                                ID = null,
                                TrxRef = record.LINE.api_ref,
                                DocRef = record.LINE.doc_wms,
                                Priority = record.LINE.Priority,
                                SeqGroup = DataADO.GetInstant().NextNum("BuWork_SeqGroup",false,buVO),
                                SeqIndex = 0,
                                IOType = IOType.OUTBOUND,
                                SkuCode = record.LINE.sku,
                                SkuGrade = record.LINE.grade,
                                SkuLot = record.LINE.lot,
                                SkuQty = record.LINE.qty_per_pallet,
                                SkuUnit = record.LINE.unit,
                                SkuStatus = record.LINE.status,
                                Des_Warehouse_ID = wh.ID.Value,
                                Des_Area_ID = area.ID.Value,
                                Des_Location_ID = null,
                                Remark = record.LINE.Dock_no,
                                Status = EntityStatus.ACTIVE
                            };
                            buWork.ID = ADO.WCSDB.DataADO.GetInstant().Insert<act_BuWork>(buWork, buVO);
                            buWorks.Add(buWork);
                        });

                        buWorks
                            .GroupBy(x => new
                            {
                                Des_Warehouse_ID = x.Des_Warehouse_ID,
                                Des_Area_ID = x.Des_Area_ID,
                                SkuCode = x.SkuCode,
                                SkuGrade = x.SkuGrade,
                                SkuLot = x.SkuLot,
                                SkuStatus = x.SkuStatus,
                            })
                            .ToList()
                            .ForEach(bw =>
                            {
                                List<act_BaseObject> bObjs = DataADO.GetInstant().SelectBy<act_BaseObject>(
                                    ListKeyValue<string, object>
                                        .New("Warehouse_ID", bw.Key.Des_Warehouse_ID)
                                        .Add("SkuCode", bw.Key.SkuCode)
                                        .Add("SkuGrade", bw.Key.SkuGrade)
                                        .Add("SkuLot", bw.Key.SkuLot)
                                        .Add("SkuStatus", bw.Key.SkuStatus)
                                        .Add("EventStatus", BaseObjectEventStatus.IDLE)
                                        .Add("Status", EntityStatus.ACTIVE),
                                    buVO)
                                .OrderByDescending(x => StaticValueManager.GetInstant().GetLocation(x.Location_ID).GetBay())
                                .OrderByDescending(x => StaticValueManager.GetInstant().GetLocation(x.Location_ID).GetBank())
                                .ToList();

                                long seqGroup = DataADO.GetInstant().NextNum("McWorkGroup", false, buVO);
                                decimal dis_qty = bw.Sum(x => x.SkuQty);
                                foreach (var bObj in bObjs)
                                {
                                    if (dis_qty <= 0)
                                    {
                                        break;
                                    }
                                    else
                                    {
                                        act_McWork mcWork = new act_McWork()
                                        {
                                            ID = null,
                                            Priority = 1,
                                            SeqGroup = seqGroup,
                                            SeqItem = 10,
                                            BaseObject_ID = bObj.ID.Value,
                                            IOType = IOType.OUTBOUND,
                                            QueueType = 2,
                                            Cur_Warehouse_ID = bObj.Warehouse_ID,
                                            Cur_Area_ID = bObj.Area_ID,
                                            Cur_Location_ID = bObj.Location_ID,
                                            Sou_Area_ID = bObj.Area_ID,
                                            Sou_Location_ID = bObj.Location_ID,
                                            Des_Area_ID = bw.Key.Des_Area_ID.Value,
                                            Des_Location_ID = null,
                                            ActualTime = DateTime.Now,
                                            Cur_McObject_ID = null,
                                            StartTime = DateTime.Now,
                                            Rec_McObject_ID = null,
                                            TreeRoute = "{}",
                                            EndTime = null,
                                            WMS_WorkQueue_ID = null,
                                            DocRef = string.Join(",", bw.Select(x => x.DocRef).ToArray()),
                                            Remark = string.Join(",", bw.Select(x => x.DocRef).ToArray()),
                                            EventStatus = McWorkEventStatus.IN_QUEUE,
                                            Status = EntityStatus.ACTIVE
                                        };
                                        DataADO.GetInstant().Insert<act_McWork>(mcWork, buVO);

                                        bObj.EventStatus = BaseObjectEventStatus.OUTBOUND;
                                        DataADO.GetInstant().Insert<act_BaseObject>(bObj, buVO);

                                    }
                                }
                            });




                        return null;
                    });
            return res;
        }

        [HttpGet("buwork")]
        public dynamic get_buWork(string wh, IOType iotype, string sku, string lot, int max)
        {
            var res =
            this.ExecBlock<List<act_BuWork>>("get_buWork", (buVo) =>
            {
                var warehouse = StaticValueManager.GetInstant().GetWarehouse(wh);

                var buWorks = DataADO.GetInstant().SelectBy<act_BuWork>(
                    new SQLConditionCriteria[]
                    {
                        new SQLConditionCriteria("IOType",iotype, SQLOperatorType.EQUALS),
                        new SQLConditionCriteria("Status",EntityStatus.REMOVE, SQLOperatorType.NOTEQUALS),
                        new SQLConditionCriteria("Des_Warehouse_ID",warehouse.ID.Value, SQLOperatorType.EQUALS),
                        new SQLConditionCriteria("SkuCode",sku, SQLOperatorType.EQUALS_OR_EMPTY),
                        new SQLConditionCriteria("SkuLot",lot, SQLOperatorType.EQUALS_OR_EMPTY)
                    },
                    new SQLOrderByCriteria[] { new SQLOrderByCriteria("id", SQLOrderByType.DESC) },
                    max, 0,
                    buVo);

                return buWorks;
            });
            return new act_BuWork[] { new act_BuWork(),new act_BuWork() { ID=99} };
        }

    }
}
