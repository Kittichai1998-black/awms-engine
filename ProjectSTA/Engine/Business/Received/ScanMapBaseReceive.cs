using AMWUtil.Common;
using AMWUtil.Exception;
using AWMSEngine.Engine.V2.Business;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Criteria;
using AWMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ProjectSTA.Engine.Business.Received
{
    public class ScanMapBaseReceive : AWMSEngine.Engine.BaseEngine<ScanMapBaseReceive.TReq, ScanMapBaseReceive.TRes>
    {
        public class TReq
        {
            public int? areaID;
            public string scanCode;
            
        }
        public class TRes
        {
            public int? areaID;
            public int? areaLocationID;
            public StorageObjectCriteria bsto;
        }
        protected override TRes ExecuteEngine(TReq reqVO)
        {
           

            string scanCode = reqVO.scanCode == null ? null : reqVO.scanCode;
            string orderNo = scanCode.Substring(0, 7);
            string skuCode = scanCode.Substring(7, 12); //11
            int cartonNo = int.Parse(scanCode.Substring(19, 4)); //22


            // var areaLocationMastersItems = AWMSEngine.ADO.DataADO.GetInstant().SelectBy<ams_AreaLocationMaster>("AreaMaster_ID", reqVO.areaID, this.BuVO);
            //หา Array ของ ArealocationID ที่ AreaMaster_ID ตรงกับ areaID
            var areaLocationMastersItems = AWMSEngine.ADO.DataADO.GetInstant().SelectBy<ams_AreaLocationMaster>(
                  new SQLConditionCriteria[] {
                        new SQLConditionCriteria("AreaMaster_ID",reqVO.areaID, SQLOperatorType.EQUALS),
                        new SQLConditionCriteria("Status", 1, SQLOperatorType.EQUALS, SQLConditionType.AND)
                  },
                  new SQLOrderByCriteria[] { }, null, null, this.BuVO);
            //bool checkLocation = true;
            int lenghtAreaLocItems = areaLocationMastersItems.Count();
            int numLoc = 0;
            List<dynamic> tempAreaLoc = new List<dynamic>();
            List<dynamic> tempStoLocationItems = new List<dynamic>();
            dynamic areaLocationID = null;
            StorageObjectCriteria stobsto = null;
            foreach (var location in areaLocationMastersItems)
            {
                numLoc++;
                //var stoItems = AWMSEngine.ADO.DataADO.GetInstant().SelectBy<amt_StorageObject>("AreaLocationMaster_ID", location.ID, this.BuVO);
                //หา stoID ที่เป็น base เพื่อเอาไปหาสินค้าในพาเลท ว่ามี OrderNo,SKUCode ตรงกันมั้ย
                var stoLocationItems = AWMSEngine.ADO.DataADO.GetInstant().SelectBy<amt_StorageObject>(
                  new SQLConditionCriteria[] {
                        new SQLConditionCriteria("AreaLocationMaster_ID",(int)location.ID, SQLOperatorType.EQUALS),
                        new SQLConditionCriteria("ObjectType", StorageObjectType.BASE, SQLOperatorType.EQUALS, SQLConditionType.AND),
                        new SQLConditionCriteria("EventStatus", StorageObjectEventStatus.NEW, SQLOperatorType.EQUALS, SQLConditionType.AND)
                        //new SQLConditionCriteria("Status", EntityStatus.REMOVE, SQLOperatorType.LESS, SQLConditionType.AND)
                  }, this.BuVO).FirstOrDefault();

                //เช็คข้อมูลBase ที่มี AreaLocationMaster_ID ที่ตรงกับ location.ID
                if (stoLocationItems != null)
                {
                    //เอาstoID ของ Base มาหารายการสินค้า SKU 
                    var stoPackObjects = AWMSEngine.ADO.DataADO.GetInstant().SelectBy<amt_StorageObject>(
                      new SQLConditionCriteria[] {
                            new SQLConditionCriteria("ParentStorageObject_ID",(long)stoLocationItems.ID, SQLOperatorType.EQUALS),
                            //new SQLConditionCriteria("Status", EntityStatus.REMOVE, SQLOperatorType.LESS, SQLConditionType.AND)
                      }, this.BuVO);
                    // var stoPackObjects = AWMSEngine.ADO.StorageObjectADO.GetInstant().Get((long)stoLocationItems.ID, StorageObjectType.BASE, false, true, this.BuVO);
                    if(stoPackObjects != null && stoPackObjects.Count() > 0)
                    { //เจอสินค้าที่อยู่ในพาเลท
                        foreach (var stoPack in stoPackObjects)
                        {
                            //เช็คพาเลทว่ามี OrderNo,skuCode ตรงกันกับ ScanCode ของสินค้าใหม่มั้ย
                            if (orderNo == stoPack.OrderNo && skuCode == stoPack.Code)
                            {  //ข้อมูลตรง เช็คว่ามีค่า Options มั้ย ถ้ามี เช็คหาค่า CartonNo.
                                if (stoPack.Options.Length > 0)
                                {
                                    dynamic[] options = stoPack.Options.Split("&").ToArray();
                                    
                                    foreach (var val in options)
                                    {
                                        dynamic[] options2 = val.Split("=");

                                        if (options2[0] == "CartonNo")
                                        {  //มีค่า CartonNo 
                                            if (options2[1].Contains(cartonNo.ToString()))
                                            {
                                                ///เลขcarton no ซ้ำ รับเข้าไม่ได้ วางสินค้าลงบนพาเลทไม่ได้
                                                throw new AMWException(this.Logger, AMWExceptionCode.V1001, "สแกนสินค้าซ้ำกัน");
                                            }
                                            else
                                            {
                                                /// รับเข้า วางสินค้าลงบนพาเลทได้
                                                dynamic optionsNew = "CartonNo=" + options2[1] + "," + cartonNo.ToString();
                                                var unit = this.StaticValue.UnitTypes.Where(un => un.ID == stoPack.UnitType_ID).FirstOrDefault();
                                                var area = this.StaticValue.AreaMasters.Where(ar => ar.ID == reqVO.areaID).FirstOrDefault();
                                                areaLocationID = (int)stoLocationItems.ID;

                                                //--validate limit size of pallet
                                                stoPack.Quantity += 1;
                                                stoPack.Options = optionsNew;
                                                //-end-validate limit size of pallet


                                                var reqScan = new ScanMapStoNoDoc.TReq()
                                                {
                                                    rootID = (long)stoLocationItems.ID,
                                                    scanCode = skuCode,
                                                    orderNo = orderNo,
                                                    batch = null,
                                                    lot = null,
                                                    amount = 1,
                                                    unitCode = unit.Code,
                                                    productDate = null,
                                                    warehouseID = area.Warehouse_ID,
                                                    areaID = reqVO.areaID,
                                                    options = optionsNew,
                                                    isRoot = false,
                                                    mode = VirtualMapSTOModeType.REGISTER,
                                                    action = VirtualMapSTOActionType.ADD
                                                };

                                                var resScanMapStoNoDoc = new ScanMapStoNoDoc().Execute(this.Logger, this.BuVO, reqScan); ;
                                                if (resScanMapStoNoDoc != null)
                                                {
                                                    stobsto = resScanMapStoNoDoc;
                                                    //stobsto = AWMSEngine.ADO.StorageObjectADO.GetInstant().Get(stoID, StorageObjectType.BASE, false, true, this.BuVO);
                                                    TRes res = new TRes()
                                                    {
                                                        areaID = reqVO.areaID,
                                                        areaLocationID = areaLocationID,
                                                        bsto = stobsto
                                                    };
                                                    return res;
                                                }
                                            }
                                            break;
                                        }
                                    }
                                }
                                else
                                {
                                    throw new AMWException(this.Logger, AMWExceptionCode.V1001, "ไม่สามารถวางสินค้าลงบน Pallet ได้2");
                                }
                                break;
                            }
                            else
                            {
                                //orderNo, skuCode ไม่ตรงกัน
                                continue;
                            }
                        } //end foreach check สินค้าที่มีในพาเลท
                    }
                    else
                    {
                        //มีพาเลทเปล่า ไม่มีสินค้าอยู่ข้างใน
                        //ต้องเอาไว้ใช้เก็บสินค้า
                        //เช็คจนเหลือพาเลทสุดท้ายเเล้ว
                        if (numLoc == lenghtAreaLocItems)
                        {
                            //เตรียมข้อมูลinsert 
                            var options = "CartonNo=" + cartonNo.ToString();
                            var locationID = (int)location.ID;
                            var baseID = (long)stoLocationItems.ID;
                            var skuItem =  AWMSEngine.ADO.DataADO.GetInstant().SelectBy<ams_SKUMaster>("Code", skuCode, this.BuVO).FirstOrDefault();
                            //var skuName = skuItem.Name;
                            var unit = this.StaticValue.UnitTypes.Where(un => un.ID == skuItem.UnitType_ID).FirstOrDefault();
                            var area = this.StaticValue.AreaMasters.Where(ar => ar.ID == reqVO.areaID).FirstOrDefault();

                            var reqScan = new ScanMapStoNoDoc.TReq()
                            {
                                rootID = (long)stoLocationItems.ID,
                                scanCode = skuCode,
                                orderNo = orderNo,
                                batch = null,
                                lot = null,
                                amount = 1,
                                unitCode = unit.Code,
                                productDate = null,
                                warehouseID = area.Warehouse_ID,
                                areaID = reqVO.areaID,
                                options = options,
                                isRoot = false,
                                mode = VirtualMapSTOModeType.REGISTER,
                                action = VirtualMapSTOActionType.ADD
                            };

                            //stobsto = AWMSEngine.ADO.StorageObjectADO.GetInstant().Get((long)stoLocationItems.ID, StorageObjectType.BASE, false, true, this.BuVO);
                            areaLocationID = locationID;
                            var resScanMapStoNoDoc = new ScanMapStoNoDoc().Execute(this.Logger, this.BuVO, reqScan); ;
                            if (resScanMapStoNoDoc != null)
                            {
                                stobsto = resScanMapStoNoDoc;
                                //stobsto = AWMSEngine.ADO.StorageObjectADO.GetInstant().Get(stoID, StorageObjectType.BASE, false, true, this.BuVO);
                                TRes res = new TRes()
                                {
                                    areaID = reqVO.areaID,
                                    areaLocationID = areaLocationID,
                                    bsto = stobsto
                                };
                                return res;
                            }
                            else
                            {
                                throw new AMWException(this.Logger, AMWExceptionCode.V1001, "ไม่สามารถวางสินค้าลงบน Pallet ได้3");
                            }
                        }
                        // แต่ว่าถ้ายังมีพาเลทอีกอันที่ยังไม่เช็ค
                        else
                        {
                            //buffer ข้อมูลlocation,pallet
                            tempAreaLoc.Add(location);
                            tempStoLocationItems.Add(stoLocationItems);
                        }
                    }
                }
                else //ไม่มีข้อมูล Base ใน Location
                {
                    if (numLoc == lenghtAreaLocItems)
                    {
                        if(tempAreaLoc.Count() > 0)
                        { 
                            var options = "CartonNo=" + cartonNo.ToString();
                            //areaID = reqVO.areaID
                            var locationID = (int)tempAreaLoc[0].ID;
                            dynamic stoID = null;
                            if (tempStoLocationItems.Count() > 0)
                            {
                                stoID = (long)tempStoLocationItems[0].ID;  //ที่ ObjectType = Base
                            }
                            var skuItem = AWMSEngine.ADO.DataADO.GetInstant().SelectBy<ams_SKUMaster>("Code", skuCode, this.BuVO).FirstOrDefault();
                            //var skuName = skuItem.Name;
                            var unit = this.StaticValue.UnitTypes.Where(un => un.ID == skuItem.UnitType_ID).FirstOrDefault();
                            var area = this.StaticValue.AreaMasters.Where(ar => ar.ID == reqVO.areaID).FirstOrDefault();

                            //เอาไปแมพ เอาไปเช็ค over limit size
                            var reqScan = new ScanMapStoNoDoc.TReq() {
                                rootID = stoID,
                                scanCode = skuCode,
                                orderNo = orderNo,
                                batch = null,
                                lot = null,
                                amount = 1,
                                unitCode = unit.Code,
                                productDate = null,
                                warehouseID = area.Warehouse_ID,
                                areaID = reqVO.areaID,
                                options = options,
                                isRoot = false,
                                mode = VirtualMapSTOModeType.REGISTER,
                                action = VirtualMapSTOActionType.ADD
                            };

                            areaLocationID = locationID;

                            var resScanMapStoNoDoc = new ScanMapStoNoDoc().Execute(this.Logger, this.BuVO, reqScan); ;
                            if(resScanMapStoNoDoc != null)
                            {
                                stobsto = resScanMapStoNoDoc;
                                //stobsto = AWMSEngine.ADO.StorageObjectADO.GetInstant().Get(stoID, StorageObjectType.BASE, false, true, this.BuVO);
                                TRes res = new TRes()
                                {
                                    areaID = reqVO.areaID,
                                    areaLocationID = areaLocationID,
                                    bsto = stobsto
                                };
                                return res;
                            } 
                        }
                        else
                        {
                            throw new AMWException(this.Logger, AMWExceptionCode.V1001, "ไม่สามารถวางสินค้าลงบน Pallet ได้1");

                        }
                    }
                    else
                    {
                        continue;
                    }

                }
            }
            
            return null;
        }
    }
}
