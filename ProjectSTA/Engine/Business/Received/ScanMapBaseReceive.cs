using AMWUtil.Common;
using AMWUtil.Exception;
using AWMSEngine.Engine.V2.Business;
using AWMSEngine.Engine.V2.Validation;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Constant.StringConst;
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
            public long areaID;
            public string scanCode;
            public List<long> lockGateID = new List<long>();
        }
        public class TRes
        {
            public long areaID;
            public long areaLocationID;
            public string areaCode;
            public string areaLocationCode;
            public StorageObjectCriteria bsto;
        }
        protected override TRes ExecuteEngine(TReq reqVO)
        {
            if (reqVO.areaID == 0)
            {
                throw new AMWException(this.Logger, AMWExceptionCode.V1002, "Not received value for AreaID");
            }

            string scanCode = reqVO.scanCode == null ? throw new AMWException(this.Logger, AMWExceptionCode.V1002, "Not received value for ScanCode") : reqVO.scanCode;
            if (scanCode.Length != 26)
            {
                throw new AMWException(this.Logger, AMWExceptionCode.V1002, "ScanCode must be equal 26-digits");
            }
            string orderNo = scanCode.Substring(0, 7);
            string skuCode1 = scanCode.Substring(7, 15).Replace('@', ' ');
            string skuCode = skuCode1.Trim(); //ทดสอบ .Trim() ต้องตัดค่าว่างท้ายทิ้ง
            int cartonNo = int.Parse(scanCode.Substring(22, 4));

            ams_AreaMaster areaItem = this.StaticValue.AreaMasters.Find(y => y.ID == reqVO.areaID);
            if (areaItem == null)
            {
                throw new AMWException(this.Logger, AMWExceptionCode.V2001, "Area Not Found");
            }
             
            ams_SKUMaster skuItem = AWMSEngine.ADO.DataADO.GetInstant().SelectBy<ams_SKUMaster>(new SQLConditionCriteria[] {
                            new SQLConditionCriteria("Code",skuCode, SQLOperatorType.EQUALS),
                            new SQLConditionCriteria("Status", EntityStatus.ACTIVE, SQLOperatorType.EQUALS, SQLConditionType.AND)
                      }, this.BuVO).FirstOrDefault();
            if (skuItem == null)
            {
                throw new AMWException(this.Logger, AMWExceptionCode.V3001, "Data of SKU Code: " + skuCode + " Not Found");
            }
            ams_SKUMasterType smt = this.StaticValue.SKUMasterTypes.Find(x => x.ID == skuItem.SKUMasterType_ID);
            if (smt.GroupType != SKUGroupType.FG)
            {
                throw new AMWException(this.Logger, AMWExceptionCode.V1001, "SKU Type must be 'FG' only.");
            }

            //หา Array ของ ArealocationID ที่ AreaMaster_ID ตรงกับ areaID
            var areaLocationMastersItems = AWMSEngine.ADO.DataADO.GetInstant().SelectBy<ams_AreaLocationMaster>(
                  new SQLConditionCriteria[] {
                        new SQLConditionCriteria("AreaMaster_ID",reqVO.areaID, SQLOperatorType.EQUALS),
                        new SQLConditionCriteria("Status", 1, SQLOperatorType.EQUALS, SQLConditionType.AND),
                        new SQLConditionCriteria("ID",string.Join(',',reqVO.lockGateID), SQLOperatorType.NOTIN)
                  },
                  new SQLOrderByCriteria[] { }, null, null, this.BuVO);

            if (areaLocationMastersItems == null)
            {
                throw new AMWException(this.Logger, AMWExceptionCode.V3001, "Gate of Area: "+ areaItem.Code + " Not Ready");
            }
            int lenghtAreaLocItems = areaLocationMastersItems.Count();
            int numLoc = 0;
            List<ams_AreaLocationMaster> tempAreaLoc = new List<ams_AreaLocationMaster>();
            List<amt_StorageObject> tempStoBaseItems = new List<amt_StorageObject>();
           

            foreach (var location in areaLocationMastersItems)
            {
                numLoc++;
                //หา stoID ที่เป็น base เพื่อเอาไปหาสินค้าในพาเลท ว่ามี OrderNo,SKUCode ตรงกันมั้ย
                var stoBaseItems = AWMSEngine.ADO.DataADO.GetInstant().SelectBy<amt_StorageObject>(
                  new SQLConditionCriteria[] {
                        new SQLConditionCriteria("AreaLocationMaster_ID",(long)location.ID, SQLOperatorType.EQUALS),
                        new SQLConditionCriteria("ObjectType", StorageObjectType.BASE, SQLOperatorType.EQUALS, SQLConditionType.AND),
                        new SQLConditionCriteria("EventStatus", StorageObjectEventStatus.NEW, SQLOperatorType.EQUALS, SQLConditionType.AND),
                        new SQLConditionCriteria("Status", EntityStatus.REMOVE, SQLOperatorType.LESS, SQLConditionType.AND)
                  }, this.BuVO).FirstOrDefault();
                //อัพเดต root_options
               
                //เช็คข้อมูลBase ที่มี AreaLocationMaster_ID ที่ตรงกับ location.ID
                if (stoBaseItems != null)
                {

                    var baseItemsCheck = AWMSEngine.ADO.DataADO.GetInstant().SelectByID<ams_BaseMaster>((long)stoBaseItems.BaseMaster_ID, this.BuVO);
                    if (baseItemsCheck == null)
                        throw new AMWException(this.Logger, AMWExceptionCode.V3001, "Data of Base Not Found");

                    var objSizeBaseCheck = this.StaticValue.ObjectSizes.Where(ob => ob.ID == (long)baseItemsCheck.ObjectSize_ID).FirstOrDefault();
                    if (objSizeBaseCheck == null)
                        throw new AMWException(this.Logger, AMWExceptionCode.V3001, "Object Size of Base Not Found");
                    
                    //เอาstoID ของ Base มาหารายการสินค้า SKU 
                    var stoPackObjects = AWMSEngine.ADO.DataADO.GetInstant().SelectBy<amt_StorageObject>(
                      new SQLConditionCriteria[] {
                            new SQLConditionCriteria("ParentStorageObject_ID",(long)stoBaseItems.ID, SQLOperatorType.EQUALS),
                            new SQLConditionCriteria("Status", EntityStatus.REMOVE, SQLOperatorType.LESS, SQLConditionType.AND)
                      }, this.BuVO);

                    if (stoPackObjects != null && stoPackObjects.Count() > 0)
                    { //มีสินค้าอยู่บนพาเลท
                        foreach (var stoPack in stoPackObjects)
                        {
                            var packItemsCheck = AWMSEngine.ADO.DataADO.GetInstant().SelectByID<ams_PackMaster>((long)stoPack.PackMaster_ID, this.BuVO);
                            if (packItemsCheck == null)
                                throw new AMWException(this.Logger, AMWExceptionCode.V3001, "Data of Pack Not Found");

                            var objSizePackCheck = this.StaticValue.ObjectSizes.Where(ob => ob.ID == (long)packItemsCheck.ObjectSize_ID).FirstOrDefault();
                            if (objSizePackCheck == null)
                                throw new AMWException(this.Logger, AMWExceptionCode.V3001, "Object Size of Pack Not Found");

                            var objectSizeMaps = AWMSEngine.ADO.DataADO.GetInstant().SelectBy<ams_ObjectSizeMap>(new SQLConditionCriteria[] {
                                    new SQLConditionCriteria("OuterObjectSize_ID", (long)objSizeBaseCheck.ID, SQLOperatorType.EQUALS),
                                    new SQLConditionCriteria("InnerObjectSize_ID", (long)objSizePackCheck.ID, SQLOperatorType.EQUALS, SQLConditionType.AND),
                                    new SQLConditionCriteria("Status", EntityStatus.ACTIVE, SQLOperatorType.EQUALS, SQLConditionType.AND), 
                              }, this.BuVO).FirstOrDefault();
                            if (objectSizeMaps == null)
                                throw new AMWException(this.Logger, AMWExceptionCode.V3001, "Object Size Maps of Pack Not Found");
                            var lastPackQty = stoPack.Quantity;
                            if(lastPackQty == objectSizeMaps.MaxQuantity)
                            {
                                continue;
                            }

                            //เช็คพาเลทว่ามี OrderNo,skuCode ตรงกันกับ ScanCode ของสินค้าใหม่มั้ย
                            if (orderNo == stoPack.OrderNo && skuCode == stoPack.Code)
                            {  //ข้อมูลตรง เช็คว่ามีค่า Options มั้ย ถ้ามี เช็คหาค่า CartonNo.
                                if (stoPack.Options != null && stoPack.Options.Length > 0)
                                {
                                    var optionsCartonNo = ObjectUtil.QryStrGetValue(stoPack.Options, OptionVOConst.OPT_CARTON_NO);

                                         //มีค่า CartonNo 
                                            if (optionsCartonNo.Length > 0) {
                                                var resCartonNo = AMWUtil.Common.RangeNumUtil.ExplodeRangeNum(optionsCartonNo);
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
                                                            "Pallet No. " + stoBaseItems.Code + " had SKU Code: " + skuCode + " and Carton No." + cartonNo.ToString() + " already");
                                                    }
                                                    else
                                                    {
                                                        if (numCarton == lenSplitCartonNo)
                                                        {
                                                            newCartonNos = AMWUtil.Common.RangeNumUtil.MergeRangeNum(resCartonNo + "," + cartonNo.ToString());
                                                        }
                                                        else {
                                                            continue;
                                                        }
                                                    }
                                                }

                                                /// รับเข้า วางสินค้าลงบนพาเลทได้
                                                //var optionsNew = OptionVOConst.OPT_CARTON_NO + "=" + newCartonNos;
                                        var optionsNew = AMWUtil.Common.ObjectUtil.QryStrSetValue(stoPack.Options, OptionVOConst.OPT_CARTON_NO, newCartonNos);
                                        
                                        var objectSizePack = this.StaticValue.ObjectSizes.Where(ob => ob.ID == (long)skuItem.ObjectSize_ID).FirstOrDefault();
                                                if (objectSizePack == null)
                                                {
                                                    throw new AMWException(this.Logger, AMWExceptionCode.V3001, "Object Size of SKU Code: " + skuItem.Code + " Not Found");
                                                }
                                                //--validate limit size of pallet
                                                List<StorageObjectCriteria> mapStosPack = new List<StorageObjectCriteria> { };
                                                mapStosPack.Add(new StorageObjectCriteria() {
                                                    id = (long)stoPack.ID,
                                                    groupSum = null,
                                                    type = stoPack.ObjectType,
                                                    code = stoPack.Code,
                                                    areaID = reqVO.areaID,
                                                    orderNo = orderNo,
                                                    lot = null,
                                                    batch = null,
                                                    qty = stoPack.Quantity + 1,
                                                    baseQty = stoPack.BaseQuantity + 1,
                                                    unitID = stoPack.UnitType_ID,
                                                    unitCode = this.StaticValue.UnitTypes.Find(y => y.ID == stoPack.UnitType_ID).Code,
                                                    baseUnitID = stoPack.BaseUnitType_ID,
                                                    baseUnitCode = this.StaticValue.UnitTypes.Find(y => y.ID == stoPack.BaseUnitType_ID).Code,
                                                    objectSizeID = (long)packItemsCheck.ObjectSize_ID,
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

                                                return this.GenerateMapSto(reqVO, orderNo, optionsNew, stoBaseItems, skuItem, mapStosPack, areaItem, location, null);
                                            }
                                            else
                                            {
                                                throw new AMWException(this.Logger, AMWExceptionCode.V3001, "Carton No. of SKU Code: " + skuCode + " on Pallet: " + stoBaseItems.Code + " Not Found");
                                            }
                                                                              
                                }
                                else
                                {
                                    throw new AMWException(this.Logger, AMWExceptionCode.V3001, "Options Not Found");
                                }
                            }
                            else
                            {
                                //orderNo, skuCode ไม่ตรงกัน
                                if (numLoc == lenghtAreaLocItems)
                                {
                                    //มีข้อมูล base เปล่า ก่อนหน้าที่สามารถวางสินค้าได้
                                    if (tempAreaLoc.Count() > 0)
                                    {
                                        //var optionsNew = OptionVOConst.OPT_CARTON_NO + "=" + cartonNo.ToString();
                                        var optionsNew = AMWUtil.Common.ObjectUtil.QryStrSetValue(null, OptionVOConst.OPT_CARTON_NO, cartonNo.ToString());

                                        if (tempStoBaseItems.Count() > 0)
                                        {
                                            //ที่ ObjectType = Base
                                            var root_optionsNew = AMWUtil.Common.ObjectUtil.QryStrSetValue(tempStoBaseItems[0].Options, OptionVOConst.OPT_DONE_DES_EVENT_STATUS, StorageObjectEventStatus.QC.GetValueInt());

                                            List<StorageObjectCriteria> mapStosPack = new List<StorageObjectCriteria> { };
                                            return this.GenerateMapSto(reqVO, orderNo, optionsNew, tempStoBaseItems[0], skuItem, mapStosPack, areaItem, tempAreaLoc[0], root_optionsNew);
                                        }
                                        else
                                        {
                                            throw new AMWException(this.Logger, AMWExceptionCode.V3001, "Empty Pallet Not Found or Order No. or SKU Code doesn't match");
                                        }
                                    }
                                    else
                                    {
                                        throw new AMWException(this.Logger, AMWExceptionCode.V3001, "Empty Pallet Not Found or Order No. or SKU Code doesn't match");

                                    }
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
                        //เช็คจนเหลือ Gate สุดท้ายเเล้ว
                        //มีพาเลทเปล่า ไม่มีสินค้าอยู่ข้างใน
                        //เอาไว้ใช้เก็บสินค้าได้
                        
                        if (numLoc == lenghtAreaLocItems)
                        {
                            //เตรียมข้อมูลinsert 
                            //var optionsNew = OptionVOConst.OPT_CARTON_NO + "=" + cartonNo.ToString();
                            var optionsNew = AMWUtil.Common.ObjectUtil.QryStrSetValue(null,OptionVOConst.OPT_CARTON_NO, cartonNo.ToString());

                            List<StorageObjectCriteria> mapStosPack = new List<StorageObjectCriteria> { };

                            if (tempAreaLoc.Count() > 0)
                            {
                                if (tempStoBaseItems.Count() > 0)
                                {
                                    var root_optionsNew = AMWUtil.Common.ObjectUtil.QryStrSetValue(tempStoBaseItems[0].Options, OptionVOConst.OPT_DONE_DES_EVENT_STATUS, StorageObjectEventStatus.QC.GetValueInt());

                                    return this.GenerateMapSto(reqVO, orderNo, optionsNew, tempStoBaseItems[0], skuItem, mapStosPack, areaItem, tempAreaLoc[0], root_optionsNew);
                                }
                                else
                                {
                                    throw new AMWException(this.Logger, AMWExceptionCode.V3001, "Empty Pallet Not Found or Order No. or SKU Code doesn't match");
                                }
                            }
                            else
                            {
                                var root_optionsNew = AMWUtil.Common.ObjectUtil.QryStrSetValue(stoBaseItems.Options, OptionVOConst.OPT_DONE_DES_EVENT_STATUS, StorageObjectEventStatus.QC.GetValueInt());

                                return this.GenerateMapSto(reqVO, orderNo, optionsNew, stoBaseItems, skuItem, mapStosPack, areaItem, location, root_optionsNew);
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
                           // var optionsNew = OptionVOConst.OPT_CARTON_NO + "=" + cartonNo.ToString();
                            var optionsNew = AMWUtil.Common.ObjectUtil.QryStrSetValue(null, OptionVOConst.OPT_CARTON_NO, cartonNo.ToString());

                            if (tempStoBaseItems.Count() > 0)
                            {
                                //ที่ ObjectType = Base
                                var root_optionsNew = AMWUtil.Common.ObjectUtil.QryStrSetValue(tempStoBaseItems[0].Options, OptionVOConst.OPT_DONE_DES_EVENT_STATUS, StorageObjectEventStatus.QC.GetValueInt());

                                List<StorageObjectCriteria> mapStosPack = new List<StorageObjectCriteria> { };
                                return this.GenerateMapSto(reqVO, orderNo, optionsNew, tempStoBaseItems[0], skuItem, mapStosPack, areaItem, tempAreaLoc[0], root_optionsNew);
                            }
                            else {
                                throw new AMWException(this.Logger, AMWExceptionCode.V3001, "Empty Pallet Not Found or Order No. or SKU Code doesn't match");
                            }
                        }
                        else
                        {
                            throw new AMWException(this.Logger, AMWExceptionCode.V3001, "Empty Pallet Not Found or Order No. or SKU Code doesn't match");

                        }
                    }
                    else
                    {
                        continue;
                    }

                }
            }
                            throw new AMWException(this.Logger, AMWExceptionCode.V2002, "Can't add product in this pallet. Because Empty Pallet Not Found or Order No. or SKU Code doesn't match");
        }

        private TRes GenerateMapSto(TReq reqVO, string orderNo, string newOptions, amt_StorageObject stoBaseItem, ams_SKUMaster skuItem, List<StorageObjectCriteria> mapStosPack, ams_AreaMaster areaItem, ams_AreaLocationMaster arealocation, string root_optionsNew)
        {
            TRes res = new TRes() { };

            var baseItems = AWMSEngine.ADO.DataADO.GetInstant().SelectBy<ams_BaseMaster>("ID", (long)stoBaseItem.BaseMaster_ID, this.BuVO).FirstOrDefault();
            if (baseItems == null)
            {
                throw new AMWException(this.Logger, AMWExceptionCode.V3001, "Data of Pallet Not Found");
            }
            var objectSizeRoot = this.StaticValue.ObjectSizes.Where(ob => ob.ID == (long)baseItems.ObjectSize_ID).FirstOrDefault();
            if (objectSizeRoot == null)
            {
                throw new AMWException(this.Logger, AMWExceptionCode.V3001, "Object Size of Pallet: " + baseItems.Code + " Not Found");
            }

            var stoValidateReq = new StorageObjectCriteria()
            {
                id = (long)stoBaseItem.ID,
                groupSum = null,
                type = stoBaseItem.ObjectType,
                code = stoBaseItem.Code,
                areaID = reqVO.areaID,
                orderNo = orderNo,
                lot = null,
                batch = null,
                qty = stoBaseItem.Quantity,
                unitID = stoBaseItem.UnitType_ID,
                unitCode = this.StaticValue.UnitTypes.Find(y => y.ID == stoBaseItem.UnitType_ID).Code,
                baseQty = stoBaseItem.BaseQuantity,
                objectSizeID = baseItems.ObjectSize_ID,
                objectSizeName = objectSizeRoot.Name,
                maxWeiKG = objectSizeRoot.MaxWeigthKG,
                minWeiKG = objectSizeRoot.MinWeigthKG,
                weiKG = stoBaseItem.WeigthKG,
                widthM = null,
                heightM = null,
                lengthM = null,
                isFocus = true,
                productDate = null,
                eventStatus = stoBaseItem.EventStatus,
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
                mapstos = mapStosPack
            };

            var stoValidateRes = new ValidateObjectSizeOverLimit().Execute(this.Logger, this.BuVO, stoValidateReq);
            //-end-validate limit size of pallet

            var reqScan = new ScanMapStoNoDoc.TReq()
            {
                rootID = (long)stoBaseItem.ID,
                scanCode = skuItem.Code,
                orderNo = orderNo,
                batch = null,
                lot = null,
                amount = 1,
                unitCode = this.StaticValue.UnitTypes.Find(un => un.ID == skuItem.UnitType_ID).Code,
                productDate = null,
                warehouseID = this.StaticValue.AreaMasters.Find(ar => ar.ID == reqVO.areaID).Warehouse_ID,
                areaID = reqVO.areaID,
                options = newOptions,
                isRoot = false,
                mode = VirtualMapSTOModeType.REGISTER,
                action = VirtualMapSTOActionType.ADD,
                rootOptions = root_optionsNew
            };

            var resScanMapStoNoDoc = new ScanMapStoNoDoc().Execute(this.Logger, this.BuVO, reqScan); ;
            if (resScanMapStoNoDoc != null)
            {
                StorageObjectCriteria stobsto = resScanMapStoNoDoc;
                res = new TRes()
                {
                    areaID = (long)areaItem.ID,
                    areaCode = areaItem.Code,
                    areaLocationID = (long)arealocation.ID,
                    areaLocationCode = arealocation.Code,
                    bsto = stobsto
                };
                return res;
            }
            else
            {
                throw new AMWException(this.Logger, AMWExceptionCode.V1001, "Can't add SKU Code: " + skuItem.Code + " in Pallet No." + stoBaseItem.Code);
            }

        }
    }
}
