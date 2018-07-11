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
        public int? parentID;
        public StorageObjectType? parentType;
        public string code;
        public string name;
        public decimal? minChildWeiKG;
        public decimal? maxChildWeiKG;
        public decimal? minChildQty;
        public decimal? maxChildQty;
        public bool isFocus;
        //public decimal amount;
        public int? sizeLevel;
        public List<int> innerSizeLevels;
        public List<KeyValuePair<string, string>> options;
        public List<StorageObjectCriteria> mapstos;

        public static StorageObjectCriteria Generate(List<SPStorageObjectCriteria> stos, string codeFocus)
        {
            var rootSto = stos.FirstOrDefault(x => !x.parentID.HasValue);
            bool isFucus = false;
            var res = new StorageObjectCriteria()
            {
                id = rootSto.id,
                type = rootSto.type,
                parentID = null,
                parentType = null,
                code = rootSto.code,
                name = rootSto.name,
                minChildWeiKG = rootSto.minChildWeiKG,
                maxChildWeiKG = rootSto.maxChildWeiKG,
                minChildQty = rootSto.minChildQty,
                maxChildQty = rootSto.maxChildQty,
                options = AMWUtil.Common.ObjectUtil.QueryStringToListKey(rootSto.options ?? string.Empty),
                mapstos = generateMapstos(rootSto.id.Value, rootSto.type, out isFucus),
                sizeLevel = rootSto.sizeLevel,
                innerSizeLevels = string.IsNullOrEmpty(rootSto.innerSizeLevels) ?
                    null :
                    rootSto.innerSizeLevels.Split("|")
                    .Select(x => { int? y = x.Get<int>(); return y ?? -1; })
                    .Where(x => x >= 0)
                    .ToList(),
                isFocus = isFucus
            };

            List<StorageObjectCriteria> generateMapstos(int parentID, StorageObjectType parentType, out bool outParentIsFocus)
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
                            minChildWeiKG = x.minChildWeiKG,
                            maxChildWeiKG = x.maxChildWeiKG,
                            minChildQty = x.minChildQty,
                            maxChildQty = x.maxChildQty,
                            options = AMWUtil.Common.ObjectUtil.QueryStringToListKey(x.options ?? string.Empty),
                            mapstos = generateMapstos(x.id.Value, x.type, out isFocus),
                            isFocus = isFocus,
                            sizeLevel = x.sizeLevel,
                            innerSizeLevels = string.IsNullOrEmpty(rootSto.innerSizeLevels) ?
                                                null :
                                                x.innerSizeLevels.Split("|")
                                                .Select(z => { int? y = z.GetTry<int>(); return y ?? -1; })
                                                .Where(z => z >= 0)
                                                .ToList(),
                        };
                        if (!s.isFocus && s.code.Equals(codeFocus))
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
