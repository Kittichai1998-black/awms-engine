using AWMSModel.Constant.EnumConst;
using AWMSModel.Criteria.SP.Response;
using System;
using System.Collections.Generic;
using System.Text;
using System.Linq;
using AMWUtil.Common;

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
        public decimal? weiKG;
        public bool isFocus;
        public int? objectSizeID;
        public List<KeyValuePair<string, string>> options;
        public List<StorageObjectCriteria> mapstos;

        public static StorageObjectCriteria Generate(List<SPStorageObjectCriteria> stos, string codeFocus)
        {
            return Generate(stos, null, codeFocus);
        }
        public static StorageObjectCriteria Generate(List<SPStorageObjectCriteria> stos, int idFocus)
        {
            return Generate(stos, idFocus, null);
        }

        private static StorageObjectCriteria Generate(List<SPStorageObjectCriteria> stos, int? idFocus, string codeFocus)
        {
            var rootSto = stos.FirstOrDefault(x => !x.parentID.HasValue);
            if (rootSto == null) return null;
            bool isFucus = false;
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
                /*innerSizeLevels = string.IsNullOrEmpty(rootSto.innerSizeLevels) ?
                    null :
                    rootSto.innerSizeLevels.Split("|")
                    .Select(x => { int? y = x.Get<int>(); return y ?? -1; })
                    .Where(x => x >= 0)
                    .ToList(),*/
                isFocus = isFucus
            };

            List<StorageObjectCriteria> generateMapstos(int? parentID, StorageObjectType parentType, out bool outParentIsFocus)
            {
                List<StorageObjectCriteria> r =
                    stos.Where(x => x.parentID == parentID && x.parentType == parentType)
                    .Select(x => {
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
                            /*innerSizeLevels = string.IsNullOrEmpty(rootSto.innerSizeLevels) ?
                                                null :
                                                x.innerSizeLevels.Split("|")
                                                .Select(z => { int? y = z.GetTry<int>(); return y ?? -1; })
                                                .Where(z => z >= 0)
                                                .ToList(),*/
                        };
                        if (!s.isFocus && (s.id == idFocus || s.code == codeFocus))
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
