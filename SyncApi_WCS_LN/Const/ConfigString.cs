using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SyncApi_WCS_LN.Const
{
    public class ConfigString
    {
        public const string KEY_DB_CONNECTIONSTRING = "database.connection_string";

        public const string KEY_POST2WMS_APINAMES = "post2wms.api_names";
        public const string KEY_POST2WMS_THREAD_SLEEP = "post2wms.thread_sleep";
        public const string KEY_POST2WMS_APIURL = "post2wms.{0}.api_url";
        public const string KEY_POST2WMS_SP_GET_REQUEST = "post2wms.{0}.get_req";
        public const string KEY_POST2WMS_SP_UPDATE_RESULT = "post2wms.{0}.update_res";


        public const string KEY_APICONTROLLER_APINAMES = "controller.api_names";
        public const string KEY_APICONTROLLER_SP_EXEC = "controller.{0}.sp_exec";

    }
}
