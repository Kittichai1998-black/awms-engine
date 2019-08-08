using AMWUtil.DataAccess.Http;
using System;
using System.Collections.Generic;
using System.Text;

namespace AWMSModel.Criteria
{
    public class FinalDatabaseLogCriteria
    {
        public List<HttpResultModel> sendAPIEvents;
        public List<DocumentOptionMessage> documentOptionMessages;
        public class DocumentOptionMessage
        {
            public long docID;
            public string msgWarning;
            public string msgInfo;
            public string msgError;
        }
    }
}
