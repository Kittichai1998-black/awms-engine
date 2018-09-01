using System;
using System.Collections.Generic;
using System.Text;

namespace AWMSModel.Constant.StringConst
{
    public static class BusinessVOConst
    {
        public const string KEY_TOKEN = "_TOKEN";
        public const string KEY_TOKEN_INFO = "_TOKEN_INFO";
        public const string KEY_APIKEY = "_APIKEY";
        public const string KEY_REQUEST = "_REQUEST";
        public const string KEY_TEMP = "_TEMP";
        public const string KEY_RESPONSE = "_RESPONSE";
        public const string KEY_TECHMESSAGE = "_TECHMESSAGE";
        public const string KEY_LANGUAGE_CODE = "_LANGUAGE_CODE";
        public const string KEY_LOGGER = "_LOGGER";
        public const string KEY_DB_TRANSACTION= "_DB_TRANSACTION";
        public const string KEY_RESULT_API = "_result";
        public const string KEY_DB_LOGID = "_db_logID";

        public static string KEY_REQUEST_FIELD(string fields)
        {
            return KEY_DOT_FIELD(KEY_REQUEST, fields);
        }
        public static string KEY_TEMP_FIELD(string fields)
        {
            return KEY_PREFIX_FIELD(KEY_TEMP, fields);
        }
        public static string KEY_DOT_FIELD(string key, string fields)
        {
            return "*" + key + "." + fields;
        }
        public static string KEY_PREFIX_FIELD(string key, string fields)
        {
            return "*" + key + "_" + fields;
        }

    }
}
