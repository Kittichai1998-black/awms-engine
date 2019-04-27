﻿using AMWUtil.Common;
using AMWUtil.Exception;
using AWMSEngine.Engine.V2.Business;
using AWMSEngine.Engine.V2.Validation;
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
            public int areaID;
            public string scanCode;
            
        }
        public class TRes
        {
            public int areaID;
            public int areaLocationID;
            public string areaCode;
            public string areaLocationCode;
            public StorageObjectCriteria bsto;
        }
        protected override TRes ExecuteEngine(TReq reqVO)
        {
            if (reqVO.areaID == 0)
            {
                throw new AMWException(this.Logger, AMWExceptionCode.V1002, "ไม่ได้รับค่า Area ID");
            }
            string scanCode = reqVO.scanCode == null ? throw new AMWException(this.Logger, AMWExceptionCode.V1002, "ไม่ได้รับค่า Scan Code") : reqVO.scanCode;
            if (scanCode.Length != 26)
            {
                throw new AMWException(this.Logger, AMWExceptionCode.V1002, "จำนวนตัวอักษรของ Scan Code ไม่เท่ากับ 26 ตัวอักษร");
            }
            string orderNo = scanCode.Substring(0, 7);
            string skuCode1 = scanCode.Substring(7, 15); 
            string skuCode = skuCode1.Substring(0, 12); //ทดสอบ ใช้skucodeของทานตะวันอยู่ เลยต้องตัดxxxท้ายทิ้ง
            int cartonNo = int.Parse(scanCode.Substring(22, 4));

            dynamic areaCode = this.StaticValue.AreaMasters.Find(y => y.ID == reqVO.areaID).Code;
            if (areaCode == null)
            {
                throw new AMWException(this.Logger, AMWExceptionCode.V2001, "ไม่พบ Area Code นี้ในระบบ");
            }
            //หา Array ของ ArealocationID ที่ AreaMaster_ID ตรงกับ areaID
            var areaLocationMastersItems = AWMSEngine.ADO.DataADO.GetInstant().SelectBy<ams_AreaLocationMaster>(
                  new SQLConditionCriteria[] {
                        new SQLConditionCriteria("AreaMaster_ID",reqVO.areaID, SQLOperatorType.EQUALS),
                        new SQLConditionCriteria("Status", 1, SQLOperatorType.EQUALS, SQLConditionType.AND)
                  },
                  new SQLOrderByCriteria[] { }, null, null, this.BuVO);
            if (areaLocationMastersItems == null)
            {
                throw new AMWException(this.Logger, AMWExceptionCode.V3001, "ไม่พบ Gate ใน Area: "+ areaCode + " นี้");
            }
            int lenghtAreaLocItems = areaLocationMastersItems.Count();
            int numLoc = 0;
            List<dynamic> tempAreaLoc = new List<dynamic>();
            List<dynamic> tempStoBaseItems = new List<dynamic>();
            //dynamic areaLocationID = null;
           
            //dynamic areaLocationCode = null;
            StorageObjectCriteria stobsto = null;
            var skuItem = AWMSEngine.ADO.DataADO.GetInstant().SelectBy<ams_SKUMaster>("Code", skuCode, this.BuVO).FirstOrDefault();
            if(skuItem == null)
            {
                throw new AMWException(this.Logger, AMWExceptionCode.V3001, "ไม่พบ SKU นี้ในระบบ");
            }
            foreach (var location in areaLocationMastersItems)
            {
                numLoc++;
                //หา stoID ที่เป็น base เพื่อเอาไปหาสินค้าในพาเลท ว่ามี OrderNo,SKUCode ตรงกันมั้ย
                var stoBaseItems = AWMSEngine.ADO.DataADO.GetInstant().SelectBy<amt_StorageObject>(
                  new SQLConditionCriteria[] {
                        new SQLConditionCriteria("AreaLocationMaster_ID",(int)location.ID, SQLOperatorType.EQUALS),
                        new SQLConditionCriteria("ObjectType", StorageObjectType.BASE, SQLOperatorType.EQUALS, SQLConditionType.AND),
                        new SQLConditionCriteria("EventStatus", StorageObjectEventStatus.NEW, SQLOperatorType.EQUALS, SQLConditionType.AND)
                        //new SQLConditionCriteria("Status", EntityStatus.REMOVE, SQLOperatorType.LESS, SQLConditionType.AND)
                  }, this.BuVO).FirstOrDefault();
                 
                //เช็คข้อมูลBase ที่มี AreaLocationMaster_ID ที่ตรงกับ location.ID
                if (stoBaseItems != null)
                {
                    //เอาstoID ของ Base มาหารายการสินค้า SKU 
                    var stoPackObjects = AWMSEngine.ADO.DataADO.GetInstant().SelectBy<amt_StorageObject>(
                      new SQLConditionCriteria[] {
                            new SQLConditionCriteria("ParentStorageObject_ID",(long)stoBaseItems.ID, SQLOperatorType.EQUALS),
                            //new SQLConditionCriteria("Status", EntityStatus.REMOVE, SQLOperatorType.LESS, SQLConditionType.AND)
                      }, this.BuVO);
                    if(stoPackObjects != null && stoPackObjects.Count() > 0)
                    { //มีสินค้าอยู่บนพาเลท
                        foreach (var stoPack in stoPackObjects)
                        {
                            //เช็คพาเลทว่ามี OrderNo,skuCode ตรงกันกับ ScanCode ของสินค้าใหม่มั้ย
                            if (orderNo == stoPack.OrderNo && skuCode == stoPack.Code)
                            {  //ข้อมูลตรง เช็คว่ามีค่า Options มั้ย ถ้ามี เช็คหาค่า CartonNo.
                                if (stoPack.Options != null && stoPack.Options.Length > 0)
                                {
                                    dynamic[] options = stoPack.Options.Split("&").ToArray();
                                    
                                    foreach (var val in options)
                                    {
                                        dynamic[] options2 = val.Split("=");

                                        if (options2[0] == "CartonNo")
                                        {  //มีค่า CartonNo 
                                            if (options2[1].Length > 0) {
                                                var resCartonNo = AMWUtil.Common.ConvertUtil.ConvertRangeNumToString(options2[1]);
                                                dynamic newCartonNos = null;
                                                var splitCartonNo = resCartonNo.Split(",");
                                                int lenSplitCartonNo = splitCartonNo.Length;
                                                int numCarton = 0;
                                                foreach (var no in splitCartonNo)
                                                {
                                                    numCarton++;
                                                    var valno = no;
                                                    if (cartonNo == Int32.Parse(no))
                                                    {
                                                        ///เลขcarton no ซ้ำ รับเข้าไม่ได้ วางสินค้าลงบนพาเลทไม่ได้
                                                        throw new AMWException(this.Logger, AMWExceptionCode.V1002,
                                                            "PalletNo. " + stoBaseItems.Code + " มี SKU Code: " + skuCode + ", Carton No." + cartonNo.ToString() + " นี้อยู่แล้ว ไม่สามารถสแกนซ้ำกันได้");
                                                    }
                                                    else
                                                    {
                                                        if (numCarton == lenSplitCartonNo)
                                                        {
                                                            newCartonNos = AMWUtil.Common.ConvertUtil.ConvertStringToRangeNum(resCartonNo + "," + cartonNo.ToString());
                                                        }
                                                        else {
                                                            continue;
                                                        }
                                                    }
                                                }

                                                /// รับเข้า วางสินค้าลงบนพาเลทได้
                                                var optionsNew = "CartonNo=" + newCartonNos;

                                                var baseItems = AWMSEngine.ADO.DataADO.GetInstant().SelectBy<ams_BaseMaster>("ID", stoBaseItems.BaseMaster_ID, this.BuVO).FirstOrDefault();
                                                if (baseItems == null)
                                                {
                                                    throw new AMWException(this.Logger, AMWExceptionCode.V3001, "ไม่พบข้อมูลของ Pallet นี้ในระบบ");
                                                }
                                                var objectSizeRoot = this.StaticValue.ObjectSizes.Where(ob => ob.ID == baseItems.ObjectSize_ID).FirstOrDefault();
                                                if (objectSizeRoot == null)
                                                {
                                                    throw new AMWException(this.Logger, AMWExceptionCode.V3001, "ไม่พบข้อมูล Object Size ของ Pallet: "+ baseItems.Code + " นี้ในระบบ");
                                                }
                                                var objectSizePack = this.StaticValue.ObjectSizes.Where(ob => ob.ID == skuItem.ObjectSize_ID).FirstOrDefault();
                                                if (objectSizePack == null)
                                                {
                                                    throw new AMWException(this.Logger, AMWExceptionCode.V3001, "ไม่พบข้อมูล Object Size ของ SKU: " + skuItem.Code + " นี้ในระบบ");
                                                }
                                                //--validate limit size of pallet
                                                List<StorageObjectCriteria> mapstos = new List<StorageObjectCriteria> { };
                                                mapstos.Add(new StorageObjectCriteria() {
                                                    id = stoPack.ID,
                                                    groupSum = null,
                                                    type = stoPack.ObjectType,
                                                    code = stoPack.Code,
                                                    areaID = (long)reqVO.areaID,
                                                    orderNo = orderNo,
                                                    lot = null,
                                                    batch = null,
                                                    qty = stoPack.Quantity + 1,
                                                    baseQty = stoPack.BaseQuantity + 1,
                                                    unitID = stoPack.UnitType_ID,
                                                    unitCode = this.StaticValue.UnitTypes.Find(y => y.ID == stoPack.UnitType_ID).Code,
                                                    baseUnitID = stoPack.BaseUnitType_ID,
                                                    baseUnitCode = this.StaticValue.UnitTypes.Find(y => y.ID == stoPack.BaseUnitType_ID).Code,
                                                    objectSizeID = skuItem.ObjectSize_ID,
                                                    objectSizeName = objectSizePack.Name,
                                                    maxWeiKG = objectSizePack.MaxWeigthKG,
                                                    minWeiKG = objectSizePack.MinWeigthKG,
                                                    weiKG = stoPack.WeigthKG,
                                                    widthM = null,
                                                    heightM = null,
                                                    lengthM = null,
                                                    isFocus = false,
                                                    productDate = null,
                                                    eventStatus = stoPack.EventStatus,
                                                    objectSizeMaps = objectSizePack.ObjectSizeInners.Select(x => new StorageObjectCriteria.ObjectSizeMap()
                                                    {
                                                        innerObjectSizeID = x.InnerObjectSize_ID,
                                                        innerObjectSizeName = this.StaticValue.ObjectSizes.Find(y => y.ID == x.InnerObjectSize_ID).Name,
                                                        outerObjectSizeID = x.OuterObjectSize_ID,
                                                        outerObjectSizeName = this.StaticValue.ObjectSizes.Find(y => y.ID == x.OuterObjectSize_ID).Name,
                                                        maxQuantity = x.MaxQuantity,
                                                        minQuantity = x.MinQuantity,
                                                        quantity = 0
                                                    }).ToList(),
                                                    options = optionsNew
                                                });
                                                var stoValidateReq = new StorageObjectCriteria() {
                                                    id = stoBaseItems.ID,
                                                    groupSum = null,
                                                    type = stoBaseItems.ObjectType,
                                                    code = stoBaseItems.Code,
                                                    areaID = (long)reqVO.areaID,
                                                    orderNo = orderNo,
                                                    lot = null,
                                                    batch = null,
                                                    qty = stoBaseItems.Quantity,
                                                    unitID = stoBaseItems.UnitType_ID,
                                                    unitCode = this.StaticValue.UnitTypes.Find(y => y.ID == stoBaseItems.UnitType_ID).Code,
                                                    baseQty = stoBaseItems.BaseQuantity,
                                                    objectSizeID = baseItems.ObjectSize_ID,
                                                    objectSizeName = objectSizeRoot.Name,
                                                    maxWeiKG = objectSizeRoot.MaxWeigthKG,
                                                    minWeiKG = objectSizeRoot.MinWeigthKG,
                                                    weiKG = stoBaseItems.WeigthKG,
                                                    widthM = null,
                                                    heightM = null,
                                                    lengthM = null,
                                                    isFocus = true,
                                                    productDate = null,
                                                    eventStatus = stoBaseItems.EventStatus,
                                                    objectSizeMaps = objectSizeRoot.ObjectSizeInners.Select(x => new StorageObjectCriteria.ObjectSizeMap()
                                                    {
                                                        innerObjectSizeID = x.InnerObjectSize_ID,
                                                        innerObjectSizeName = this.StaticValue.ObjectSizes.Find(y => y.ID == x.InnerObjectSize_ID).Name,
                                                        outerObjectSizeID = x.OuterObjectSize_ID,
                                                        outerObjectSizeName = x.Name,
                                                        maxQuantity = x.MaxQuantity,
                                                        minQuantity = x.MinQuantity,
                                                        quantity = 0
                                                    }).ToList(),
                                                    mapstos = mapstos
                                                };

                                                var stoValidateRes = new ValidateObjectSizeOverLimit().Execute(this.Logger, this.BuVO, stoValidateReq);

                                                //-end-validate limit size of pallet

                                                var reqScan = new ScanMapStoNoDoc.TReq()
                                                {
                                                    rootID = (long)stoBaseItems.ID,
                                                    scanCode = skuCode,
                                                    orderNo = orderNo,
                                                    batch = null,
                                                    lot = null,
                                                    amount = 1,
                                                    unitCode = this.StaticValue.UnitTypes.Find(un => un.ID == stoPack.UnitType_ID).Code,
                                                    productDate = null,
                                                    warehouseID = this.StaticValue.AreaMasters.Find(ar => ar.ID == reqVO.areaID).Warehouse_ID,
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
                                                    TRes res = new TRes()
                                                    {
                                                        areaID = reqVO.areaID,
                                                        areaCode = areaCode,
                                                        areaLocationID = (int)stoBaseItems.ID,
                                                        areaLocationCode = location.Code,
                                                        bsto = stobsto
                                                    };
                                                    return res;
                                                }
                                                else
                                                {
                                                    throw new AMWException(this.Logger, AMWExceptionCode.V1001, "ไม่สามารถกำกับสินค้ากับ Pallet No." + stoBaseItems.Code + " ได้");
                                                }
                                            }
                                            else
                                            {
                                                throw new AMWException(this.Logger, AMWExceptionCode.V3001, "ไม่พบ Carton No. ของสินค้าที่อยู่ใน Pallet: "+ stoBaseItems.Code);
                                            }
                                        }
                                        else
                                        {
                                            throw new AMWException(this.Logger, AMWExceptionCode.V3001, "ไม่พบ Carton No. ของสินค้าที่อยู่ใน Pallet: " + stoBaseItems.Code);
                                        }
                                    }
                                }
                                else
                                {
                                    throw new AMWException(this.Logger, AMWExceptionCode.V3001, "ไม่พบข้อมูล Options");
                                }
                            }
                            else
                            {
                                //orderNo, skuCode ไม่ตรงกัน
                                if (numLoc == lenghtAreaLocItems)
                                {
                                    throw new AMWException(this.Logger, AMWExceptionCode.V1001, "Order No.หรือ SKU Code ไม่ตรงกัน จึงไม่สามารถวางสินค้าลงบน Pallet ได้");
                                }
                                else
                                {
                                    continue;
                                }
                            }
                        } //end foreach check สินค้าที่มีในพาเลท
                    }
                    else
                    {
                        //เช็คจนเหลือพาเลทสุดท้ายเเล้ว
                        //มีพาเลทเปล่า ไม่มีสินค้าอยู่ข้างใน
                        //เอาไว้ใช้เก็บสินค้าได้
                        
                        if (numLoc == lenghtAreaLocItems)
                        {
                            //เตรียมข้อมูลinsert 
                            var optionsNew = "CartonNo=" + cartonNo.ToString(); 
                             
                            var reqScan = new ScanMapStoNoDoc.TReq()
                            {
                                rootID = (long)stoBaseItems.ID,
                                scanCode = skuCode,
                                orderNo = orderNo,
                                batch = null,
                                lot = null,
                                amount = 1,
                                unitCode = this.StaticValue.UnitTypes.Find(un => un.ID == skuItem.UnitType_ID).Code,
                                productDate = null,
                                warehouseID = this.StaticValue.AreaMasters.Find(ar => ar.ID == reqVO.areaID).Warehouse_ID,
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
                                TRes res = new TRes()
                                {
                                    areaID = reqVO.areaID,
                                    areaCode = areaCode,
                                    areaLocationID = (int)location.ID,
                                    areaLocationCode = location.Code,
                                    bsto = stobsto
                                };
                                return res;
                            }
                            else
                            {
                                throw new AMWException(this.Logger, AMWExceptionCode.V1001, "ไม่สามารถกำกับสินค้ากับ Pallet No."+ stoBaseItems.Code +" ได้");
                            }
                        }
                        // แต่ว่าถ้ายังมีพาเลทอีกอันที่ยังไม่เช็ค
                        else
                        {
                            //buffer ข้อมูลlocation,pallet
                            tempAreaLoc.Add(location);
                            tempStoBaseItems.Add(stoBaseItems);
                        }
                    }
                }
                else //ไม่มีข้อมูล Base ใน Location
                {
                    if (numLoc == lenghtAreaLocItems)
                    {
                        //มีข้อมูล base เปล่า ก่อนหน้าที่สามารถวางสินค้าได้
                        if(tempAreaLoc.Count() > 0)
                        { 
                            var options = "CartonNo=" + cartonNo.ToString();
                            dynamic stoID = null;
                            if (tempStoBaseItems.Count() > 0)
                            {
                                stoID = (long)tempStoBaseItems[0].ID;  //ที่ ObjectType = Base
                            }

                            //เอาไปแมพ 
                            var reqScan = new ScanMapStoNoDoc.TReq() {
                                rootID = stoID,
                                scanCode = skuCode,
                                orderNo = orderNo,
                                batch = null,
                                lot = null,
                                amount = 1,
                                unitCode = this.StaticValue.UnitTypes.Find(un => un.ID == skuItem.UnitType_ID).Code,
                                productDate = null,
                                warehouseID = this.StaticValue.AreaMasters.Find(ar => ar.ID == reqVO.areaID).Warehouse_ID,
                                areaID = reqVO.areaID,
                                options = options,
                                isRoot = false,
                                mode = VirtualMapSTOModeType.REGISTER,
                                action = VirtualMapSTOActionType.ADD
                            };

                            var resScanMapStoNoDoc = new ScanMapStoNoDoc().Execute(this.Logger, this.BuVO, reqScan); ;
                            if(resScanMapStoNoDoc != null)
                            {
                                stobsto = resScanMapStoNoDoc;
                                TRes res = new TRes()
                                {
                                    areaID = reqVO.areaID,
                                    areaCode = areaCode,
                                    areaLocationID = (int)tempAreaLoc[0].ID,
                                    areaLocationCode = tempAreaLoc[0].Code,
                                    bsto = stobsto
                                };
                                return res;
                            }
                            else
                            {
                                throw new AMWException(this.Logger, AMWExceptionCode.V1001, "ไม่สามารถกำกับสินค้ากับ Pallet No." + tempStoBaseItems[0].Code + " ได้");
                            }
                        }
                        else
                        {
                            throw new AMWException(this.Logger, AMWExceptionCode.V3001, "ไม่พบ Pallet ที่สามารถวางสินค้าได้");

                        }
                    }
                    else
                    {
                        continue;
                    }

                }
            }
                            throw new AMWException(this.Logger, AMWExceptionCode.V2002, "ไม่สามารถวางสินค้าลงบน Pallet ได้");
        }
    }
}
