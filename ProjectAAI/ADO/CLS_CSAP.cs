using AWMSEngine.ADO.StaticValue;
using SAP.Middleware.Connector;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ProjectAAI.ADO
{
    public class CLS_CSAP : IDestinationConfiguration
    {
        public event RfcDestinationManager.ConfigurationChangeHandler ConfigurationChanged;

        public bool ChangeEventsSupported()
        {
            return false;
        }

        public RfcConfigParameters GetParameters(string destinationName)
        {
            var parms = new RfcConfigParameters();
            parms.Add(RfcConfigParameters.AppServerHost, StaticValueManager.GetInstant().GetConfig("ERP_CONFIG_APP_SERVER_HOST"));
            parms.Add(RfcConfigParameters.SystemNumber, StaticValueManager.GetInstant().GetConfig("ERP_CONFIG_SYSTEM_NUMBER"));
            parms.Add(RfcConfigParameters.SystemID, StaticValueManager.GetInstant().GetConfig("ERP_CONFIG_SYSTEM_ID"));
            parms.Add(RfcConfigParameters.User, StaticValueManager.GetInstant().GetConfig("ERP_CONFIG_USER"));
            parms.Add(RfcConfigParameters.Password, StaticValueManager.GetInstant().GetConfig("ERP_CONFIG_PASSWORD"));
            parms.Add(RfcConfigParameters.Client, StaticValueManager.GetInstant().GetConfig("ERP_CONFIG_CLIENT"));
            parms.Add(RfcConfigParameters.Language, "EN");
            parms.Add(RfcConfigParameters.PoolSize, "5");
            parms.Add(RfcConfigParameters.PeakConnectionsLimit, "10");
            parms.Add(RfcConfigParameters.IdleTimeout, "600");

            return parms;
        }
    }
}
