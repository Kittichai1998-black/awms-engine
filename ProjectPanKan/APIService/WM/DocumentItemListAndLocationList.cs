using AWMSEngine.Engine;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ProjectPanKan.APIService.WM
{
    public class DocumentItemListAndLocationList : BaseEngine<long, DocumentItemListAndLocationList.TRes>
    {
        public class TRes
        {
            public long docID;
            public List<DocItemList> docItemLists;
            public List<LocationList> locationLists;

            public class DocItemList
            {
                public long docItemID;
                public string code;
                public string name;
                public string unit;
                public string pickQty;
                public string allQty;
            }
            public class LocationList
            {
                public long locCode;
                public string baseCode;
            }
        }

        protected override TRes ExecuteEngine(long reqVO)
        {
            return null;
        }
    }
}
