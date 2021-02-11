using AMWUtil.DataAccess.Http;
using System;
using System.Collections.Generic;
using System.Text;

namespace AMSModel.Criteria
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
            public DocumentOptionMessage() { }
            public DocumentOptionMessage(long docID, string msgInfo, string msgWarning, string msgError)
            {
                this.docID = docID;
                this.msgInfo = msgInfo;
                this.msgWarning = msgWarning;
                this.msgError = msgError;
            }
        }
    }
}
