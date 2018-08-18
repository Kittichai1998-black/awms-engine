﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AWMSModel.Criteria;

namespace AWMSEngine.Engine.Business
{
    public class DocGoodsReceivedClose : BaseEngine<DocGoodsReceivedClose.TReq, AWMSModel.Criteria.NullCriteria>
    {
        public class TReq
        {
            public List<long> DocumentIDs;
        }
        protected override NullCriteria ExecuteEngine(TReq reqVO)
        {
            foreach(long docID in reqVO.DocumentIDs)
            {
                ADO.DocumentADO.GetInstant().Close(docID, false, this.BuVO);
            }
            return null;
        }
    }
}
