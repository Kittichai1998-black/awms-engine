using AWMSModel.Constant.EnumConst;
using AWMSModel.Criteria.SP.Response;
using System;
using System.Collections.Generic;
using System.Text;
using System.Linq;
using AMWUtil.Common;
using AWMSModel.Entity;

namespace AWMSModel.Criteria
{
    public class StorageObjectCriteria
    {
        public int? id;
        public StorageObjectType type;
        public int? mstID;
        public int? parentID;
        public StorageObjectType? parentType;
        public string code;
        public string name;

        public int? objectSizeID;
        public decimal? weiKG;
        public decimal? minWeiKG;
        public decimal? maxWeiKG;
        public bool isFocus;
        public List<ObjectSizeMap> objectSizeMaps;
        public List<KeyValuePair<string, string>> options;
        public List<StorageObjectCriteria> mapstos;

        public class ObjectSizeMap
        {
            public int innerObjectSizeID;
            public decimal? minQuantity;
            public decimal? maxQuantity;
        }

        public static StorageObjectCriteria Generate(List<SPStorageObjectCriteria> stos, List<ams_ObjectSize> staticObjectSizes, string codeFocus)
        {
            return Generate(stos, staticObjectSizes, null, codeFocus);
        }
        public static StorageObjectCriteria Generate(List<SPStorageObjectCriteria> stos, List<ams_ObjectSize> staticObjectSizes, int idFocus)
        {
            return Generate(stos, staticObjectSizes, idFocus, null);
        }

        private static StorageObjectCriteria Generate(List<SPStorageObjectCriteria> stos, List<ams_ObjectSize> staticObjectSizes,
            int? idFocus, string codeFocus)
        {
            var rootSto = stos.FirstOrDefault(x => !x.parentID.HasValue);
            if (rootSto == null) return null;
            bool isFucus = false;

            var sos = staticObjectSizes.FirstOrDefault(x => x.ID == rootSto.objectSizeID);
            var res = new StorageObjectCriteria()
            {
                id = rootSto.id,
                type = rootSto.type,
                parentID = null,
                parentType = null,
                code = rootSto.code,
                name = rootSto.name,
                weiKG = rootSto.weiKG,
                mstID = rootSto.mstID,
                options = AMWUtil.Common.ObjectUtil.QueryStringToListKey(rootSto.options ?? string.Empty),
                mapstos = generateMapstos(rootSto.id, rootSto.type, out isFucus),
                objectSizeID = rootSto.objectSizeID,
                objectSizeMaps = sos != null ?
                    sos.ObjectSizeInners
                    .Select(x => new ObjectSizeMap() {
                        innerObjectSizeID = x.InnerObjectSize_ID,
                        maxQuantity = x.MaxQuantity,
                        minQuantity = x.MinQuantity })
                    .ToList() : null,
                minWeiKG = sos != null ? sos.MinWeigthKG : null,
                maxWeiKG = sos != null ? sos.MaxWeigthKG : null,
                isFocus = isFucus
            };
            if (!res.weiKG.HasValue && res.mapstos.TrueForAll(y => y.weiKG.HasValue))
                res.weiKG = res.mapstos.Sum(y => y.weiKG.Value);


            List<StorageObjectCriteria> generateMapstos(int? parentID, StorageObjectType parentType, out bool outParentIsFocus)
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
                            code = x.code,
                            name = x.name,
                            mstID = rootSto.mstID,
                            weiKG = rootSto.weiKG,
                            options = AMWUtil.Common.ObjectUtil.QueryStringToListKey(x.options ?? string.Empty),
                            mapstos = generateMapstos(x.id, x.type, out isFocus),
                            isFocus = isFocus,
                            objectSizeID = x.objectSizeID,
                            objectSizeMaps = sos2 != null ?
                                sos2.ObjectSizeInners
                                .Select(y => new ObjectSizeMap()
                                {
                                    innerObjectSizeID = y.InnerObjectSize_ID,
                                    maxQuantity = y.MaxQuantity,
                                    minQuantity = y.MinQuantity
                                })
                                .ToList() : null,
                            minWeiKG = sos2 != null ? sos2.MinWeigthKG : null,
                            maxWeiKG = sos2 != null ? sos2.MaxWeigthKG : null,
                        };
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
