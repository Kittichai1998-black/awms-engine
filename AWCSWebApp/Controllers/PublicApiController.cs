﻿using ADO.WCSDB;
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
        [HttpPost("receive_order_qr")]
        public dynamic receive_order(dynamic requirt)
        {
            var mapReq = this.ExecBlock<AMWRequestCreateGRDocList>("receive_order", x =>
            {
                try
                {
                    string[] qrDatas = ((string)requirt.qrCode).Split("|").Select(x => x.Trim()).ToArray();
                    string doc_wms = qrDatas[0];
                    string customer = qrDatas[1];
                    string grade = qrDatas[2];
                    string sku = qrDatas[3];
                    string lot = qrDatas[4];
                    int start_pallet = int.Parse(qrDatas[5].Substring(0,4));
                    int end_pallet = int.Parse(qrDatas[5].Substring(4));
                    string warehouse = qrDatas[6];
                    decimal qty = decimal.Parse(qrDatas[7]);
                    string unit = qrDatas[8];
                    decimal qty_per_pallet = decimal.Parse(qrDatas[9]);
                    string storage_status = qrDatas[10];
                    string discharge = qrDatas[11];
                    List<string> list_pallet = new List<string>();
                    for (int i = start_pallet; i <= end_pallet; i++)
                        list_pallet.Add($"{grade}  {lot}  {i:0000}");

                    AMWRequestCreateGRDocList req = new AMWRequestCreateGRDocList()
                    {
                        RECORD = new List<AMWRequestCreateGRDocList.RECORD_LIST>()
                        {
                            new AMWRequestCreateGRDocList.RECORD_LIST()
                            {
                                LINE = new AMWRequestCreateGRDocList.LINELIST()
                                {
                                    api_ref = "WC1."+ObjectUtil.GenUniqID(),
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
                    throw new Exception($"QRCode Format ไม่ถูกต้อง!");
                }
            });

            if (mapReq._result.status == 1)
            {
                var res = receive_order(mapReq.response);
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
                this.ExecBlock<dynamic>(
                    "receive_order",
                    (buVO) => {
                        List<act_BuWork> buWorks = new List<act_BuWork>();
                        req.RECORD.ForEach(record =>
                        {
                            var wh = StaticValueManager.GetInstant().GetWarehouseByName(record.LINE.warehouse);
                            if (wh == null)
                                throw new Exception($"รหัสคลังสินค้า Name:'{record.LINE.warehouse}' ไม่ถูกต้อง!");

                            var freeLocs = LocationADO.GetInstant().List_FreeLocationBayLv(wh.ID.Value, record.LINE.List_Pallet.Count, buVO);
                            int i_freeLocs = 0;
                            record.LINE.List_Pallet.ForEach(pallet =>
                            {
                                pallet = pallet.Trim();
                                var itemNo = pallet.Substring(pallet.LastIndexOf(' ') + 1);
                                var buWork = new act_BuWork()
                                {
                                    ID = null,
                                    ItemNo = itemNo,
                                    IOType = IOType.INBOUND,
                                    SkuCode = record.LINE.sku,
                                    SkuGrade = record.LINE.grade,
                                    SkuLot = record.LINE.lot,
                                    SkuQty = record.LINE.qty_per_pallet,
                                    SkuUnit = record.LINE.unit,
                                    Des_Warehouse_ID = wh.ID.Value,
                                    Des_Area_ID = freeLocs[i_freeLocs].Area_ID,
                                    Des_Location_ID = freeLocs[i_freeLocs].ID.Value,
                                    LabelData = pallet,
                                    TrxRef = record.LINE.api_ref,
                                    DocRef = record.LINE.doc_wms,
                                    SkuStatus = record.LINE.status,
                                    Status = EntityStatus.INACTIVE
                                };
                                i_freeLocs++;
                                buWork.ID = ADO.WCSDB.DataADO.GetInstant().Insert<act_BuWork>(buWork, buVO);
                                buWorks.Add(buWork);
                            });
                        });

                        return buWorks.Select(x=>new { 
                            pallet = x.LabelData,
                            location = StaticValueManager.GetInstant().GetLocation(x.Des_Location_ID.Value).Name 
                        });
                    });
            return res;
        }




        [HttpPost("issue_order_qr")]
        public dynamic issue_order_qr(dynamic request)
        {
            var mapReq = this.ExecBlock<AMWRequestCreateGIDocList>("receive_order_qr", x =>
            {
                try
                {
                    string[] qrDatas = ((string)request.qrCode).Split("|").Select(x => x.Trim()).ToArray();
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
                                    api_ref = "WC2."+ObjectUtil.GenUniqID(),
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
                    throw new Exception($"QRCode Format ไม่ถูกต้อง!");
                }
            });

            if (mapReq._result.status == 1)
            {
                var res = issue_order(mapReq.response);
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
                            var wh = StaticValueManager.GetInstant().GetWarehouseByName(record.LINE.warehouse);
                            if (wh == null)
                                throw new Exception($"รหัสคลังสินค้า '{record.LINE.warehouse}' ไม่ถูกต้อง!");

                            string stagingNo = record.LINE.staging==null?string.Empty: record.LINE.staging.Split(",").FirstOrDefault();
                            string dockNo = record.LINE.Dock_no == null ? string.Empty: record.LINE.Dock_no.Split(",").FirstOrDefault();
                            if (string.IsNullOrEmpty(stagingNo))
                                throw new Exception("กรุณาระบุบ Staging ปลายทาง!");
                            
                            if (string.IsNullOrWhiteSpace(stagingNo))
                            {
                                stagingNo = Regex.Replace(dockNo, "^[A-Za-z ]+", "");
                            }
                            acs_Area area = null;
                            var areaInWH = StaticValueManager.GetInstant().ListArea_ByWarehouse(wh.Code);
                            int _stagingNo = stagingNo.Get2<int>();
                            int _i = 1;
                            do
                            {
                                area = StaticValueManager.GetInstant().GetArea(_stagingNo.ToString());
                                _stagingNo = _stagingNo + _i;
                                if (_stagingNo % 100 > 20)
                                    _i = -1;
                                else if (_stagingNo % 100 == 0)
                                    _i = 1;
                            } while (area == null);
                            

                            var buWork = new act_BuWork()
                            {
                                ID = null,
                                TrxRef = record.LINE.api_ref,
                                DocRef = record.LINE.doc_wms,
                                Priority = record.LINE.Priority,
                                SeqGroup = DataADO.GetInstant().NextNum("McWorkSeqGroup", false,buVO),
                                SeqIndex = 0,
                                IOType = IOType.OUTBOUND,
                                SkuCode = record.LINE.sku,
                                SkuGrade = record.LINE.grade,
                                SkuLot = record.LINE.lot,
                                SkuQty = record.LINE.qty,
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

                                long seqGroup = DataADO.GetInstant().NextNum("McWorkSeqGroup", false, buVO);
                                decimal dis_qty = bw.Sum(x => x.SkuQty);
                                if (dis_qty > bObjs.Sum(x => x.SkuQty))
                                    throw new Exception($"จำนวนสินค้า '{bw.Key.SkuCode} {bw.Key.SkuLot} qty:{dis_qty}' ที่ต้องการเบิก มีมากกว่าจำนวนที่จัดเก็บ qty:{bObjs.Sum(x => x.SkuQty)}!");
                               
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
            return res;
        }


        [HttpPost("register_pallet")]
        public dynamic post_register_pallet(dynamic request)
        {
            string mcCode = ((string)request.mcCode).Trim();
            string qrCode = ((string)request.qrCode).Trim();

            var res =
            this.ExecBlock<act_BaseObject>("post_register_pallet", (buVo) =>
            {
                //////////////////ตรวจสอบรหัสเครื่องจักร gate
                var mcMst = StaticValueManager.GetInstant().GetMcMaster(mcCode);
                if (mcMst == null)
                    throw new Exception($"ไม่พบเลทที่ Machine '{mcCode}' ในระบบ!");

                var mcObj = DataADO.GetInstant().SelectBy<act_McObject>(
                    new SQLConditionCriteria[]
                    {
                        new SQLConditionCriteria("McMaster_ID",mcMst.ID.Value, SQLOperatorType.EQUALS),
                        new SQLConditionCriteria("Status", EntityStatus.ACTIVE, SQLOperatorType.EQUALS)
                    },
                    buVo).FirstOrDefault();

                //////////////////ตรวจสอบงานรับเข้า
                var buWorks = DataADO.GetInstant().SelectBy<act_BuWork>(
                    new SQLConditionCriteria[]
                    {
                        new SQLConditionCriteria("LabelData",qrCode, SQLOperatorType.EQUALS),
                        new SQLConditionCriteria("Status", new EntityStatus[]{ EntityStatus.ACTIVE , EntityStatus.INACTIVE}, SQLOperatorType.IN)
                    },
                    buVo).FirstOrDefault();
                if (buWorks == null)
                    throw new Exception($"ไม่พบเลขที่ QR '{qrCode}' ในงานรับเข้า!");

                /////////////////////////////////////ตรวจสอบพาเลทซ้ำ ถ้ามีซ้ำและยังไม่รับเข้าให้ให้ลบ แต่ถ้าอยู่ระหว่างรับเข้าให้ error
                var bo = BaseObjectADO.GetInstant().GetByLabel(qrCode, buVo);
                if (bo != null)
                {
                    //มีซ้ำ ลบ
                    if (bo.EventStatus == BaseObjectEventStatus.TEMP)
                    {
                        bo.Status = EntityStatus.REMOVE;
                        DataADO.GetInstant().UpdateBy<act_BaseObject>(bo, buVo);
                        return bo;
                    }
                    //อยู่ระหว่างรับเข้า
                    else
                        throw new Exception($"พาเลท '{bo.LabelData}' อยู่ระหว่างรับเข้า ไม่สามารถรับเข้าซ้ำได้");
                }

                ////////////////////////ตรวจสอบงานบนเครื่องจักร Gate
                bo = ADO.WCSDB.BaseObjectADO.GetInstant().GetByMcObject(mcObj.ID.Value, buVo);
                if (bo != null)
                    throw new Exception($"Gate '{mcMst.Code}' อยู่ระหว่างรับเข้า พาเลท '{bo.LabelData}'!");

                string baseCode;
                do
                {
                    baseCode = (DataADO.GetInstant().NextNum("base_no", false, buVo) % (Math.Pow(10, 10))).ToString("0000000000");
                } while (DataADO.GetInstant().SelectByCodeActive<act_BaseObject>(baseCode, buVo) != null);

                var curLoc = StaticValueManager.GetInstant().GetLocation(mcObj.Cur_Location_ID.Value);
                var curArea = StaticValueManager.GetInstant().GetArea(curLoc.Area_ID);
                var curWH = StaticValueManager.GetInstant().GetWarehouse(curArea.Warehouse_ID);

                act_BaseObject baseObj = new act_BaseObject()
                {
                    ID = null,
                    Code = baseCode,
                    Model = "N/A",
                    McObject_ID = mcObj.ID,
                    Warehouse_ID = curWH.ID.Value,
                    Area_ID = curArea.ID.Value,
                    Location_ID = curLoc.ID.Value,
                    LabelData = qrCode,
                    EventStatus = BaseObjectEventStatus.TEMP,
                    Status = EntityStatus.ACTIVE
                };

                baseObj.ID = DataADO.GetInstant().Insert<act_BaseObject>(baseObj, buVo);
                return baseObj;
            });
            return res;
        }



    }
}
