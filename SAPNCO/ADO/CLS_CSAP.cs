using SAP.Middleware.Connector;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace SAPNCO.ADO
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
            RfcConfigParameters parms = new RfcConfigParameters();
            switch (destinationName)
            {
                case "DEV":
                    parms.Add(RfcConfigParameters.AppServerHost, "192.168.9.2");
                    parms.Add(RfcConfigParameters.SystemNumber, "00");
                    parms.Add(RfcConfigParameters.SystemID, "DEV");
                    parms.Add(RfcConfigParameters.User, "AAI_RFC");
                    parms.Add(RfcConfigParameters.Password, "Qazx12345");
                    parms.Add(RfcConfigParameters.Client, "200");
                    parms.Add(RfcConfigParameters.Language, "EN");
                    parms.Add(RfcConfigParameters.PoolSize, "5");
                    parms.Add(RfcConfigParameters.PeakConnectionsLimit, "10");
                    parms.Add(RfcConfigParameters.IdleTimeout, "600");
                    break;
                case "QAS":
                    parms.Add(RfcConfigParameters.AppServerHost, "192.168.9.5");
                    parms.Add(RfcConfigParameters.SystemNumber, "00");
                    parms.Add(RfcConfigParameters.SystemID, "QAS");
                    parms.Add(RfcConfigParameters.User, "xxxxx");
                    parms.Add(RfcConfigParameters.Password, "xxxxx");
                    parms.Add(RfcConfigParameters.Client, "500");
                    parms.Add(RfcConfigParameters.Language, "EN");
                    parms.Add(RfcConfigParameters.PoolSize, "5");
                    parms.Add(RfcConfigParameters.PeakConnectionsLimit, "10");
                    parms.Add(RfcConfigParameters.IdleTimeout, "600");
                    break;
                case "PRD":
                    parms.Add(RfcConfigParameters.AppServerHost, "192.168.9.13");
                    parms.Add(RfcConfigParameters.SystemNumber, "00");
                    parms.Add(RfcConfigParameters.SystemID, "PRD");
                    parms.Add(RfcConfigParameters.User, "xxxx");
                    parms.Add(RfcConfigParameters.Password, "xxxx");
                    parms.Add(RfcConfigParameters.Client, "900");
                    parms.Add(RfcConfigParameters.Language, "EN");
                    parms.Add(RfcConfigParameters.PoolSize, "5");
                    parms.Add(RfcConfigParameters.PeakConnectionsLimit, "10");
                    parms.Add(RfcConfigParameters.IdleTimeout, "600");
                    break;
                default:
                    break;
            }
            return parms;
        }
    }
}