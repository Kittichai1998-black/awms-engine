﻿using AWMSModel.Constant.EnumConst;
using AWMSModel.Criteria.SP.Response;
using System;
using System.Collections.Generic;
using System.Text;
using System.Linq;
using AMWUtil.Common;
using AWMSModel.Entity;

namespace AWMSModel.Criteria
{
    public class StorageObjectCriteria : ITreeObject
    {
        public long? id;
        public StorageObjectType type;
        public long? mstID;
        public long? parentID;
        public long warehouseID;
        public long areaID;
        public StorageObjectType? parentType;
        public string code;
        public string name;
        public string lot;
        public string batch;

        public int? objectSizeID;
        public string objectSizeName;
        public decimal? lengthM;
        public decimal? widthM;
        public decimal? heightM;
        public decimal? weiKG;
        public decimal? minWeiKG;
        public decimal? maxWeiKG;
        public bool isFocus;
        public StorageObjectEventStatus eventStatus;
        public List<ObjectSizeMap> objectSizeMaps;
        public List<KeyValuePair<string, string>> options;
        public List<StorageObjectCriteria> mapstos;
        

        public class ObjectSizeMap
        {
            public long outerObjectSizeID;
            public string outerObjectSizeName;
            public int innerObjectSizeID;
            public string innerObjectSizeName;
            public decimal? quantity;
            public decimal? minQuantity;
            public decimal? maxQuantity;
        }

        public static StorageObjectCriteria Generate(List<SPOutSTOMiniCriteria> stos, List<ams_ObjectSize> staticObjectSizes, string codeFocus)
        {
            return Generate(stos, staticObjectSizes, null, codeFocus);
        }
        public static StorageObjectCriteria Generate(List<SPOutSTOMiniCriteria> stos, List<ams_ObjectSize> staticObjectSizes, long idFocus)
        {
            return Generate(stos, staticObjectSizes, idFocus, null);
        }

        private static StorageObjectCriteria Generate(List<SPOutSTOMiniCriteria> stos, List<ams_ObjectSize> staticObjectSizes,
            long? idFocus, string codeFocus)
        {
            var rootSto = stos.FirstOrDefault();
            if (rootSto == null) return null;
            bool isFucus = false;

            var sos = staticObjectSizes.FirstOrDefault(x => x.ID == rootSto.objectSizeID);
            var res = generateMapstos(rootSto.parentID, rootSto.parentType, out isFucus).FirstOrDefault();
            

            List<StorageObjectCriteria> generateMapstos(int? parentID, StorageObjectType? parentType, out bool outParentIsFocus)
            {
                List<StorageObjectCriteria> r =
                    stos.Where(x => x.parentID == parentID && x.parentType == parentType)
                    .Select(x => {
                        var sos2 = staticObjectSizes.FirstOrDefault(y => y.ID == x.objectSizeID);
                        bool isFocus = false;
                        var s = new StorageObjectCriteria()
                        {
                            id = x.id,
                            type = x.type,
                            parentID = x.parentID,
                            parentType = x.parentType,
                            warehouseID = x.warehouseID,
                            areaID = x.areaID,
                            code = x.code,
                            name = x.name,
                            mstID = x.mstID,
                            weiKG = x.weiKG,

                            lengthM = x.lengthM,
                            widthM = x.widthM,
                            heightM = x.heightM,

                            options = AMWUtil.Common.ObjectUtil.QueryStringToKeyValues(x.options ?? string.Empty),
                            mapstos = generateMapstos(x.id, x.type, out isFocus),
                            isFocus = isFocus,
                            objectSizeID = x.objectSizeID,
                            objectSizeName = sos2.Name,
                            eventStatus = x.eventStatus,
                            lot = x.lot,
                            batch = x.batch,
                            minWeiKG = sos2 != null ? sos2.MinWeigthKG : null,
                            maxWeiKG = sos2 != null ? sos2.MaxWeigthKG : null,
                        };
                        s.objectSizeMaps = sos2 != null ?
                                sos2.ObjectSizeInners
                                .Select(y => new ObjectSizeMap()
                                {
                                    innerObjectSizeID = y.InnerObjectSize_ID,
                                    maxQuantity = y.MaxQuantity,
                                    minQuantity = y.MinQuantity,
                                    outerObjectSizeName = sos2.Name,
                                    innerObjectSizeName = staticObjectSizes.First(z => z.ID == y.InnerObjectSize_ID).Name,
                                    outerObjectSizeID = sos2.ID.Value,
                                    quantity = s.mapstos.Count(z => z.objectSizeID == y.InnerObjectSize_ID)
                                })
                                .ToList() : null;

                        if (!s.weiKG.HasValue && s.mapstos.TrueForAll(y => y.weiKG.HasValue))
                            s.weiKG = s.mapstos.Sum(y => y.weiKG.Value);

                        if (!s.isFocus && (s.id == idFocus || s.code == codeFocus) && s.type != StorageObjectType.PACK)
                            s.isFocus = true;
                        return s;
                    }).ToList();
                outParentIsFocus = r.Any(x => x.isFocus);
                return r;
            }

            return res;
        }
        
    }
}
