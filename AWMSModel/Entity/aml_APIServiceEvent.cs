using System;
using System.Collections.Generic;
using System.Text;

namespace AWMSModel.Entity
{
    public class aml_APIServiceEvent : IEntityModel
    {
        public long? ID;
        public string LogRefID;
        public string Token;
        public string APIKey;
        public long APIService_ID;
        public string APIService_Code;
        public string APIService_Name;
        public long? ResultStatus;
        public string ResultCode;
        public string ResultMessage;
        public long? ActionBy;
        public DateTime? StartTime;
        public DateTime EndTime;
        public string TechMessage;
        public string InputText;
        public string OutputText;
        public string IPRemote;
        public string IPLocal;
        public string ServerName;
        public string Url;
        public string APIRefID;

    }
}
