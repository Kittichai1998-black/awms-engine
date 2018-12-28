using AWMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.Engine.Business.Issued
{
    public class UpdateGIDocumentBeforProcessQueue : BaseEngine<UpdateGIDocumentBeforProcessQueue.TReq, UpdateGIDocumentBeforProcessQueue.TRes>
    {
        public class TReq
        {
            public List<long> docIDs;
        }
        public class TRes
        {
            public List<amt_Document> documents;
        }

        protected override TRes ExecuteEngine(TReq reqVO)
        {
            TRes res = new TRes();
            res.documents = new List<amt_Document>();

            var dbDocs = ADO.DocumentADO.GetInstant().List(reqVO.docIDs, this.BuVO);
            dbDocs.ForEach(x => x.DocumentItems = ADO.DocumentADO.GetInstant().ListItem(x.ID.Value, this.BuVO));
            foreach (long docID in reqVO.docIDs)
            {
                /*ADO.SAPApi.SAPInterfaceADO.TREQ_MMI0008_1 tReq =
                    new ADO.SAPApi.SAPInterfaceADO.TREQ_MMI0008_1()
                    {
                        HEADER_DATA = new ADO.SAPApi.SAPInterfaceADO.TREQ_MMI0008_1.THeader()
                        {

                        }
                    };*/
                //ADO.SAPApi.SAPInterfaceADO.GetInstant().MMI0008_1_DO_INFO()
            }

            return null;
        }

    }
}
