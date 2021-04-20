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
    public partial class PublicApiController : BaseController
    {
        [HttpPost("post_receive_order_qr")]
        public dynamic post_receive_order(dynamic requirt)
        {
            var mapReq = this.ExecBlock<AMWRequestCreateGRDocList>("receive_order", x =>
            {
                try
                {
                    string[] qrDatas = ((string)requirt.qrCode).Split("|").Select(x => x.Trim()).ToArray();
                    if (string.IsNullOrWhiteSpace(qrDatas[0]))
                        throw new Exception("กรุณากรอก เลข BO");
                    if (string.IsNullOrWhiteSpace(qrDatas[1]))
                        throw new Exception("กรุณากรอก รหัสลูกค้า");
                    if (string.IsNullOrWhiteSpace(qrDatas[2]))
                        throw new Exception("กรุณากรอก ข้อมูลเกรดสินค้า");
                    if (string.IsNullOrWhiteSpace(qrDatas[3]))
                        throw new Exception("กรุณากรอก รหัสสินค้า");
                    if (string.IsNullOrWhiteSpace(qrDatas[4]))
                        throw new Exception("กรุณากรอก ข้อมูลลอทสินค้า");
                    if (string.IsNullOrWhiteSpace(qrDatas[6]))
                        throw new Exception("กรุณากรอก ข้อมูลคลังสินค้า");
                    if (qrDatas[5].Length<4)
                        throw new Exception("กรุณากรอก ข้อมูลพาเลทเริ่มต้น");
                    if (qrDatas[5].Length < 8)
                        throw new Exception("กรุณากรอก ข้อมูลพาเลทสุดท้าย");
                    if (string.IsNullOrWhiteSpace(qrDatas[9]))
                        throw new Exception("กรุณากรอก จำนวนสินค้าต่อพาเลท");
                    if (string.IsNullOrWhiteSpace(qrDatas[8]))
                        throw new Exception("กรุณากรอก หน่วยนับสินค้าในพาเลท");
                    if (string.IsNullOrWhiteSpace(qrDatas[10]))
                        throw new Exception("กรุณากรอก สถานะสินค้า");
                    if (string.IsNullOrWhiteSpace(qrDatas[11]))
                        throw new Exception("กรุณากรอก Dischare");

                    string doc_wms = qrDatas[0];
                    string customer = qrDatas[1];
                    string grade = qrDatas[2];
                    string sku = qrDatas[3];
                    string lot = qrDatas[4];
                    int start_pallet = int.Parse(qrDatas[5].Substring(0,4));
                    int end_pallet = int.Parse(qrDatas[5].Substring(4));
                    if (start_pallet > end_pallet)
                        throw new Exception("พาเลทเริ่มต้น ต้อมมีค่าน้อยกว่าหรือเท่ากับ พาเลทสุดทาย");

                    string warehouse = qrDatas[6];
                    string unit = qrDatas[8];
                    decimal qty_per_pallet = decimal.Parse(qrDatas[9]);
                    if (qty_per_pallet <= 0)
                        throw new Exception("จำนวนสินค้าต่อพาเลทต้องมากกว่า 0");
                    string storage_status = qrDatas[10];
                    string discharge = qrDatas[11];
                    List<string> list_pallet = new List<string>();
                    for (int i = start_pallet; i <= end_pallet; i++)
                        list_pallet.Add(string.Format("{0}{1}{2}{3}{4:0000}",
                            grade, new string(' ', 9 - grade.Length),
                            lot, new string(' ', 11 - lot.Length),
                            i));
                    decimal qty = qty_per_pallet * list_pallet.Count;

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
                    throw;// new Exception($"QRCode Format ไม่ถูกต้อง!");
                }
            });

            if (mapReq._result.status == 1)
            {
                var res = post_receive_order(mapReq.response);
                return res;
            }
            else
            {
                return mapReq;
            }

        }

        [HttpPost("post_receive_order")]
        public dynamic post_receive_order(AMWRequestCreateGRDocList req)
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
                            bool isDesc = wh.Code.In("W08");
                            
                            var freeLocs = LocationADO.GetInstant().List_FreeLocationBayLv(wh.ID.Value, record.LINE.List_Pallet.Count, isDesc,buVO);
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
                                    Customer = record.LINE.customer,
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




        [HttpPost("post_issue_order_qr")]
        public dynamic post_issue_order_qr(dynamic request)
        {
            var mapReq = this.ExecBlock<AMWRequestCreateGIDocList>("receive_order_qr", x =>
            {
                try
                {
                    string[] qrDatas = ((string)request.qrCode).Split("|").Select(x => x.Trim()).ToArray();
                    if (string.IsNullOrWhiteSpace(qrDatas[0]))
                        throw new Exception("กรุณากรอก เลขที่ DO");
                    if (string.IsNullOrWhiteSpace(qrDatas[1]))
                        throw new Exception("กรุณากรอก รหัสลูกค้า");
                    if (string.IsNullOrWhiteSpace(qrDatas[2]))
                        throw new Exception("กรุณากรอก ข้อมูลเกรดสินค้า");
                    if (string.IsNullOrWhiteSpace(qrDatas[3]))
                        throw new Exception("กรุณากรอก รหัสสินค้า");
                    if (string.IsNullOrWhiteSpace(qrDatas[4]))
                        throw new Exception("กรุณากรอก ข้อมูลลอทสินค้า");
                    if (string.IsNullOrWhiteSpace(qrDatas[5]))
                        throw new Exception("กรุณากรอก ข้อมูลคลังสินค้า");
                    if (string.IsNullOrWhiteSpace(qrDatas[6]))
                        throw new Exception("กรุณากรอก จุดเบิกปลายทาง");
                    if (string.IsNullOrWhiteSpace(qrDatas[7]))
                        throw new Exception("กรุณากรอก จำนวนขอเบิก");
                    if (string.IsNullOrWhiteSpace(qrDatas[8]))
                        throw new Exception("กรุณากรอก หน่วยนับสินค้าในพาเลท");
                    if (string.IsNullOrWhiteSpace(qrDatas[9]))
                        throw new Exception("กรุณากรอก สถานะสินค้า");

                    string doc_wms = qrDatas[0];
                    string customer = qrDatas[1];
                    string grade = qrDatas[2];
                    string sku = qrDatas[3];
                    string lot = qrDatas[4];
                    string warehouse = qrDatas[5];
                    string staging = qrDatas[6];
                    decimal qty = decimal.Parse(qrDatas[7]);
                    if (qty <= 0)
                        throw new Exception("จำนวนสินค้าขอเบิกต้องมากกว่า 0");
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
                    throw;// new Exception($"QRCode Format ไม่ถูกต้อง!");
                }
            });

            if (mapReq._result.status == 1)
            {
                var res = post_issue_order(mapReq.response);
                return res;
            }
            else
            {
                return mapReq;
            }

        }

        [HttpPost("post_issue_order")]
        public dynamic post_issue_order(AMWRequestCreateGIDocList req)
        {
            var res =
                this.ExecBlock<AMWRequestCreateGIDocList>(
                    "post_issue_order",
                    (buVO) => {
                        req.RECORD.ForEach(record =>
                        {
                            var wh = StaticValueManager.GetInstant().GetWarehouseByName(record.LINE.warehouse);
                            if (wh == null)
                                throw new Exception($"รหัสคลังสินค้า '{record.LINE.warehouse}' ไม่ถูกต้อง!");

                            string stagingNo = record.LINE.staging == null ? string.Empty : record.LINE.staging.Split(",").FirstOrDefault();
                            string dockNo = record.LINE.Dock_no == null ? string.Empty : record.LINE.Dock_no.Split(",").FirstOrDefault();
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
                            



                            //////////////////////SELECT PALLET FOR PICK


                            List<act_BaseObject> bObjs = DataADO.GetInstant().SelectBy<act_BaseObject>(
                                ListKeyValue<string, object>
                                    .New("Warehouse_ID", wh.ID.Value)
                                    .Add("SkuCode", record.LINE.sku)
                                    .Add("SkuGrade", record.LINE.grade)
                                    .Add("SkuLot", record.LINE.lot)
                                    //.Add("SkuStatus", record.LINE.status)
                                    //.Add("Customer", record.LINE.customer)
                                    .Add("EventStatus", BaseObjectEventStatus.IDLE)
                                    .Add("Status", EntityStatus.ACTIVE),
                                buVO)
                            .OrderByDescending(x => StaticValueManager.GetInstant().GetLocation(x.Location_ID).GetBay())
                            .OrderBy(x => StaticValueManager.GetInstant().GetLocation(x.Location_ID).GetLv())
                            .OrderByDescending(x => StaticValueManager.GetInstant().GetLocation(x.Location_ID).GetBank())
                            .ToList();

                            long seqGroup = DataADO.GetInstant().NextNum("McWorkSeqGroup", false, buVO);
                            decimal dis_qty = record.LINE.qty;
                            if (dis_qty > bObjs.Sum(x => x.SkuQty))
                                throw new Exception($"จำนวนสินค้า '{record.LINE.sku} {record.LINE.lot} qty:{dis_qty}' ที่ต้องการเบิก มีมากกว่าจำนวนที่จัดเก็บ qty:{bObjs.Sum(x => x.SkuQty)}!");

                            List<act_BaseObject> _out_bObjs = new List<act_BaseObject>();

                            foreach (var bObj in bObjs)
                            {
                                if (dis_qty <= 0)
                                {
                                    break;
                                }
                                else
                                {

                                    var buWork = new act_BuWork()
                                    {
                                        ID = null,
                                        TrxRef = record.LINE.api_ref,
                                        DocRef = record.LINE.doc_wms,
                                        Priority = record.LINE.Priority,
                                        SeqGroup = DataADO.GetInstant().NextNum("McWorkSeqGroup", false, buVO),
                                        SeqIndex = 0,
                                        IOType = IOType.OUTBOUND,
                                        SkuCode = record.LINE.sku,
                                        SkuGrade = record.LINE.grade,
                                        SkuLot = record.LINE.lot,
                                        SkuQty = bObj.SkuQty,
                                        SkuUnit = record.LINE.unit,
                                        SkuStatus = record.LINE.status,
                                        Des_Warehouse_ID = wh.ID.Value,
                                        Des_Area_ID = area.ID.Value,
                                        Des_Location_ID = null,
                                        Remark = (stagingNo != area.Code ? stagingNo : string.Empty),
                                        Status = EntityStatus.INACTIVE
                                    };
                                    buWork.ID = ADO.WCSDB.DataADO.GetInstant().Insert<act_BuWork>(buWork, buVO);

                                    act_McWork mcWork = new act_McWork()
                                    {
                                        ID = null,
                                        Priority = 1,
                                        BuWork_ID = buWork.ID.Value,
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
                                        Des_Area_ID = buWork.Des_Area_ID.Value,
                                        Des_Location_ID = null,
                                        ActualTime = DateTime.Now,
                                        Cur_McObject_ID = null,
                                        StartTime = DateTime.Now,
                                        Rec_McObject_ID = null,
                                        TreeRoute = "{}",
                                        EndTime = null,
                                        WMS_WorkQueue_ID = null,
                                        DocRef = buWork.DocRef,
                                        TrxRef = buWork.TrxRef,
                                        Remark = buWork.Remark,
                                        EventStatus = McWorkEventStatus.IN_QUEUE,
                                        Status = EntityStatus.ACTIVE
                                    };
                                    DataADO.GetInstant().Insert<act_McWork>(mcWork, buVO);

                                    bObj.BuWork_ID = buWork.ID.Value;
                                    bObj.EventStatus = BaseObjectEventStatus.OUTBOUND;
                                    DataADO.GetInstant().UpdateBy<act_BaseObject>(bObj, buVO);

                                    _out_bObjs.Add(bObj);
                                    dis_qty -= bObj.SkuQty;
                                }
                            }

                            /*_out_bObjs.Select(
                                x =>
                                {
                                    var loc = StaticValueManager.GetInstant().GetLocation(x.Location_ID);
                                    return new { bank=loc.GetBank(), bay = loc.GetBay(), lv = loc.GetLv() };
                                })
                            .GroupBy(x =>new { bay=x.bay,lv=x.lv })
                            .ToList().ForEach(x =>
                            {

                                List<acv_BaseObject> _notout_bObjs = DataADO.GetInstant().SelectBy<acv_BaseObject>(
                                    new SQLConditionCriteria[]
                                    {
                                        new SQLConditionCriteria("Status", EntityStatus.ACTIVE,SQLOperatorType.EQUALS),
                                        new SQLConditionCriteria("EventStatus", BaseObjectEventStatus.OUTBOUND,SQLOperatorType.NOTEQUALS),
                                        new SQLConditionCriteria("isSto",1,SQLOperatorType.EQUALS),
                                        new SQLConditionCriteria("Bay",x.Key.bay,SQLOperatorType.EQUALS),
                                        new SQLConditionCriteria("Lv",x.Key.bay,SQLOperatorType.EQUALS),
                                        new SQLConditionCriteria("Bank",x.Min(y=>y.bank),SQLOperatorType.LESS),
                                    },
                                    buVO);
                                if (_notout_bObjs.Count > 0)
                                {
                                    var bays = string.Join(',', _notout_bObjs.GroupBy(x => "[" + x.Bay + ":" + x.Lv + "]").Select(x => x.Key).ToArray());
                                    throw new Exception("ไม่สามารถเบิกได้ มีสินค้าขวางด้านหน้า [bay:lv]="+bays);
                                }
                            });*/
                            
                        });





                        return null;
                    });
            return res;
        }

        [HttpGet("get_order")]
        public dynamic get_order(IOType io, string wh,int max)
        {
            var res =
            this.ExecBlock<List<dynamic>>("get_buWork", (buVo) =>
            {
                var warehouse = StaticValueManager.GetInstant().GetWarehouse(wh);

                var dsBu = DashboardADO.GetInstant().Dashboard_ReportOrder(io, warehouse.ID.Value, max, buVo);

                return dsBu;
            });
            return res;
        }

        [HttpPost("post_receive_pallet")]
        public dynamic post_receive_pallet(dynamic request)
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
                    BuWork_ID = buWorks.ID.Value,
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

        [HttpGet("get_receive_pallet")]
        public dynamic get_receive_pallet(string gate)
        {
            var res = this.ExecBlock<dynamic>("get_register_pallet", (buVO) =>
            {
                var mcGate = StaticValueManager.GetInstant().GetMcMaster(gate);
                if (mcGate == null)
                    throw new Exception($"รหัสเครื่องจักร '{gate}' ไม่ถูกต้อง!");

                var bo = DataADO.GetInstant().SelectBy<act_BaseObject>(
                    ListKeyValue<string, object>
                    .New("Status", EntityStatus.ACTIVE)
                    .Add("McObject_ID", mcGate.ID.Value), buVO).FirstOrDefault();

                if (bo.BuWork_ID.HasValue)
                {
                    var bu = DataADO.GetInstant().SelectByID<act_BuWork>(bo.BuWork_ID.Value, buVO);
                    return new { LabelData = bo.LabelData, DocRef = bu.DocRef, CreateTime = bo.CreateTime };
                }
                else
                {
                    return new { LabelData = bo.LabelData, DocRef = "", CreateTime = bo.CreateTime };
                }
            });
            return res;
        }

        [HttpPost("post_closed_buwork")]
        public dynamic post_closed_buwork(dynamic request)
        {
            string trxRef = (string)request.trxRef; ;
            int io = (int)request.io; ;
            var res = this.ExecBlock<bool>("post_closed_buwork", (buVO) =>
            {
                ///////remove inbound
                if(io == 1)
                {
                    DataADO.GetInstant().UpdateBy<act_BuWork>(
                        new SQLConditionCriteria[] {
                            new SQLConditionCriteria("status",EntityStatus.INACTIVE,SQLOperatorType.EQUALS),
                            new SQLConditionCriteria("trxRef",trxRef,SQLOperatorType.EQUALS)
                        },
                        new KeyValuePair<string, object>[] {
                            new KeyValuePair<string, object>("status", EntityStatus.REMOVE)
                        }, buVO);

                    DataADO.GetInstant().UpdateBy<act_McWork>(
                        new SQLConditionCriteria[] {
                            new SQLConditionCriteria("iotype",1,SQLOperatorType.EQUALS),
                            new SQLConditionCriteria("eventstatus",McWorkEventStatus.IN_QUEUE,SQLOperatorType.EQUALS),
                            new SQLConditionCriteria("trxRef",trxRef,SQLOperatorType.EQUALS)
                        },
                        new KeyValuePair<string, object>[] {
                            new KeyValuePair<string, object>("eventstatus", McWorkEventStatus.REMOVE_QUEUE),
                            new KeyValuePair<string, object>("status", EntityStatus.REMOVE)
                        }, buVO);
                }
                else if(io == 2)
                {
                    DataADO.GetInstant().UpdateBy<act_McWork>(
                        new SQLConditionCriteria[] {
                        new SQLConditionCriteria("iotype",2,SQLOperatorType.EQUALS),
                        new SQLConditionCriteria("queuestatus",0,SQLOperatorType.EQUALS),
                        new SQLConditionCriteria("trxRef",trxRef,SQLOperatorType.EQUALS)
                        },
                        new KeyValuePair<string, object>[] {
                        new KeyValuePair<string, object>("eventstatus", McWorkEventStatus.REMOVE_QUEUE),
                        new KeyValuePair<string, object>("status", EntityStatus.REMOVE)
                        }, buVO);

                    var mcWorks = DataADO.GetInstant().SelectBy<act_McWork>(
                        ListKeyValue<string, object>.New("trxRef", trxRef).Add("Status", EntityStatus.REMOVE), buVO);

                    DataADO.GetInstant().UpdateBy<act_BuWork>(
                        new SQLConditionCriteria[] {
                            new SQLConditionCriteria("ID",string.Join(",", mcWorks.Select(x=>x.BuWork_ID).ToArray()), SQLOperatorType.IN),
                            new SQLConditionCriteria("status",EntityStatus.ACTIVE,SQLOperatorType.EQUALS,SQLConditionType.OR),
                            new SQLConditionCriteria("status",EntityStatus.INACTIVE,SQLOperatorType.EQUALS)
                        },
                        new KeyValuePair<string, object>[] {
                            new KeyValuePair<string, object>("status", EntityStatus.REMOVE)
                        }, buVO);

                    DataADO.GetInstant().UpdateBy<act_BaseObject>(
                        new SQLConditionCriteria[]
                        {
                            new SQLConditionCriteria("ID",string.Join(",", mcWorks.Select(x=>x.BaseObject_ID).ToArray()), SQLOperatorType.IN),
                            new SQLConditionCriteria("status",EntityStatus.ACTIVE,SQLOperatorType.EQUALS)
                        },
                        new KeyValuePair<string, object>[] {
                        new KeyValuePair<string, object>("eventstatus",BaseObjectEventStatus.IDLE)
                        }, buVO);
                }


                return true;
            });

            return res;
        }


        [HttpPost("post_receive_shu")]
        public dynamic post_receive_shu(dynamic request)
        {
            var res = this.ExecBlock<dynamic>("post_receive_shu", (buVO) =>
            {
                string shu = (string)request.shu;
                string gate = (string)request.gate;
                /*var mcShu = StaticValueManager.GetInstant().GetMcMaster(shuCode);
                var mcGate = StaticValueManager.GetInstant().GetMcMaster(gateCode);
                var mcObjShu = DataADO.GetInstant().SelectByID<act_McObject>(mcShu.ID.Value, buVO);
                var mcObjGate = DataADO.GetInstant().SelectByID<act_McObject>(mcGate.ID.Value, buVO);
                if (mcObjShu.IsOnline)
                {
                    throw new Exception("Shuttle กำลังออนไลน์อยู่");
                }
                mcObjShu.IsOnline = true;
                mcObjShu.Cur_Location_ID = mcObjGate.Cur_Location_ID;
                DataADO.GetInstant().UpdateBy<act_McObject>(mcObjShu, buVO);*/
                Dapper.DynamicParameters parameter = new Dapper.DynamicParameters();
                parameter.Add("SH_NAME", shu);
                parameter.Add("SS_NAME", gate);
                parameter.Add("rtFlag", gate, System.Data.DbType.String, System.Data.ParameterDirection.Output);
                parameter.Add("rtDesc", gate, System.Data.DbType.String, System.Data.ParameterDirection.Output);
                DataADO.GetInstant().QuerySP("SP_ShuttleBatteryFull", parameter, buVO);
                var rtFlag = parameter.Get<string>("rtFlag");
                var rtDesc = parameter.Get<string>("rtDesc");
                if (rtFlag.ToUpper() != "Y")
                    throw new Exception(rtDesc);
                return new { desc = rtDesc };
            });
            return res;
        }
    }
}
